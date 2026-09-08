import React from "react";
import { TOKOVO_MONO_UI_FONT_FAMILY } from "@tokovo/visual-system";
import { applyMatrix3, evaluateCameraOutput, type EvaluatedCameraOutput } from "@tokovo/camera";
import { selectPreparedCameraProgram, type PreparedCinematicPrograms } from "@tokovo/compiler";
import {
  TokovoConfig,
  type LayoutCacheStore,
  type TokovoConfigType,
  type WorldState,
} from "@tokovo/core";
import type { PreparedInputProgram } from "@tokovo/device-keyboard";
import type { PreparedNotificationProgram } from "@tokovo/device-notifications";
import { evaluateStageFrame, type EvaluatedStageFrame } from "@tokovo/stage";
import { CameraProjectionSurface, projectCinematicFrame } from "./camera/index.js";
import {
  computeLayoutEngine,
  createLayoutEngineRuntime,
  type LayoutEngineRuntime,
} from "./engines/useLayoutEngine.js";
import type { RendererRegistries } from "./RegistryContext.js";
import { TokovoRenderer } from "./TokovoRenderer.js";
import type { PluginManagerClass } from "@tokovo/react";

function projectedBounds(
  output: EvaluatedCameraOutput,
  rect: { x: number; y: number; width: number; height: number },
) {
  const corners = [
    applyMatrix3(output.viewMatrix, { x: rect.x, y: rect.y }),
    applyMatrix3(output.viewMatrix, { x: rect.x + rect.width, y: rect.y }),
    applyMatrix3(output.viewMatrix, { x: rect.x, y: rect.y + rect.height }),
    applyMatrix3(output.viewMatrix, {
      x: rect.x + rect.width,
      y: rect.y + rect.height,
    }),
  ];
  const xs = corners.map((corner) => corner.x);
  const ys = corners.map((corner) => corner.y);
  const left = Math.min(...xs);
  const top = Math.min(...ys);
  return {
    x: left,
    y: top,
    width: Math.max(...xs) - left,
    height: Math.max(...ys) - top,
  };
}

const CinematicDebugOverlay: React.FC<{
  outputs: readonly EvaluatedCameraOutput[];
  stage: EvaluatedStageFrame;
}> = ({ outputs, stage }) => (
  <div
    style={{
      position: "absolute",
      inset: 0,
      pointerEvents: "none",
      zIndex: 10000,
    }}
  >
    {outputs.flatMap((output) => {
      const safe = output.trace.constraints.effectiveViewport;
      const desiredCenter = applyMatrix3(output.viewMatrix, {
        x: output.trace.desiredPose.centerX,
        y: output.trace.desiredPose.centerY,
      });
      const finalCenter = applyMatrix3(output.viewMatrix, {
        x: output.trace.finalPose.centerX,
        y: output.trace.finalPose.centerY,
      });
      return [
        <div
          key={`${output.outputId}:safe`}
          style={{
            position: "absolute",
            left: safe.x,
            top: safe.y,
            width: safe.width,
            height: safe.height,
            boxSizing: "border-box",
            border: "2px dashed rgba(55, 225, 255, 0.92)",
          }}
        />,
        ...stage.nodes
          .filter((node) => node.id !== stage.rootNodeId)
          .map((node) => {
            const bounds = projectedBounds(output, node.worldBounds);
            return (
              <div
                key={`${output.outputId}:stage:${node.id}`}
                style={{
                  position: "absolute",
                  left: bounds.x,
                  top: bounds.y,
                  width: bounds.width,
                  height: bounds.height,
                  boxSizing: "border-box",
                  border: "1px dashed rgba(167, 139, 250, 0.8)",
                  color: "#C4B5FD",
                  font: `600 10px ${TOKOVO_MONO_UI_FONT_FAMILY}`,
                }}
              >
                {node.id}
              </div>
            );
          }),
        <div
          key={`${output.outputId}:desired-pose`}
          style={{
            position: "absolute",
            left: desiredCenter.x - 5,
            top: desiredCenter.y - 5,
            width: 10,
            height: 10,
            borderRadius: "50%",
            background: "#FB7185",
            boxShadow: "0 0 0 1px rgba(0,0,0,0.7)",
          }}
        />,
        <div
          key={`${output.outputId}:final-pose`}
          style={{
            position: "absolute",
            left: finalCenter.x - 5,
            top: finalCenter.y - 5,
            width: 10,
            height: 10,
            borderRadius: "50%",
            background: "#34D399",
            boxShadow: "0 0 0 1px rgba(0,0,0,0.7)",
          }}
        />,
        ...output.trace.subjects.map((subject) => {
          const bounds = projectedBounds(output, subject.worldRect);
          return (
            <div
              key={`${output.outputId}:${subject.key}`}
              style={{
                position: "absolute",
                left: bounds.x,
                top: bounds.y,
                width: bounds.width,
                height: bounds.height,
                boxSizing: "border-box",
                border: "2px solid rgba(255, 213, 64, 0.96)",
                color: "#FFE36B",
                font: `600 11px ${TOKOVO_MONO_UI_FONT_FAMILY}`,
              }}
            >
              {subject.regionId}
            </div>
          );
        }),
        ...(output.trace.framingGuard?.subjects ?? []).map((subject) => {
          const bounds = projectedBounds(output, subject.worldRect);
          return (
            <div
              key={`${output.outputId}:guard:${subject.key}`}
              style={{
                position: "absolute",
                left: bounds.x,
                top: bounds.y,
                width: bounds.width,
                height: bounds.height,
                boxSizing: "border-box",
                border: "2px solid rgba(255, 91, 214, 0.9)",
              }}
            />
          );
        }),
      ];
    })}
  </div>
);

export interface CinematicStageRendererProps {
  world: WorldState;
  t: number;
  fps?: number;
  debug?: boolean;
  mode?: "preview" | "render";
  config?: TokovoConfigType;
  layoutCacheKey?: string;
  pluginManager: PluginManagerClass;
  registries: RendererRegistries;
  inputProgram?: PreparedInputProgram;
  notificationProgram?: PreparedNotificationProgram;
  cinematics: PreparedCinematicPrograms;
  cameraPlanId?: string;
  cameraProjectionBackend?: "final" | "texture-stage-plate" | "texture-projection-data";
  onCinematicCameraDebugFrame?: (frame: CinematicCameraDebugFrame) => void;
  renderCameraTextureProjectionArtifact?: (
    frame: CinematicTextureProjectionFrame,
  ) => React.ReactNode;
}

export interface CinematicCameraDebugFrame {
  t: number;
  storySignature: string;
  stageSignature: string;
  outputs: readonly EvaluatedCameraOutput[];
}

export interface CinematicTextureProjectionFrame {
  t: number;
  storySignature: string;
  stageSignature: string;
  cameraSignature: string;
  planId: string;
  stage: { width: number; height: number };
  outputs: readonly EvaluatedCameraOutput[];
}

function createLayoutCacheStore(scopeKey: string): LayoutCacheStore {
  const cache = new Map<string, unknown>();
  return {
    scopeKey,
    get<T>(key: string): T | undefined {
      return cache.get(key) as T | undefined;
    },
    set<T>(key: string, value: T): void {
      cache.set(key, value);
    },
    clear(): void {
      cache.clear();
    },
  };
}

/**
 * Camera VNext's native shared-stage renderer. Every device is projected from
 * the same replayed world and exact layout frame before any camera output is
 */
export const CinematicStageRenderer: React.FC<CinematicStageRendererProps> = ({
  world,
  t,
  fps = 30,
  debug = false,
  mode = "preview",
  config = TokovoConfig,
  layoutCacheKey = "tokovo:cinematic-stage",
  pluginManager,
  registries,
  inputProgram,
  notificationProgram,
  cinematics,
  cameraPlanId,
  cameraProjectionBackend = "final",
  onCinematicCameraDebugFrame,
  renderCameraTextureProjectionArtifact,
}) => {
  const runtimeRef = React.useRef<LayoutEngineRuntime | null>(null);
  const layoutRuntime = runtimeRef.current ?? createLayoutEngineRuntime();
  runtimeRef.current = layoutRuntime;
  const cacheRef = React.useRef<Map<string, LayoutCacheStore>>(new Map());

  const frame = React.useMemo(() => {
    const stage = evaluateStageFrame(cinematics.stageProgram, t);
    const stageDevices = stage.nodes.filter((node) => node.source.kind === "device");
    const layouts = stageDevices.map((node) => {
      if (node.source.kind !== "device") {
        throw new Error(`Stage node "${node.id}" is not a device.`);
      }
      const deviceId = node.source.deviceId;
      if (!world.devices[deviceId]) {
        throw new Error(
          `CAM_STAGE_DEVICE_MISSING: Stage node "${node.id}" references missing device "${deviceId}".`,
        );
      }
      let layoutCache = cacheRef.current.get(deviceId);
      if (!layoutCache) {
        layoutCache = createLayoutCacheStore(`${layoutCacheKey}:${deviceId}`);
        cacheRef.current.set(deviceId, layoutCache);
      }
      return computeLayoutEngine(
        {
          world,
          t,
          fps,
          focusDeviceId: deviceId,
          mode,
          config,
          layoutCache,
          inputProgram,
          notificationProgram,
        },
        registries,
        layoutRuntime,
      );
    });
    const subjectFrame = projectCinematicFrame({
      frame: t,
      world,
      layouts,
      stage,
      registry: registries.plugins.cinematicSubjects,
    });
    const program =
      cameraProjectionBackend === "texture-stage-plate"
        ? null
        : selectPreparedCameraProgram(cinematics, cameraPlanId);
    const outputs =
      program?.plan.outputs.map((output) =>
        evaluateCameraOutput(
          {
            program,
            outputId: output.id,
            frame: t,
            subjectFrame,
            mode,
          },
          registries.camera,
        ),
      ) ?? [];
    return { stage, layouts, outputs };
  }, [
    cameraPlanId,
    cameraProjectionBackend,
    cinematics,
    config,
    fps,
    inputProgram,
    layoutRuntime,
    layoutCacheKey,
    mode,
    notificationProgram,
    registries,
    t,
    world,
  ]);

  React.useEffect(() => {
    if (!onCinematicCameraDebugFrame) return;
    onCinematicCameraDebugFrame({
      t,
      storySignature: cinematics.storySignature,
      stageSignature: cinematics.stageSignature,
      outputs: frame.outputs,
    });
  }, [cinematics, frame.outputs, onCinematicCameraDebugFrame, t]);

  if (cameraProjectionBackend === "texture-projection-data") {
    const planId = frame.outputs[0]?.trace.planId;
    if (!planId) throw new Error("CAM_OUTPUT_MISSING: Camera plan produced no outputs.");
    const cameraSignature = cinematics.cameraSignatures[planId];
    if (!cameraSignature) {
      throw new Error(`Camera signature for plan "${planId}" is missing.`);
    }
    const root = frame.stage.nodes.find((node) => node.id === frame.stage.rootNodeId);
    if (!root) throw new Error(`Camera stage root "${frame.stage.rootNodeId}" is missing.`);
    const projectionFrame: CinematicTextureProjectionFrame = {
      t,
      storySignature: cinematics.storySignature,
      stageSignature: cinematics.stageSignature,
      cameraSignature,
      planId,
      stage: { width: root.localBounds.width, height: root.localBounds.height },
      outputs: frame.outputs,
    };
    return renderCameraTextureProjectionArtifact?.(projectionFrame) ?? null;
  }

  const root = frame.stage.nodes.find((node) => node.id === frame.stage.rootNodeId);
  if (!root) throw new Error(`Camera stage root "${frame.stage.rootNodeId}" is missing.`);
  const stageWidth = root.localBounds.width;
  const stageHeight = root.localBounds.height;
  const layoutsByDevice = new Map(frame.layouts.map((layout) => [layout.deviceId, layout]));
  const stagePlate = (
    <div style={{ position: "relative", width: stageWidth, height: stageHeight }}>
      {frame.stage.nodes.map((node) => {
        if (node.source.kind !== "device") return null;
        const deviceId = node.source.deviceId;
        const layout = layoutsByDevice.get(deviceId);
        if (!layout) {
          throw new Error(`CAM_LAYOUT_MISSING: No layout was projected for device "${deviceId}".`);
        }
        const matrix = node.worldTransform;
        const scaleX = node.localBounds.width / layout.profile.dimensions.width;
        const scaleY = node.localBounds.height / layout.profile.dimensions.height;
        return (
          <div
            key={node.id}
            style={{
              position: "absolute",
              left: node.localBounds.x,
              top: node.localBounds.y,
              width: node.localBounds.width,
              height: node.localBounds.height,
              zIndex: node.zIndex,
              transformOrigin: "0 0",
              transform: `matrix(${matrix.a}, ${matrix.b}, ${matrix.c}, ${matrix.d}, ${matrix.tx}, ${matrix.ty})`,
            }}
          >
            <div
              style={{
                width: layout.profile.dimensions.width,
                height: layout.profile.dimensions.height,
                transformOrigin: "0 0",
                transform: `scale(${scaleX}, ${scaleY})`,
              }}
            >
              <TokovoRenderer
                world={world}
                t={t}
                fps={fps}
                debug={false}
                mode={mode}
                config={config}
                layoutCacheKey={`${layoutCacheKey}:paint:${deviceId}`}
                focusDeviceId={deviceId}
                pluginManager={pluginManager}
                registries={registries}
                inputProgram={inputProgram}
                notificationProgram={notificationProgram}
              />
            </div>
          </div>
        );
      })}
    </div>
  );

  if (cameraProjectionBackend === "texture-stage-plate") return stagePlate;

  return (
    <div style={{ position: "relative", width: stageWidth, height: stageHeight }}>
      {[...frame.outputs]
        .sort(
          (left: EvaluatedCameraOutput, right: EvaluatedCameraOutput) =>
            left.zIndex - right.zIndex || left.outputId.localeCompare(right.outputId),
        )
        .map((output) => (
          <CameraProjectionSurface
            key={output.outputId}
            id={`${output.trace.planId}-${output.outputId}`}
            output={output}
            stageWidth={stageWidth}
            stageHeight={stageHeight}
          >
            {stagePlate}
          </CameraProjectionSurface>
        ))}
      {debug ? <CinematicDebugOverlay outputs={frame.outputs} stage={frame.stage} /> : null}
    </div>
  );
};
