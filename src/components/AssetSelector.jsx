import React from 'react';

const AssetSelector = ({ label, assets, selectedAsset, onSelect }) => {
    return (
        <div style={{ marginBottom: '1rem' }}>
            <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                color: 'var(--color-text-secondary)',
                fontSize: '0.875rem'
            }}>
                {label}
            </label>
            <select
                value={selectedAsset}
                onChange={(e) => onSelect(e.target.value)}
                style={{
                    width: '100%',
                    padding: '0.75rem',
                    backgroundColor: 'rgba(0, 0, 0, 0.2)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: 'var(--border-radius-sm)',
                    color: 'white',
                    fontSize: '1rem',
                    outline: 'none',
                    cursor: 'pointer',
                    appearance: 'none', // Custom arrow would be better but keeping it simple for now
                    backgroundImage: `url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23FFFFFF%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 0.7rem top 50%',
                    backgroundSize: '0.65rem auto',
                }}
            >
                {assets.map((asset) => (
                    <option key={asset.symbol} value={asset.symbol}>
                        {asset.symbol} - {asset.name}
                    </option>
                ))}
            </select>
        </div>
    );
};

export default AssetSelector;
