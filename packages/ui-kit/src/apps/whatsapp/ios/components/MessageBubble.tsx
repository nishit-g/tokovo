import React from 'react';
import { Message } from '@tokovo/shared-types';

const Tail = ({ isMe }: { isMe: boolean }) => (
    <svg
        viewBox="0 0 8 13"
        width="8"
        height="13"
        style={{
            position: 'absolute',
            top: 0,
            [isMe ? 'right' : 'left']: -8,
            transform: isMe ? 'scaleX(1)' : 'scaleX(-1)',
            fill: isMe ? '#E7FFDB' : '#FFFFFF',
            filter: 'drop-shadow(0 1px 0.5px rgba(0,0,0,0.13))',
            zIndex: 1,
        }}
    >
        <path d="M5.188 1H0v11.193l6.467-8.625C7.526 2.156 6.958 1 5.188 1z" />
    </svg>
);

const CheckIcon = ({ status }: { status: 'sent' | 'delivered' | 'read' }) => {
    const color = status === 'read' ? '#53BDEB' : '#8696A0'; // WhatsApp Blue and Gray
    return (
        <svg width="16" height="11" viewBox="0 0 16 11" fill="none">
            <path
                d="M4.3 8.1L1.2 5L0.5 5.7L4.3 9.5L12.3 1.5L11.6 0.8L4.3 8.1Z"
                fill={color}
            />
            {status !== 'sent' && (
                <path
                    d="M7.8 8.1L4.7 5L4 5.7L7.8 9.5L15.8 1.5L15.1 0.8L7.8 8.1Z"
                    fill={color}
                    style={{ transform: 'translateX(3px)' }}
                />
            )}
        </svg>
    );
};

export const MessageBubble: React.FC<{
    text: string;
    isMe: boolean;
    time: string;
    status: 'sent' | 'delivered' | 'read';
    senderName?: string;
}> = ({ text, isMe, time, status, senderName }) => {
    return (
        <div
            style={{
                alignSelf: isMe ? 'flex-end' : 'flex-start',
                backgroundColor: isMe ? '#E7FFDB' : '#FFFFFF',
                padding: '6px 7px 8px 9px',
                borderRadius: 7.5,
                margin: '2px 15px',
                maxWidth: '75%',
                boxShadow: '0 1px 0.5px rgba(0,0,0,0.13)',
                fontSize: 16,
                lineHeight: '19px',
                position: 'relative',
                borderTopRightRadius: isMe ? 0 : 7.5,
                borderTopLeftRadius: isMe ? 7.5 : 0,
                color: '#111B21',
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
                display: 'flex',
                flexDirection: 'column'
            }}
        >
            <Tail isMe={isMe} />
            {senderName && (
                <div style={{
                    fontSize: 12,
                    color: '#e542a3', // WhatsApp-like color for names
                    marginBottom: 2,
                    fontWeight: 500
                }}>
                    {senderName}
                </div>
            )}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span>{text}</span>
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'flex-end',
                        alignItems: 'center',
                        gap: 3,
                        marginTop: 2,
                        fontSize: 11,
                        color: 'rgba(17, 27, 33, 0.5)', // WhatsApp timestamp color
                    }}
                >
                    <span>{time}</span>
                    {isMe && <CheckIcon status={status} />}
                </div>
            </div>
        </div>
    );
};
