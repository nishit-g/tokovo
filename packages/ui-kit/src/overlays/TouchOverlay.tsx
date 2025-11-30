import React from 'react';
import { AbsoluteFill, interpolate } from 'remotion';
import { TouchEvent } from '@tokovo/shared-types';

export const TouchOverlay: React.FC<{
    touches: TouchEvent[];
    currentTime: number;
}> = ({ touches, currentTime }) => {
    // const { fps } = useVideoConfig();

    // Show touch for a short duration (e.g., 0.5s)
    // Filter for active touches based on their animation duration
    const activeTouches = touches.filter(t => {
        const duration = t.action === 'long_press' ? 1.3 : 0.3; // Max duration for long press or tap
        return currentTime >= t.atSecond && currentTime < t.atSecond + duration;
    });

    if (activeTouches.length === 0) return null;

    return (
        <AbsoluteFill style={{ pointerEvents: 'none' }}>
            {activeTouches.map((touch) => {
                const timeSinceStart = currentTime - touch.atSecond;
                // Animation logic
                // Tap: Scale up and fade out quickly
                // Long Press: Scale up slowly and hold, then fade

                let scale = 0;
                let opacity = 0;

                if (touch.action === 'long_press') {
                    // Long press animation (e.g. 1 second hold)
                    if (timeSinceStart < 0.2) {
                        scale = interpolate(timeSinceStart, [0, 0.2], [0, 1.5], { extrapolateRight: 'clamp' });
                        opacity = interpolate(timeSinceStart, [0, 0.2], [0, 0.5], { extrapolateRight: 'clamp' });
                    } else if (timeSinceStart < 1.0) {
                        // Pulse effect while holding
                        const pulse = Math.sin((timeSinceStart - 0.2) * 10) * 0.1;
                        scale = 1.5 + pulse;
                        opacity = 0.5;
                    } else {
                        // Fade out
                        scale = 1.5;
                        opacity = interpolate(timeSinceStart, [1.0, 1.3], [0.5, 0], { extrapolateRight: 'clamp' });
                    }
                } else {
                    // Default Tap animation
                    scale = interpolate(timeSinceStart, [0, 0.15], [0, 1], { extrapolateRight: 'clamp' });
                    opacity = interpolate(timeSinceStart, [0.1, 0.3], [0.6, 0], { extrapolateRight: 'clamp' });
                }

                return (
                    <div
                        key={touch.id}
                        style={{
                            position: 'absolute',
                            left: touch.x,
                            top: touch.y,
                            width: 40,
                            height: 40,
                            borderRadius: '50%',
                            backgroundColor: 'rgba(200, 200, 200, 0.8)',
                            transform: `translate(-50%, -50%) scale(${scale})`,
                            opacity: opacity,
                            pointerEvents: 'none',
                            border: touch.action === 'long_press' ? '2px solid rgba(255, 255, 255, 0.8)' : 'none',
                        }}
                    />
                );
            })}
        </AbsoluteFill>
    );
};
