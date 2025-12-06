const { rpc, nativeToScVal, scValToNative, xdr } = require('@stellar/stellar-sdk');
const { ApiPromise, WsProvider, Keyring } = require('@polkadot/api');

// 1. CONFIGURATION
const RPC_URL = "https://soroban-testnet.stellar.org"; // Use your local or testnet RPC
const CONTRACT_ID = "CAIGF53UI7SWZXSQPHJNSYRK7T2AMPWEAF6I6R57IXFDNVQNFQAYF7IA"; // <--- REPLACE THIS WITH YOUR DEPLOYED CONTRACT ID
const POLL_INTERVAL = 5000; // Check every 5 seconds
const POLKADOT_WS_URL = "wss://westend-rpc.polkadot.io"; // Westend Testnet

async function main() {
    const server = new rpc.Server(RPC_URL);

    // Initialize Polkadot API
    console.log(`🔌 Connecting to Polkadot (Westend)...`);
    const wsProvider = new WsProvider(POLKADOT_WS_URL);
    const polkadotApi = await ApiPromise.create({ provider: wsProvider });
    console.log(`✅ Connected to Polkadot!`);

    // 1. Setup Relayer Account (At Startup)
    const keyring = new Keyring({ type: 'sr25519' });
    const RELAYER_MNEMONIC = "bottom drive obey lake curtain smoke basket hold race lonely fit walk";
    const relayer = keyring.addFromUri(RELAYER_MNEMONIC);

    console.log(`\n🔐 Relayer Address: ${relayer.address}`);

    // 2. Check Relayer Balance
    const { data: balance } = await polkadotApi.query.system.account(relayer.address);
    console.log(`💰 Relayer Balance: ${balance.free.toHuman()}`);

    if (balance.free.isZero()) {
        console.log("⚠️  RELAYER HAS 0 FUNDS! You must fund this address to send transactions.");
        console.log("👉 Go to: https://faucet.polkadot.io/westend");
        console.log("👉 Or use Matrix: @westend_faucet:matrix.org !drip " + relayer.address);
    } else {
        console.log("✅ Relayer is funded and ready!");
    }

    console.log(`\n🌉 Bridge Listener Started...`);
    console.log(`👀 Watching Contract: ${CONTRACT_ID}`);

    // Get the latest ledger so we only listen for NEW events (not old ones)
    let latestLedger = await server.getLatestLedger();
    let cursor = (BigInt(latestLedger.sequence) - BigInt(100)).toString();

    console.log(`⏱️  Starting from Ledger: ${cursor}`);

    // 2. THE POLLING LOOP
    while (true) {
        try {
            // Fetch events from the contract specifically looking for the "deposit" topic
            const response = await server.getEvents({
                startLedger: parseInt(cursor),
                filters: [
                    {
                        type: "contract",
                        contractIds: [CONTRACT_ID],
                    }
                ],
                limit: 10 // Process 10 events at a time
            });

            // 3. PROCESS FOUND EVENTS
            if (response.events && response.events.length > 0) {
                for (const event of response.events) {

                    // Decode the raw XDR data back to human-readable format
                    // The Rust contract emits: topics: ["deposit", user, token], data: (amount, destination)

                    // Topic 0 is "deposit" (we already filtered for this)
                    // Topic 1 is the User Address
                    const userScVal = event.topic[1];
                    const userAddress = scValToNative(userScVal);

                    // Topic 2 is the Token Address (USDC/XLM)
                    const tokenScVal = event.topic[2];
                    const tokenAddress = scValToNative(tokenScVal);

                    // The "value" (data) of the event is now a Tuple: (amount, destination)
                    const dataScVal = event.value;
                    const [amount, destination] = scValToNative(dataScVal);

                    console.log("\n-----------------------------------------");
                    console.log("🔥 EVENT DETECTED: Cross-Chain Deposit");
                    console.log(`👤 User:        ${userAddress}`);
                    console.log(`💰 Amount:      ${amount} (Raw Units)`);
                    console.log(`🪙 Token:       ${tokenAddress}`);
                    console.log(`🎯 Destination: ${destination}`);
                    console.log("-----------------------------------------");

                    console.log("🚀 TRIGGERING POLKADOT BRIDGE...");
                    await mintOnPolkadot(polkadotApi, relayer, destination, amount);
                }
            }

            // Update the cursor to the latest ledger found + 1 so we don't re-read events
            // (In production, use the 'pagingToken' from the response for better precision)
            const currentLedger = await server.getLatestLedger();
            cursor = currentLedger.sequence.toString();

        } catch (e) {
            console.error("⚠️ Error polling events:", e.message);
        }

        // Sleep for 5 seconds before checking again
        await new Promise(r => setTimeout(r, POLL_INTERVAL));
    }
}

async function mintOnPolkadot(api, relayer, destination, amount) {
    try {
        // 3. Convert Amount (Stellar 7 decimals -> Westend 12 decimals)
        // 1 XLM (10^7) -> 0.01 WND (10^10) => Multiply by 1000
        // This prevents draining the relayer too fast during testing.
        const amountBigInt = BigInt(amount);
        const amountDOT = amountBigInt * BigInt(1000);

        // Check Relayer Balance
        const { data: balance } = await api.query.system.account(relayer.address);
        if (balance.free.toBigInt() < amountDOT) {
            console.error(`❌ INSUFFICIENT RELAYER FUNDS!`);
            console.error(`   Required: ${amountDOT.toString()}`);
            console.error(`   Available: ${balance.free.toString()}`);
            console.error(`   Please fund the relayer: ${relayer.address}`);
            return;
        }

        console.log(`💸 Sending ${amountDOT.toString()} Planck (${amountDOT / BigInt(1000000000000)} WND) to ${destination}...`);

        // 4. Send Transaction
        const unsub = await api.tx.balances.transferKeepAlive(destination, amountDOT)
            .signAndSend(relayer, ({ status, events = [] }) => {
                if (status.isInBlock) {
                    console.log(`📦 Transaction included in block: ${status.asInBlock}`);
                } else if (status.isFinalized) {
                    const txHash = status.asFinalized.toString();
                    console.log(`✅ Transaction Finalized! Hash: ${txHash}`);

                    // Write to JSON file for frontend
                    const fs = require('fs');
                    const path = require('path');
                    const txFile = path.join(__dirname, '../data/transactions.json');

                    let transactions = [];
                    try {
                        if (fs.existsSync(txFile)) {
                            transactions = JSON.parse(fs.readFileSync(txFile, 'utf8'));
                        }
                    } catch (e) {
                        console.error("Error reading tx file:", e);
                    }

                    transactions.push({
                        hash: txHash,
                        amount: amountDOT.toString(),
                        destination: destination,
                        timestamp: new Date().toISOString(),
                        asset: 'WND'
                    });

                    fs.writeFileSync(txFile, JSON.stringify(transactions, null, 2));
                    console.log("📝 Transaction saved to transactions.json");

                    unsub();
                }
            });

        console.log("⏳ Transaction submitted, waiting for finalization...");

    } catch (error) {
        console.error("❌ Failed to trigger Polkadot transaction:", error);
    }
}

main();