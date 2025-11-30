import React from 'react';
import { AbsoluteFill, useVideoConfig, interpolate, Easing } from 'remotion';
import { NotificationEvent } from '@tokovo/shared-types';

export const NotificationOverlay: React.FC<{
    notifications: NotificationEvent[];
    currentTime: number;
}> = ({ notifications, currentTime }) => {
    const { fps } = useVideoConfig();

    // Filter active notifications
    const activeNotification = notifications.find(n => {
        const duration = n.durationSeconds || 5;
        return currentTime >= n.atSecond && currentTime < n.atSecond + duration;
    });

    if (!activeNotification) return null;

    // Animation
    const timeSinceStart = currentTime - activeNotification.atSecond;
    const frameSinceStart = timeSinceStart * fps;

    const translateY = interpolate(
        frameSinceStart,
        [0, 15, 120, 135], // Enter, Stay, Exit
        [-100, 20, 20, -100],
        {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
            easing: Easing.out(Easing.cubic),
        }
    );

    return (
        <AbsoluteFill style={{ pointerEvents: 'none' }}>
            <div
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 20,
                    right: 20,
                    height: 80,
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    backdropFilter: 'blur(20px)',
                    borderRadius: 20,
                    transform: `translateY(${translateY}px)`,
                    display: 'flex',
                    alignItems: 'center',
                    padding: '0 20px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                    zIndex: 1000,
                }}
            >
                {/* App Icon */}
                <div style={{
                    width: 40,
                    height: 40,
                    borderRadius: 10,
                    backgroundColor: activeNotification.appId === 'whatsapp' ? '#25D366' : '#007AFF',
                    marginRight: 15,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    color: 'white',
                    fontWeight: 'bold',
                }}>
                    {activeNotification.appId[0].toUpperCase()}
                </div>

                {/* Content */}
                <div>
                    <div style={{ fontWeight: '600', fontSize: 16, color: 'black' }}>{activeNotification.title}</div>
                    <div style={{ fontSize: 14, color: '#333' }}>{activeNotification.message}</div>
                </div>
            </div>
        </AbsoluteFill>
    );
};
