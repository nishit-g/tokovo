import React from 'react';
import { Img, staticFile } from 'remotion';
import { Message, TypingIndicator as TypingIndicatorType } from '@tokovo/shared-types';
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
    messages: Message[];
    activeTyping: TypingIndicatorType[];
    chatTitle: string;
    avatarAssetId?: string;
    wallpaperAssetId?: string;
    isGroup?: boolean;
    senderName?: string;
}> = ({ messages, activeTyping, chatTitle, avatarAssetId, wallpaperAssetId, isGroup, senderName }) => {

    const resolveAvatar = (id?: string) => {
        if (!id) return null;
        if (id.startsWith('http') || id.startsWith('data:')) return id;
        return staticFile(id);
    };

    const avatarSrc = resolveAvatar(avatarAssetId);

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
                    height: 60,
                    backgroundColor: '#f6f6f6',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '0 10px',
                    borderBottom: '1px solid #ddd',
                    zIndex: 10,
                }}
            >
                <div style={{ fontSize: 24, color: '#007AFF', marginRight: 5 }}>‹</div>
                <div
                    style={{
                        width: 36,
                        height: 36,
                        borderRadius: '50%',
                        backgroundColor: '#ccc',
                        marginRight: 10,
                        overflow: 'hidden',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        fontSize: 18
                    }}
                >
                    {avatarSrc ? (
                        <Img src={avatarSrc} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                        <span>👤</span>
                    )}
                </div>
                <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 'bold', fontSize: 16 }}>{chatTitle}</div>
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
                {messages.map((msg) => {
                    const isMe = msg.sender === 'me';
                    const showSenderName = isGroup && !isMe;

                    return (
                        <MessageBubble
                            key={msg.id}
                            text={msg.text}
                            isMe={isMe}
                            time={new Date(msg.atSecond * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            status={msg.status}
                            senderName={showSenderName ? msg.sender : undefined}
                            type={msg.type}
                        />
                    );
                })}
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
