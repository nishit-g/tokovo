import React from "react";
import { CameraTransform, WorldState } from "@tokovo/core";

export const VisualDebugger: React.FC<{
  world: WorldState;
  t: number;
  transform: CameraTransform;
  debugInfo?: {
    activeEffectType?: string;
    activeEffectId?: string;
    requestedAnchor?: string;
    resolvedAnchor?: string;
    fallbackUsed: boolean;
    resolvedRect?: { x: number; y: number; width: number; height: number };
    warnings: string[];
    anchors?: Record<
      string,
      { x: number; y: number; width: number; height: number }
    >;
    effectTimeline: Array<{
      id: string;
      type: string;
      startFrame: number;
      endFrame: number;
      anchorId?: string;
    }>;
  };
  showAllAnchors?: boolean;
}> = ({ world, t, transform, debugInfo, showAllAnchors = false }) => {
  const activeApp =
    world.devices[world.camera.activeDeviceId]?.foregroundAppId || "Home";
  const requested = debugInfo?.requestedAnchor ?? "-";
  const resolved = debugInfo?.resolvedAnchor ?? "-";
  const warnings = debugInfo?.warnings ?? [];

  return (
    <>
      {showAllAnchors &&
        debugInfo?.anchors &&
        Object.entries(debugInfo.anchors).map(([name, rect]) => (
          <React.Fragment key={name}>
            <div
              style={{
                position: "absolute",
                left: rect.x,
                top: rect.y,
                width: rect.width,
                height: rect.height,
                border: "1px dashed rgba(255,255,255,0.8)",
                borderRadius: 6,
                zIndex: 9996,
                pointerEvents: "none",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: rect.x,
                top: Math.max(4, rect.y - 16),
                background: "rgba(255,255,255,0.85)",
                color: "#111",
                fontFamily: "monospace",
                fontSize: 10,
                padding: "1px 4px",
                borderRadius: 3,
                zIndex: 9997,
                pointerEvents: "none",
              }}
            >
              {name}
            </div>
          </React.Fragment>
        ))}

      {debugInfo?.resolvedRect && (
        <>
          <div
            style={{
              position: "absolute",
              left: debugInfo.resolvedRect.x,
              top: debugInfo.resolvedRect.y,
              width: debugInfo.resolvedRect.width,
              height: debugInfo.resolvedRect.height,
              border: "3px solid #ff2d2d",
              borderRadius: 8,
              zIndex: 9998,
              pointerEvents: "none",
              boxShadow: "0 0 0 1px rgba(0,0,0,0.4) inset",
            }}
          />
          <div
            style={{
              position: "absolute",
              left: debugInfo.resolvedRect.x,
              top: Math.max(6, debugInfo.resolvedRect.y - 24),
              background: "rgba(255,45,45,0.9)",
              color: "#fff",
              fontFamily: "monospace",
              fontSize: 12,
              padding: "2px 6px",
              borderRadius: 4,
              zIndex: 9999,
              pointerEvents: "none",
            }}
          >
            {requested}
            {resolved !== requested ? ` -> ${resolved}` : ""}
            {debugInfo.fallbackUsed ? " (fallback)" : ""}
          </div>
        </>
      )}

      {warnings.length > 0 && (
        <div
          style={{
            position: "absolute",
            top: 16,
            right: 16,
            display: "flex",
            gap: 6,
            zIndex: 10000,
            pointerEvents: "none",
          }}
        >
          {warnings.map((warning) => (
            <div
              key={warning}
              style={{
                background: "rgba(255, 104, 104, 0.92)",
                color: "#fff",
                fontFamily: "monospace",
                fontSize: 11,
                borderRadius: 999,
                padding: "4px 8px",
              }}
            >
              {warning}
            </div>
          ))}
        </div>
      )}

      <div
        style={{
          position: "absolute",
          bottom: 18,
          right: 18,
          backgroundColor: "rgba(0, 0, 0, 0.82)",
          color: "#7dffb2",
          fontFamily: "monospace",
          fontSize: 12,
          lineHeight: 1.45,
          padding: 10,
          borderRadius: 8,
          zIndex: 9999,
          pointerEvents: "none",
          minWidth: 260,
          border: "1px solid rgba(125,255,178,0.2)",
        }}
      >
        <div>
          <strong>frame</strong>: {Math.floor(t)}
        </div>
        <div>
          <strong>app</strong>: {activeApp}
        </div>
        <div>
          <strong>scale</strong>: {transform.scale.toFixed(3)}
        </div>
        <div>
          <strong>origin</strong>: {transform.originX.toFixed(3)},{" "}
          {transform.originY.toFixed(3)}
        </div>
        <div>
          <strong>translate</strong>: {transform.translateX.toFixed(2)},{" "}
          {transform.translateY.toFixed(2)}
        </div>
        <div>
          <strong>rotation</strong>: {transform.rotation.toFixed(2)}
        </div>
        <div>
          <strong>shake</strong>: {transform.shakeX.toFixed(2)},{" "}
          {transform.shakeY.toFixed(2)}
        </div>
        <div>
          <strong>effect</strong>: {debugInfo?.activeEffectType ?? "-"}
        </div>
        <div>
          <strong>effectId</strong>: {debugInfo?.activeEffectId ?? "-"}
        </div>
        <div>
          <strong>target</strong>: {requested}
        </div>
        <div>
          <strong>resolved</strong>: {resolved}
        </div>
        <div>
          <strong>fallback</strong>: {debugInfo?.fallbackUsed ? "yes" : "no"}
        </div>
        <div>
          <strong>warnings</strong>: {warnings.length > 0 ? warnings.join(", ") : "-"}
        </div>
      </div>
    </>
  );
};
