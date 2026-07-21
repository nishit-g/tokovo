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

function requireSingleOutput(capture: CameraTextureProjectionCapture) {
  if (capture.outputs.length !== 1) {
    throw new Error(
      `CAM_TEXTURE_MULTI_OUTPUT_NOT_CONNECTED: Expected one camera output, received ${capture.outputs.length}.`,
    );
  }
  return capture.outputs[0];
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
): PerspectiveCorners {
  const output = requireSingleOutput(capture);
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
  compositionWidth: number;
  compositionHeight: number;
  mapWidth?: number;
  mapHeight?: number;
}): { x: Uint8Array; y: Uint8Array } {
  const output = requireSingleOutput(input.capture);
  if (
    output.viewport.x !== 0 ||
    output.viewport.y !== 0 ||
    output.viewport.width !== input.compositionWidth ||
    output.viewport.height !== input.compositionHeight ||
    output.clipRadiusPx !== 0
  ) {
    throw new Error(
      `CAM_TEXTURE_OUTPUT_MASK_NOT_CONNECTED: Frame ${input.capture.frame} must use one full-frame, square camera output until output masks are connected.`,
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
        viewport: output.viewport,
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

function dominantSmear(capture: CameraTextureProjectionCapture): SmearPass | null {
  const smears = capture.outputs.flatMap((output) =>
    output.projectionPasses.filter((pass): pass is SmearPass => pass.kind === "directional-smear"),
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

export function createCameraCommandFile(
  captures: readonly CameraTextureProjectionCapture[],
  fps: number,
): string {
  return captures
    .map((capture, sequenceIndex) => {
      const smear = dominantSmear(capture);
      const length = smear ? Math.max(1e-6, Math.hypot(smear.direction[0], smear.direction[1])) : 1;
      const directionX = smear ? smear.direction[0] / length : 1;
      const directionY = smear ? smear.direction[1] / length : 0;
      const spread = smear?.spreadPx ?? 0;
      const samples = clamp(Math.round(smear?.samples ?? 2), 2, 16);
      const majorDeviation = spread / Math.max(4, samples * 0.75);
      const sigmaX = Math.max(0.2, Math.abs(directionX) * majorDeviation);
      const sigmaY = Math.max(0.2, Math.abs(directionY) * majorDeviation);
      const alpha = smear ? 0.24 + smear.decay * 0.18 : 0;
      const cameraOpacity = clamp(capture.outputs[0]?.opacity ?? 1, 0, 1);
      const offsetX = directionX * spread * 0.18;
      const offsetY = directionY * spread * 0.18;
      const timestamp = (sequenceIndex / fps).toFixed(9);
      const corners = createPerspectiveCorners(capture);
      return `${timestamp} [enter] ${[
        ...perspectiveCommands("perspective@tokovo_camera_rgb", corners),
        ...perspectiveCommands("perspective@tokovo_camera_alpha", corners),
        `gblur@tokovo_smear sigma ${commandNumber(sigmaX)}`,
        `gblur@tokovo_smear sigmaV ${commandNumber(sigmaY)}`,
        `colorchannelmixer@tokovo_camera_opacity aa ${commandNumber(cameraOpacity)}`,
        `colorchannelmixer@tokovo_smear_alpha aa ${commandNumber(alpha)}`,
        `overlay@tokovo_smear_overlay x ${commandNumber(offsetX)}`,
        `overlay@tokovo_smear_overlay y ${commandNumber(offsetY)}`,
      ].join(", ")};`;
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
    if (
      captures.some(
        (capture) =>
          capture.storySignature !== identity.storySignature ||
          capture.stageSignature !== identity.stageSignature ||
          capture.cameraSignature !== identity.cameraSignature ||
          capture.planId !== identity.planId ||
          capture.stage.width !== identity.stage.width ||
          capture.stage.height !== identity.stage.height,
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
}): Promise<{ xPattern: string; yPattern: string }> {
  const xDir = path.join(input.rootDir, "xmaps");
  const yDir = path.join(input.rootDir, "ymaps");
  await Promise.all([fs.mkdir(xDir, { recursive: true }), fs.mkdir(yDir, { recursive: true })]);
  const cache = new Map<string, { x: string; y: string }>();
  for (const [sequenceIndex, capture] of input.captures.entries()) {
    const planes = createOpticalDisplacementMapPlanes({
      capture,
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
    xPattern: path.join(xDir, "%06d.png"),
    yPattern: path.join(yDir, "%06d.png"),
  };
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

export function createTextureFilterGraph(input: {
  commandFile: string;
  initialCapture: CameraTextureProjectionCapture;
  width: number;
  height: number;
}): string {
  const commandFile = escapeFilterPath(input.commandFile);
  const initialCorners = createPerspectiveCorners(input.initialCapture);
  return [
    `[1:v]format=rgba,sendcmd=f='${commandFile}',split=2[camera_rgb_source][camera_alpha_source]`,
    `[camera_rgb_source]format=rgb24,${perspectiveFilter("tokovo_camera_rgb", initialCorners)},crop=${input.width}:${input.height}:0:0[framed_rgb]`,
    `[camera_alpha_source]alphaextract,${perspectiveFilter("tokovo_camera_alpha", initialCorners)},crop=${input.width}:${input.height}:0:0[framed_alpha]`,
    `[2:v]scale=${input.width}:${input.height}:flags=bicubic,setsar=1,format=gray,split=2[xmap_rgb][xmap_alpha]`,
    `[3:v]scale=${input.width}:${input.height}:flags=bicubic,setsar=1,format=gray,split=2[ymap_rgb][ymap_alpha]`,
    `[framed_rgb][xmap_rgb][ymap_rgb]displace=edge=blank[warped_rgb]`,
    `[framed_alpha][xmap_alpha][ymap_alpha]displace=edge=blank[warped_alpha]`,
    `[warped_rgb][warped_alpha]alphamerge,format=rgba,colorchannelmixer@tokovo_camera_opacity=aa=1[warped]`,
    `[warped]split=2[crisp_source][smear_source]`,
    `[smear_source]gblur@tokovo_smear=sigma=0.2:sigmaV=0.2:steps=2:planes=15,colorchannelmixer@tokovo_smear_alpha=aa=0[smear]`,
    `[crisp_source]split=2[crisp_rgb][crisp_alpha_source]`,
    `[smear]split=2[smear_rgb][smear_alpha_source]`,
    `[crisp_rgb][smear_rgb]overlay@tokovo_smear_overlay=x=0:y=0:format=auto:alpha=straight,format=rgb24[optical_rgb]`,
    `[crisp_alpha_source]format=rgba,alphaextract[crisp_alpha]`,
    `[smear_alpha_source]format=rgba,alphaextract[smear_alpha]`,
    `[crisp_alpha][smear_alpha]blend=all_mode=lighten[optical_alpha]`,
    `[optical_rgb][optical_alpha]alphamerge,format=rgba[optical]`,
    `[0:v]format=rgba[underlay]`,
    `[underlay][optical]overlay=x=0:y=0:format=auto:alpha=straight,format=rgba[with_camera]`,
    `[4:v]format=rgba[foreground]`,
    `[with_camera][foreground]overlay=x=0:y=0:format=yuv420:alpha=straight[final]`,
  ].join(";");
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
  });
  await runFfmpeg([
    "-hide_banner",
    "-loglevel",
    "error",
    "-y",
    "-i",
    input.underlayPath,
    "-i",
    input.cameraPlatePath,
    "-framerate",
    String(input.fps),
    "-start_number",
    "0",
    "-i",
    maps.xPattern,
    "-framerate",
    String(input.fps),
    "-start_number",
    "0",
    "-i",
    maps.yPattern,
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
