const { ApiPromise, WsProvider, Keyring } = require('@polkadot/api');

const POLKADOT_WS_URL = "wss://westend-rpc.polkadot.io";
const RELAYER_MNEMONIC = "bottom drive obey lake curtain smoke basket hold race lonely fit walk";

async function main() {
    console.log(`🔌 Connecting to Polkadot (Westend)...`);
    const wsProvider = new WsProvider(POLKADOT_WS_URL);
    const api = await ApiPromise.create({ provider: wsProvider });
    console.log(`✅ Connected!`);

    const keyring = new Keyring({ type: 'sr25519' });
    const relayer = keyring.addFromUri(RELAYER_MNEMONIC);
    console.log(`🔐 Relayer Address: ${relayer.address}`);

    const { data: balance } = await api.query.system.account(relayer.address);
    console.log(`💰 Relayer Balance: ${balance.free.toHuman()}`);
    console.log(`   Raw: ${balance.free.toString()}`);

    if (balance.free.isZero()) {
        console.error("❌ RELAYER HAS 0 FUNDS!");
    } else {
        console.log("✅ Relayer has funds.");
    }

    process.exit(0);
}

main().catch(console.error);
