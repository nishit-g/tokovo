import React from 'react';
import { AbsoluteFill } from 'remotion';
import { Device } from '@tokovo/shared-types';
import { StatusBar } from './StatusBar';

export const PhoneFrame: React.FC<{
    device: Device;
    children: React.ReactNode;
}> = ({ device, children }) => {
    return (
        <AbsoluteFill
            style={{
                backgroundColor: '#111', // Dark background for the video
                justifyContent: 'center',
                alignItems: 'center',
            }}
        >
            {/* iPhone 14 Pro Frame */}
            <div
                style={{
                    width: 430, // iPhone 14 Pro Max width (points)
                    height: 932, // iPhone 14 Pro Max height (points)
                    backgroundColor: '#000',
                    position: 'relative',
                    borderRadius: 55,
                    boxShadow: '0 0 0 12px #1a1a1a, 0 0 0 14px #2a2a2a, 0 20px 50px rgba(0,0,0,0.5)', // Bezel simulation
                    overflow: 'hidden',
                    transform: 'scale(1.8)', // Scale up to fill 1080x1920 better
                }}
            >
                {/* Screen Content */}
                <div
                    style={{
                        width: '100%',
                        height: '100%',
                        backgroundColor: '#fff',
                        position: 'relative',
                        overflow: 'hidden',
                        borderRadius: 48,
                    }}
                >
                    <StatusBar device={device} />
                    <div style={{ flex: 1, height: '100%' }}>{children}</div>
                </div>

                {/* Dynamic Island / Notch */}
                <div
                    style={{
                        position: 'absolute',
                        top: 11,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: 126,
                        height: 37,
                        backgroundColor: '#000',
                        borderRadius: 20,
                        zIndex: 100,
                    }}
                />

                {/* Home Indicator */}
                <div
                    style={{
                        position: 'absolute',
                        bottom: 8,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: 140,
                        height: 5,
                        backgroundColor: '#000', // Usually white on dark apps, black on light apps.
                        // For WhatsApp light mode, it's black/gray.
                        borderRadius: 10,
                        zIndex: 100,
                        opacity: 0.3,
                    }}
                />
            </div>
        </AbsoluteFill>
    );
};
