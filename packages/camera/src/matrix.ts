import type { CameraPointIR } from "@tokovo/ir";
import type { CameraPose2D, Matrix3 } from "./types.js";

export const IDENTITY_MATRIX_3: Matrix3 = [1, 0, 0, 0, 1, 0, 0, 0, 1];

export function multiplyMatrix3(left: Matrix3, right: Matrix3): Matrix3 {
  const out = new Array<number>(9);
  for (let row = 0; row < 3; row += 1) {
    for (let column = 0; column < 3; column += 1) {
      out[row * 3 + column] =
        left[row * 3] * right[column] +
        left[row * 3 + 1] * right[column + 3] +
        left[row * 3 + 2] * right[column + 6];
    }
  }
  return [
    out[0],
    out[1],
    out[2],
    out[3],
    out[4],
    out[5],
    out[6],
    out[7],
    out[8],
  ];
}

export function translationMatrix3(x: number, y: number): Matrix3 {
  return [1, 0, x, 0, 1, y, 0, 0, 1];
}

export function scaleMatrix3(x: number, y = x): Matrix3 {
  return [x, 0, 0, 0, y, 0, 0, 0, 1];
}

export function rotationMatrix3(rotationDeg: number): Matrix3 {
  const radians = (rotationDeg * Math.PI) / 180;
  const cosine = Math.cos(radians);
  const sine = Math.sin(radians);
  return [cosine, -sine, 0, sine, cosine, 0, 0, 0, 1];
}

export function invertMatrix3(matrix: Matrix3): Matrix3 {
  const [a, b, c, d, e, f, g, h, i] = matrix;
  const determinant =
    a * (e * i - f * h) - b * (d * i - f * g) + c * (d * h - e * g);

  if (!Number.isFinite(determinant) || Math.abs(determinant) < 1e-12) {
    throw new Error("Cannot invert a singular camera matrix.");
  }

  const inverse = 1 / determinant;
  return [
    (e * i - f * h) * inverse,
    (c * h - b * i) * inverse,
    (b * f - c * e) * inverse,
    (f * g - d * i) * inverse,
    (a * i - c * g) * inverse,
    (c * d - a * f) * inverse,
    (d * h - e * g) * inverse,
    (b * g - a * h) * inverse,
    (a * e - b * d) * inverse,
  ];
}

export function applyMatrix3(
  matrix: Matrix3,
  point: CameraPointIR,
): CameraPointIR {
  const denominator = matrix[6] * point.x + matrix[7] * point.y + matrix[8];
  if (!Number.isFinite(denominator) || Math.abs(denominator) < 1e-12) {
    throw new Error("Camera matrix projected a point to infinity.");
  }
  return {
    x: (matrix[0] * point.x + matrix[1] * point.y + matrix[2]) / denominator,
    y: (matrix[3] * point.x + matrix[4] * point.y + matrix[5]) / denominator,
  };
}

export function cameraPoseToViewMatrix(pose: CameraPose2D): Matrix3 {
  const outputCenterX = pose.clipRect.x + pose.clipRect.width / 2;
  const outputCenterY = pose.clipRect.y + pose.clipRect.height / 2;
  return multiplyMatrix3(
    translationMatrix3(outputCenterX, outputCenterY),
    multiplyMatrix3(
      rotationMatrix3(pose.rotationDeg),
      multiplyMatrix3(
        scaleMatrix3(pose.scale),
        translationMatrix3(-pose.centerX, -pose.centerY),
      ),
    ),
  );
}
