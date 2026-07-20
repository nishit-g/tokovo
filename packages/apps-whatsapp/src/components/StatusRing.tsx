import { memo } from "react";
import { useTheme } from "../experience/ExperienceContext.js";

export type StatusSegmentState = "viewed" | "unviewed";

export interface StatusRingProps {
  size: number;
  segments: readonly StatusSegmentState[];
  strokeWidth?: number;
}

/**
 * Deterministic status boundary. Each authored status owns one stable arc;
 * viewed state changes color without shifting neighboring arc geometry.
 */
export const StatusRing = memo(function StatusRing({
  size,
  segments,
  strokeWidth = 3,
}: StatusRingProps) {
  const theme = useTheme();
  if (segments.length === 0) return null;

  const visibleSegments = segments.slice(0, 32);
  const count = visibleSegments.length;
  const gap = count === 1 ? 0 : Math.min(2.6, 18 / count);
  const segmentLength = (100 - gap * count) / count;
  const radius = (size - strokeWidth) / 2;
  const center = size / 2;

  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      style={{ display: "block" }}
    >
      <circle
        cx={center}
        cy={center}
        r={radius}
        fill="none"
        stroke={theme.colors.statusRingGap}
        strokeWidth={strokeWidth + 2}
      />
      <g transform={`rotate(-90 ${center} ${center})`}>
        {visibleSegments.map((state, index) => (
          <circle
            key={`${index}_${state}`}
            cx={center}
            cy={center}
            r={radius}
            pathLength={100}
            fill="none"
            stroke={
              state === "unviewed"
                ? theme.colors.statusRingUnviewed
                : theme.colors.statusRingViewed
            }
            strokeWidth={strokeWidth}
            strokeDasharray={`${segmentLength} ${100 - segmentLength}`}
            strokeDashoffset={-index * (segmentLength + gap)}
            strokeLinecap={count === 1 ? "round" : "butt"}
          />
        ))}
      </g>
    </svg>
  );
});

export default StatusRing;
