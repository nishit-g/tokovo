import React from "react";
import type { CameraProjectionPass, EvaluatedCameraOutput, Matrix3 } from "@tokovo/camera";
import {
  CameraProjectionBackendError,
  selectCameraProjectionBackend,
} from "./projectionBackend.js";

const DISPLACEMENT_MAP_SIZE = 512;
const displacementMapCache = new Map<string, string>();

type DisplacementKind = "barrel" | "fisheye" | "edge-horizontal" | "edge-vertical";

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.max(minimum, Math.min(maximum, value));
}

function displacementVector(input: {
  kind: DisplacementKind;
  x: number;
  y: number;
  center: readonly [number, number];
  radius: number;
  edgeStart: number;
}): readonly [number, number] {
  const normalizedX = (input.x - input.center[0]) * 2;
  const normalizedY = (input.y - input.center[1]) * 2;
  const radius = Math.max(0.01, input.radius);
  const distance = Math.sqrt(normalizedX * normalizedX + normalizedY * normalizedY);

  if (input.kind === "edge-horizontal" || input.kind === "edge-vertical") {
    const axisValue = input.kind === "edge-horizontal" ? normalizedX : normalizedY;
    const absoluteAxis = Math.abs(axisValue);
    const start = clamp(input.edgeStart, 0, 0.99);
    const edgeProgress = clamp((absoluteAxis - start) / (1 - start), 0, 1);
    const displacement = Math.sign(axisValue) * edgeProgress * edgeProgress;
    return input.kind === "edge-horizontal" ? [displacement, 0] : [0, displacement];
  }

  if (distance < 1e-6 || distance >= radius) return [0, 0];

  const radialProgress = clamp(distance / radius, 0, 1);
  const magnitude =
    input.kind === "fisheye"
      ? Math.sin(radialProgress * Math.PI) ** 2
      : (256 / 27) * radialProgress ** 3 * (1 - radialProgress);
  return [(normalizedX / distance) * magnitude, (normalizedY / distance) * magnitude];
}

function writeUint32(bytes: Uint8Array, offset: number, value: number): void {
  bytes[offset] = (value >>> 24) & 0xff;
  bytes[offset + 1] = (value >>> 16) & 0xff;
  bytes[offset + 2] = (value >>> 8) & 0xff;
  bytes[offset + 3] = value & 0xff;
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

function adler32(bytes: Uint8Array): number {
  let a = 1;
  let b = 0;
  for (const byte of bytes) {
    a = (a + byte) % 65521;
    b = (b + a) % 65521;
  }
  return ((b << 16) | a) >>> 0;
}

function pngChunk(type: string, data: Uint8Array): Uint8Array {
  const chunk = new Uint8Array(12 + data.length);
  writeUint32(chunk, 0, data.length);
  for (let index = 0; index < 4; index += 1) {
    chunk[4 + index] = type.charCodeAt(index);
  }
  chunk.set(data, 8);
  writeUint32(chunk, chunk.length - 4, crc32(chunk.subarray(4, chunk.length - 4)));
  return chunk;
}

function encodeStoredZlib(data: Uint8Array): Uint8Array {
  const blockCount = Math.ceil(data.length / 65535);
  const result = new Uint8Array(2 + data.length + blockCount * 5 + 4);
  result[0] = 0x78;
  result[1] = 0x01;
  let inputOffset = 0;
  let outputOffset = 2;
  while (inputOffset < data.length) {
    const length = Math.min(65535, data.length - inputOffset);
    const isFinal = inputOffset + length === data.length;
    result[outputOffset] = isFinal ? 1 : 0;
    result[outputOffset + 1] = length & 0xff;
    result[outputOffset + 2] = (length >>> 8) & 0xff;
    const inverseLength = ~length & 0xffff;
    result[outputOffset + 3] = inverseLength & 0xff;
    result[outputOffset + 4] = (inverseLength >>> 8) & 0xff;
    outputOffset += 5;
    result.set(data.subarray(inputOffset, inputOffset + length), outputOffset);
    inputOffset += length;
    outputOffset += length;
  }
  writeUint32(result, outputOffset, adler32(data));
  return result;
}

function joinBytes(parts: readonly Uint8Array[]): Uint8Array {
  const result = new Uint8Array(parts.reduce((total, part) => total + part.length, 0));
  let offset = 0;
  for (const part of parts) {
    result.set(part, offset);
    offset += part.length;
  }
  return result;
}

const BASE64_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

function bytesToBase64(bytes: Uint8Array): string {
  let result = "";
  for (let index = 0; index < bytes.length; index += 3) {
    const first = bytes[index] ?? 0;
    const second = bytes[index + 1] ?? 0;
    const third = bytes[index + 2] ?? 0;
    const packed = (first << 16) | (second << 8) | third;
    result += BASE64_ALPHABET[(packed >>> 18) & 63];
    result += BASE64_ALPHABET[(packed >>> 12) & 63];
    result += index + 1 < bytes.length ? BASE64_ALPHABET[(packed >>> 6) & 63] : "=";
    result += index + 2 < bytes.length ? BASE64_ALPHABET[packed & 63] : "=";
  }
  return result;
}

function encodeRgbaPng(width: number, height: number, pixels: Uint8Array): Uint8Array {
  const stride = width * 4;
  const scanlines = new Uint8Array((stride + 1) * height);
  for (let row = 0; row < height; row += 1) {
    const scanlineOffset = row * (stride + 1);
    scanlines[scanlineOffset] = 0;
    scanlines.set(pixels.subarray(row * stride, (row + 1) * stride), scanlineOffset + 1);
  }

  const header = new Uint8Array(13);
  writeUint32(header, 0, width);
  writeUint32(header, 4, height);
  header[8] = 8;
  header[9] = 6;

  return joinBytes([
    new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]),
    pngChunk("IHDR", header),
    pngChunk("IDAT", encodeStoredZlib(scanlines)),
    pngChunk("IEND", new Uint8Array()),
  ]);
}

/**
 * Builds a deterministic raster vector map without canvas, DOM reads, network
 * access, or checked-in binary assets. R/G encode normalized X/Y displacement
 * for SVG feDisplacementMap. A real bitmap avoids Chromium's discontinuities
 * when a grid of SVG rectangles is scaled as a filter input.
 */
export function createDisplacementMapDataUri(input: {
  kind: DisplacementKind;
  center?: readonly [number, number];
  radius?: number;
  edgeStart?: number;
}): string {
  const center = input.center ?? [0.5, 0.5];
  const radius = input.radius ?? 1;
  const edgeStart = input.edgeStart ?? 0.68;
  const cacheKey = `${input.kind}:${center[0]}:${center[1]}:${radius}:${edgeStart}`;
  const cached = displacementMapCache.get(cacheKey);
  if (cached) return cached;

  const pixels = new Uint8Array(DISPLACEMENT_MAP_SIZE * DISPLACEMENT_MAP_SIZE * 4);
  for (let row = 0; row < DISPLACEMENT_MAP_SIZE; row += 1) {
    for (let column = 0; column < DISPLACEMENT_MAP_SIZE; column += 1) {
      const x = (column + 0.5) / DISPLACEMENT_MAP_SIZE;
      const y = (row + 0.5) / DISPLACEMENT_MAP_SIZE;
      const [dx, dy] = displacementVector({
        kind: input.kind,
        x,
        y,
        center,
        radius,
        edgeStart,
      });
      const red = Math.round(clamp(128 + dx * 127, 0, 255));
      const green = Math.round(clamp(128 + dy * 127, 0, 255));
      const offset = (row * DISPLACEMENT_MAP_SIZE + column) * 4;
      pixels[offset] = red;
      pixels[offset + 1] = green;
      pixels[offset + 2] = 128;
      pixels[offset + 3] = 255;
    }
  }

  const uri = `data:image/png;base64,${bytesToBase64(
    encodeRgbaPng(DISPLACEMENT_MAP_SIZE, DISPLACEMENT_MAP_SIZE, pixels),
  )}`;
  displacementMapCache.set(cacheKey, uri);
  return uri;
}

export function matrix3ToCssMatrix(
  matrix: Matrix3,
  viewportOffset: readonly [number, number] = [0, 0],
): string {
  return `matrix(${matrix[0]}, ${matrix[3]}, ${matrix[1]}, ${matrix[4]}, ${
    matrix[2] - viewportOffset[0]
  }, ${matrix[5] - viewportOffset[1]})`;
}

function sanitizeSvgId(value: string): string {
  return value.replace(/[^a-zA-Z0-9_-]/g, "-");
}

function maxCropCompensation(passes: readonly CameraProjectionPass[]): number {
  return passes.reduce((maximum, pass) => {
    if ("cropCompensation" in pass) {
      return Math.max(maximum, pass.cropCompensation);
    }
    return maximum;
  }, 1);
}

function projectiveTransform(passes: readonly CameraProjectionPass[]): string | undefined {
  const projective = passes.find(
    (pass): pass is Extract<CameraProjectionPass, { kind: "projective-warp" }> =>
      pass.kind === "projective-warp",
  );
  if (!projective) return undefined;
  return `perspective(${projective.perspectivePx}px) rotateX(${projective.tiltXDeg}deg) rotateY(${projective.tiltYDeg}deg)`;
}

function ProjectionFilterDefinition(props: {
  id: string;
  width: number;
  height: number;
  passes: readonly CameraProjectionPass[];
}): React.ReactElement | null {
  const primitives: React.ReactNode[] = [];
  let currentInput = "SourceGraphic";
  let passIndex = 0;

  for (const pass of props.passes) {
    if (pass.kind === "radial-warp" || pass.kind === "fisheye-warp") {
      const mapResult = `map-${passIndex}`;
      const outputResult = `pass-${passIndex}`;
      const map = createDisplacementMapDataUri({
        kind: pass.kind === "fisheye-warp" ? "fisheye" : "barrel",
        center: pass.center,
        radius: pass.radius,
      });
      primitives.push(
        <feImage
          key={`${mapResult}-image`}
          href={map}
          x={0}
          y={0}
          width={props.width}
          height={props.height}
          preserveAspectRatio="none"
          result={mapResult}
        />,
        <feDisplacementMap
          key={`${outputResult}-displacement`}
          in={currentInput}
          in2={mapResult}
          scale={pass.strength * Math.min(props.width, props.height) * 0.2}
          xChannelSelector="R"
          yChannelSelector="G"
          result={outputResult}
        />,
      );
      currentInput = outputResult;
      passIndex += 1;
      continue;
    }

    if (pass.kind === "anamorphic-edge-stretch") {
      const mapResult = `map-${passIndex}`;
      const outputResult = `pass-${passIndex}`;
      const map = createDisplacementMapDataUri({
        kind: pass.axis === "horizontal" ? "edge-horizontal" : "edge-vertical",
        edgeStart: pass.edgeStart,
      });
      primitives.push(
        <feImage
          key={`${mapResult}-image`}
          href={map}
          x={0}
          y={0}
          width={props.width}
          height={props.height}
          preserveAspectRatio="none"
          result={mapResult}
        />,
        <feDisplacementMap
          key={`${outputResult}-displacement`}
          in={currentInput}
          in2={mapResult}
          scale={pass.strength * Math.min(props.width, props.height) * 0.16}
          xChannelSelector="R"
          yChannelSelector="G"
          result={outputResult}
        />,
      );
      currentInput = outputResult;
      passIndex += 1;
      continue;
    }

    if (pass.kind === "directional-smear" && pass.spreadPx > 0) {
      const samples = clamp(Math.round(pass.samples), 2, 16);
      const directionLength = Math.max(1e-6, Math.hypot(pass.direction[0], pass.direction[1]));
      const directionX = pass.direction[0] / directionLength;
      const directionY = pass.direction[1] / directionLength;
      const majorDeviation = pass.spreadPx / Math.max(4, samples * 0.75);
      const minorDeviation = 0.2;
      const blurResult = `smear-blur-${passIndex}`;
      const offsetResult = `smear-offset-${passIndex}`;
      const fadeResult = `smear-fade-${passIndex}`;
      primitives.push(
        <feGaussianBlur
          key={blurResult}
          in={currentInput}
          stdDeviation={`${Math.max(minorDeviation, Math.abs(directionX) * majorDeviation)} ${Math.max(minorDeviation, Math.abs(directionY) * majorDeviation)}`}
          edgeMode="duplicate"
          result={blurResult}
        />,
        <feOffset
          key={offsetResult}
          in={blurResult}
          dx={directionX * pass.spreadPx * 0.18}
          dy={directionY * pass.spreadPx * 0.18}
          result={offsetResult}
        />,
        <feComponentTransfer key={fadeResult} in={offsetResult} result={fadeResult}>
          <feFuncA type="linear" slope={0.24 + pass.decay * 0.18} />
        </feComponentTransfer>,
      );
      const outputResult = `pass-${passIndex}`;
      primitives.push(
        <feMerge key={outputResult} result={outputResult}>
          <feMergeNode in={currentInput} />
          <feMergeNode in={fadeResult} />
        </feMerge>,
      );
      currentInput = outputResult;
      passIndex += 1;
    }
  }

  if (primitives.length === 0) return null;
  return (
    <filter
      id={props.id}
      x={-props.width * 0.25}
      y={-props.height * 0.25}
      width={props.width * 1.5}
      height={props.height * 1.5}
      filterUnits="userSpaceOnUse"
      primitiveUnits="userSpaceOnUse"
      colorInterpolationFilters="sRGB"
    >
      {primitives}
    </filter>
  );
}

export interface CameraProjectionSurfaceProps {
  id: string;
  output: EvaluatedCameraOutput;
  stageWidth: number;
  stageHeight: number;
  children: React.ReactNode;
  /** Paint affine/projective pixels but leave nonlinear optics to the raster pass. */
  backendMode?: "final" | "texture-plate";
}

/**
 * VNext output painter feasibility surface. It applies an already-evaluated
 * view matrix and projection-pass sequence; it does not select shots or resolve
 * cinematic subjects.
 */
export const CameraProjectionSurface: React.FC<CameraProjectionSurfaceProps> = ({
  id,
  output,
  stageWidth,
  stageHeight,
  children,
  backendMode = "final",
}) => {
  const viewport = output.pose.clipRect;
  const backend = selectCameraProjectionBackend({
    mode: output.trace.mode,
    passes: output.projectionPasses,
  });
  if (backend === "texture-compositor" && backendMode !== "texture-plate") {
    throw new CameraProjectionBackendError(output.outputId, output.frame);
  }
  const safeId = sanitizeSvgId(id);
  const filterId = `${safeId}-projection-filter`;
  const clipId = `${safeId}-output-clip`;
  const hasFilter =
    backendMode !== "texture-plate" &&
    output.projectionPasses.some((pass) => pass.kind !== "projective-warp");
  const cropCompensation = maxCropCompensation(output.projectionPasses);
  const projective =
    backendMode === "texture-plate" ? undefined : projectiveTransform(output.projectionPasses);

  return (
    <svg
      width={viewport.width}
      height={viewport.height}
      viewBox={`0 0 ${viewport.width} ${viewport.height}`}
      style={{
        position: "absolute",
        left: viewport.x,
        top: viewport.y,
        width: viewport.width,
        height: viewport.height,
        overflow: "visible",
        opacity: output.pose.opacity,
      }}
    >
      <defs>
        <clipPath id={clipId}>
          <rect
            x={0}
            y={0}
            width={viewport.width}
            height={viewport.height}
            rx={output.clipRadiusPx}
            ry={output.clipRadiusPx}
          />
        </clipPath>
        {backendMode !== "texture-plate" && (
          <ProjectionFilterDefinition
            id={filterId}
            width={viewport.width}
            height={viewport.height}
            passes={output.projectionPasses}
          />
        )}
      </defs>
      <g clipPath={`url(#${clipId})`}>
        <foreignObject
          x={0}
          y={0}
          width={viewport.width}
          height={viewport.height}
          filter={hasFilter ? `url(#${filterId})` : undefined}
        >
          <div
            style={{
              width: viewport.width,
              height: viewport.height,
              position: "relative",
              overflow: "hidden",
              transformOrigin: "center center",
              transform:
                [projective, cropCompensation === 1 ? undefined : `scale(${cropCompensation})`]
                  .filter((value): value is string => Boolean(value))
                  .join(" ") || undefined,
            }}
          >
            <div
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                width: stageWidth,
                height: stageHeight,
                transformOrigin: "0 0",
                transform: matrix3ToCssMatrix(output.viewMatrix, [viewport.x, viewport.y]),
              }}
            >
              {children}
            </div>
          </div>
        </foreignObject>
      </g>
    </svg>
  );
};
