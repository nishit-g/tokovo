import type { NotificationPreviewPolicyIR } from "@tokovo/ir";
import {
  resolveNotificationDeviceContext,
  type NotificationAnimationPhase,
  type NotificationDeviceProjection,
  type NotificationGroupProjection,
  type NotificationItemProjection,
  type NotificationProjectionConfig,
  type PreparedNotificationProgram,
  type PreparedNotificationRecord,
} from "../contract/index.js";
import { evaluateNotificationProgram } from "../runtime/index.js";
import { getNotificationTheme } from "../theme/index.js";
import {
  getNotificationLocalization,
  type NotificationLocalizedStrings,
} from "./localization.js";

const RTL_PATTERN = /[\u0590-\u08ff\ufb1d-\ufefc]/u;

const recordsByProgram = new WeakMap<
  PreparedNotificationProgram,
  ReadonlyMap<string, PreparedNotificationRecord>
>();

function getRecordsById(
  program: PreparedNotificationProgram,
): ReadonlyMap<string, PreparedNotificationRecord> {
  const existing = recordsByProgram.get(program);
  if (existing) return existing;
  const created = new Map(program.records.map((record) => [record.id, record]));
  recordsByProgram.set(program, created);
  return created;
}

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

function easeOutCubic(value: number): number {
  return 1 - Math.pow(1 - clamp01(value), 3);
}

function durationAtFps(framesAt30: number, fps: number): number {
  return Math.max(1, Math.round((framesAt30 / 30) * fps));
}

function animation(
  frame: number,
  start: number,
  end: number | undefined,
  enterFrames: number,
  exitFrames: number,
): { phase: NotificationAnimationPhase; progress: number } {
  if (frame < start + enterFrames) {
    return {
      phase: "entering",
      progress: easeOutCubic((frame - start) / enterFrames),
    };
  }
  if (end !== undefined && frame >= end - exitFrames) {
    return {
      phase: "exiting",
      progress: 1 - easeOutCubic((frame - (end - exitFrames)) / exitFrames),
    };
  }
  return { phase: "visible", progress: 1 };
}

function ageLabel(
  frame: number,
  deliveredAt: number,
  fps: number,
  strings: NotificationLocalizedStrings,
): string {
  const seconds = Math.max(0, Math.floor((frame - deliveredAt) / fps));
  if (seconds < 60) return strings.now;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return strings.minute(minutes);
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return strings.hour(hours);
  return strings.day(Math.floor(hours / 24));
}

function mayRevealPreview(
  policy: NotificationPreviewPolicyIR,
  locked: boolean,
): boolean {
  return policy === "always" || (policy === "whenUnlocked" && !locked);
}

function itemProjection(
  record: PreparedNotificationRecord,
  frame: number,
  locked: boolean,
  fps: number,
  strings: NotificationLocalizedStrings,
  animationValue: NotificationItemProjection["animation"],
): NotificationItemProjection {
  const reveal = mayRevealPreview(record.previewPolicy, locked);
  const title = reveal
    ? record.presentation.title
    : record.presentation.appName;
  const body = reveal ? record.presentation.body : strings.newNotification;
  const subtitle = reveal ? record.presentation.subtitle : undefined;
  return {
    id: record.id,
    appId: record.appId,
    appName: record.presentation.appName,
    icon: record.presentation.icon,
    accentColor: record.presentation.accentColor,
    leadingImage: reveal ? record.presentation.leadingImage : undefined,
    leadingImageAlt: reveal ? record.presentation.leadingImageAlt : undefined,
    title,
    body,
    subtitle,
    media: reveal ? record.content.media : undefined,
    direction: RTL_PATTERN.test(`${title} ${body}`) ? "rtl" : "ltr",
    deliveredAtFrame: record.deliverAtFrame,
    ageLabel: ageLabel(frame, record.deliverAtFrame, fps, strings),
    interruption: record.interruption,
    privacy: record.privacy,
    actions: reveal ? record.actions : [],
    reply: reveal ? record.reply : undefined,
    animation: animationValue,
  };
}

function groupRecords(
  records: readonly PreparedNotificationRecord[],
  createItem: (
    record: PreparedNotificationRecord,
  ) => NotificationItemProjection,
  limit: number,
): NotificationGroupProjection[] {
  const groups = new Map<string, PreparedNotificationRecord[]>();
  for (const record of records) {
    const key = `${record.appId}:${record.groupId ?? record.threadId ?? record.id}`;
    const group = groups.get(key) ?? [];
    group.push(record);
    groups.set(key, group);
  }
  return [...groups.entries()]
    .map(([key, group]) => {
      const ordered = [...group].sort(
        (left, right) =>
          right.deliverAtFrame - left.deliverAtFrame ||
          right.sequence - left.sequence ||
          right.id.localeCompare(left.id),
      );
      return {
        key,
        appId: ordered[0].appId,
        count: ordered.length,
        latestAtFrame: ordered[0].deliverAtFrame,
        items: ordered.slice(0, 3).map(createItem),
      };
    })
    .sort(
      (left, right) =>
        right.latestAtFrame - left.latestAtFrame ||
        right.key.localeCompare(left.key),
    )
    .slice(0, limit);
}

export function projectNotifications(
  program: PreparedNotificationProgram,
  deviceId: string,
  frame: number,
  config: NotificationProjectionConfig,
): NotificationDeviceProjection {
  const device = program.devices[deviceId];
  if (!device) {
    throw new Error(
      `NOTIFICATION_PROJECTION_INVALID: unknown device ${deviceId}`,
    );
  }
  if (
    !Number.isFinite(config.viewportWidth) ||
    !Number.isFinite(config.viewportHeight) ||
    !Number.isFinite(config.pointScale) ||
    config.viewportWidth <= 0 ||
    config.viewportHeight <= 0 ||
    config.pointScale <= 0
  ) {
    throw new Error(
      "NOTIFICATION_PROJECTION_INVALID: viewport and point scale must be positive.",
    );
  }

  const runtime = evaluateNotificationProgram(program, deviceId, frame);
  const theme = getNotificationTheme(
    device.platform,
    device.appearance,
    config.themeId,
  );
  const deviceContext = resolveNotificationDeviceContext(
    device,
    frame,
    program.actionEffects,
  );
  const localization = getNotificationLocalization(device.locale);
  const enterFrames = durationAtFps(
    theme.motion.cardEnterFramesAt30,
    program.fps,
  );
  const recordsById = getRecordsById(program);
  const visibleRecords = runtime.orderedIds
    .map((id) => recordsById.get(id))
    .filter((record): record is PreparedNotificationRecord => {
      if (!record) return false;
      return runtime.records[record.id]?.lifecycle === "delivered";
    });
  const cardItem = (record: PreparedNotificationRecord) =>
    itemProjection(
      record,
      frame,
      deviceContext.isLocked,
      program.fps,
      localization.strings,
      animation(frame, record.deliverAtFrame, undefined, enterFrames, 1),
    );

  const bannerRecord = visibleRecords.find(
    (record) =>
      record.delivery.bannerStartFrame !== undefined &&
      record.delivery.bannerEndFrame !== undefined &&
      frame >= record.delivery.bannerStartFrame &&
      frame < record.delivery.bannerEndFrame,
  );
  const banner = bannerRecord
    ? itemProjection(
        bannerRecord,
        frame,
        false,
        program.fps,
        localization.strings,
        animation(
          frame,
          bannerRecord.delivery.bannerStartFrame as number,
          bannerRecord.delivery.bannerEndFrame,
          durationAtFps(theme.motion.bannerEnterFramesAt30, program.fps),
          durationAtFps(theme.motion.bannerExitFramesAt30, program.fps),
        ),
      )
    : undefined;

  const centerRecords = visibleRecords.filter(
    (record) => record.delivery.centerEligible,
  );
  const statusBarIcons = [
    ...centerRecords
      .reduce((groups, record) => {
        const existing = groups.get(record.appId);
        if (existing) {
          existing.count += 1;
        } else {
          groups.set(record.appId, {
            appId: record.appId,
            icon: record.presentation.icon,
            count: 1,
          });
        }
        return groups;
      }, new Map<string, { appId: string; icon: string; count: number }>())
      .values(),
  ];
  const lockRecords = deviceContext.isLocked
    ? visibleRecords.filter((record) => record.delivery.lockScreenEligible)
    : [];
  const scale = config.pointScale;
  const horizontalMargin = theme.geometry.centerHorizontalMargin * scale;
  const bannerMargin = theme.geometry.bannerHorizontalMargin * scale;
  const centerProgress = runtime.centerOpen
    ? easeOutCubic(
        (frame - (runtime.centerOpenedAtFrame ?? frame)) /
          durationAtFps(theme.motion.centerEnterFramesAt30, program.fps),
      )
    : 0;

  return {
    deviceId,
    platform: device.platform,
    appearance: device.appearance,
    locale: device.locale,
    direction: localization.direction,
    strings: {
      centerTitle: localization.strings.centerTitle,
      newNotification: localization.strings.newNotification,
      reply: localization.strings.reply,
      timeSensitive: localization.strings.timeSensitive,
      critical: localization.strings.critical,
    },
    theme,
    deviceContext,
    banner,
    lockScreenGroups: groupRecords(
      lockRecords,
      cardItem,
      theme.geometry.maxLockScreenGroups,
    ),
    center: {
      open: runtime.centerOpen,
      progress: centerProgress,
      groups: groupRecords(
        centerRecords,
        cardItem,
        theme.geometry.maxCenterGroups,
      ),
    },
    statusBarIcons,
    anchors: {
      banner: banner
        ? {
            x: bannerMargin,
            y: (theme.geometry.bannerTop + config.safeAreaTop) * scale,
            width: config.viewportWidth - bannerMargin * 2,
            height: theme.geometry.bannerMinHeight * scale,
          }
        : undefined,
      lockScreen:
        lockRecords.length > 0
          ? {
              x: horizontalMargin,
              y: theme.geometry.lockScreenTop * scale,
              width: config.viewportWidth - horizontalMargin * 2,
              height: Math.max(
                theme.geometry.bannerMinHeight * scale,
                config.viewportHeight - theme.geometry.lockScreenTop * scale,
              ),
            }
          : undefined,
      center: runtime.centerOpen
        ? {
            x: 0,
            y: 0,
            width: config.viewportWidth,
            height: config.viewportHeight,
          }
        : undefined,
    },
  };
}
