import React from "react";
import { AbsoluteFill } from "remotion";
import { WhatsappApp } from "@tokovo/apps-whatsapp";
import { WorldState, APP_IDS } from "@tokovo/core";
import { iPhone16Profile } from "@tokovo/devices";

const mockWorld: WorldState = {
    conversations: {
        'chat1': {
            id: 'chat1',
            type: 'dm',
            name: 'Alice',
            messages: [
                { id: '1', from: 'Alice', text: 'Hey! Check out this photo', type: 'text', timestamp: '10:00', status: 'read' },
                { id: '2', from: 'Alice', type: 'image', imageUrl: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExcDdtY2J6eHl5aDdxNHl5aDdxNHl5aDdxNHl5aDdxNHl5YSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3o7TKr3nzbh5TQTTz2/giphy.gif', text: 'Vacation!', timestamp: '10:01', status: 'read' },
                { id: '3', from: 'me', text: 'Nice! Send me a voice note.', type: 'text', timestamp: '10:02', status: 'read' },
                { id: '4', from: 'Alice', type: 'voice', duration: 15, isPlaying: false, timestamp: '10:03', status: 'read' },
                { id: '5', from: 'Alice', type: 'video', thumbnailUrl: 'https://media.giphy.com/media/3o7TKr3nzbh5TQTTz2/giphy.gif', text: 'Here is a video', durationText: '0:15', timestamp: '10:04', status: 'read' }
            ],
            typing: { 'Alice': true }
        },
        'chat2': {
            id: 'chat2',
            type: 'group',
            name: 'Family Group',
            members: [{id: '1', name: 'Mom'}, {id: '2', name: 'Dad'}],
            messages: [
                { id: '1', from: 'Mom', text: 'Dinner at 7?', type: 'text', timestamp: '09:00', status: 'read' }
            ]
        }
    },
    devices: {
        'dev1': { id: 'dev1', ownerName: 'me' }
    },
    appState: {
        [APP_IDS.WHATSAPP]: {
            currentChatId: 'chat1'
        }
    },
    camera: { activeDeviceId: 'dev1' }
} as any;

export const WhatsappNewFeaturesVideo: React.FC = () => {
    // We render the app directly inside an iPhone frame context
    // Actually just the app view for clarity

    // Scale it down to fit 1080x1920 canvas if needed, or just use AbsoluteFill
    // WhatsappApp is responsive to container usually, but let's give it fixed dimensions of iPhone
    const width = 1179; // iPhone 16 Pro roughly
    const height = 2556;

    return (
        <AbsoluteFill style={{ backgroundColor: "#000", alignItems: "center", justifyContent: "center" }}>
             <div style={{ width: width, height: height, transform: "scale(0.4)", position: "relative", backgroundColor: "#FFF" }}>
                 <WhatsappApp
                     world={mockWorld}
                     t={0}
                     platform="ios"
                 />
             </div>
        </AbsoluteFill>
    );
};

export const WhatsappListViewVideo: React.FC = () => {
    const worldList = {
        ...mockWorld,
        appState: {
            [APP_IDS.WHATSAPP]: {
                currentChatId: undefined // Should trigger List View
            }
        }
    };

    const width = 1179;
    const height = 2556;

    return (
        <AbsoluteFill style={{ backgroundColor: "#000", alignItems: "center", justifyContent: "center" }}>
             <div style={{ width: width, height: height, transform: "scale(0.4)", position: "relative", backgroundColor: "#FFF" }}>
                 <WhatsappApp
                     world={worldList}
                     t={0}
                     platform="ios"
                 />
             </div>
        </AbsoluteFill>
    );
};
