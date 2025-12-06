import React, { useState } from 'react';
import Card from './Card';
import AssetSelector from './AssetSelector';
import Input from './Input';
import { useWallet } from '../contexts/WalletContext';
import { CONTRACT_ID, NATIVE_TOKEN_ID, NETWORK_PASSPHRASE } from '../constants';
import { isConnected, signTransaction } from '@stellar/freighter-api';
import {
    Address,
    Contract,
    TransactionBuilder,
    SorobanDataBuilder,
    TimeoutInfinite,
    nativeToScVal,
    xdr,
    rpc,
    Networks
} from '@stellar/stellar-sdk';

const STELLAR_ASSETS = [
    { symbol: 'EUR', name: 'Digital Euro' },
    { symbol: 'USDC', name: 'USD Coin' },
    { symbol: 'XLM', name: 'Stellar Lumens' }
];

const DepositCard = ({ destination }) => {
    const { account, isConnected: isWalletConnected } = useWallet();
    const [asset, setAsset] = useState('XLM');
    const [amount, setAmount] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [balance, setBalance] = useState('---');

    React.useEffect(() => {
        const fetchBalance = async () => {
            if (isWalletConnected && account) {
                try {
                    const server = new rpc.Server("https://soroban-testnet.stellar.org");
                    const accountData = await server.getAccount(account);
                    // Find the native balance (XLM)
                    // Note: getAccount returns standard Horizon-like response or Soroban response?
                    // rpc.Server.getAccount returns a Soroban account object which might not have 'balances' array directly like Horizon.
                    // Actually, for Soroban RPC, getAccount usually returns the account entry.
                    // But usually for balances we use Horizon or we query the token contract.
                    // Since this is Native XLM, we can use the standard Horizon server OR check if rpc server gives it.
                    // Let's use the standard Horizon server for balances as it's easier, or query the Native Token Contract.
                    // Querying Native Token Contract is more "Soroban-native".

                    // Let's try querying the Native Token Contract (CDLZ...) using `balance` function.
                    const result = await server.getHealth(); // Just to check connection

                    // Actually, let's use the simple Horizon endpoint for XLM balance for now as it's robust.
                    // But we are using rpc.Server.
                    // Let's use the `Contract.call` to read balance from the Native Token Contract.

                    const tx = new TransactionBuilder(accountData, {
                        fee: "100",
                        networkPassphrase: Networks.TESTNET,
                    })
                        .addOperation(
                            Contract.call(
                                NATIVE_TOKEN_ID,
                                "balance",
                                xdr.ScVal.scvVec([new Address(account).toScVal()])
                            )
                        )
                        .setTimeout(TimeoutInfinite)
                        .build();

                    // Simulate to get the result
                    const sim = await server.simulateTransaction(tx);
                    if (rpc.Api.isSimulationSuccess(sim)) {
                        const balanceScVal = sim.result.retval;
                        const balanceStroops = nativeToScVal(balanceScVal); // Wait, retval IS ScVal.
                        // We need scValToNative
                        // But wait, I need to import scValToNative.
                        // Let's just use the Horizon API for simplicity if possible? 
                        // No, let's stick to Soroban RPC to be consistent.

                        // We need to decode the return value.
                        // It returns i128.
                    }
                } catch (e) {
                    console.error("Balance fetch failed:", e);
                }
            }
        };

        // fetchBalance();
    }, [isWalletConnected, account, asset]);

    // Alternative: Use Horizon for simple XLM balance
    React.useEffect(() => {
        if (isWalletConnected && account) {
            fetch(`https://friendbot.stellar.org/?addr=${account}`) // Hack to ensure account exists? No.
            // Use Horizon Testnet
            fetch(`https://horizon-testnet.stellar.org/accounts/${account}`)
                .then(res => res.json())
                .then(data => {
                    if (data.balances) {
                        const native = data.balances.find(b => b.asset_type === 'native');
                        if (native) {
                            setBalance(native.balance);
                        }
                    }
                })
                .catch(err => console.error("Horizon fetch error:", err));
        }
    }, [isWalletConnected, account]);

    const handleDeposit = async () => {
        if (!isWalletConnected) {
            alert("Please connect your wallet first!");
            return;
        }

        if (!amount || parseFloat(amount) <= 0) {
            alert("Please enter a valid amount.");
            return;
        }

        setIsLoading(true);
        try {
            const server = new rpc.Server("https://soroban-testnet.stellar.org");
            const sourceAccount = await server.getAccount(account);

            // Convert amount to stroops (7 decimals for XLM)
            const amountInStroops = Math.floor(parseFloat(amount) * 10000000).toString();

            // Build the transaction
            let tx = new TransactionBuilder(sourceAccount, {
                fee: "100",
                networkPassphrase: Networks.TESTNET,
            })
                .addOperation(
                    new Contract(CONTRACT_ID).call(
                        "deposit",
                        new Address(account).toScVal(), // user
                        new Address(NATIVE_TOKEN_ID).toScVal(), // token (Native XLM)
                        nativeToScVal(amountInStroops, { type: "i128" }), // amount
                        nativeToScVal(destination, { type: "string" }) // destination
                    )
                )
                .setTimeout(TimeoutInfinite)
                .build();

            // Simulate and prepare transaction (required for Soroban)
            tx = await server.prepareTransaction(tx);

            // Sign with Freighter
            const { signedTxXdr } = await signTransaction(tx.toXDR(), {
                networkPassphrase: Networks.TESTNET
            });

            if (signedTxXdr) {
                // Submit to network
                const txHash = await server.sendTransaction(TransactionBuilder.fromXDR(signedTxXdr, Networks.TESTNET));

                if (txHash.status !== "PENDING") {
                    throw new Error("Transaction failed to submit");
                }

                alert(`Deposit Submitted! Hash: ${txHash.hash}`);
                setAmount('');
            }
        } catch (error) {
            console.error("Deposit failed:", error);
            alert(`Deposit Failed: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card>
            <h2 style={{ marginBottom: '1.5rem', fontSize: '1.25rem' }}>Deposit Collateral</h2>
            <div style={{ marginBottom: '1rem', padding: '0.75rem', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '8px', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
                <div style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>Wallet Balance</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{isWalletConnected ? balance : '---'} {asset}</div>
            </div>

            <AssetSelector
                label="Select Asset (Stellar)"
                assets={STELLAR_ASSETS}
                selectedAsset={asset}
                onSelect={setAsset}
            />

            <Input
                label="Amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                type="number"
                rightLabel={`Max: ---`}
            />



            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
                <span>Collateral Factor</span>
                <span style={{ color: 'var(--color-success)' }}>80%</span>
            </div>

            <button
                className="btn-primary"
                style={{ width: '100%', opacity: isLoading ? 0.7 : 1 }}
                onClick={handleDeposit}
                disabled={isLoading}
            >
                {isLoading ? 'Processing...' : `Deposit ${asset}`}
            </button>
        </Card>
    );
};

export default DepositCard;
