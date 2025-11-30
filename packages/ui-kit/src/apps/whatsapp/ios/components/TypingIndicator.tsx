import React from 'react';

export const TypingIndicator: React.FC = () => {
    return (
        <div
            style={{
                alignSelf: 'flex-start',
                backgroundColor: '#fff',
                padding: '10px 15px',
                borderRadius: 10,
                margin: '5px 15px',
                boxShadow: '0 1px 1px rgba(0,0,0,0.1)',
                fontSize: 24,
                color: '#888',
            }}
        >
            typing...
        </div>
    );
};
