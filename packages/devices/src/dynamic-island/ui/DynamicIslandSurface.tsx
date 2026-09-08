import React from "react";
import { materialToPaintStyle } from "@tokovo/visual-system";
import type {
  DynamicIslandActivityContent,
  DynamicIslandProjection,
  ScreenRecordingCompletionBanner,
} from "../contract.js";

const SensorCluster = React.memo(function SensorCluster(props: {
  centerX: number;
  pointScale: number;
  pillWidth: number;
  pillHeight: number;
  lensSize: number;
  expanded: boolean;
}) {
  const { centerX, pointScale, pillWidth, pillHeight, lensSize, expanded } = props;
  const gap = 8 * pointScale;
  const groupWidth = pillWidth + gap + lensSize;
  return (
    <div
      style={{
        position: "absolute",
        top: 5 * pointScale,
        left: centerX - groupWidth / 2,
        width: groupWidth,
        height: Math.max(pillHeight, lensSize),
        opacity: expanded ? 0.96 : 0.74,
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: pillWidth,
          height: pillHeight,
          borderRadius: pillHeight / 2,
          background: "linear-gradient(180deg, rgba(3,3,3,0.98), rgba(8,8,8,0.96))",
          boxShadow: expanded ? "inset 0 1px 2px rgba(255,255,255,0.025)" : "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          right: 0,
          top: (pillHeight - lensSize) / 2,
          width: lensSize,
          height: lensSize,
          borderRadius: "50%",
          background:
            "radial-gradient(circle at 42% 38%, rgba(82,96,155,0.9) 0 7%, rgba(25,35,72,0.96) 10%, #05060b 37%, #000 68%)",
          boxShadow: "inset 0 0 0 1px rgba(80,105,190,0.13), 0 0 8px rgba(28,52,125,0.18)",
        }}
      />
    </div>
  );
});

function ActivityGlyph(props: {
  activity: DynamicIslandActivityContent["kind"];
  color: string;
  size: number;
}) {
  const { activity, color, size } = props;
  if (activity === "call") {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <path
          d="M6.6 3.9c.5-.5 1.3-.4 1.7.1l2.2 2.8c.4.5.4 1.1 0 1.6L9 10c1 2.1 2.8 3.9 4.9 4.9l1.6-1.5c.4-.4 1.1-.4 1.6 0l2.9 2.2c.5.4.6 1.2.1 1.7l-1.4 1.5c-.8.8-2 1.2-3.2.9C9.6 18.3 5.7 14.4 4.2 8.5c-.3-1.2.1-2.4.9-3.2l1.5-1.4Z"
          fill={color}
        />
      </svg>
    );
  }
  if (activity === "location") {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <path
          d="M20.8 3.3 4.3 9.8c-1.3.5-1.2 2.4.2 2.7l6.1 1.2 1.2 6.1c.3 1.4 2.2 1.5 2.7.2L21 3.6c.1-.3-.1-.5-.2-.3Z"
          fill={color}
        />
      </svg>
    );
  }
  if (activity === "timer") {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="13" r="7.5" stroke={color} strokeWidth="2.2" />
        <path
          d="M9 2.8h6M12 5.5V3M17.5 7.5l1.7-1.7M12 13l3.2-2.2"
          stroke={color}
          strokeWidth="2.2"
          strokeLinecap="round"
        />
      </svg>
    );
  }
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {[5, 9, 13, 17, 21].map((x, index) => (
        <rect
          key={x}
          x={x - 1}
          y={index % 2 === 0 ? 6 : 9}
          width="2"
          height={index % 2 === 0 ? 12 : 6}
          rx="1"
          fill={color}
        />
      ))}
    </svg>
  );
}

function RecordingCountdown(props: DynamicIslandProjection) {
  const scale = props.pointScale;
  return (
    <div style={{ position: "absolute", inset: 0, opacity: props.contentOpacity }}>
      <div
        style={{
          position: "absolute",
          left: 23 * scale,
          top: "50%",
          width: 16 * scale,
          height: 16 * scale,
          borderRadius: "50%",
          border: `${2.4 * scale}px solid rgba(255,255,255,0.96)`,
          transform: "translateY(-50%)",
          boxSizing: "border-box",
        }}
      />
      <div
        style={{
          position: "absolute",
          right: 23 * scale,
          top: "50%",
          transform: "translateY(-52%)",
          color: "rgba(255,255,255,0.96)",
          fontFamily: props.visuals.fontFamily,
          fontSize: 15 * scale,
          fontWeight: 650,
          fontVariantNumeric: "tabular-nums",
          lineHeight: 1,
        }}
      >
        {props.recording?.countdownValue}
      </div>
    </div>
  );
}

function CompactRecording(props: DynamicIslandProjection) {
  const scale = props.pointScale;
  return (
    <div
      style={{
        position: "absolute",
        left: 18 * scale,
        top: "50%",
        width: 14 * scale,
        height: 14 * scale,
        borderRadius: "50%",
        transform: "translateY(-50%)",
        background: "#D84A42",
        opacity: props.contentOpacity,
        boxShadow: "0 0 0 1px rgba(216,74,66,0.08)",
      }}
    />
  );
}

function ExpandedRecording(props: DynamicIslandProjection) {
  const scale = props.pointScale;
  const isRtl = props.direction === "rtl";
  const leading = isRtl ? undefined : 22 * scale;
  const trailing = isRtl ? 22 * scale : undefined;
  return (
    <div
      dir={props.direction}
      style={{
        position: "absolute",
        inset: 0,
        opacity: props.contentOpacity,
        fontFamily: props.visuals.fontFamily,
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 17 * scale,
          left: leading,
          right: trailing,
          width: 140 * scale,
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          gap: 3 * scale,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 7 * scale,
            color: "#D84A42",
            fontSize: 14.5 * scale,
            fontWeight: 500,
            lineHeight: 1,
            fontVariantNumeric: "tabular-nums",
          }}
        >
          <span
            style={{
              width: 9 * scale,
              height: 9 * scale,
              borderRadius: "50%",
              background: "#A9322D",
              flex: "0 0 auto",
            }}
          />
          {props.recording?.elapsedLabel}
        </div>
        <div
          style={{
            color: "#FFFFFF",
            fontSize: 16 * scale,
            fontWeight: 500,
            lineHeight: 1.08,
            letterSpacing: -0.25 * scale,
            whiteSpace: "nowrap",
          }}
        >
          {props.recording?.title}
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          top: 14 * scale,
          right: isRtl ? undefined : 15 * scale,
          left: isRtl ? 15 * scale : undefined,
          width: 50 * scale,
          height: 50 * scale,
          borderRadius: "50%",
          border: `${3 * scale}px solid rgba(255,255,255,0.98)`,
          boxSizing: "border-box",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            width: 20 * scale,
            height: 20 * scale,
            borderRadius: 5 * scale,
            background: "#FF453A",
            boxShadow: "0 0 12px rgba(255,69,58,0.18)",
          }}
        />
      </div>
    </div>
  );
}

function ActivityContent(props: DynamicIslandProjection) {
  const activity = props.activity;
  if (!activity) return null;
  const scale = props.pointScale;
  if (props.presentation === "minimal") {
    return (
      <div
        style={{
          position: "absolute",
          right: 0,
          top: 0,
          width: 37 * scale,
          height: 37 * scale,
          borderRadius: "50%",
          background: "#000",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          opacity: props.contentOpacity,
        }}
      >
        <ActivityGlyph activity={activity.kind} color={activity.tint} size={17 * scale} />
      </div>
    );
  }
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        alignItems: props.presentation === "expanded" ? "flex-end" : "center",
        justifyContent: "space-between",
        padding:
          props.presentation === "expanded"
            ? `${18 * scale}px ${22 * scale}px`
            : `0 ${18 * scale}px`,
        boxSizing: "border-box",
        opacity: props.contentOpacity,
        color: "white",
        fontFamily: props.visuals.fontFamily,
      }}
    >
      <ActivityGlyph activity={activity.kind} color={activity.tint} size={19 * scale} />
      <div
        style={{
          maxWidth: props.presentation === "expanded" ? 210 * scale : 62 * scale,
          textAlign: "right",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          fontSize: (props.presentation === "expanded" ? 17 : 13) * scale,
          fontWeight: 650,
          letterSpacing: -0.2 * scale,
        }}
      >
        {activity.elapsedLabel ?? activity.title}
      </div>
    </div>
  );
}

function PhotosIcon({ size }: { size: number }) {
  const center = size / 2;
  const radius = size * 0.22;
  const colors = [
    "#FF3B30",
    "#FF9500",
    "#FFCC00",
    "#34C759",
    "#00C7BE",
    "#007AFF",
    "#5856D6",
    "#AF52DE",
  ];
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <rect width={size} height={size} rx={size * 0.23} fill="#fff" />
      {colors.map((color, index) => {
        const angle = (Math.PI * 2 * index) / colors.length - Math.PI / 2;
        return (
          <ellipse
            key={color}
            cx={center + Math.cos(angle) * radius}
            cy={center + Math.sin(angle) * radius}
            rx={size * 0.12}
            ry={size * 0.2}
            transform={`rotate(${index * 45} ${center + Math.cos(angle) * radius} ${center + Math.sin(angle) * radius})`}
            fill={color}
            opacity="0.88"
          />
        );
      })}
      <circle cx={center} cy={center} r={size * 0.1} fill="#fff" />
    </svg>
  );
}

function CompletionBanner(props: {
  banner: ScreenRecordingCompletionBanner;
  projection: DynamicIslandProjection;
}) {
  const { banner, projection } = props;
  const scale = projection.pointScale;
  return (
    <div
      dir={projection.direction}
      style={{
        position: "absolute",
        top: banner.top,
        left: banner.left,
        width: banner.width,
        height: banner.height,
        zIndex: 1003,
        borderRadius: 24 * scale,
        ...materialToPaintStyle(projection.visuals.notificationMaterial, scale),
        color: projection.visuals.primaryText,
        padding: `${11 * scale}px ${13 * scale}px`,
        boxSizing: "border-box",
        display: "grid",
        gridTemplateColumns: `${38 * scale}px minmax(0,1fr)`,
        columnGap: 10 * scale,
        fontFamily: projection.visuals.fontFamily,
        opacity: banner.progress,
        transform: `translate3d(0, ${-16 * (1 - banner.progress) * scale}px, 0) scale(${0.985 + banner.progress * 0.015})`,
        transformOrigin: "top center",
        contain: "layout paint style",
      }}
    >
      <div style={{ gridRow: "1 / span 3", paddingTop: 1 * scale }}>
        <PhotosIcon size={38 * scale} />
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          minWidth: 0,
          color: projection.visuals.secondaryText,
          fontSize: 10.5 * scale,
          fontWeight: 500,
          letterSpacing: 0.25 * scale,
          lineHeight: 1.1,
        }}
      >
        <span>{banner.appLabel}</span>
        <span style={{ textTransform: "none", letterSpacing: 0 }}>{banner.timeLabel}</span>
      </div>
      <div style={{ fontSize: 14.5 * scale, fontWeight: 650, lineHeight: 1.18 }}>
        {banner.title}
      </div>
      <div
        style={{
          color: projection.visuals.secondaryText,
          fontSize: 13 * scale,
          lineHeight: 1.22,
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {banner.body}
      </div>
    </div>
  );
}

export const DynamicIslandSurface = React.memo(function DynamicIslandSurface({
  projection,
}: {
  projection: DynamicIslandProjection;
}) {
  const { geometry, pointScale: scale } = projection;
  const expanded = projection.presentation === "expanded";
  const minimalActivity = projection.phase === "activity" && projection.presentation === "minimal";

  return (
    <>
      <div
        role="img"
        aria-label={projection.accessibilityLabel}
        style={{
          position: "absolute",
          top: geometry.top,
          left: geometry.left,
          width: geometry.width,
          height: geometry.height,
          zIndex: 1004,
          pointerEvents: "none",
          borderRadius: geometry.cornerRadius,
          ...(minimalActivity
            ? { background: "transparent" }
            : projection.phase === "idle"
              ? { background: "#000000" }
              : materialToPaintStyle(projection.visuals.islandMaterial, scale)),
          overflow: "visible",
          contain: "layout style",
          transform: "translate3d(0,0,0)",
          willChange: projection.isMorphing ? "width,height,left,border-radius" : "auto",
        }}
      >
        {minimalActivity ? (
          <div
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              width: geometry.hardwareCenterX * 2,
              height: 37 * scale,
              borderRadius: 19 * scale,
              ...materialToPaintStyle(projection.visuals.islandMaterial, scale),
            }}
          />
        ) : null}
        <SensorCluster
          centerX={geometry.hardwareCenterX}
          pointScale={scale}
          pillWidth={geometry.sensorPillWidth}
          pillHeight={geometry.sensorPillHeight}
          lensSize={geometry.cameraLensSize}
          expanded={expanded}
        />
        {projection.phase === "countdown" ? (
          <RecordingCountdown {...projection} />
        ) : projection.phase === "recording" && expanded ? (
          <ExpandedRecording {...projection} />
        ) : projection.phase === "recording" ? (
          <CompactRecording {...projection} />
        ) : projection.phase === "activity" ? (
          <ActivityContent {...projection} />
        ) : null}
      </div>
      {projection.completionBanner ? (
        <CompletionBanner banner={projection.completionBanner} projection={projection} />
      ) : null}
    </>
  );
});
