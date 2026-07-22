import { spawn } from "node:child_process";
import { createHash } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { deflateSync } from "node:zlib";

import { applyMatrix3, type CameraProjectionPass } from "@tokovo/camera";
import {
  parseCameraTextureProjectionCapture,
  type CameraTextureProjectionCapture,
} from "video-runner/camera-texture-contract";

import { createRenderServiceError } from "./errors";
import type { RenderLogger } from "./logger";
import type { RenderProfile } from "./profiles";

const MAP_WIDTH = 512;
const MAP_HEIGHT = 512;
const PNG_SIGNATURE = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

type DistortionPass = Exclude<
  CameraProjectionPass,
  { kind: "directional-smear" } | { kind: "projective-warp" }
>;
type ProjectivePass = Extract<CameraProjectionPass, { kind: "projective-warp" }>;
type SmearPass = Extract<CameraProjectionPass, { kind: "directional-smear" }>;
type CaptureOutput = CameraTextureProjectionCapture["outputs"][number];

export interface PerspectiveCorners {
  topLeft: { x: number; y: number };
  topRight: { x: number; y: number };
  bottomLeft: { x: number; y: number };
  bottomRight: { x: number; y: number };
}

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.max(minimum, Math.min(maximum, value));
}

function displacementVector(input: {
  pass: DistortionPass;
  x: number;
  y: number;
}): readonly [number, number] {
  const pass = input.pass;
  const center = pass.kind === "anamorphic-edge-stretch" ? [0.5, 0.5] : pass.center;
  const normalizedX = (input.x - center[0]) * 2;
  const normalizedY = (input.y - center[1]) * 2;

  if (pass.kind === "anamorphic-edge-stretch") {
    const axisValue = pass.axis === "horizontal" ? normalizedX : normalizedY;
    const start = clamp(pass.edgeStart, 0, 0.99);
    const edgeProgress = clamp((Math.abs(axisValue) - start) / (1 - start), 0, 1);
    const displacement = Math.sign(axisValue) * edgeProgress * edgeProgress;
    return pass.axis === "horizontal" ? [displacement, 0] : [0, displacement];
  }

  const distance = Math.hypot(normalizedX, normalizedY);
  const radius = Math.max(0.01, pass.radius);
  if (distance < 1e-6 || distance >= radius) return [0, 0];
  const radialProgress = clamp(distance / radius, 0, 1);
  const magnitude =
    pass.kind === "fisheye-warp"
      ? Math.sin(radialProgress * Math.PI) ** 2
      : (256 / 27) * radialProgress ** 3 * (1 - radialProgress);
  return [(normalizedX / distance) * magnitude, (normalizedY / distance) * magnitude];
}

function passDisplacementPixels(
  pass: DistortionPass,
  x: number,
  y: number,
  viewport: { width: number; height: number },
): readonly [number, number] {
  const vector = displacementVector({ pass, x, y });
  const scale =
    pass.kind === "anamorphic-edge-stretch"
      ? pass.strength * Math.min(viewport.width, viewport.height) * 0.16
      : pass.strength * Math.min(viewport.width, viewport.height) * 0.2;
  // feDisplacementMap treats the 128-centered channel as half-scale. Keeping
  // the same convention makes the release compositor match preview optics.
  return [vector[0] * scale * 0.5, vector[1] * scale * 0.5];
}

export function composeWarpDisplacement(input: {
  x: number;
  y: number;
  viewport: { width: number; height: number };
  passes: readonly CameraProjectionPass[];
}): readonly [number, number] {
  let sourceX = input.x;
  let sourceY = input.y;
  const passes = input.passes.filter(
    (pass): pass is DistortionPass =>
      pass.kind !== "directional-smear" && pass.kind !== "projective-warp",
  );
  // A later displacement samples the already-displaced result, so compose
  // sampling coordinates in reverse painter order instead of merely summing.
  for (let index = passes.length - 1; index >= 0; index -= 1) {
    const [dx, dy] = passDisplacementPixels(passes[index], sourceX, sourceY, input.viewport);
    sourceX += dx / input.viewport.width;
    sourceY += dy / input.viewport.height;
  }
  return [(sourceX - input.x) * input.viewport.width, (sourceY - input.y) * input.viewport.height];
}

function maxCropCompensation(passes: readonly CameraProjectionPass[]): number {
  return passes.reduce(
    (maximum, pass) =>
      "cropCompensation" in pass ? Math.max(maximum, pass.cropCompensation) : maximum,
    1,
  );
}

function orderedOutputs(capture: CameraTextureProjectionCapture): readonly CaptureOutput[] {
  if (capture.outputs.length === 0) {
    throw new Error(
      `CAM_TEXTURE_OUTPUTS_EMPTY: Frame ${capture.frame} does not contain a camera output.`,
    );
  }
  const seen = new Set<string>();
  for (const output of capture.outputs) {
    if (seen.has(output.outputId)) {
      throw new Error(
        `CAM_TEXTURE_OUTPUT_DUPLICATE: Frame ${capture.frame} contains duplicate output "${output.outputId}".`,
      );
    }
    seen.add(output.outputId);
  }
  return [...capture.outputs].sort(
    (left, right) => left.zIndex - right.zIndex || left.outputId.localeCompare(right.outputId),
  );
}

function getOutput(capture: CameraTextureProjectionCapture, outputId: string): CaptureOutput {
  const output = capture.outputs.find((candidate) => candidate.outputId === outputId);
  if (!output) {
    throw new Error(
      `CAM_TEXTURE_OUTPUT_MISSING: Frame ${capture.frame} does not contain output "${outputId}".`,
    );
  }
  return output;
}

function projectForward(input: {
  point: { x: number; y: number };
  viewport: { x: number; y: number; width: number; height: number };
  cropCompensation: number;
  projective: ProjectivePass | undefined;
}): { x: number; y: number } {
  const centerX = input.viewport.width / 2;
  const centerY = input.viewport.height / 2;
  let x = centerX + (input.point.x - input.viewport.x - centerX) * input.cropCompensation;
  let y = centerY + (input.point.y - input.viewport.y - centerY) * input.cropCompensation;

  if (input.projective) {
    const radians = Math.PI / 180;
    const tiltX = input.projective.tiltXDeg * radians;
    const tiltY = input.projective.tiltYDeg * radians;
    const cosX = Math.cos(tiltX);
    const sinX = Math.sin(tiltX);
    const cosY = Math.cos(tiltY);
    const sinY = Math.sin(tiltY);
    const perspective = Math.max(1, input.projective.perspectivePx);
    const sourceX = x - centerX;
    const sourceY = y - centerY;
    const denominator = 1 + (cosX * sinY * sourceX) / perspective - (sinX * sourceY) / perspective;
    if (!Number.isFinite(denominator) || Math.abs(denominator) < 1e-8) {
      throw new Error(
        "CAM_TEXTURE_PROJECTIVE_SINGULAR: Projective camera transform sent a stage corner to infinity.",
      );
    }
    x = (cosY * sourceX) / denominator + centerX;
    y = (sinX * sinY * sourceX + cosX * sourceY) / denominator + centerY;
  }

  return { x: x + input.viewport.x, y: y + input.viewport.y };
}

export function createPerspectiveCorners(
  capture: CameraTextureProjectionCapture,
  outputId: string,
): PerspectiveCorners {
  const output = getOutput(capture, outputId);
  const projectivePasses = output.projectionPasses.filter(
    (pass): pass is ProjectivePass => pass.kind === "projective-warp",
  );
  if (projectivePasses.length > 1) {
    throw new Error(
      `CAM_TEXTURE_MULTIPLE_PROJECTIVE_PASSES: Frame ${capture.frame} requested ${projectivePasses.length} projective passes; exactly zero or one is supported.`,
    );
  }
  const cropCompensation = maxCropCompensation(output.projectionPasses);
  const map = (x: number, y: number) =>
    projectForward({
      point: applyMatrix3(output.viewMatrix, { x, y }),
      viewport: output.viewport,
      cropCompensation,
      projective: projectivePasses[0],
    });

  return {
    topLeft: map(0, 0),
    topRight: map(capture.stage.width, 0),
    bottomLeft: map(0, capture.stage.height),
    bottomRight: map(capture.stage.width, capture.stage.height),
  };
}

export function createOpticalDisplacementMapPlanes(input: {
  capture: CameraTextureProjectionCapture;
  outputId: string;
  compositionWidth: number;
  compositionHeight: number;
  mapWidth?: number;
  mapHeight?: number;
}): { x: Uint8Array; y: Uint8Array } {
  const output = getOutput(input.capture, input.outputId);
  const viewport = output.viewport;
  if (
    ![viewport.x, viewport.y, viewport.width, viewport.height].every(Number.isInteger) ||
    viewport.x < 0 ||
    viewport.y < 0 ||
    viewport.x + viewport.width > input.compositionWidth ||
    viewport.y + viewport.height > input.compositionHeight
  ) {
    throw new Error(
      `CAM_TEXTURE_OUTPUT_VIEWPORT_INVALID: Frame ${input.capture.frame} output "${output.outputId}" must use an integer viewport inside ${input.compositionWidth}x${input.compositionHeight}.`,
    );
  }
  const width = input.mapWidth ?? MAP_WIDTH;
  const height = input.mapHeight ?? MAP_HEIGHT;
  const xPlane = new Uint8Array(width * height).fill(128);
  const yPlane = new Uint8Array(width * height).fill(128);

  for (let row = 0; row < height; row += 1) {
    for (let column = 0; column < width; column += 1) {
      const localX = (column + 0.5) / width;
      const localY = (row + 0.5) / height;
      const [dx, dy] = composeWarpDisplacement({
        x: localX,
        y: localY,
        viewport,
        passes: output.projectionPasses,
      });
      if (Math.abs(dx) > 127.5 || Math.abs(dy) > 127.5) {
        throw new Error(
          `CAM_TEXTURE_DISPLACEMENT_RANGE_EXCEEDED: Frame ${input.capture.frame} requires (${dx.toFixed(2)}, ${dy.toFixed(2)})px at map sample ${column},${row}.`,
        );
      }
      const offset = row * width + column;
      xPlane[offset] = Math.round(clamp(128 + dx, 0, 255));
      yPlane[offset] = Math.round(clamp(128 + dy, 0, 255));
    }
  }

  return { x: xPlane, y: yPlane };
}

function crc32(bytes: Uint8Array): number {
  let crc = 0xffffffff;
  for (const byte of bytes) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit += 1) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function pngChunk(type: string, data: Uint8Array): Buffer {
  const chunk = Buffer.alloc(12 + data.length);
  chunk.writeUInt32BE(data.length, 0);
  chunk.write(type, 4, 4, "ascii");
  Buffer.from(data).copy(chunk, 8);
  chunk.writeUInt32BE(crc32(chunk.subarray(4, chunk.length - 4)), chunk.length - 4);
  return chunk;
}

export function encodeGrayscalePng(width: number, height: number, pixels: Uint8Array): Buffer {
  if (pixels.length !== width * height) {
    throw new Error("Grayscale PNG pixel count does not match its dimensions.");
  }
  const scanlines = Buffer.alloc((width + 1) * height);
  for (let row = 0; row < height; row += 1) {
    const offset = row * (width + 1);
    scanlines[offset] = 0;
    Buffer.from(pixels.subarray(row * width, (row + 1) * width)).copy(scanlines, offset + 1);
  }
  const header = Buffer.alloc(13);
  header.writeUInt32BE(width, 0);
  header.writeUInt32BE(height, 4);
  header[8] = 8;
  header[9] = 0;
  return Buffer.concat([
    PNG_SIGNATURE,
    pngChunk("IHDR", header),
    pngChunk("IDAT", deflateSync(scanlines, { level: 9 })),
    pngChunk("IEND", Buffer.alloc(0)),
  ]);
}

function dominantSmear(output: CaptureOutput): SmearPass | null {
  const smears = output.projectionPasses.filter(
    (pass): pass is SmearPass => pass.kind === "directional-smear",
  );
  return (
    [...smears].sort(
      (left, right) =>
        right.spreadPx - left.spreadPx || right.decay - left.decay || right.samples - left.samples,
    )[0] ?? null
  );
}

function commandNumber(value: number): string {
  const normalized = Math.abs(value) < 1e-8 ? 0 : value;
  return normalized.toFixed(6).replace(/\.?0+$/, "");
}

function perspectiveCommands(target: string, corners: PerspectiveCorners): string[] {
  return [
    ["x0", corners.topLeft.x],
    ["y0", corners.topLeft.y],
    ["x1", corners.topRight.x],
    ["y1", corners.topRight.y],
    ["x2", corners.bottomLeft.x],
    ["y2", corners.bottomLeft.y],
    ["x3", corners.bottomRight.x],
    ["y3", corners.bottomRight.y],
  ].map(([property, value]) => `${target} ${property} ${commandNumber(value as number)}`);
}

function filterTarget(filter: string, instance: string, outputIndex: number): string {
  return `${filter}@tokovo_${instance}_${outputIndex}`;
}

export function createCameraCommandFile(
  captures: readonly CameraTextureProjectionCapture[],
  fps: number,
): string {
  return captures
    .map((capture, sequenceIndex) => {
      const timestamp = (sequenceIndex / fps).toFixed(9);
      const commands = orderedOutputs(capture).flatMap((output, outputIndex) => {
        const smear = dominantSmear(output);
        const length = smear
          ? Math.max(1e-6, Math.hypot(smear.direction[0], smear.direction[1]))
          : 1;
        const directionX = smear ? smear.direction[0] / length : 1;
        const directionY = smear ? smear.direction[1] / length : 0;
        const spread = smear?.spreadPx ?? 0;
        const samples = clamp(Math.round(smear?.samples ?? 2), 2, 16);
        const majorDeviation = spread / Math.max(4, samples * 0.75);
        const sigmaX = Math.max(0.2, Math.abs(directionX) * majorDeviation);
        const sigmaY = Math.max(0.2, Math.abs(directionY) * majorDeviation);
        const alpha = smear ? 0.24 + smear.decay * 0.18 : 0;
        const cameraOpacity = clamp(output.opacity, 0, 1);
        const offsetX = directionX * spread * 0.18;
        const offsetY = directionY * spread * 0.18;
        const corners = createPerspectiveCorners(capture, output.outputId);
        return [
          ...perspectiveCommands(filterTarget("perspective", "camera", outputIndex), corners),
          `${filterTarget("gblur", "smear", outputIndex)} sigma ${commandNumber(sigmaX)}`,
          `${filterTarget("gblur", "smear", outputIndex)} sigmaV ${commandNumber(sigmaY)}`,
          `${filterTarget("colorchannelmixer", "camera_opacity", outputIndex)} aa ${commandNumber(cameraOpacity)}`,
          `${filterTarget("colorchannelmixer", "smear_alpha", outputIndex)} aa ${commandNumber(alpha)}`,
          `${filterTarget("overlay", "smear_overlay", outputIndex)} x ${commandNumber(offsetX)}`,
          `${filterTarget("overlay", "smear_overlay", outputIndex)} y ${commandNumber(offsetY)}`,
        ];
      });
      return `${timestamp} [enter] ${commands.join(", ")};`;
    })
    .join("\n");
}

export class CameraTextureCaptureCollector {
  readonly #frames = new Map<number, CameraTextureProjectionCapture>();

  acceptBrowserLog(text: string): void {
    const capture = parseCameraTextureProjectionCapture(text);
    if (!capture) return;
    const existing = this.#frames.get(capture.frame);
    if (existing && JSON.stringify(existing) !== JSON.stringify(capture)) {
      throw new Error(
        `CAM_TEXTURE_CAPTURE_NONDETERMINISTIC: Frame ${capture.frame} emitted conflicting projection data.`,
      );
    }
    this.#frames.set(capture.frame, capture);
  }

  complete(durationInFrames: number): readonly CameraTextureProjectionCapture[] {
    return this.completeRange(0, durationInFrames - 1);
  }

  completeRange(startFrame: number, endFrame: number): readonly CameraTextureProjectionCapture[] {
    if (
      !Number.isInteger(startFrame) ||
      !Number.isInteger(endFrame) ||
      startFrame < 0 ||
      endFrame < startFrame
    ) {
      throw new Error(
        `CAM_TEXTURE_CAPTURE_RANGE_INVALID: Expected an inclusive non-negative frame range, received ${startFrame}-${endFrame}.`,
      );
    }
    const captures: CameraTextureProjectionCapture[] = [];
    for (let frame = startFrame; frame <= endFrame; frame += 1) {
      const capture = this.#frames.get(frame);
      if (!capture) {
        throw new Error(
          `CAM_TEXTURE_CAPTURE_INCOMPLETE: Missing projection data for frame ${frame}.`,
        );
      }
      captures.push(capture);
    }
    const identity = captures[0];
    const outputLayoutIdentity = JSON.stringify(
      orderedOutputs(identity).map((output) => ({
        outputId: output.outputId,
        sourceStageNodeId: output.sourceStageNodeId,
        zIndex: output.zIndex,
        viewport: output.viewport,
        clipRadiusPx: output.clipRadiusPx,
        shadow: output.shadow,
      })),
    );
    if (
      captures.some(
        (capture) =>
          capture.storySignature !== identity.storySignature ||
          capture.stageSignature !== identity.stageSignature ||
          capture.cameraSignature !== identity.cameraSignature ||
          capture.planId !== identity.planId ||
          capture.stage.width !== identity.stage.width ||
          capture.stage.height !== identity.stage.height ||
          JSON.stringify(
            orderedOutputs(capture).map((output) => ({
              outputId: output.outputId,
              sourceStageNodeId: output.sourceStageNodeId,
              zIndex: output.zIndex,
              viewport: output.viewport,
              clipRadiusPx: output.clipRadiusPx,
              shadow: output.shadow,
            })),
          ) !== outputLayoutIdentity,
      )
    ) {
      throw new Error(
        "CAM_TEXTURE_CAPTURE_IDENTITY_CHANGED: Story, stage, or camera identity changed during one render.",
      );
    }
    return captures;
  }
}

async function writeMapSequence(input: {
  captures: readonly CameraTextureProjectionCapture[];
  compositionWidth: number;
  compositionHeight: number;
  rootDir: string;
}): Promise<readonly { outputId: string; xPattern: string; yPattern: string }[]> {
  const firstCapture = input.captures[0];
  if (!firstCapture) return [];
  const cache = new Map<string, { x: string; y: string }>();
  const opticalOutputs = orderedOutputs(firstCapture).filter((output) =>
    input.captures.some((capture) => hasOpticalDisplacement(getOutput(capture, output.outputId))),
  );
  return Promise.all(
    opticalOutputs.map(async (output, outputIndex) => {
      const outputDir = path.join(
        input.rootDir,
        `output-${outputIndex.toString().padStart(2, "0")}`,
      );
      const xDir = path.join(outputDir, "xmaps");
      const yDir = path.join(outputDir, "ymaps");
      await Promise.all([fs.mkdir(xDir, { recursive: true }), fs.mkdir(yDir, { recursive: true })]);
      for (const [sequenceIndex, capture] of input.captures.entries()) {
        const planes = createOpticalDisplacementMapPlanes({
          capture,
          outputId: output.outputId,
          compositionWidth: input.compositionWidth,
          compositionHeight: input.compositionHeight,
        });
        const xPng = encodeGrayscalePng(MAP_WIDTH, MAP_HEIGHT, planes.x);
        const yPng = encodeGrayscalePng(MAP_WIDTH, MAP_HEIGHT, planes.y);
        const digest = createHash("sha256").update(xPng).update(yPng).digest("hex");
        const name = `${sequenceIndex.toString().padStart(6, "0")}.png`;
        const xPath = path.join(xDir, name);
        const yPath = path.join(yDir, name);
        const cached = cache.get(digest);
        if (cached) {
          await Promise.all([fs.link(cached.x, xPath), fs.link(cached.y, yPath)]);
          continue;
        }
        await Promise.all([fs.writeFile(xPath, xPng), fs.writeFile(yPath, yPng)]);
        cache.set(digest, { x: xPath, y: yPath });
      }
      return {
        outputId: output.outputId,
        xPattern: path.join(xDir, "%06d.png"),
        yPattern: path.join(yDir, "%06d.png"),
      };
    }),
  );
}

function escapeFilterPath(filePath: string): string {
  return filePath.replaceAll("\\", "\\\\").replaceAll(":", "\\:").replaceAll("'", "\\'");
}

function perspectiveFilter(target: string, corners: PerspectiveCorners): string {
  return [
    `perspective@${target}=x0=${commandNumber(corners.topLeft.x)}`,
    `y0=${commandNumber(corners.topLeft.y)}`,
    `x1=${commandNumber(corners.topRight.x)}`,
    `y1=${commandNumber(corners.topRight.y)}`,
    `x2=${commandNumber(corners.bottomLeft.x)}`,
    `y2=${commandNumber(corners.bottomLeft.y)}`,
    `x3=${commandNumber(corners.bottomRight.x)}`,
    `y3=${commandNumber(corners.bottomRight.y)}`,
    "sense=destination",
    "interpolation=cubic",
  ].join(":");
}

function roundedClipFilter(input: {
  radius: number;
  width: number;
  height: number;
}): string | undefined {
  const radius = Math.min(input.radius, input.width / 2, input.height / 2);
  if (radius <= 0) return undefined;
  const r = commandNumber(radius);
  const right = commandNumber(input.width - radius);
  const bottom = commandNumber(input.height - radius);
  const radiusSquared = commandNumber(radius * radius);
  const distanceX = `max(max(${r}-X,0),X-${right})`;
  const distanceY = `max(max(${r}-Y,0),Y-${bottom})`;
  const inside = `lte(pow(${distanceX},2)+pow(${distanceY},2),${radiusSquared})`;
  return `geq=r='r(X,Y)':g='g(X,Y)':b='b(X,Y)':a='alpha(X,Y)*${inside}'`;
}

function hasOpticalDisplacement(output: CaptureOutput): boolean {
  return output.projectionPasses.some(
    (pass) =>
      pass.kind === "radial-warp" ||
      pass.kind === "fisheye-warp" ||
      pass.kind === "anamorphic-edge-stretch",
  );
}

export function createTextureFilterGraph(input: {
  commandFile: string;
  initialCapture: CameraTextureProjectionCapture;
  width: number;
  height: number;
  opticalOutputIds?: readonly string[];
}): string {
  const commandFile = escapeFilterPath(input.commandFile);
  const outputs = orderedOutputs(input.initialCapture);
  const opticalOutputIds =
    input.opticalOutputIds ??
    outputs.filter((output) => hasOpticalDisplacement(output)).map((output) => output.outputId);
  const opticalOutputIndex = new Map(
    opticalOutputIds.map((outputId, index) => [outputId, index] as const),
  );
  for (const outputId of opticalOutputIds) {
    if (!outputs.some((output) => output.outputId === outputId)) {
      throw new Error(`CAM_TEXTURE_OPTICAL_OUTPUT_MISSING: Unknown output "${outputId}".`);
    }
  }
  const foregroundInputIndex = 2 + opticalOutputIds.length * 2;
  const graph: string[] = [];
  const cameraSourceLabels = outputs.map((_, index) => `[camera_source_${index}]`).join("");
  graph.push(
    outputs.length === 1
      ? `[1:v]format=rgba,sendcmd=f='${commandFile}'${cameraSourceLabels}`
      : `[1:v]format=rgba,sendcmd=f='${commandFile}',split=${outputs.length}${cameraSourceLabels}`,
  );

  for (const [outputIndex, output] of outputs.entries()) {
    const viewport = output.viewport;
    const initialCorners = createPerspectiveCorners(input.initialCapture, output.outputId);
    const opticalIndex = opticalOutputIndex.get(output.outputId);
    graph.push(
      `[camera_source_${outputIndex}]${perspectiveFilter(`tokovo_camera_${outputIndex}`, initialCorners)},crop=${viewport.width}:${viewport.height}:${viewport.x}:${viewport.y},format=rgba[framed_${outputIndex}]`,
    );
    if (opticalIndex !== undefined) {
      const xMapInputIndex = 2 + opticalIndex * 2;
      const yMapInputIndex = xMapInputIndex + 1;
      graph.push(
        `[${xMapInputIndex}:v]scale=${viewport.width}:${viewport.height}:flags=bicubic,setsar=1,format=gray[xmap_${outputIndex}]`,
        `[${yMapInputIndex}:v]scale=${viewport.width}:${viewport.height}:flags=bicubic,setsar=1,format=gray[ymap_${outputIndex}]`,
        `[framed_${outputIndex}][xmap_${outputIndex}][ymap_${outputIndex}]displace=edge=blank,format=rgba,colorchannelmixer@tokovo_camera_opacity_${outputIndex}=aa=1[warped_${outputIndex}]`,
      );
    } else {
      graph.push(
        `[framed_${outputIndex}]format=rgba,colorchannelmixer@tokovo_camera_opacity_${outputIndex}=aa=1[warped_${outputIndex}]`,
      );
    }
    graph.push(
      `[warped_${outputIndex}]split=2[crisp_source_${outputIndex}][smear_source_${outputIndex}]`,
      `[smear_source_${outputIndex}]gblur@tokovo_smear_${outputIndex}=sigma=0.2:sigmaV=0.2:steps=2:planes=15,colorchannelmixer@tokovo_smear_alpha_${outputIndex}=aa=0[smear_${outputIndex}]`,
      `[crisp_source_${outputIndex}][smear_${outputIndex}]overlay@tokovo_smear_overlay_${outputIndex}=x=0:y=0:format=auto:alpha=straight,format=rgba[optical_unmasked_${outputIndex}]`,
    );
    const roundedClip = roundedClipFilter({
      radius: output.clipRadiusPx,
      width: viewport.width,
      height: viewport.height,
    });
    if (roundedClip) {
      graph.push(
        `[optical_unmasked_${outputIndex}]${roundedClip},format=rgba[optical_clipped_${outputIndex}]`,
      );
    } else {
      graph.push(`[optical_unmasked_${outputIndex}]null[optical_clipped_${outputIndex}]`);
    }
    if (output.shadow && output.shadow.opacity > 0 && output.shadow.blurPx > 0) {
      const shadowPadding = Math.ceil(output.shadow.blurPx * 2);
      graph.push(
        `[optical_clipped_${outputIndex}]split=2[shadow_source_${outputIndex}][optical_${outputIndex}]`,
        `[shadow_source_${outputIndex}]pad=${viewport.width + shadowPadding * 2}:${viewport.height + shadowPadding * 2}:${shadowPadding}:${shadowPadding}:color=black@0,format=rgba,colorchannelmixer=rr=0:gg=0:bb=0:aa=${commandNumber(output.shadow.opacity)},gblur=sigma=${commandNumber(output.shadow.blurPx)}:sigmaV=${commandNumber(output.shadow.blurPx)}:steps=2:planes=15[shadow_${outputIndex}]`,
      );
    } else {
      graph.push(`[optical_clipped_${outputIndex}]null[optical_${outputIndex}]`);
    }
  }

  graph.push(`[0:v]format=rgba[camera_canvas_0]`);
  for (const [outputIndex, output] of outputs.entries()) {
    if (output.shadow && output.shadow.opacity > 0 && output.shadow.blurPx > 0) {
      const shadowPadding = Math.ceil(output.shadow.blurPx * 2);
      graph.push(
        `[camera_canvas_${outputIndex}][shadow_${outputIndex}]overlay=x=${commandNumber(output.viewport.x + output.shadow.offsetX - shadowPadding)}:y=${commandNumber(output.viewport.y + output.shadow.offsetY - shadowPadding)}:format=auto:alpha=straight[camera_shadow_canvas_${outputIndex}]`,
        `[camera_shadow_canvas_${outputIndex}][optical_${outputIndex}]overlay=x=${output.viewport.x}:y=${output.viewport.y}:format=auto:alpha=straight[camera_canvas_${outputIndex + 1}]`,
      );
    } else {
      graph.push(
        `[camera_canvas_${outputIndex}][optical_${outputIndex}]overlay=x=${output.viewport.x}:y=${output.viewport.y}:format=auto:alpha=straight[camera_canvas_${outputIndex + 1}]`,
      );
    }
  }
  graph.push(
    `[${foregroundInputIndex}:v]format=rgba[foreground]`,
    `[camera_canvas_${outputs.length}][foreground]overlay=x=0:y=0:format=yuv420:alpha=straight[final]`,
  );
  // Keep this RGBA constraint after perspective. Without it, FFmpeg can
  // negotiate the camera stream down to gray to match displace's map inputs.
  return graph.join(";");
}

async function runFfmpeg(args: readonly string[]): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    const child = spawn("ffmpeg", args, {
      stdio: ["ignore", "ignore", "pipe"],
    });
    let stderr = "";
    child.stderr.setEncoding("utf8");
    child.stderr.on("data", (chunk: string) => {
      stderr = `${stderr}${chunk}`.slice(-24_000);
    });
    child.once("error", reject);
    child.once("close", (code) => {
      if (code === 0) {
        resolve();
        return;
      }
      reject(new Error(`ffmpeg exited with code ${code}: ${stderr}`));
    });
  });
}

export async function renderPosterFromVideo(input: {
  videoPath: string;
  posterPath: string;
  frame: number;
  fps: number;
}): Promise<void> {
  await runFfmpeg([
    "-hide_banner",
    "-loglevel",
    "error",
    "-y",
    "-ss",
    (input.frame / input.fps).toFixed(9),
    "-i",
    input.videoPath,
    "-frames:v",
    "1",
    "-c:v",
    "png",
    input.posterPath,
  ]);
}

export async function compositeCameraTexture(input: {
  captures: readonly CameraTextureProjectionCapture[];
  underlayPath: string;
  cameraPlatePath: string;
  foregroundPlatePath: string;
  outputPath: string;
  workingDirectory: string;
  width: number;
  height: number;
  fps: number;
  profile: RenderProfile;
  logger: RenderLogger;
}): Promise<void> {
  const initialCapture = input.captures[0];
  if (!initialCapture) {
    throw new Error("CAM_TEXTURE_CAPTURE_EMPTY: Offline composition requires at least one frame.");
  }
  if (initialCapture.stage.width < input.width || initialCapture.stage.height < input.height) {
    throw new Error(
      `CAM_TEXTURE_STAGE_TOO_SMALL: Reusable stage plate ${initialCapture.stage.width}x${initialCapture.stage.height} cannot contain ${input.width}x${input.height} output.`,
    );
  }
  const mapStartedAt = Date.now();
  const maps = await writeMapSequence({
    captures: input.captures,
    compositionWidth: input.width,
    compositionHeight: input.height,
    rootDir: input.workingDirectory,
  });
  const commandFile = path.join(input.workingDirectory, "camera.sendcmd");
  await fs.writeFile(
    commandFile,
    `${createCameraCommandFile(input.captures, input.fps)}\n`,
    "utf8",
  );
  await input.logger.info(
    "camera.texture.maps.done",
    "Built deterministic camera homography commands and optical displacement maps",
    {
      frameCount: input.captures.length,
      opticalOutputCount: maps.length,
      mapWidth: MAP_WIDTH,
      mapHeight: MAP_HEIGHT,
      durationMs: Date.now() - mapStartedAt,
    },
  );

  const filterGraph = createTextureFilterGraph({
    commandFile,
    initialCapture,
    width: input.width,
    height: input.height,
    opticalOutputIds: maps.map((map) => map.outputId),
  });
  const mapInputs = maps.flatMap((map) => [
    "-framerate",
    String(input.fps),
    "-start_number",
    "0",
    "-i",
    map.xPattern,
    "-framerate",
    String(input.fps),
    "-start_number",
    "0",
    "-i",
    map.yPattern,
  ]);
  await runFfmpeg([
    "-hide_banner",
    "-loglevel",
    "error",
    "-y",
    "-i",
    input.underlayPath,
    "-i",
    input.cameraPlatePath,
    ...mapInputs,
    "-i",
    input.foregroundPlatePath,
    "-filter_complex_threads",
    "1",
    "-filter_complex",
    filterGraph,
    "-map",
    "[final]",
    "-map",
    "0:a?",
    "-frames:v",
    String(input.captures.length),
    "-r",
    String(input.fps),
    "-c:v",
    "libx264",
    "-b:v",
    input.profile.videoBitrate,
    "-preset",
    input.profile.x264Preset,
    "-pix_fmt",
    "yuv420p",
    "-c:a",
    "aac",
    "-b:a",
    "192k",
    "-movflags",
    "+faststart",
    input.outputPath,
  ]).catch((error) => {
    throw createRenderServiceError({
      code: "CAM_TEXTURE_COMPOSITOR_FAILED",
      stage: "camera-texture-compositor",
      message: "Offline camera texture composition failed",
      details: {
        outputPath: input.outputPath,
        planId: input.captures[0]?.planId,
        cameraSignature: input.captures[0]?.cameraSignature,
      },
      cause: error instanceof Error ? error : undefined,
    });
  });
}
