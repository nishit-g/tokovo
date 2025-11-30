import React from 'react';
import { Conversation, Message, TypingIndicator as TypingIndicatorType } from '@tokovo/shared-types';
import { MessageBubble } from '../components/MessageBubble';
import { TypingIndicator } from '../components/TypingIndicator';

const BackIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="#007AFF">
        <path d="M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6 1.41-1.41z" />
    </svg>
);

const VideoCallIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="#007AFF">
        <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z" />
    </svg>
);

const PhoneIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="#007AFF">
        <path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56-.35-.12-.74-.03-1.01.24l-2.2 2.2c-2.83-1.44-5.15-3.75-6.59-6.59l2.2-2.21c.28-.26.36-.65.25-1.01A11.36 11.36 0 008.59 3.91c-.35-.7-1.04-1.15-1.84-1.15H3.95C2.87 2.76 2 3.63 2 4.71c0 10.66 8.64 19.3 19.3 19.3 1.08 0 1.95-.87 1.95-1.95v-2.81c0-.8-.45-1.49-1.15-1.84-.36-.11-.73-.16-1.09-.16z" />
    </svg>
);

const MicIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="#007AFF">
        <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
        <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
    </svg>
);

const PlusIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="#007AFF">
        <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
    </svg>
);

export const ChatScreen: React.FC<{
    conversation: Conversation;
    visibleMessages: Message[];
    activeTyping: TypingIndicatorType[];
}> = ({ conversation, visibleMessages, activeTyping }) => {
    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                backgroundColor: '#E5DDD5', // WhatsApp default background
                backgroundImage: 'url("https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png")', // WhatsApp doodle
                backgroundSize: '400px', // Adjust pattern size
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
            }}
        >
            {/* Header */}
            <div
                style={{
                    height: 95, // Taller for status bar + nav
                    paddingTop: 47, // Space for Dynamic Island
                    backgroundColor: 'rgba(245, 245, 245, 0.95)', // Translucent iOS header
                    backdropFilter: 'blur(10px)',
                    borderBottom: '0.5px solid rgba(0,0,0,0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    paddingLeft: 10,
                    paddingRight: 15,
                    justifyContent: 'space-between',
                    zIndex: 80,
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <BackIcon />
                    <div
                        style={{
                            width: 38,
                            height: 38,
                            borderRadius: '50%',
                            backgroundColor: '#ccc',
                            overflow: 'hidden',
                            marginRight: 8,
                        }}
                    >
                        {/* Avatar placeholder */}
                        <div style={{ width: '100%', height: '100%', backgroundColor: '#999' }} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                        <div style={{ fontSize: 16, fontWeight: '600', color: '#000', lineHeight: '1.2' }}>
                            {conversation.chatTitle}
                        </div>
                        <div style={{ fontSize: 12, color: '#8e8e93', lineHeight: '1.2' }}>online</div>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: 20 }}>
                    <VideoCallIcon />
                    <PhoneIcon />
                </div>
            </div>

            {/* Messages Area */}
            <div
                style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    padding: '105px 0 80px 0', // Top padding for header, bottom for footer
                    overflow: 'hidden',
                }}
            >
                {visibleMessages.map((msg) => (
                    <MessageBubble
                        key={msg.id}
                        message={msg}
                        isMe={msg.sender !== 'alex'}
                    />
                ))}
                {activeTyping.length > 0 && <TypingIndicator />}
            </div>

            {/* Footer */}
            <div
                style={{
                    height: 80, // Taller for home indicator
                    backgroundColor: '#F6F6F6',
                    borderTop: '0.5px solid rgba(0,0,0,0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '0 10px 25px 10px', // Bottom padding for home indicator
                    gap: 12,
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    zIndex: 80,
                }}
            >
                <PlusIcon />
                <div
                    style={{
                        flex: 1,
                        height: 36,
                        backgroundColor: '#fff',
                        borderRadius: 18,
                        border: '0.5px solid rgba(0,0,0,0.1)',
                        padding: '0 15px',
                        display: 'flex',
                        alignItems: 'center',
                        fontSize: 16,
                        color: '#000',
                    }}
                >

                </div>
                <MicIcon />
            </div>
        </div>
    );
};
