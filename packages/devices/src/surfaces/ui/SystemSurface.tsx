import React from "react";
import type { SystemSurfaceProjection } from "../contract.js";
import { HomeScreenSurface } from "./HomeScreenSurface.js";
import { LockscreenSurface } from "./LockscreenSurface.js";

export const SystemSurface: React.FC<{ projection: SystemSurfaceProjection }> = ({ projection }) => (
  projection.kind === "lockscreen"
    ? <LockscreenSurface projection={projection} />
    : <HomeScreenSurface projection={projection} />
);

