import React from 'react';

const Input = ({ label, value, onChange, placeholder, type = 'text', rightLabel }) => {
    return (
        <div style={{ marginBottom: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <label style={{
                    color: 'var(--color-text-secondary)',
                    fontSize: '0.875rem'
                }}>
                    {label}
                </label>
                {rightLabel && (
                    <span style={{
                        color: 'var(--color-text-secondary)',
                        fontSize: '0.875rem'
                    }}>
                        {rightLabel}
                    </span>
                )}
            </div>
            <input
                type={type}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                style={{
                    width: '100%',
                    padding: '0.75rem',
                    backgroundColor: 'rgba(0, 0, 0, 0.2)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: 'var(--border-radius-sm)',
                    color: 'white',
                    fontSize: '1rem',
                    outline: 'none',
                    transition: 'border-color 0.2s'
                }}
                onFocus={(e) => e.target.style.borderColor = 'var(--color-primary)'}
                onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'}
            />
        </div>
    );
};

export default Input;
