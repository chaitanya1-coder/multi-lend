import React from 'react';

const Card = ({ children, className = '', style = {} }) => {
    return (
        <div
            className={`glass-panel ${className}`}
            style={{
                padding: '1.5rem',
                ...style
            }}
        >
            {children}
        </div>
    );
};

export default Card;
