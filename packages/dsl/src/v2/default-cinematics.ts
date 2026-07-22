import type { DeviceConfig, EpisodeCinematicsIR } from "@tokovo/ir";
import { cameraSubject, cinematicProgram } from "./cinematics.js";

const STAGE_WIDTH = 1080;
const STAGE_HEIGHT = 1920;

function placement(
  index: number,
  count: number,
): {
  x: number;
  y: number;
  width: number;
  height: number;
} {
  if (count === 1) return { x: 330, y: 510, width: 420, height: 889 };
  if (count === 2) {
    return { x: index === 0 ? 70 : 590, y: 510, width: 420, height: 889 };
  }
  const columns = 2;
  const width = 360;
  const height = 762;
  const gapX = 80;
  const gapY = 70;
  const row = Math.floor(index / columns);
  const column = index % columns;
  return {
    x: 140 + column * (width + gapX),
    y: 160 + row * (height + gapY),
    width,
    height,
  };
}

/**
 * Native Camera VNext baseline for episodes that do not need a bespoke cut.
 * It is generated directly from declared devices; no camera events, subjects,
 * DOM measurements, or compatibility translation participate.
 */
export function createDefaultEpisodeCinematics(input: {
  fps: number;
  durationInFrames: number;
  devices: readonly DeviceConfig[];
}): EpisodeCinematicsIR | undefined {
  if (input.devices.length === 0) return undefined;
  const subjects = input.devices.map((device) =>
    cameraSubject.device(device.id, "body"),
  );
  const stageSubject =
    subjects.length === 1 ? subjects[0]! : cameraSubject.group(...subjects);

  return cinematicProgram(
    {
      fps: input.fps,
      duration: input.durationInFrames,
      stage: {
        width: STAGE_WIDTH,
        height: STAGE_HEIGHT,
        devices: input.devices.map((device, index) => ({
          deviceId: device.id,
          ...placement(index, input.devices.length),
          zIndex: 10 + index,
        })),
      },
    },
    (cinema) => {
      cinema.plan(
        "default",
        (camera) => {
          camera
            .output("portrait-main", {
              viewport: {
                x: 0,
                y: 0,
                width: STAGE_WIDTH,
                height: STAGE_HEIGHT,
              },
              defaultRigId: "stage-neutral",
              safeAreaInsets: { top: 48, right: 48, bottom: 48, left: 48 },
            })
            .modifier("quiet-breathing", "lens-breathing", {
              amount: 0.0025,
              periodFrames: Math.max(90, input.fps * 5),
            })
            .rig("stage-neutral", {
              outputId: "portrait-main",
              subject: stageSubject,
              composer: {
                screenPosition: [0.5, 0.5],
                targetFill: input.devices.length === 1 ? 0.84 : 0.9,
                fillMode: "contain",
                paddingPx: input.devices.length === 1 ? 34 : 44,
                minScale: 0.25,
                maxScale: 1.15,
              },
              framingGuard: {
                subject: stageSubject,
                screenPosition: [0.5, 0.5],
                paddingPx: input.devices.length === 1 ? 34 : 44,
              },
              modifierIds: ["quiet-breathing"],
              motion: {
                type: "minimum-jerk",
                durationFrames: Math.max(12, input.fps),
              },
            });
        },
        { default: true },
      );
    },
  );
}
