import React from "react";
import type { LockscreenProjection } from "../contract.js";
import { AndroidLockscreenSurface } from "./AndroidLockscreenSurface.js";
import { IOSLockscreenSurface } from "./IOSLockscreenSurface.js";

const LOCK_PAINTERS = {
  ios: IOSLockscreenSurface,
  android: AndroidLockscreenSurface,
} as const;

export const LockscreenSurface = React.memo(function LockscreenSurface({
  projection,
}: {
  projection: LockscreenProjection;
}) {
  const Painter = LOCK_PAINTERS[projection.theme.platform];
  return <Painter projection={projection} />;
});
