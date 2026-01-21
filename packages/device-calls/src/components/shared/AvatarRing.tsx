import React from "react";
import { useCurrentFrame, useVideoConfig, interpolate } from "remotion";

interface AvatarRingProps {
  image?: string;
  name: string;
  size?: number;
}

export const AvatarRing: React.FC<AvatarRingProps> = ({
  image,
  name,
  size = 200,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const cycleDuration = fps * 2;

  const getPulseAnimation = (delaySeconds: number) => {
    const delayFrames = delaySeconds * fps;
    const cycleFrame = (frame - delayFrames + cycleDuration) % cycleDuration;

    const scale = interpolate(
      cycleFrame,
      [0, cycleDuration * 0.5, cycleDuration],
      [1, 1.15, 1],
      { extrapolateRight: "clamp" },
    );

    const opacity = interpolate(
      cycleFrame,
      [0, cycleDuration * 0.5, cycleDuration],
      [0.3, 0.6, 0.3],
      { extrapolateRight: "clamp" },
    );

    return { scale, opacity };
  };

  const ring1 = getPulseAnimation(0);
  const ring2 = getPulseAnimation(0.5);

  return (
    <div
      style={{
        position: "relative",
        width: size,
        height: size,
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: -20,
          borderRadius: "50%",
          border: `2px solid rgba(255, 255, 255, ${ring1.opacity})`,
          transform: `scale(${ring1.scale})`,
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: -10,
          borderRadius: "50%",
          border: `2px solid rgba(255, 255, 255, ${ring2.opacity})`,
          transform: `scale(${ring2.scale})`,
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
