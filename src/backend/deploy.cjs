const {
    Keypair,
    Networks,
    Operation,
    SorobanDataBuilder,
    TimeoutInfinite,
    TransactionBuilder,
    rpc,
    hash,
} = require("@stellar/stellar-sdk");
const fs = require("fs");
const path = require("path");

const RPC_URL = "https://soroban-testnet.stellar.org";
const FRIEND_BOT = "https://friendbot.stellar.org";
const NETWORK_PASSPHRASE = Networks.TESTNET;

async function fundAccount(publicKey) {
    console.log(`Funding account ${publicKey}...`);
    const response = await fetch(`${FRIEND_BOT}?addr=${publicKey}`);
    const json = await response.json();
    console.log("Friendbot response:", json);
}

async function main() {
    const server = new rpc.Server(RPC_URL);

    // 1. Generate Deployer Keypair
    const pair = Keypair.random();
    console.log(`Generated Keypair:`);
    console.log(`   Public: ${pair.publicKey()}`);
    console.log(`   Secret: ${pair.secret()}`);

    // 2. Fund Account
    await fundAccount(pair.publicKey());

    // 3. Load WASM
    const wasmPath = path.join(
        __dirname,
        "../../src/contract/target/wasm32-unknown-unknown/release/collateral_vault.wasm"
    );
    if (!fs.existsSync(wasmPath)) {
        throw new Error(`WASM not found at ${wasmPath}`);
    }
    const wasmBuffer = fs.readFileSync(wasmPath);

    // 4. Upload Contract Code
    console.log("Uploading contract code...");
    const account = await server.getAccount(pair.publicKey());

    const uploadTx = new TransactionBuilder(account, {
        fee: "10000",
        networkPassphrase: NETWORK_PASSPHRASE,
    })
        .addOperation(Operation.uploadContractWasm({ wasm: wasmBuffer }))
        .setTimeout(TimeoutInfinite)
        .build();

    uploadTx.sign(pair);

    // Simulate first
    const sim = await server.simulateTransaction(uploadTx);
    if (rpc.Api.isSimulationError(sim)) {
        console.error("Simulation failed:", sim);
        return;
    }
    console.log("Simulation successful, cost:", sim.cost);

    // Prepare transaction with simulation data (optional but good for resources)
    // For now, just sign and send the original (or rebuild if needed for resources)
    // uploadTx.sign(pair); // Already signed? No, simulation doesn't need signature usually, but we signed before.
    // Actually, if we rebuild, we need to sign again.
    // Let's just send the one we built if simulation passed.

    const sendResponse = await server.sendTransaction(uploadTx);
    if (sendResponse.status !== "PENDING") {
        console.error("Upload failed. Full response:", JSON.stringify(sendResponse, null, 2));
        return;
    }

    // Poll for status
    let statusResponse;
    let status = "PENDING";
    while (status === "PENDING") {
        await new Promise((resolve) => setTimeout(resolve, 2000));
        statusResponse = await server.getTransaction(sendResponse.hash);
        status = statusResponse.status;
        console.log(`Upload status: ${status}`);
    }

    if (status !== "SUCCESS") {
        console.error("Upload transaction failed");
        return;
    }

    // Get WASM Hash
    // The WASM hash is the SHA256 of the bytecode.
    // Or we can get it from the transaction result if we parse it, but calculating it locally is easier.
    // Actually, Operation.uploadContractWasm doesn't return the hash directly in the tx object, 
    // but the on-chain execution produces it.
    // However, we can compute it.
    const wasmHash = hash(wasmBuffer);
    console.log(`WASM Hash: ${wasmHash.toString("hex")}`);

    // 5. Instantiate Contract
    console.log("Instantiating contract...");

    // We need to reload account to get updated sequence number
    const account2 = await server.loadAccount(pair.publicKey());

    const deployTx = new TransactionBuilder(account2, {
        fee: "10000",
        networkPassphrase: NETWORK_PASSPHRASE,
    })
        .addOperation(Operation.createCustomContract({
            wasmHash: wasmHash,
            address: pair.publicKey(), // Using the deployer as the salt/address generator
        }))
        .setTimeout(TimeoutInfinite)
        .build();

    deployTx.sign(pair);

    const deploySendResponse = await server.sendTransaction(deployTx);

    // Poll for status
    let deployStatusResponse;
    let deployStatus = "PENDING";
    while (deployStatus === "PENDING") {
        await new Promise((resolve) => setTimeout(resolve, 2000));
        deployStatusResponse = await server.getTransaction(deploySendResponse.hash);
        deployStatus = deployStatusResponse.status;
        console.log(`Deploy status: ${deployStatus}`);
    }

    if (deployStatus !== "SUCCESS") {
        console.error("Deploy transaction failed");
        return;
    }

    // The contract ID is in the result.
    // We can also predict it, but let's try to extract it or just print "Deployed".
    // Actually, for createCustomContract, the ID is deterministic based on address and salt.
    // But parsing the result XDR is a bit complex without the helpers.
    // Let's just print that it succeeded and we might need to look up the transaction metadata to find the ID.
    // Or we can use `strkey` to encode the contract address if we knew the salt.

    console.log("✅ Contract Deployed Successfully!");
    console.log("Transaction Hash:", deploySendResponse.hash);
    console.log("Please check the explorer to get the Contract ID or parse the result meta.");

    // Attempt to find the created contract ID from the transaction result meta would be ideal,
    // but for now let's just output the hash.
}

main().catch((err) => {
    console.error(err);
});
