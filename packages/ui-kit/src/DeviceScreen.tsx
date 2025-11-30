import React from 'react';
import { Device, App, Message, TypingIndicator } from '@tokovo/shared-types';
import { ChatScreen as WhatsappChatScreen } from './apps/whatsapp/ios/screens/ChatScreen';
import { WhatsappListScreen } from './apps/whatsapp/ios/screens/WhatsappListScreen';
import { LockScreen } from './devices/ios/screens/LockScreen';
import { HomeScreen } from './devices/ios/screens/HomeScreen';
import { AbsoluteFill } from 'remotion';

export const DeviceScreen: React.FC<{
    device: Device;
    // We pass these as props because the "engine" logic (timeline) is currently in the app.
    // In a future refactor, we might move the engine logic into the app component itself or a hook.
    appState?: {
        visibleMessages: Message[];
        activeTyping: TypingIndicator[];
    };
}> = ({ device, appState }) => {
    const activeApp = device.apps.find(app => app.id === device.activeAppId);

    if (!activeApp) {
        return <AbsoluteFill style={{ backgroundColor: 'black' }} />;
    }

    switch (activeApp.type) {
        case 'whatsapp':
            if (!appState) return null; // WhatsApp needs state
            // Check activeScreen to decide what to render
            // Default to chat screen for now to maintain backward compatibility
            // But if activeScreen is 'list', show list
            if (device.activeScreen === 'list') {
                const conversations = device.apps
                    .filter(app => app.type === 'whatsapp')
                    .map(app => app.data.conversation);
                return <WhatsappListScreen conversations={conversations} device={device} />;
            }

            return (
                <WhatsappChatScreen
                    messages={appState.visibleMessages}
                    activeTyping={appState.activeTyping}
                    chatTitle={activeApp.data.conversation.chatTitle}
                    avatarAssetId={activeApp.data.conversation.avatarAssetId}
                    wallpaperAssetId={activeApp.data.conversation.wallpaperAssetId}
                    isGroup={activeApp.data.conversation.isGroup}
                    senderName={activeApp.data.conversation.isGroup ? activeApp.data.conversation.participants?.[0] : undefined} // Simple default for now
                />
            );
        case 'whatsapp_list':
            // This app type might be redundant now if we use 'whatsapp' + activeScreen='list'
            // But keeping it for legacy support or explicit app switcher behavior
            const conversations = device.apps
                .filter(app => app.type === 'whatsapp')
                .map(app => app.data.conversation);

            return <WhatsappListScreen conversations={conversations} device={device} />;
        case 'lockscreen':
            return <LockScreen time={device.time} />;
        case 'homescreen':
            return <HomeScreen />;
        default:
            return (
                <AbsoluteFill style={{ backgroundColor: 'white', justifyContent: 'center', alignItems: 'center' }}>
                    <div style={{ color: 'black', fontSize: 40 }}>Unknown App</div>
                </AbsoluteFill>
            );
    }
};
