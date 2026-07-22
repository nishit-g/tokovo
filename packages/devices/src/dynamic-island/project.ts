import type {
  DynamicIslandPresentation,
  DynamicIslandState,
  ScreenRecordingPresentation,
  ScreenRecordingState,
} from "@tokovo/core";
import type { DeviceProfile } from "../types.js";
import { getIOSChromeMetrics } from "../ios/chrome-metrics.js";
import { resolveDevicePlatformVisuals } from "../visual-system.js";
import { directionForLocale, localizeSystemDigits } from "../surfaces/localization.js";
import type {
  DynamicIslandGeometry,
  DynamicIslandProjection,
  ScreenRecordingCompletionBanner,
} from "./contract.js";

interface DynamicIslandCopy {
  screenRecording: string;
  savedTitle: string;
  savedBody: string;
  photos: string;
  now: string;
  activities: Record<"music" | "call" | "timer" | "location", string>;
}

const COPY: Record<"en" | "hi" | "ar" | "ja", DynamicIslandCopy> = {
  en: {
    screenRecording: "Screen Recording",
    savedTitle: "Screen Recording",
    savedBody: "Screen Recording video saved to Photos",
    photos: "PHOTOS",
    now: "now",
    activities: { music: "Now Playing", call: "Call", timer: "Timer", location: "Directions" },
  },
  hi: {
    screenRecording: "स्क्रीन रिकॉर्डिंग",
    savedTitle: "स्क्रीन रिकॉर्डिंग",
    savedBody: "स्क्रीन रिकॉर्डिंग वीडियो Photos में सेव हुआ",
    photos: "PHOTOS",
    now: "अभी",
    activities: { music: "अभी चल रहा है", call: "कॉल", timer: "टाइमर", location: "दिशा-निर्देश" },
  },
  ar: {
    screenRecording: "تسجيل الشاشة",
    savedTitle: "تسجيل الشاشة",
    savedBody: "تم حفظ فيديو تسجيل الشاشة في الصور",
    photos: "الصور",
    now: "الآن",
    activities: { music: "قيد التشغيل", call: "مكالمة", timer: "المؤقت", location: "الاتجاهات" },
  },
  ja: {
    screenRecording: "画面収録",
    savedTitle: "画面収録",
    savedBody: "画面収録ビデオを写真に保存しました",
    photos: "写真",
    now: "今",
    activities: { music: "再生中", call: "通話", timer: "タイマー", location: "経路案内" },
  },
};

function languageFor(locale: string): keyof typeof COPY {
  const language = locale.trim().toLowerCase().split(/[-_]/u)[0];
  return language === "hi" || language === "ar" || language === "ja" ? language : "en";
}

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

function easeOutQuint(value: number): number {
  const inverse = 1 - clamp01(value);
  return 1 - inverse ** 5;
}

function easeInOutCubic(value: number): number {
  const progress = clamp01(value);
  return progress < 0.5 ? 4 * progress ** 3 : 1 - (-2 * progress + 2) ** 3 / 2;
}

function lerp(from: number, to: number, progress: number): number {
  return from + (to - from) * progress;
}

function formatElapsed(frames: number, fps: number, locale: string): string {
  const totalSeconds = Math.max(0, Math.floor(frames / Math.max(1, fps)));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return localizeSystemDigits(
    `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`,
    locale,
  );
}

type GeometryKind =
  | "idle"
  | "countdown"
  | "recording-compact"
  | "recording-expanded"
  | ScreenRecordingPresentation
  | DynamicIslandPresentation;

function geometryFor(profile: DeviceProfile, kind: GeometryKind): DynamicIslandGeometry {
  const chrome = getIOSChromeMetrics(profile);
  const island = chrome.dynamicIsland;
  if (!island) {
    throw new Error(`Dynamic Island projection requires profile geometry: ${profile.id}`);
  }

  const collapsedLeft = island.centerX - island.collapsedWidth / 2;
  let left = collapsedLeft;
  let width = island.collapsedWidth;
  let height = island.collapsedHeight;
  let cornerRadius = island.cornerRadius;

  if (kind === "countdown") {
    width = island.countdownWidth;
    left = island.centerX - width / 2;
  } else if (kind === "recording-compact") {
    width = island.recordingCompactWidth;
    left = collapsedLeft - (width - island.collapsedWidth);
  } else if (kind === "recording-expanded") {
    width = island.recordingExpandedWidth;
    height = island.recordingExpandedHeight;
    left = island.centerX - width / 2;
    cornerRadius = island.recordingExpandedCornerRadius;
  } else if (kind === "compact") {
    width = island.compactWidth;
    left = island.centerX - width / 2;
  } else if (kind === "expanded") {
    width = island.expandedWidth;
    height = island.expandedHeight;
    left = island.centerX - width / 2;
    cornerRadius = island.expandedCornerRadius;
  } else if (kind === "minimal") {
    width = island.collapsedWidth + chrome.pointScale * 46;
    left = collapsedLeft;
  }

  return {
    top: island.topY,
    left,
    width,
    height,
    cornerRadius,
    hardwareCenterX: island.centerX - left,
    sensorPillWidth: island.sensorPillWidth,
    sensorPillHeight: island.sensorPillHeight,
    cameraLensSize: island.cameraLensSize,
  };
}

function interpolateGeometry(
  from: DynamicIslandGeometry,
  to: DynamicIslandGeometry,
  progress: number,
): DynamicIslandGeometry {
  return {
    top: lerp(from.top, to.top, progress),
    left: lerp(from.left, to.left, progress),
    width: lerp(from.width, to.width, progress),
    height: lerp(from.height, to.height, progress),
    cornerRadius: lerp(from.cornerRadius, to.cornerRadius, progress),
    hardwareCenterX: lerp(from.hardwareCenterX, to.hardwareCenterX, progress),
    sensorPillWidth: to.sensorPillWidth,
    sensorPillHeight: to.sensorPillHeight,
    cameraLensSize: to.cameraLensSize,
  };
}

function suppressesStatusBar(profile: DeviceProfile, geometry: DynamicIslandGeometry): boolean {
  const island = getIOSChromeMetrics(profile).dynamicIsland;
  return Boolean(island && geometry.width > island.compactWidth + 0.5);
}

function completionBanner(
  profile: DeviceProfile,
  recording: ScreenRecordingState,
  currentFrame: number,
  copy: DynamicIslandCopy,
): ScreenRecordingCompletionBanner | undefined {
  if (
    recording.completion !== "saved" ||
    recording.captureStoppedAtFrame === undefined ||
    recording.feedbackEndsAtFrame === undefined ||
    currentFrame >= recording.feedbackEndsAtFrame
  ) {
    return undefined;
  }
  const scale = profile.pointScale;
  const platformVisuals = resolveDevicePlatformVisuals(profile, "light");
  const enter = clamp01((currentFrame - recording.captureStoppedAtFrame) / 10);
  const exit = clamp01((recording.feedbackEndsAtFrame - currentFrame) / 10);
  const progress = easeOutQuint(Math.min(enter, exit));
  const width = profile.display.width - 24 * scale;
  return {
    progress,
    left: 12 * scale,
    top: Math.max(
      (platformVisuals.geometry.minimumContentInsets.top +
        platformVisuals.geometry.notification.islandClearance) *
        scale,
      49 * scale,
    ),
    width,
    height: 82 * scale,
    appLabel: copy.photos,
    timeLabel: copy.now,
    title: copy.savedTitle,
    body: copy.savedBody,
  };
}

function recordingProjection(input: {
  profile: DeviceProfile;
  recording: ScreenRecordingState;
  currentFrame: number;
  fps: number;
  locale: string;
  appearance: "light" | "dark";
  copy: DynamicIslandCopy;
}): DynamicIslandProjection {
  const { profile, recording, currentFrame, fps, locale, appearance, copy } = input;
  const platformVisuals = resolveDevicePlatformVisuals(profile, appearance, locale);
  const metrics = getIOSChromeMetrics(profile).dynamicIsland;
  if (!metrics) throw new Error(`Missing Dynamic Island metrics for ${profile.id}`);

  const isCountdown = recording.isCapturing && currentFrame < recording.captureStartedAtFrame;
  const isActive = recording.isCapturing && currentFrame >= recording.captureStartedAtFrame;
  const geometryKindForPresentation = (
    presentation: ScreenRecordingPresentation | "idle" | "countdown",
  ): GeometryKind =>
    presentation === "compact"
      ? "recording-compact"
      : presentation === "expanded"
        ? "recording-expanded"
        : presentation;
  const targetKind: GeometryKind = isCountdown
    ? "countdown"
    : isActive
      ? geometryKindForPresentation(recording.presentation)
      : "idle";
  let previousKind: GeometryKind = "idle";
  let changedAt = recording.presentationChangedAtFrame;

  if (isCountdown) {
    previousKind = "idle";
    changedAt = recording.requestedAtFrame;
  } else if (isActive) {
    if (
      currentFrame - recording.captureStartedAtFrame < metrics.morphFrames &&
      recording.presentationChangedAtFrame <= recording.captureStartedAtFrame
    ) {
      previousKind =
        recording.requestedAtFrame === recording.captureStartedAtFrame ? "idle" : "countdown";
      changedAt = recording.captureStartedAtFrame;
    } else {
      previousKind = geometryKindForPresentation(recording.previousPresentation ?? "compact");
    }
  } else {
    previousKind = geometryKindForPresentation(
      recording.previousPresentation ?? recording.presentation,
    );
    changedAt = recording.captureStoppedAtFrame ?? currentFrame;
  }

  const morphProgress = easeInOutCubic(
    (currentFrame - changedAt) / Math.max(1, metrics.morphFrames),
  );
  const target = geometryFor(profile, targetKind);
  const geometry = interpolateGeometry(geometryFor(profile, previousKind), target, morphProgress);
  const isHidden = isActive && recording.presentation === "hidden";
  const phase = isCountdown ? "countdown" : isActive && !isHidden ? "recording" : "idle";
  const countdown = isCountdown
    ? Math.max(1, Math.ceil((recording.captureStartedAtFrame - currentFrame) / Math.max(1, fps)))
    : undefined;
  const elapsed = isActive
    ? formatElapsed(currentFrame - recording.captureStartedAtFrame, fps, locale)
    : undefined;
  const title = copy.screenRecording;

  return {
    phase,
    presentation: isHidden ? "idle" : isCountdown ? "compact" : recording.presentation,
    geometry,
    pointScale: profile.pointScale,
    contentOpacity: clamp01((morphProgress - 0.18) / 0.82),
    direction: directionForLocale(locale),
    appearance,
    visuals: {
      fontFamily: platformVisuals.typography.primaryFamily,
      primaryText: platformVisuals.palette.primaryText,
      secondaryText: platformVisuals.palette.secondaryText,
      islandMaterial: platformVisuals.materials.island,
      notificationMaterial: platformVisuals.materials.notification,
    },
    recording:
      phase === "idle"
        ? undefined
        : {
            countdownValue:
              countdown === undefined ? undefined : localizeSystemDigits(String(countdown), locale),
            elapsedLabel: elapsed,
            title,
            microphoneEnabled: recording.microphoneEnabled,
          },
    completionBanner: completionBanner(profile, recording, currentFrame, copy),
    accessibilityLabel:
      phase === "recording" && elapsed
        ? `${title}, ${elapsed}`
        : phase === "countdown" && countdown
          ? `${title}, ${countdown}`
          : title,
    isMorphing: morphProgress < 1,
    suppressesStatusBar: suppressesStatusBar(profile, geometry),
  };
}

export function projectDynamicIsland(input: {
  profile: DeviceProfile;
  dynamicIsland?: DynamicIslandState;
  screenRecording?: ScreenRecordingState;
  currentFrame: number;
  fps: number;
  locale?: string;
  appearance?: "light" | "dark";
}): DynamicIslandProjection | null {
  if (!input.profile.dynamicIsland) return null;
  const locale = input.locale ?? "en-US";
  const appearance = input.appearance ?? "light";
  const copy = COPY[languageFor(locale)];
  const platformVisuals = resolveDevicePlatformVisuals(input.profile, appearance, locale);
  const recording = input.screenRecording;

  if (
    recording &&
    (recording.isCapturing ||
      (recording.feedbackEndsAtFrame !== undefined &&
        input.currentFrame < recording.feedbackEndsAtFrame))
  ) {
    return recordingProjection({
      profile: input.profile,
      recording,
      currentFrame: input.currentFrame,
      fps: input.fps,
      locale,
      appearance,
      copy,
    });
  }

  const islandState = input.dynamicIsland;
  const activity = islandState?.visible === false ? null : islandState?.activity;
  const presentation = activity ? (islandState?.presentation ?? "compact") : "idle";
  const metrics = getIOSChromeMetrics(input.profile).dynamicIsland;
  if (!metrics) return null;
  const changedAt = islandState?.updatedAtFrame ?? input.currentFrame - metrics.morphFrames;
  const progress = easeInOutCubic(
    (input.currentFrame - changedAt) / Math.max(1, metrics.morphFrames),
  );
  const geometry = interpolateGeometry(
    geometryFor(input.profile, "idle"),
    geometryFor(input.profile, presentation),
    progress,
  );

  const supportedActivity =
    activity === "music" || activity === "call" || activity === "timer" || activity === "location"
      ? activity
      : undefined;
  const title = supportedActivity
    ? (islandState?.content?.title ?? copy.activities[supportedActivity])
    : "Dynamic Island";

  return {
    phase: supportedActivity ? "activity" : "idle",
    presentation,
    geometry,
    pointScale: input.profile.pointScale,
    contentOpacity: clamp01((progress - 0.18) / 0.82),
    direction: directionForLocale(locale),
    appearance,
    visuals: {
      fontFamily: platformVisuals.typography.primaryFamily,
      primaryText: platformVisuals.palette.primaryText,
      secondaryText: platformVisuals.palette.secondaryText,
      islandMaterial: platformVisuals.materials.island,
      notificationMaterial: platformVisuals.materials.notification,
    },
    activity: supportedActivity
      ? {
          kind: supportedActivity,
          title,
          subtitle: islandState?.content?.subtitle,
          icon: islandState?.content?.icon,
          tint:
            islandState?.content?.tint ??
            (supportedActivity === "call"
              ? "#30D158"
              : supportedActivity === "timer"
                ? "#FF9F0A"
                : supportedActivity === "location"
                  ? "#0A84FF"
                  : "#FF375F"),
          elapsedLabel: islandState?.content?.elapsedLabel,
        }
      : undefined,
    accessibilityLabel: title,
    isMorphing: progress < 1,
    suppressesStatusBar: suppressesStatusBar(input.profile, geometry),
  };
}
