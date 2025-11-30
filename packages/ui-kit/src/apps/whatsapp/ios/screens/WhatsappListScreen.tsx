import React from 'react';
import { AbsoluteFill, Img, staticFile } from 'remotion';
import { Conversation, Device } from '@tokovo/shared-types';
import { StatusBar } from '../../../../devices/ios/components/StatusBar';

export const WhatsappListScreen: React.FC<{
    conversations: Conversation[];
    device: Device;
}> = ({ conversations, device }) => {
    return (
        <AbsoluteFill style={{ backgroundColor: '#ffffff' }}>
            <StatusBar device={device} />

            {/* Header */}
            <div style={{
                marginTop: 47,
                padding: '15px 20px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: '#f6f6f6',
                borderBottom: '1px solid #e5e5e5'
            }}>
                <div style={{ fontSize: 17, color: '#007AFF', fontWeight: 500 }}>Edit</div>
                <div style={{ fontSize: 22, fontWeight: 'bold', color: '#000' }}>Chats</div>
                <div style={{ fontSize: 24, color: '#007AFF' }}>📝</div>
            </div>

            {/* Search Bar */}
            <div style={{ padding: '10px 15px', backgroundColor: '#fff' }}>
                <div style={{
                    backgroundColor: '#f0f0f2',
                    borderRadius: 10,
                    padding: '8px 12px',
                    display: 'flex',
                    alignItems: 'center',
                    color: '#8e8e93',
                    fontSize: 16
                }}>
                    <span style={{ marginRight: 8 }}>🔍</span> Search
                </div>
            </div>

            {/* Chat List */}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
                {conversations.map((chat, index) => {
                    const lastMessage = chat.messages[chat.messages.length - 1];
                    const time = lastMessage ? new Date(lastMessage.atSecond * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';

                    return (
                        <div key={index} style={{
                            display: 'flex',
                            padding: '12px 15px',
                            borderBottom: '1px solid #f0f0f0',
                            alignItems: 'center'
                        }}>
                            {/* Avatar */}
                            <div style={{
                                width: 60,
                                height: 60,
                                borderRadius: '50%',
                                backgroundColor: '#e1e1e1',
                                marginRight: 15,
                                overflow: 'hidden',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                fontSize: 24
                            }}>
                                {chat.avatarAssetId.startsWith('http') ? (
                                    <Img src={chat.avatarAssetId} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                    <span>👤</span>
                                )}
                            </div>

                            {/* Content */}
                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                    <div style={{ fontWeight: 'bold', fontSize: 17, color: '#000' }}>
                                        {chat.isGroup ? (chat.groupName || chat.chatTitle) : chat.chatTitle}
                                    </div>
                                    <div style={{ fontSize: 14, color: '#8e8e93' }}>
                                        {time || 'Yesterday'}
                                    </div>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <div style={{
                                        fontSize: 15,
                                        color: '#8e8e93',
                                        whiteSpace: 'nowrap',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        maxWidth: 200
                                    }}>
                                        {lastMessage ? lastMessage.text : 'No messages yet'}
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Bottom Tab Bar */}
            <div style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: 83,
                backgroundColor: '#f6f6f6',
                borderTop: '1px solid #b2b2b2',
                display: 'flex',
                justifyContent: 'space-around',
                paddingTop: 10,
                paddingBottom: 20
            }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: '#8e8e93' }}>
                    <div style={{ fontSize: 24 }}>◎</div>
                    <div style={{ fontSize: 10, marginTop: 4 }}>Status</div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: '#8e8e93' }}>
                    <div style={{ fontSize: 24 }}>📞</div>
                    <div style={{ fontSize: 10, marginTop: 4 }}>Calls</div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: '#007AFF' }}>
                    <div style={{ fontSize: 24 }}>💬</div>
                    <div style={{ fontSize: 10, marginTop: 4 }}>Chats</div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: '#8e8e93' }}>
                    <div style={{ fontSize: 24 }}>⚙️</div>
                    <div style={{ fontSize: 10, marginTop: 4 }}>Settings</div>
                </div>
            </div>
        </AbsoluteFill>
    );
};
