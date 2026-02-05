/**
 * Unsend Animation Component - Poof effect for unsent messages
 */

import React, { useEffect, useState } from "react";

interface UnsendAnimationProps {
    children: React.ReactNode;
    isUnsent?: boolean;
    onComplete?: () => void;
}

export const UnsendAnimation: React.FC<UnsendAnimationProps> = ({
    children,
    isUnsent,
    onComplete,
}) => {
    const [phase, setPhase] = useState<"normal" | "shrinking" | "poof" | "gone">("normal");

    useEffect(() => {
        if (isUnsent && phase === "normal") {
            setPhase("shrinking");
            setTimeout(() => setPhase("poof"), 200);
            setTimeout(() => {
                setPhase("gone");
                onComplete?.();
            }, 600);
        }
    }, [isUnsent, phase, onComplete]);

    if (phase === "gone") return null;

    const getStyle = (): React.CSSProperties => {
        switch (phase) {
            case "shrinking":
                return {
                    transform: "scale(0.8)",
                    opacity: 0.7,
                    transition: "all 0.2s ease-out",
                };
            case "poof":
                return {
                    transform: "scale(0.1)",
                    opacity: 0,
                    filter: "blur(10px)",
                    transition: "all 0.4s ease-out",
                };
            default:
                return {};
        }
    };

    return (
        <div style={{ position: "relative" }}>
            <div style={getStyle()}>
                {children}
            </div>
            {phase === "poof" && (
                <div style={{
                    position: "absolute",
                    inset: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                }}>
                    {/* Sparkle particles */}
                    {Array.from({ length: 8 }).map((_, i) => (
                        <div
                            key={i}
                            style={{
                                position: "absolute",
                                width: 4,
                                height: 4,
                                borderRadius: "50%",
                                backgroundColor: "rgba(142, 142, 147, 0.8)",
                                animation: `imessage-poof-particle 0.4s ease-out forwards`,
                                animationDelay: `${i * 0.02}s`,
                                transform: `rotate(${i * 45}deg) translateX(0)`,
                            }}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default UnsendAnimation;
