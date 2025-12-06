import React from 'react';
import DepositCard from '../components/DepositCard';
import BorrowCard from '../components/BorrowCard';
import Card from '../components/Card';

const Dashboard = () => {
    const [destination, setDestination] = React.useState('');

    return (
        <div>
            <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', fontWeight: 700 }}>
                Dashboard
            </h1>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '1.1rem' }}>
                Manage your collateral and loans across Stellar and Polkadot networks.
            </p>

            <div style={{
                marginTop: '2rem',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
                gap: '2rem'
            }}>
                <DepositCard destination={destination} />
                <BorrowCard destination={destination} onDestinationChange={setDestination} />
            </div>

            <div style={{ marginTop: '3rem' }}>
                <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem' }}>Transaction History</h2>
                <Card style={{ padding: '0' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                <th style={{ padding: '1rem', color: 'var(--color-text-secondary)', fontWeight: 500 }}>Type</th>
                                <th style={{ padding: '1rem', color: 'var(--color-text-secondary)', fontWeight: 500 }}>Asset</th>
                                <th style={{ padding: '1rem', color: 'var(--color-text-secondary)', fontWeight: 500 }}>Amount</th>
                                <th style={{ padding: '1rem', color: 'var(--color-text-secondary)', fontWeight: 500 }}>Status</th>
                                <th style={{ padding: '1rem', color: 'var(--color-text-secondary)', fontWeight: 500 }}>Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {[
                                { type: 'Deposit', asset: 'EUR', amount: '1,000.00', status: 'Completed', date: '2025-12-04' },
                                { type: 'Borrow', asset: 'DOT', amount: '50.00', status: 'Active', date: '2025-12-04' },
                                { type: 'Deposit', asset: 'USDC', amount: '500.00', status: 'Completed', date: '2025-12-01' },
                            ].map((tx, i) => (
                                <tr key={i} style={{ borderBottom: i < 2 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                                    <td style={{ padding: '1rem' }}>
                                        <span style={{
                                            color: tx.type === 'Deposit' ? 'var(--color-success)' : 'var(--color-secondary)',
                                            background: tx.type === 'Deposit' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(217, 70, 239, 0.1)',
                                            padding: '0.25rem 0.5rem',
                                            borderRadius: '4px',
                                            fontSize: '0.875rem'
                                        }}>
                                            {tx.type}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem' }}>{tx.asset}</td>
                                    <td style={{ padding: '1rem' }}>{tx.amount}</td>
                                    <td style={{ padding: '1rem' }}>{tx.status}</td>
                                    <td style={{ padding: '1rem', color: 'var(--color-text-secondary)' }}>{tx.date}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </Card>
            </div>
        </div>
    );
};

export default Dashboard;
