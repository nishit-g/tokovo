import React from 'react';
import { AbsoluteFill } from 'remotion';

export const LockScreen: React.FC<{
    time: string;
    date?: string;
}> = ({ time, date = "Monday, June 5" }) => {
    return (
        <AbsoluteFill
            style={{
                // iOS 16 "Astronomy" / Gradient style wallpaper
                background: 'linear-gradient(180deg, #1a1a2e 0%, #16213e 40%, #2a3b55 100%)',
                justifyContent: 'flex-start',
                alignItems: 'center',
                paddingTop: 100,
                color: 'white',
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
            }}
        >
            {/* Wallpaper Overlay for depth */}
            <AbsoluteFill
                style={{
                    background: 'radial-gradient(circle at 50% 30%, rgba(76, 161, 175, 0.4) 0%, transparent 60%)',
                    zIndex: 0,
                }}
            />

            <div style={{ zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
                {/* Lock Icon */}
                <div style={{ marginBottom: 20, opacity: 0.8 }}>
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="white">
                        <path d="M12 17a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm6-9h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM9 6c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9V6z" />
                    </svg>
                </div>

                {/* Date */}
                <div style={{
                    fontSize: 24,
                    fontWeight: '600',
                    opacity: 0.9,
                    marginBottom: 5,
                    textShadow: '0 2px 10px rgba(0,0,0,0.2)'
                }}>
                    {date}
                </div>

                {/* Time - iOS 16 Thick Font Style */}
                <div style={{
                    fontSize: 200,
                    fontWeight: '700',
                    lineHeight: 0.85,
                    letterSpacing: -4,
                    textShadow: '0 4px 20px rgba(0,0,0,0.3)',
                    fontVariantNumeric: 'tabular-nums'
                }}>
                    {time}
                </div>
            </div>

            {/* Bottom Actions */}
            <div
                style={{
                    position: 'absolute',
                    bottom: 50,
                    width: '100%',
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '0 46px',
                    zIndex: 10,
                }}
            >
                {/* Flashlight Button */}
                <div
                    style={{
                        width: 50,
                        height: 50,
                        borderRadius: '50%',
                        backgroundColor: 'rgba(30, 30, 30, 0.4)',
                        backdropFilter: 'blur(30px)',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        border: '1px solid rgba(255,255,255,0.1)',
                        boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
                    }}
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                        <path d="M6 2h12v3H6zM6 6h12v10H6zM6 17h12v5H6z" />
                    </svg>
                </div>

                {/* Camera Button */}
                <div
                    style={{
                        width: 50,
                        height: 50,
                        borderRadius: '50%',
                        backgroundColor: 'rgba(30, 30, 30, 0.4)',
                        backdropFilter: 'blur(30px)',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        border: '1px solid rgba(255,255,255,0.1)',
                        boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
                    }}
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                        <path d="M9.66 3h4.69L16 4.83V19H8V4.83L9.66 3zM12 16c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4z" />
                    </svg>
                </div>
            </div>

            {/* Swipe Indicator */}
            <div
                style={{
                    position: 'absolute',
                    bottom: 12,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: 140,
                    height: 5,
                    backgroundColor: 'white',
                    borderRadius: 10,
                    opacity: 0.8,
                    zIndex: 10,
                    boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
                }}
            />
        </AbsoluteFill>
    );
};
