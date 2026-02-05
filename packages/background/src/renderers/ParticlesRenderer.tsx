/**
 * Particles Background Renderer
 * 
 * Generates floating particles using pure CSS/JS animations.
 */

import React, { useMemo } from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import type { ResolvedBackgroundConfig } from "../types";

interface ParticlesRendererProps {
    config: ResolvedBackgroundConfig;
    frame?: number;
    fps?: number;
}

interface Particle {
    id: number;
    x: number;
    y: number;
    size: number;
    speed: number;
    opacity: number;
}

const PARTICLE_COUNT = 30;

export const ParticlesRenderer: React.FC<ParticlesRendererProps> = ({
    config,
    frame: frameProp,
    fps: fpsProp,
}) => {
    const videoConfig = useVideoConfig();
    const currentFrame = useCurrentFrame();

    const frame = frameProp ?? currentFrame;
    const fps = fpsProp ?? videoConfig.fps;

    // Generate consistent particles based on seed
    const particles = useMemo<Particle[]>(() => {
        const result: Particle[] = [];
        for (let i = 0; i < PARTICLE_COUNT; i++) {
            // Pseudo-random but deterministic based on index
            const seed = i * 12345.6789;
            result.push({
                id: i,
                x: (seed % 100),
                y: (seed * 1.5 % 100),
                size: 2 + (seed % 4),
                speed: 0.5 + (seed % 1.5),
                opacity: 0.2 + (seed % 0.6),
            });
        }
        return result;
    }, []);

    const containerStyle: React.CSSProperties = {
        backgroundColor: config.color || "#0a0a1a",
        opacity: config.opacity ?? 1,
    };

    if (config.blur && config.blur > 0) {
        containerStyle.filter = `blur(${config.blur}px)`;
    }

    return (
        <AbsoluteFill style={containerStyle}>
            {particles.map((particle) => {
                // Calculate Y position based on frame (moving upward slowly)
                const timeInSeconds = frame / fps;
                const yOffset = (timeInSeconds * particle.speed * 10) % 120;
                const y = (particle.y - yOffset + 120) % 120 - 10; // Loop from bottom to top

                // Fade at edges
                const edgeFade = interpolate(
                    y,
                    [-10, 10, 90, 110],
                    [0, 1, 1, 0],
                    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
                );

                return (
                    <div
                        key={particle.id}
                        style={{
                            position: "absolute",
                            left: `${particle.x}%`,
                            top: `${y}%`,
                            width: particle.size,
                            height: particle.size,
                            borderRadius: "50%",
                            backgroundColor: "rgba(255, 255, 255, 0.8)",
                            opacity: particle.opacity * edgeFade,
                            pointerEvents: "none",
                        }}
                    />
                );
            })}
        </AbsoluteFill>
    );
};
