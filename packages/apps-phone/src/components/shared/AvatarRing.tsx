/**
 * Shared Components - Avatar Ring
 * 
 * Pulsing avatar circle used in incoming call screens.
 */

import React from "react";

interface AvatarRingProps {
    image?: string;
    name: string;
    size?: number;
}

/**
 * AvatarRing - Circular avatar with pulsing ring animation
 */
export const AvatarRing: React.FC<AvatarRingProps> = ({
    image,
    name,
    size = 200
}) => {
    const initials = name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);

    return (
        <div
            style={{
                position: "relative",
                width: size,
                height: size,
            }}
        >
            {/* Pulsing rings */}
            <div
                style={{
                    position: "absolute",
                    inset: -20,
                    borderRadius: "50%",
                    border: "2px solid rgba(255, 255, 255, 0.3)",
                    animation: "pulse 2s ease-in-out infinite",
                }}
            />
            <div
                style={{
                    position: "absolute",
                    inset: -10,
                    borderRadius: "50%",
                    border: "2px solid rgba(255, 255, 255, 0.5)",
                    animation: "pulse 2s ease-in-out infinite 0.5s",
                }}
            />

            {/* Avatar */}
            <div
                style={{
                    width: size,
                    height: size,
                    borderRadius: "50%",
                    overflow: "hidden",
                    backgroundColor: "#4a90d9",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: "4px solid rgba(255, 255, 255, 0.3)",
                }}
            >
                {image ? (
                    <img
                        src={image}
                        alt={name}
                        style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                        }}
                    />
                ) : (
                    <span
                        style={{
                            fontSize: size * 0.35,
                            fontWeight: 500,
                            color: "#fff",
                        }}
                    >
                        {initials}
                    </span>
                )}
            </div>
        </div>
    );
};
