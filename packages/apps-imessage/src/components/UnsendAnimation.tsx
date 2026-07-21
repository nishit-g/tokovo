/** Frame-driven poof effect for unsent messages. */

import React from "react";
import { easeOutCubic, frameProgress, useFps, useTime } from "@tokovo/react";

interface UnsendAnimationProps {
  children: React.ReactNode;
  isUnsent?: boolean;
  startedAtFrame?: number;
}

export const UnsendAnimation: React.FC<UnsendAnimationProps> = ({
  children,
  isUnsent,
  startedAtFrame = 0,
}) => {
  const frame = useTime();
  const fps = useFps();
  const progress = isUnsent ? easeOutCubic(frameProgress(frame, startedAtFrame, 0.6 * fps)) : 0;

  if (isUnsent && progress >= 1) return null;

  const poofProgress = Math.max(0, (progress - 1 / 3) * 1.5);

  return (
    <div style={{ position: "relative" }}>
      <div
        style={{
          transform: `scale(${1 - progress * 0.9})`,
          opacity: 1 - progress,
          filter: `blur(${poofProgress * 10}px)`,
        }}
      >
        {children}
      </div>
      {poofProgress > 0 ? (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {Array.from({ length: 8 }, (_, i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                width: 4,
                height: 4,
                borderRadius: "50%",
                backgroundColor: "rgba(142, 142, 147, 0.8)",
                opacity: 1 - poofProgress,
                transform: `rotate(${i * 45}deg) translateX(${poofProgress * 30}px) scale(${1 - poofProgress})`,
              }}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
};

export default UnsendAnimation;
