import React from "react";
import type { HomeScreenProjection } from "../contract.js";
import { AndroidHomeScreenSurface } from "./AndroidHomeScreenSurface.js";
import { IOSHomeScreenSurface } from "./IOSHomeScreenSurface.js";

const HOME_PAINTERS = {
  ios: IOSHomeScreenSurface,
  android: AndroidHomeScreenSurface,
} as const;

export const HomeScreenSurface = React.memo(function HomeScreenSurface({
  projection,
}: {
  projection: HomeScreenProjection;
}) {
  const Painter = HOME_PAINTERS[projection.theme.platform];
  return <Painter projection={projection} />;
});
