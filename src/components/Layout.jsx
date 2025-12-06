import React from 'react';
import Navbar from './Navbar';

const Layout = ({ children }) => {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Navbar />
            <main style={{ flex: 1, padding: '2rem 0' }}>
                <div className="container">
                    {children}
                </div>
            </main>
            <footer style={{
                padding: '2rem 0',
                textAlign: 'center',
                color: 'var(--color-text-secondary)',
                fontSize: '0.875rem',
                borderTop: '1px solid rgba(255,255,255,0.05)'
            }}>
                <div className="container">
                    &copy; 2025 MultiLend. Powered by Stellar & Polkadot.
                </div>
            </footer>
        </div>
    );
};

export default Layout;
