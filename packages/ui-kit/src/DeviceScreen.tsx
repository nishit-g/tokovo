import React from 'react';
import { Device, App, Message, TypingIndicator } from '@tokovo/shared-types';
import { ChatScreen as WhatsappChatScreen } from './apps/whatsapp/ios/screens/ChatScreen';
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
            return (
                <WhatsappChatScreen
                    conversation={activeApp.data.conversation}
                    visibleMessages={appState.visibleMessages}
                    activeTyping={appState.activeTyping}
                />
            );
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
