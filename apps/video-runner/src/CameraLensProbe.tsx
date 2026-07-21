import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import {
  createBuiltinCameraRegistries,
  evaluateCameraOutput,
} from "@tokovo/camera";
import {
  prepareCinematicPrograms,
  selectPreparedCameraProgram,
} from "@tokovo/compiler";
import type { CameraPlanIR, StageProgramIR } from "@tokovo/ir";
import { CameraProjectionSurface } from "@tokovo/renderer";
import { evaluateStageFrame, projectCinematicSubjects } from "@tokovo/stage";

const WIDTH = 1080;
const HEIGHT = 1920;
const SEGMENT_FRAMES = 60;

const screenSubject = {
  kind: "device" as const,
  deviceId: "probe-phone",
  subjectId: "screen",
};

const stageIR: StageProgramIR = {
  version: 1,
  rootNodeId: "stage.root",
  nodes: [
    {
      id: "stage.root",
      source: { kind: "group" },
      localBounds: { x: 0, y: 0, width: WIDTH, height: HEIGHT },
      initialTransform: { a: 1, b: 0, c: 0, d: 1, tx: 0, ty: 0 },
      zIndex: 0,
    },
  ],
  transformKeyframes: [],
};

const cameraIR: CameraPlanIR = {
  version: 1,
  id: "optical-probe",
  fps: 60,
  durationInFrames: 420,
  outputs: [
    {
      id: "main",
      viewport: { x: 0, y: 0, width: WIDTH, height: HEIGHT },
      sourceStageNodeId: "stage.root",
      zIndex: 0,
      defaultRigId: "control",
    },
  ],
  rigs: [
    "control",
    "perspective",
    "barrel",
    "fisheye",
    "anamorphic",
    "smear",
  ].map((id) => ({
    id,
    outputId: "main",
    subject: screenSubject,
    composer: {
      screenPosition: [0.5, 0.5] as const,
      targetFill: 1,
      fillMode: "contain" as const,
      minScale: 1,
      maxScale: 1,
    },
    ...(id === "control" || id === "smear" ? {} : { lensId: id }),
    ...(id === "fisheye" ? { modifierIds: ["breathing"] } : {}),
    motion:
      id === "smear"
        ? {
            type: "whip" as const,
            durationFrames: 36,
            direction: [1, 0.08] as const,
          }
        : { type: "minimum-jerk" as const, durationFrames: 18 },
  })),
  shots: [
    ["perspective-shot", "perspective", 60, 120],
    ["barrel-shot", "barrel", 120, 180],
    ["fisheye-shot", "fisheye", 180, 240],
    ["anamorphic-shot", "anamorphic", 240, 300],
    ["smear-shot", "smear", 300, 360],
    ["settlement-shot", "control", 360, 420],
  ].map(([id, rigId, startFrame, endFrame], declarationOrder) => ({
    id: id as string,
    outputId: "main",
    startFrame: startFrame as number,
    endFrame: endFrame as number,
    rigId: rigId as string,
    priority: 10,
    declarationOrder,
    ...(rigId === "smear"
      ? {}
      : { blendIn: { durationFrames: 18, curve: "minimum-jerk" as const } }),
    missingSubjectPolicy: { type: "error" as const },
    source: "authored" as const,
  })),
  lenses: [
    {
      id: "perspective",
      modelId: "perspective-tilt",
      modelVersion: 1,
      parameters: {
        tiltXDeg: 14,
        tiltYDeg: -7,
        perspectivePx: 1400,
        cropCompensation: 1.08,
      },
    },
    {
      id: "barrel",
      modelId: "wide-angle-barrel",
      modelVersion: 1,
      parameters: {
        center: [0.5, 0.68],
        strength: 0.34,
        radius: 1.15,
        cropCompensation: 1.1,
      },
    },
    {
      id: "fisheye",
      modelId: "fisheye",
      modelVersion: 1,
      parameters: {
        center: [0.5, 0.66],
        strength: 0.42,
        radius: 1.1,
        cropCompensation: 1.14,
      },
    },
    {
      id: "anamorphic",
      modelId: "anamorphic-edge-stretch",
      modelVersion: 1,
      parameters: {
        axis: "horizontal",
        strength: 0.38,
        edgeStart: 0.58,
        cropCompensation: 1.08,
      },
    },
  ],
  modifiers: [
    {
      id: "breathing",
      modelId: "lens-breathing",
      modelVersion: 1,
      parameters: { amount: 0.012, periodFrames: 120 },
    },
  ],
};

const registries = createBuiltinCameraRegistries();
const prepared = prepareCinematicPrograms(
  {
    fps: 60,
    durationInFrames: 420,
    storySignature: "camera-vnext-optical-probe-v1",
    stageProgram: stageIR,
    cameraPlans: [cameraIR],
    defaultCameraPlanId: cameraIR.id,
  },
  registries,
);
const cameraProgram = selectPreparedCameraProgram(prepared);

function labelForFrame(frame: number): string {
  if (frame < 60) return "Rectilinear control";
  if (frame < 120) return "Perspective tilt";
  if (frame < 180) return "Wide-angle barrel";
  if (frame < 240) return "Fisheye";
  if (frame < 300) return "Anamorphic edge stretch";
  if (frame < 336) return "Directional whip smear";
  if (frame < 360) return "Clean whip tail";
  return "Clean settlement";
}

const ProbeStage: React.FC<{ label: string }> = ({ label }) => (
  <AbsoluteFill
    style={{
      color: "#f5f7ff",
      background:
        "radial-gradient(circle at 20% 12%, rgba(87, 99, 255, 0.34), transparent 34%), radial-gradient(circle at 86% 82%, rgba(0, 214, 170, 0.24), transparent 36%), #070912",
      fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif",
    }}
  >
    <div
      style={{
        position: "absolute",
        inset: 0,
        opacity: 0.2,
        backgroundImage:
          "linear-gradient(rgba(255,255,255,0.13) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.13) 1px, transparent 1px)",
        backgroundSize: "54px 54px",
      }}
    />
    <div
      style={{
        position: "absolute",
        left: 80,
        top: 86,
        fontSize: 28,
        letterSpacing: 5,
        textTransform: "uppercase",
        color: "#93a2c8",
      }}
    >
      Tokovo Camera VNext Optical Probe
    </div>
    <div
      style={{
        position: "absolute",
        left: 80,
        top: 142,
        fontSize: 64,
        fontWeight: 760,
        letterSpacing: -2.6,
      }}
    >
      {label}
    </div>
    <div
      style={{
        position: "absolute",
        left: 168,
        top: 320,
        width: 744,
        height: 1410,
        borderRadius: 92,
        background: "linear-gradient(145deg, #242a37, #080a0f 64%)",
        padding: 22,
        boxShadow:
          "0 70px 140px rgba(0,0,0,0.62), inset 0 0 0 2px rgba(255,255,255,0.17)",
      }}
    >
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          borderRadius: 72,
          overflow: "hidden",
          background: "#f7f7fb",
          color: "#131621",
        }}
      >
        <div
          style={{
            height: 132,
            display: "flex",
            alignItems: "flex-end",
            padding: "0 42px 24px",
            background: "rgba(255,255,255,0.96)",
            borderBottom: "1px solid #d8dce7",
            fontSize: 31,
            fontWeight: 720,
          }}
        >
          Optical fidelity room
        </div>
        <div style={{ padding: "46px 34px", display: "grid", gap: 28 }}>
          {[
            "Crisp typography must remain readable.",
            "Curved projection should move real pixels.",
            "No affine fake-outs. No hidden fallback.",
          ].map((text, index) => (
            <div
              key={text}
              style={{
                justifySelf: index === 1 ? "end" : "start",
                maxWidth: 540,
                borderRadius: 34,
                padding: "24px 28px",
                fontSize: 29,
                lineHeight: 1.32,
                background: index === 1 ? "#d8ffe9" : "#ffffff",
                boxShadow: "0 10px 28px rgba(32,40,70,0.12)",
              }}
            >
              {text}
            </div>
          ))}
        </div>
        <div
          style={{
            position: "absolute",
            left: 24,
            right: 24,
            bottom: 36,
            height: 490,
            borderRadius: 38,
            padding: 22,
            background: "linear-gradient(180deg, #d6d8df, #b8bbc5)",
            display: "grid",
            gridTemplateColumns: "repeat(10, 1fr)",
            gridTemplateRows: "repeat(4, 1fr)",
            gap: 10,
          }}
        >
          {Array.from({ length: 40 }, (_, index) => (
            <div
              key={index}
              style={{
                borderRadius: 12,
                background: index === 39 ? "#4f60ff" : "#f5f5f8",
                boxShadow: "0 2px 4px rgba(0,0,0,0.25)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 18,
                fontWeight: 650,
              }}
            >
              {index === 39 ? "↵" : String.fromCharCode(65 + (index % 26))}
            </div>
          ))}
        </div>
      </div>
    </div>
  </AbsoluteFill>
);

export const CameraLensProbe: React.FC = () => {
  const frame = useCurrentFrame();
  const stage = evaluateStageFrame(prepared.stageProgram, frame);
  const subjects = projectCinematicSubjects(stage, [
    {
      ref: screenSubject,
      localRect: { x: 0, y: 0, width: WIDTH, height: HEIGHT },
      nodeId: "stage.root",
      visible: true,
      sourceVersion: 1,
      provenance: { ownerId: "camera-vnext-probe", regionId: "stage" },
    },
  ]);
  const output = evaluateCameraOutput(
    {
      program: cameraProgram,
      outputId: "main",
      frame,
      subjectFrame: { frame, subjects },
      mode: "preview",
    },
    registries,
  );

  return (
    <AbsoluteFill style={{ backgroundColor: "#070912" }}>
      <CameraProjectionSurface
        id="camera-vnext-lens-probe"
        output={output}
        stageWidth={WIDTH}
        stageHeight={HEIGHT}
      >
        <ProbeStage label={labelForFrame(frame)} />
      </CameraProjectionSurface>
    </AbsoluteFill>
  );
};
