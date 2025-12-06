import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useWallet } from '../contexts/WalletContext';

const Navbar = () => {
  const { isConnected, account, connect, error } = useWallet();

  const handleConnect = () => {
    connect();
  };

  return (
    <nav style={{
      borderBottom: '1px solid rgba(255,255,255,0.05)',
      padding: '1rem 0',
      position: 'sticky',
      top: 0,
      zIndex: 50,
      backdropFilter: 'blur(10px)',
      backgroundColor: 'rgba(11, 14, 20, 0.8)'
    }}>
      <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link to="/" style={{ fontSize: '1.5rem', fontWeight: 'bold', letterSpacing: '-0.02em' }}>
          <span className="text-gradient">Multi</span>Lend
        </Link>

        <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
          <Link to="/" style={{ color: 'var(--color-text-secondary)', transition: 'color 0.2s' }}>Dashboard</Link>
          <Link to="/markets" style={{ color: 'var(--color-text-secondary)', transition: 'color 0.2s' }}>Markets</Link>

          <button
            className="btn-primary"
            onClick={handleConnect}
            style={{ fontSize: '0.9rem', padding: '0.5rem 1rem' }}
          >
            {isConnected ? `${account.slice(0, 4)}...${account.slice(-4)}` : 'Connect Wallet'}
          </button>
          {error && <div style={{ color: 'red', fontSize: '0.8rem' }}>{error}</div>}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
