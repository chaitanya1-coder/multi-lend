const { Keyring } = require('@polkadot/api');
const { cryptoWaitReady } = require('@polkadot/util-crypto');

async function main() {
    await cryptoWaitReady();
    const keyring = new Keyring({ type: 'sr25519' });
    const RELAYER_MNEMONIC = "bottom drive obey lake curtain smoke basket hold race lonely fit walk";
    const relayer = keyring.addFromUri(RELAYER_MNEMONIC);
    console.log(relayer.address);
}

main();
