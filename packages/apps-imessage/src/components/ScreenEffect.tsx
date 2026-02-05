/**
 * Screen Effects Component - Full-screen iMessage effects
 * Balloons, confetti, lasers, fireworks, celebration, echo, spotlight, love
 */

import React, { useEffect, useState } from "react";
import { useIMessageTheme } from "../ui/ThemeContext";

export type ScreenEffectType =
    | "balloons"
    | "confetti"
    | "lasers"
    | "fireworks"
    | "celebration"
    | "echo"
    | "spotlight"
    | "love";

interface ScreenEffectProps {
    effect: ScreenEffectType;
    onComplete?: () => void;
}

const EFFECT_DURATION: Record<ScreenEffectType, number> = {
    balloons: 4000,
    confetti: 3500,
    lasers: 3000,
    fireworks: 4000,
    celebration: 4000,
    echo: 2000,
    spotlight: 3000,
    love: 3500,
};

export const ScreenEffect: React.FC<ScreenEffectProps> = ({ effect, onComplete }) => {
    const [isActive, setIsActive] = useState(true);
    const theme = useIMessageTheme();

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsActive(false);
            onComplete?.();
        }, EFFECT_DURATION[effect]);
        return () => clearTimeout(timer);
    }, [effect, onComplete]);

    if (!isActive) return null;

    const baseStyle: React.CSSProperties = {
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        overflow: "hidden",
        zIndex: 1000,
    };

    const renderEffect = () => {
        switch (effect) {
            case "balloons":
                return <BalloonsEffect />;
            case "confetti":
                return <ConfettiEffect />;
            case "lasers":
                return <LasersEffect />;
            case "fireworks":
                return <FireworksEffect />;
            case "celebration":
                return <CelebrationEffect />;
            case "echo":
                return <EchoEffect />;
            case "spotlight":
                return <SpotlightEffect />;
            case "love":
                return <LoveEffect />;
            default:
                return null;
        }
    };

    return <div style={baseStyle}>{renderEffect()}</div>;
};

// Balloons - rising balloons from bottom
const BalloonsEffect: React.FC = () => {
    const balloonColors = ["#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7", "#DDA0DD", "#FF69B4"];
    const balloons = Array.from({ length: 15 }, (_, i) => ({
        id: i,
        color: balloonColors[i % balloonColors.length],
        left: `${5 + Math.random() * 90}%`,
        delay: Math.random() * 1.5,
        size: 40 + Math.random() * 30,
    }));

    return (
        <>
            {balloons.map((b) => (
                <div
                    key={b.id}
                    style={{
                        position: "absolute",
                        bottom: "-100px",
                        left: b.left,
                        width: b.size,
                        height: b.size * 1.2,
                        backgroundColor: b.color,
                        borderRadius: "50% 50% 50% 50%",
                        animation: `imessage-balloon-rise 4s ease-out ${b.delay}s forwards`,
                    }}
                >
                    {/* Balloon knot */}
                    <div
                        style={{
                            position: "absolute",
                            bottom: -8,
                            left: "50%",
                            transform: "translateX(-50%)",
                            width: 0,
                            height: 0,
                            borderLeft: "6px solid transparent",
                            borderRight: "6px solid transparent",
                            borderTop: `10px solid ${b.color}`,
                        }}
                    />
                    {/* Balloon string */}
                    <div
                        style={{
                            position: "absolute",
                            bottom: -50,
                            left: "50%",
                            width: 1,
                            height: 40,
                            backgroundColor: "rgba(0,0,0,0.3)",
                        }}
                    />
                </div>
            ))}
        </>
    );
};

// Confetti - falling colorful pieces
const ConfettiEffect: React.FC = () => {
    const colors = ["#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7", "#FF69B4", "#9B59B6"];
    const pieces = Array.from({ length: 60 }, (_, i) => ({
        id: i,
        color: colors[i % colors.length],
        left: `${Math.random() * 100}%`,
        delay: Math.random() * 2,
        rotation: Math.random() * 360,
        size: 8 + Math.random() * 8,
    }));

    return (
        <>
            {pieces.map((p) => (
                <div
                    key={p.id}
                    style={{
                        position: "absolute",
                        top: "-20px",
                        left: p.left,
                        width: p.size,
                        height: p.size * 0.6,
                        backgroundColor: p.color,
                        transform: `rotate(${p.rotation}deg)`,
                        animation: `imessage-confetti-fall 3.5s ease-out ${p.delay}s forwards`,
                    }}
                />
            ))}
        </>
    );
};

// Lasers - scanning lines
const LasersEffect: React.FC = () => {
    const lasers = Array.from({ length: 8 }, (_, i) => ({
        id: i,
        top: `${10 + i * 12}%`,
        delay: i * 0.15,
        color: i % 2 === 0 ? "#FF0000" : "#00FF00",
    }));

    return (
        <>
            {lasers.map((l) => (
                <div
                    key={l.id}
                    style={{
                        position: "absolute",
                        top: l.top,
                        left: 0,
                        width: "100%",
                        height: 3,
                        background: `linear-gradient(90deg, transparent, ${l.color}, transparent)`,
                        animation: `imessage-laser-scan 0.8s ease-in-out ${l.delay}s infinite`,
                        boxShadow: `0 0 10px ${l.color}, 0 0 20px ${l.color}`,
                    }}
                />
            ))}
        </>
    );
};

// Fireworks - bursting effects
const FireworksEffect: React.FC = () => {
    const bursts = Array.from({ length: 6 }, (_, i) => ({
        id: i,
        left: `${15 + (i % 3) * 35}%`,
        top: `${20 + Math.floor(i / 3) * 40}%`,
        delay: i * 0.4,
        color: ["#FF6B6B", "#FFD93D", "#6BCB77", "#4D96FF", "#FF69B4", "#9B59B6"][i],
    }));

    return (
        <>
            {bursts.map((b) => (
                <div
                    key={b.id}
                    style={{
                        position: "absolute",
                        left: b.left,
                        top: b.top,
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        backgroundColor: b.color,
                        boxShadow: `0 0 30px 15px ${b.color}`,
                        animation: `imessage-firework-burst 1.5s ease-out ${b.delay}s forwards`,
                    }}
                />
            ))}
        </>
    );
};

// Celebration - combo of confetti and sparkles
const CelebrationEffect: React.FC = () => (
    <>
        <ConfettiEffect />
        <div
            style={{
                position: "absolute",
                inset: 0,
                background: "radial-gradient(circle, rgba(255,215,0,0.2) 0%, transparent 70%)",
                animation: "imessage-pulse 1s ease-in-out infinite",
            }}
        />
    </>
);

// Echo - ripple effect
const EchoEffect: React.FC = () => {
    const circles = Array.from({ length: 5 }, (_, i) => ({
        id: i,
        delay: i * 0.2,
    }));

    return (
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
            {circles.map((c) => (
                <div
                    key={c.id}
                    style={{
                        position: "absolute",
                        width: 100,
                        height: 100,
                        borderRadius: "50%",
                        border: "3px solid rgba(0, 122, 255, 0.5)",
                        animation: `imessage-echo-ripple 2s ease-out ${c.delay}s infinite`,
                    }}
                />
            ))}
        </div>
    );
};

// Spotlight - focused light
const SpotlightEffect: React.FC = () => (
    <div
        style={{
            position: "absolute",
            inset: 0,
            background: "radial-gradient(ellipse at 50% 50%, transparent 0%, rgba(0,0,0,0.8) 60%)",
            animation: "imessage-spotlight-move 3s ease-in-out",
        }}
    />
);

// Love - floating hearts
const LoveEffect: React.FC = () => {
    const hearts = Array.from({ length: 20 }, (_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
        delay: Math.random() * 2,
        size: 15 + Math.random() * 20,
    }));

    return (
        <>
            {hearts.map((h) => (
                <div
                    key={h.id}
                    style={{
                        position: "absolute",
                        bottom: "-50px",
                        left: h.left,
                        fontSize: h.size,
                        animation: `imessage-heart-float 3.5s ease-out ${h.delay}s forwards`,
                    }}
                >
                    ❤️
                </div>
            ))}
        </>
    );
};

export default ScreenEffect;
