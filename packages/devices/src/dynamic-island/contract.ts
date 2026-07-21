import type {
  DynamicIslandActivity,
  DynamicIslandPresentation,
  ScreenRecordingPresentation,
} from "@tokovo/core";

export type DynamicIslandVisualPhase =
  | "idle"
  | "countdown"
  | "recording"
  | "activity";

export interface DynamicIslandGeometry {
  top: number;
  left: number;
  width: number;
  height: number;
  cornerRadius: number;
  hardwareCenterX: number;
  sensorPillWidth: number;
  sensorPillHeight: number;
  cameraLensSize: number;
}

export interface ScreenRecordingIslandContent {
  countdownValue?: string;
  elapsedLabel?: string;
  title: string;
  microphoneEnabled: boolean;
}

export interface DynamicIslandActivityContent {
  kind: Exclude<DynamicIslandActivity, "recording" | null>;
  title: string;
  subtitle?: string;
  icon?: string;
  tint: string;
  elapsedLabel?: string;
}

export interface ScreenRecordingCompletionBanner {
  progress: number;
  left: number;
  top: number;
  width: number;
  height: number;
  appLabel: string;
  timeLabel: string;
  title: string;
  body: string;
}

export interface DynamicIslandProjection {
  phase: DynamicIslandVisualPhase;
  presentation: DynamicIslandPresentation | ScreenRecordingPresentation;
  geometry: DynamicIslandGeometry;
  pointScale: number;
  contentOpacity: number;
  direction: "ltr" | "rtl";
  appearance: "light" | "dark";
  recording?: ScreenRecordingIslandContent;
  activity?: DynamicIslandActivityContent;
  completionBanner?: ScreenRecordingCompletionBanner;
  accessibilityLabel: string;
  isMorphing: boolean;
  /** True only while the current geometry would collide with status-bar chrome. */
  suppressesStatusBar: boolean;
}
