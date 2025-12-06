import React, { useState } from 'react';
import Card from './Card';
import AssetSelector from './AssetSelector';
import Input from './Input';

const POLKADOT_ASSETS = [
    { symbol: 'DOT', name: 'Polkadot' },
    { symbol: 'KSM', name: 'Kusama' },
    { symbol: 'ACA', name: 'Acala' },
    { symbol: 'WND', name: 'Westend' }
];

const BorrowCard = ({ destination, onDestinationChange }) => {
    const [asset, setAsset] = useState('DOT');
    const [amount, setAmount] = useState('');

    const handleBorrow = async () => {
        if (asset === 'WND') {
            // Check for real transactions
            try {
                // Note: In Vite, we can import JSON directly or fetch it. 
                // Since it's written by backend, fetch is better as import might be cached.
                // However, serving src/data might require config. 
                // Let's assume the user moves it to public or we use a dynamic import.
                // Actually, let's try to fetch it relative to root if possible, or just import it.
                // Dynamic import might work: import('../data/transactions.json')

                // For now, let's just alert the user to check the console or wait for the bridge.
                // But the user wants it in the alert.
                // Let's try to fetch it.
                const response = await fetch('/src/data/transactions.json');
                const transactions = await response.json();

                // Find latest tx for this destination
                const myTx = transactions.reverse().find(tx => tx.destination === destination && tx.asset === 'WND');

                if (myTx) {
                    alert(`Latest WND Transfer found!\n\nTransaction Hash: ${myTx.hash}\nAmount: ${myTx.amount} Planck`);
                } else {
                    alert(`No recent WND transfer found for ${destination}.\n\nPlease ensure you have Deposited Collateral to trigger the bridge.`);
                }
            } catch (e) {
                console.error("Error fetching transactions:", e);
                alert("Could not fetch transaction history. Please check console.");
            }
        } else {
            alert(`Borrowing ${amount} ${asset} from Polkadot Network...`);
        }
        setAmount('');
    };

    return (
        <Card>
            <h2 style={{ marginBottom: '1.5rem', fontSize: '1.25rem' }}>Borrow Assets</h2>

            <div style={{ marginBottom: '1rem', display: 'flex', gap: '1rem' }}>
                <div style={{ flex: 1, padding: '0.75rem', background: 'rgba(217, 70, 239, 0.1)', borderRadius: '8px', border: '1px solid rgba(217, 70, 239, 0.2)' }}>
                    <div style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>Borrow Limit</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>$1,200.00</div>
                </div>
                <div style={{ flex: 1, padding: '0.75rem', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '8px' }}>
                    <div style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>APY</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--color-text-accent)' }}>4.5%</div>
                </div>
            </div>

            <AssetSelector
                label="Select Asset (Polkadot)"
                assets={POLKADOT_ASSETS}
                selectedAsset={asset}
                onSelect={setAsset}
            />

            <Input
                label="Amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                type="number"
            />

            <Input
                label="Polkadot Destination Address"
                value={destination}
                onChange={(e) => onDestinationChange(e.target.value)}
                placeholder="5GrwvaEF..."
                type="text"
            />

            <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                    <span style={{ color: 'var(--color-text-secondary)' }}>Health Factor</span>
                    <span style={{ color: 'var(--color-success)' }}>Safe (1.5)</span>
                </div>
                <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ width: '70%', height: '100%', background: 'var(--color-success)' }}></div>
                </div>
            </div>

            <button
                className="btn-primary"
                style={{ width: '100%', background: 'linear-gradient(135deg, var(--color-secondary), var(--color-primary))' }}
                onClick={handleBorrow}
            >
                Borrow {asset}
            </button>
        </Card>
    );
};

export default BorrowCard;
