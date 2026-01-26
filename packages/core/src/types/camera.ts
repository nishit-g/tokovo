import type { DeviceId, AppId } from "./device";
import type { ViewLayoutMode, PIPPosition } from "./layout";
export type { ViewLayoutMode, PIPPosition };

export interface CameraTransform {
  scale: number;
  translateX: number;
  translateY: number;
  originX: number;
  originY: number;
  rotation: number;
  shakeX: number;
  shakeY: number;
}

export const DEFAULT_TRANSFORM: CameraTransform = {
  scale: 1,
  translateX: 0,
  translateY: 0,
  originX: 0.5,
  originY: 0.5,
  rotation: 0,
  shakeX: 0,
  shakeY: 0,
};

export const DEFAULT_CAMERA_TRANSFORM = DEFAULT_TRANSFORM;

export type TransitionType =
  | "FADE"
  | "SLIDE_LEFT"
  | "SLIDE_RIGHT"
  | "SLIDE_UP"
  | "SLIDE_DOWN"
  | "ZOOM_IN"
  | "ZOOM_OUT"
  | "CROSS_DISSOLVE";

export type HighlightStyle =
  | "pulse"
  | "glow"
  | "shake"
  | "bounce"
  | "spotlight"
  | "scale";

export interface ViewLayout {
  mode: ViewLayoutMode;
  primaryDeviceId: string;
  secondaryDeviceId?: string;
  pipPosition?: PIPPosition;
  pipScale?: number;
}

export const DEFAULT_VIEW_LAYOUT: ViewLayout = {
  mode: "SINGLE",
  primaryDeviceId: "main_phone",
};

export interface BaseEffect {
  id: string;
  startFrame: number;
  endFrame: number;
}

export interface BaseCameraState {
  baseView: "APP_VIEW" | "TRANSITION";
  appId?: AppId;
  activeDeviceId: string;
  layout: ViewLayout;
  activeEffects: BaseEffect[];
  transform: CameraTransform;
  deviceTransforms: Record<DeviceId, CameraTransform>;
}

export const DEFAULT_BASE_CAMERA_STATE: BaseCameraState = {
  baseView: "APP_VIEW",
  activeDeviceId: "main_phone",
  layout: { ...DEFAULT_VIEW_LAYOUT },
  activeEffects: [],
  transform: { ...DEFAULT_TRANSFORM },
  deviceTransforms: {},
};
