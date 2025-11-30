import React from 'react';
import { AbsoluteFill } from 'remotion';

export const KeyboardOverlay: React.FC<{
    isVisible: boolean;
    currentTime: number;
    activeTyping: boolean;
}> = ({ isVisible, currentTime, activeTyping }) => {
    // const { fps } = useVideoConfig();

    // Simple slide up/down animation based on visibility
    // In a real implementation, we'd track "showAt" and "hideAt" times
    // For now, we'll just show it if activeTyping is true

    if (!activeTyping) return null;

    return (
        <AbsoluteFill style={{ pointerEvents: 'none', justifyContent: 'flex-end' }}>
            <div
                style={{
                    width: '100%',
                    height: 300, // Approximate keyboard height
                    backgroundColor: '#d1d5db', // Light gray iOS keyboard background
                    borderTopLeftRadius: 20,
                    borderTopRightRadius: 20,
                    display: 'flex',
                    flexDirection: 'column',
                    padding: 10,
                    boxShadow: '0 -2px 10px rgba(0,0,0,0.1)',
                }}
            >
                {/* Mock Keyboard Rows */}
                <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#6b7280' }}>
                    [iOS Keyboard Placeholder]
                </div>
                <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#6b7280' }}>
                    Typing...
                </div>
            </div>
        </AbsoluteFill>
    );
};
