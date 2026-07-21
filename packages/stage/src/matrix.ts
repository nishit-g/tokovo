import type { CameraPointIR, CameraRectIR, StageMatrix2DIR } from "@tokovo/ir";

export const IDENTITY_STAGE_MATRIX: StageMatrix2DIR = {
  a: 1,
  b: 0,
  c: 0,
  d: 1,
  tx: 0,
  ty: 0,
};

export function multiplyStageMatrices(
  left: StageMatrix2DIR,
  right: StageMatrix2DIR,
): StageMatrix2DIR {
  return {
    a: left.a * right.a + left.c * right.b,
    b: left.b * right.a + left.d * right.b,
    c: left.a * right.c + left.c * right.d,
    d: left.b * right.c + left.d * right.d,
    tx: left.a * right.tx + left.c * right.ty + left.tx,
    ty: left.b * right.tx + left.d * right.ty + left.ty,
  };
}

export function applyStageMatrix(
  matrix: StageMatrix2DIR,
  point: CameraPointIR,
): CameraPointIR {
  return {
    x: matrix.a * point.x + matrix.c * point.y + matrix.tx,
    y: matrix.b * point.x + matrix.d * point.y + matrix.ty,
  };
}

export function transformStageRect(
  matrix: StageMatrix2DIR,
  rect: CameraRectIR,
): CameraRectIR {
  const points = [
    applyStageMatrix(matrix, { x: rect.x, y: rect.y }),
    applyStageMatrix(matrix, { x: rect.x + rect.width, y: rect.y }),
    applyStageMatrix(matrix, { x: rect.x, y: rect.y + rect.height }),
    applyStageMatrix(matrix, {
      x: rect.x + rect.width,
      y: rect.y + rect.height,
    }),
  ];
  const xs = points.map((point) => point.x);
  const ys = points.map((point) => point.y);
  const minimumX = Math.min(...xs);
  const minimumY = Math.min(...ys);
  const maximumX = Math.max(...xs);
  const maximumY = Math.max(...ys);
  return {
    x: minimumX,
    y: minimumY,
    width: maximumX - minimumX,
    height: maximumY - minimumY,
  };
}
