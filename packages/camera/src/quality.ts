import type {
  CameraQualitySample,
  CameraTemporalQualityReport,
  EvaluatedCameraOutput,
} from "./types.js";
import { applyMatrix3, cameraPoseToViewMatrix } from "./matrix.js";

function round(value: number): number {
  return Math.round(value * 1_000_000) / 1_000_000;
}

function missingRanges(frames: readonly number[]): readonly (readonly [number, number])[] {
  const ranges: Array<readonly [number, number]> = [];
  for (let index = 1; index < frames.length; index += 1) {
    const previous = frames[index - 1];
    const current = frames[index];
    if (current > previous + 1) ranges.push([previous + 1, current - 1]);
  }
  return ranges;
}

export function cameraQualitySample(
  output: EvaluatedCameraOutput,
  options: { checkFraming?: boolean } = {},
): CameraQualitySample {
  const safe = output.trace.constraints.effectiveViewport;
  const matrix =
    (options.checkFraming ?? output.trace.quality.checkFraming)
      ? cameraPoseToViewMatrix(output.pose)
      : undefined;
  const framing = matrix
    ? {
        projectionSupported: output.projectionPasses.length === 0,
        subjects: output.trace.subjects.map(({ key, worldRect }) => ({ key, worldRect })),
        safeViewport: safe,
        clippedSubjectKeys: output.trace.subjects
          .filter(({ worldRect: rect }) =>
            [
              [rect.x, rect.y],
              [rect.x + rect.width, rect.y],
              [rect.x, rect.y + rect.height],
              [rect.x + rect.width, rect.y + rect.height],
            ].some(([x, y]) => {
              const point = applyMatrix3(matrix, { x, y });
              return (
                point.x < safe.x - 0.5 ||
                point.y < safe.y - 0.5 ||
                point.x > safe.x + safe.width + 0.5 ||
                point.y > safe.y + safe.height + 0.5
              );
            }),
          )
          .map(({ key }) => key),
      }
    : undefined;
  return {
    frame: output.frame,
    outputId: output.outputId,
    viewport: output.pose.clipRect,
    pose: {
      centerX: output.pose.centerX,
      centerY: output.pose.centerY,
      scale: output.pose.scale,
      rotationDeg: output.pose.rotationDeg,
    },
    subjectResolution: output.trace.subjectResolution,
    subjectFillRatio: output.trace.quality.subjectFillRatio,
    cropCompensation: output.trace.quality.cropCompensation,
    ...(framing ? { framing } : {}),
    intentionalDiscontinuity:
      (output.trace.transition?.durationFrames === 0 &&
        output.frame === output.trace.transition.startFrame) ||
      output.trace.transition?.whipActive === true,
    travel:
      output.trace.travel.mode === "stabilized"
        ? {
            mode: "stabilized",
            driftPx: output.trace.travel.driftPx,
            maxDriftPx: output.trace.travel.maxDriftPx,
          }
        : { mode: "intentional" },
  };
}

export function analyzeCameraTemporalQuality(
  samples: readonly CameraQualitySample[],
): CameraTemporalQualityReport {
  const grouped = new Map<string, CameraQualitySample[]>();
  for (const sample of samples) {
    const group = grouped.get(sample.outputId) ?? [];
    group.push(sample);
    grouped.set(sample.outputId, group);
  }
  const violations: CameraTemporalQualityReport["violations"][number][] = [];
  const outputs = [...grouped.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([outputId, values]) => {
      const ordered = [...values].sort((left, right) => left.frame - right.frame);
      const frames = ordered.map((sample) => sample.frame);
      const gaps = missingRanges(frames);
      for (const sample of ordered) {
        if (!sample.framing) continue;
        if (!sample.framing.projectionSupported)
          violations.push({
            code: "CAM_QUALITY_PROJECTION_UNCHECKED",
            outputId,
            frame: sample.frame,
            message:
              "Framing safety requires checking nonlinear projection passes in the rendered output.",
          });
        else if (sample.framing.clippedSubjectKeys.length)
          violations.push({
            code: "CAM_QUALITY_SUBJECT_CROPPED",
            outputId,
            frame: sample.frame,
            message: `Protected subjects leave the editorial safe viewport: ${sample.framing.clippedSubjectKeys.join(", ")}.`,
          });
      }
      for (const gap of gaps) {
        violations.push({
          code: "CAM_QUALITY_FRAME_GAP",
          outputId,
          frame: gap[0],
          message: `Camera output "${outputId}" is missing frames ${gap[0]}-${gap[1]}.`,
        });
      }
      const positionVelocities: number[] = [];
      const scaleVelocities: number[] = [];
      const rotationVelocities: number[] = [];
      const discontinuities: number[] = [];
      let cropCompensationChangeCount = 0;
      for (let index = 1; index < ordered.length; index += 1) {
        const previous = ordered[index - 1];
        const current = ordered[index];
        const frameDelta = Math.max(1, current.frame - previous.frame);
        const averageScale = (previous.pose.scale + current.pose.scale) / 2;
        const viewportDiagonal = Math.max(
          1,
          Math.hypot(current.viewport.width, current.viewport.height),
        );
        const positionVelocity =
          (Math.hypot(
            current.pose.centerX - previous.pose.centerX,
            current.pose.centerY - previous.pose.centerY,
          ) *
            averageScale) /
          viewportDiagonal /
          frameDelta;
        const scaleVelocity =
          Math.abs(Math.log(current.pose.scale / previous.pose.scale)) / frameDelta;
        const rotationVelocity =
          Math.abs(current.pose.rotationDeg - previous.pose.rotationDeg) / frameDelta;
        positionVelocities.push(positionVelocity);
        scaleVelocities.push(scaleVelocity);
        rotationVelocities.push(rotationVelocity);
        if (Math.abs(current.cropCompensation - previous.cropCompensation) > 0.03) {
          cropCompensationChangeCount += 1;
        }
        if (
          !current.intentionalDiscontinuity &&
          (positionVelocity > 0.105 || scaleVelocity > 0.12 || rotationVelocity > 7.5)
        ) {
          discontinuities.push(current.frame);
          violations.push({
            code: "CAM_QUALITY_POSE_DISCONTINUITY",
            outputId,
            frame: current.frame,
            message: `Camera output "${outputId}" has an unauthored pose discontinuity at frame ${current.frame}.`,
          });
        }
      }
      const accelerations = positionVelocities
        .slice(1)
        .map((velocity, index) => Math.abs(velocity - positionVelocities[index]));
      const jerks = accelerations
        .slice(1)
        .map((acceleration, index) => Math.abs(acceleration - accelerations[index]));
      const fills = ordered.map((sample) => sample.subjectFillRatio);
      const stabilized = ordered.filter(
        (
          sample,
        ): sample is CameraQualitySample & {
          travel: Extract<CameraQualitySample["travel"], { mode: "stabilized" }>;
        } => sample.travel.mode === "stabilized",
      );
      ordered.forEach((sample) => {
        if (
          !Number.isFinite(sample.subjectFillRatio) ||
          sample.subjectFillRatio <= 0 ||
          sample.subjectFillRatio > 4
        ) {
          violations.push({
            code: "CAM_QUALITY_FILL_INVALID",
            outputId,
            frame: sample.frame,
            message: `Camera output "${outputId}" has invalid subject fill ${sample.subjectFillRatio} at frame ${sample.frame}.`,
          });
        }
        if (
          sample.travel.mode === "stabilized" &&
          (Math.abs(sample.travel.driftPx[0]) > sample.travel.maxDriftPx[0] + 0.5 ||
            Math.abs(sample.travel.driftPx[1]) > sample.travel.maxDriftPx[1] + 0.5)
        ) {
          violations.push({
            code: "CAM_QUALITY_MOUNT_DRIFT",
            outputId,
            frame: sample.frame,
            message: `Camera output "${outputId}" exceeds its semantic mount dead zone at frame ${sample.frame}: drift ${round(sample.travel.driftPx[0])}px × ${round(sample.travel.driftPx[1])}px, allowed ${sample.travel.maxDriftPx[0]}px × ${sample.travel.maxDriftPx[1]}px.`,
          });
        }
      });
      return {
        outputId,
        frameRange: [ordered[0]?.frame ?? 0, ordered.at(-1)?.frame ?? 0] as const,
        maximumPositionVelocity: round(Math.max(0, ...positionVelocities)),
        maximumScaleVelocity: round(Math.max(0, ...scaleVelocities)),
        maximumRotationVelocityDeg: round(Math.max(0, ...rotationVelocities)),
        maximumPositionAcceleration: round(Math.max(0, ...accelerations)),
        maximumPositionJerk: round(Math.max(0, ...jerks)),
        minimumSubjectFillRatio: round(Math.min(...fills)),
        maximumSubjectFillRatio: round(Math.max(...fills)),
        fallbackFrameCount: ordered.filter(
          (sample) => sample.subjectResolution === "explicit-fallback",
        ).length,
        stabilizedFrameCount: stabilized.length,
        intentionalTravelFrameCount: ordered.length - stabilized.length,
        maximumMountDriftPx: [
          round(Math.max(0, ...stabilized.map((sample) => Math.abs(sample.travel.driftPx[0])))),
          round(Math.max(0, ...stabilized.map((sample) => Math.abs(sample.travel.driftPx[1])))),
        ] as const,
        cropCompensationChangeCount,
        discontinuityFrames: discontinuities,
        missingFrameRanges: gaps,
      };
    });
  return {
    version: 2,
    passed: violations.length === 0,
    sampleCount: samples.length,
    outputs,
    violations,
  };
}
