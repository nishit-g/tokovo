import React from "react";
import { CameraTransform, WorldState } from "@tokovo/core";

export const VisualDebugger: React.FC<{
  world: WorldState;
  t: number;
  transform: CameraTransform;
  debugInfo?: {
    activeEffectType?: string;
    requestedAnchor?: string;
    resolvedAnchor?: string;
    fallbackUsed: boolean;
    resolvedRect?: { x: number; y: number; width: number; height: number };
  };
}> = ({ world, t, transform, debugInfo }) => {
  const activeApp =
    world.devices[world.camera.activeDeviceId]?.foregroundAppId || "Home";
  const requested = debugInfo?.requestedAnchor ?? "-";
  const resolved = debugInfo?.resolvedAnchor ?? "-";

  return (
    <>
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
          <strong>target</strong>: {requested}
        </div>
        <div>
          <strong>resolved</strong>: {resolved}
        </div>
        <div>
          <strong>fallback</strong>: {debugInfo?.fallbackUsed ? "yes" : "no"}
        </div>
      </div>
    </>
  );
};
