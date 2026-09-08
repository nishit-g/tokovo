import { cameraSubject, cinematicProgram, cinematicShot as shot } from "@tokovo/dsl";

const LIGHT = "ios_light";
const DIM = "android_dim";
const LIGHTS_OUT = "ios_lights_out_hi";
const group = cameraSubject.group(
  cameraSubject.device(LIGHT, "body"),
  cameraSubject.device(DIM, "body"),
  cameraSubject.device(LIGHTS_OUT, "body"),
);

export const xNativeThemeMatrixCamera = cinematicProgram(
  {
    fps: 30,
    duration: 540,
    stage: {
      width: 1080,
      height: 1920,
      devices: [
        {
          deviceId: LIGHT,
          x: 100,
          y: 245,
          width: 340,
          height: 738,
          zIndex: 10,
        },
        {
          deviceId: DIM,
          x: 640,
          y: 245,
          width: 340,
          height: 742,
          zIndex: 10,
        },
        {
          deviceId: LIGHTS_OUT,
          x: 370,
          y: 975,
          width: 340,
          height: 738,
          zIndex: 10,
        },
      ],
    },
  },
  (cinema) => {
    cinema.planFamily({
      plans: [{ id: "theme-matrix", default: true }],
      outputs: [
        {
          id: "portrait-main",
          viewport: { x: 0, y: 0, width: 1080, height: 1920 },
          coveragePolicy: "require-shots",
          compositionProfileId: "wide-context",
          travel: {
            mode: "stabilized",
            subject: group,
            maxDriftPx: [44, 64],
          },
          defaultRig: {
            id: "matrix",
            subject: group,
            frame: { fill: 0.9, padding: 48, min: 0.45, max: 1 },
            framingGuard: {
              subject: group,
              paddingPx: 48,
              screenPosition: [0.5, 0.5],
            },
            motion: { type: "minimum-jerk", durationFrames: 24 },
          },
        },
      ],
      sequences: [
        {
          outputId: "portrait-main",
          end: 540,
          shots: [
            shot("native-theme-tableau", 540, group)
              .frame({ fill: 0.9, padding: 48, min: 0.45, max: 1 })
              .settle(24),
          ],
        },
      ],
    });
  },
);
