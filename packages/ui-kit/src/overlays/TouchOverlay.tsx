import React from 'react';
import { AbsoluteFill, useVideoConfig, interpolate } from 'remotion';
import { TouchEvent } from '@tokovo/shared-types';

export const TouchOverlay: React.FC<{
    touches: TouchEvent[];
    currentTime: number;
}> = ({ touches, currentTime }) => {
    const { fps } = useVideoConfig();

    // Show touch for a short duration (e.g., 0.5s)
    const activeTouch = touches.find(t => {
        return currentTime >= t.atSecond && currentTime < t.atSecond + 0.5;
    });

    if (!activeTouch) return null;

    const timeSinceStart = currentTime - activeTouch.atSecond;
    const frameSinceStart = timeSinceStart * fps;

    // Scale animation for tap
    const scale = interpolate(
        frameSinceStart,
        [0, 5, 15],
        [0.5, 1, 0],
        { extrapolateRight: 'clamp' }
    );

    const opacity = interpolate(
        frameSinceStart,
        [0, 10, 15],
        [0.6, 0.6, 0],
        { extrapolateRight: 'clamp' }
    );

    return (
        <AbsoluteFill style={{ pointerEvents: 'none' }}>
            <div
                style={{
                    position: 'absolute',
                    left: `${activeTouch.x}%`,
                    top: `${activeTouch.y}%`,
                    width: 60,
                    height: 60,
                    borderRadius: '50%',
                    backgroundColor: 'rgba(200, 200, 200, 0.5)',
                    border: '2px solid rgba(255, 255, 255, 0.8)',
                    transform: `translate(-50%, -50%) scale(${scale})`,
                    opacity,
                    zIndex: 2000,
                    boxShadow: '0 0 10px rgba(255,255,255,0.5)',
                }}
            />
        </AbsoluteFill>
    );
};
