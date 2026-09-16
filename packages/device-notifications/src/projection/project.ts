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
import { getNotificationLocalization, type NotificationLocalizedStrings } from "./localization.js";

const RTL_PATTERN = /[\u0590-\u08ff\ufb1d-\ufefc]/u;
const dateFormatters = new Map<string, { clock: Intl.DateTimeFormat; date: Intl.DateTimeFormat }>();

function formatters(locale: string) {
  const cached = dateFormatters.get(locale);
  if (cached) return cached;
  const value = {
    clock: new Intl.DateTimeFormat(locale, { timeZone: "UTC", hour: "numeric", minute: "2-digit" }),
    date: new Intl.DateTimeFormat(locale, { timeZone: "UTC", weekday: "short", month: "short", day: "numeric" }),
  };
  if (dateFormatters.size >= 64) dateFormatters.clear();
  dateFormatters.set(locale, value);
  return value;
}

const recordsByProgram = new WeakMap<
  PreparedNotificationProgram,
  ReadonlyMap<string, PreparedNotificationRecord>
>();
const groupStartsByProgram = new WeakMap<PreparedNotificationProgram, Map<string, number>>();
const interactionsByProgram = new WeakMap<PreparedNotificationProgram, Map<string, PreparedNotificationProgram["interactions"]>>();
function deviceInteractions(program: PreparedNotificationProgram, deviceId: string) {
  let devices = interactionsByProgram.get(program);
  if (!devices) { devices = new Map(); interactionsByProgram.set(program, devices); }
  let interactions = devices.get(deviceId);
  if (!interactions) {
    interactions = program.interactions.filter((item) => item.deviceId === deviceId)
      .sort((a, b) => a.atFrame - b.atFrame || a.sequence - b.sequence);
    devices.set(deviceId, interactions);
  }
  return interactions;
}
function groupStarts(program: PreparedNotificationProgram) {
  let starts = groupStartsByProgram.get(program);
  if (!starts) {
    starts = new Map();
    for (const record of program.records) {
      const key = `${record.deviceId}:${record.appId}:${record.groupId ?? record.threadId ?? record.id}`;
      starts.set(key, Math.min(starts.get(key) ?? Infinity, record.deliverAtFrame));
    }
    groupStartsByProgram.set(program, starts);
  }
  return starts;
}

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
  // Short authored lifetimes must still complete both halves of the motion.
  if (end !== undefined) {
    const halfLifetime = Math.max(0.5, (end - start) / 2);
    enterFrames = Math.min(enterFrames, halfLifetime);
    exitFrames = Math.min(exitFrames, halfLifetime);
  }
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

function mayRevealPreview(policy: NotificationPreviewPolicyIR, locked: boolean): boolean {
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
  const title = reveal ? record.presentation.title : record.presentation.appName;
  const body = reveal ? record.presentation.body : strings.newNotification;
  const subtitle = reveal ? record.presentation.subtitle : undefined;
  return {
    id: record.id,
    appId: record.appId,
    appName: record.presentation.appName,
    category: record.category,
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
  limit: number,
): (Omit<NotificationGroupProjection, "items"> & { records: PreparedNotificationRecord[] })[] {
  const groups = new Map<string, PreparedNotificationRecord[]>();
  for (const record of records) {
    const key = `${record.appId}:${record.groupId ?? record.threadId ?? record.id}`;
    const group = groups.get(key) ?? [];
    group.push(record);
    groups.set(key, group);
  }
  return [...groups.entries()]
    .map(([key, group]) => {
      // Runtime orderedIds is newest-first; partitioning preserves that order.
      const ordered = group;
      return {
        key,
        appId: ordered[0].appId,
        count: ordered.length,
        latestAtFrame: ordered[0].deliverAtFrame,
        records: ordered,
      };
    })
    .sort(
      (left, right) =>
        right.latestAtFrame - left.latestAtFrame || right.key.localeCompare(left.key),
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
    throw new Error(`NOTIFICATION_PROJECTION_INVALID: unknown device ${deviceId}`);
  }
  if (
    !Number.isFinite(config.viewportWidth) ||
    !Number.isFinite(config.viewportHeight) ||
    !Number.isFinite(config.pointScale) ||
    !Number.isFinite(config.clockMs) ||
    config.viewportWidth <= 0 ||
    config.viewportHeight <= 0 ||
    config.pointScale <= 0
  ) {
    throw new Error("NOTIFICATION_PROJECTION_INVALID: viewport and point scale must be positive.");
  }

  const runtime = evaluateNotificationProgram(program, deviceId, frame);
  const notificationUX = device.notificationUX ?? "cinematic";
  const theme = getNotificationTheme(
    device.platform,
    device.appearance,
    device.platformProfileId,
    device.locale,
    device.visualPreferences,
  );
  const deviceContext = resolveNotificationDeviceContext(device, frame, program.actionEffects);
  const tokens = device.notificationTokens;
  if (tokens) {
    if (tokens.card) {
      theme.colors.card = theme.colors.banner = theme.colors.cardSecondary = tokens.card;
      theme.materials.card = { ...theme.materials.card, fill: tokens.card };
      theme.materials.secondary = { ...theme.materials.secondary, fill: tokens.card };
    }
    if (tokens.text) theme.colors.text = tokens.text;
    if (tokens.secondaryText) theme.colors.secondaryText = tokens.secondaryText;
    if (tokens.accent) theme.colors.action = tokens.accent;
    if (tokens.border) {
      theme.colors.border = tokens.border;
      theme.materials.card = { ...theme.materials.card, stroke: { ...theme.materials.card.stroke, color: tokens.border, width: theme.materials.card.stroke?.width ?? 1 } };
    }
    if (tokens.radius !== undefined) theme.geometry.cardRadius = tokens.radius;
    if (tokens.padding !== undefined) theme.geometry.cardPadding = tokens.padding;
  }
  const localization = getNotificationLocalization(device.locale);
  const enterFrames = durationAtFps(theme.motion.cardEnterFramesAt30, program.fps);
  const exitFrames = durationAtFps(theme.motion.bannerExitFramesAt30, program.fps);
  const recordsById = getRecordsById(program);
  let expanded: NotificationDeviceProjection["expanded"];
  let collapsedAt: number | undefined;
  let expansionStartedAt = 0;
  let displayAs: NotificationDeviceProjection["displayAs"] = notificationUX === "native" && device.platform === "android" ? "list" : "stack";
  type PresentationTween = { from: number; to: number; at: number };
  const groupExpansion = new Map<string, PresentationTween>();
  const swipeProgress = new Map<string, PresentationTween>();
  let historyScroll: PresentationTween | undefined;
  const sample = (tween: PresentationTween | undefined, at: number) => !tween ? 0 : theme.motion.reduced
    ? tween.to : tween.from + (tween.to - tween.from) * easeOutCubic((at - tween.at) / enterFrames);
  const retarget = (tweens: Map<string, PresentationTween>, key: string, to: number, at: number) => {
    tweens.set(key, { from: sample(tweens.get(key), at), to, at });
  };
  const previewLocked = deviceContext.isLocked && !deviceContext.isAuthenticated;
  for (const interaction of deviceInteractions(program, deviceId)) {
    if (interaction.atFrame > frame) break;
    const record = interaction.notificationId ? recordsById.get(interaction.notificationId) : undefined;
    if (interaction.type === "setDisplay" && interaction.display) displayAs = interaction.display;
    if (interaction.type === "scrollHistory") historyScroll = { from: sample(historyScroll, interaction.atFrame), to: interaction.scrollPosition!, at: interaction.atFrame };
    if (record && (interaction.type === "expandGroup" || interaction.type === "collapseGroup")) {
      retarget(groupExpansion, `${record.appId}:${record.groupId ?? record.threadId ?? record.id}`, interaction.type === "expandGroup" ? 1 : 0, interaction.atFrame);
    }
    if (record && (interaction.type === "swipeLeft" || interaction.type === "swipeRight")) retarget(swipeProgress, record.id, interaction.type === "swipeLeft" ? 1 : 0, interaction.atFrame);
    const cinematicTap = notificationUX === "cinematic" && interaction.type === "tap" &&
      resolveNotificationDeviceContext(device, interaction.atFrame, program.actionEffects).isLocked;
    if (record && (interaction.type === "expand" || interaction.type === "beginReply" || cinematicTap)) {
      if (expanded?.item.id !== record.id) expansionStartedAt = interaction.atFrame;
      collapsedAt = undefined;
      expanded = {
        item: itemProjection(record, frame, previewLocked, program.fps, localization.strings, { phase: "visible", progress: 1 }),
        inputSessionId: interaction.type === "beginReply" && !previewLocked ? interaction.inputSessionId : undefined,
        progress: expanded?.item.id === record.id ? expanded.progress : theme.motion.reduced ? 1 : easeOutCubic((frame - interaction.atFrame) / enterFrames),
      };
    }
    if (interaction.type === "collapse" || interaction.type === "clearAll" ||
      (interaction.type === "dismiss" && interaction.notificationId === expanded?.item.id)) {
      if (notificationUX === "native" && expanded) {
        collapsedAt = interaction.atFrame;
        expanded.progress = theme.motion.reduced ? 1 : easeOutCubic((interaction.atFrame - expansionStartedAt) / enterFrames);
        expanded.inputSessionId = undefined;
      } else expanded = undefined;
    }
  }
  if (expanded && collapsedAt !== undefined) {
    expanded.progress *= theme.motion.reduced ? 0 : 1 - easeOutCubic((frame - collapsedAt) / exitFrames);
    if (expanded.progress <= 0) expanded = undefined;
  }
  if (expanded) {
    const record = recordsById.get(expanded.item.id)!;
    const terminal = runtime.records[record.id];
    const ended = terminal?.actedAtFrame ?? terminal?.dismissedAtFrame ??
      (terminal?.lifecycle === "expired" ? record.retentionUntilFrame : undefined);
    if (ended !== undefined) {
      if (theme.motion.reduced || frame >= ended + exitFrames) expanded = undefined;
      else { expanded.progress = 1 - easeOutCubic((frame - ended) / exitFrames); }
    }
  }
  const visibleRecords = runtime.orderedIds
    .map((id) => recordsById.get(id))
    .filter((record): record is PreparedNotificationRecord => {
      if (!record) return false;
      return runtime.records[record.id]?.lifecycle === "delivered";
    });
  const paintedRecords = theme.motion.reduced ? visibleRecords : runtime.orderedIds
    .map((id) => recordsById.get(id))
    .filter((record): record is PreparedNotificationRecord => {
      if (!record) return false;
      const state = runtime.records[record.id];
      const removed = state.actedAtFrame ?? state.dismissedAtFrame ?? (state.lifecycle === "expired" ? record.retentionUntilFrame : undefined);
      return state.lifecycle === "delivered" || (removed !== undefined && frame < removed + exitFrames);
    });
  const motionGroups = (records: readonly PreparedNotificationRecord[], limit: number) => {
    const groups = groupRecords(records, Number.MAX_SAFE_INTEGER);
    const states = new Map<string, { live: boolean; removed: number; born: number }>();
    for (const record of records) {
      const key = `${record.appId}:${record.groupId ?? record.threadId ?? record.id}`;
      const state = runtime.records[record.id];
      const previous = states.get(key);
      states.set(key, {
        live: Boolean(previous?.live || state.lifecycle === "delivered"),
        removed: Math.max(previous?.removed ?? 0, state.actedAtFrame ?? state.dismissedAtFrame ?? record.retentionUntilFrame ?? 0),
        born: Math.min(previous?.born ?? Infinity, record.deliverAtFrame),
      });
    }
    const starts = groupStarts(program);
    const firstDelivery = (key: string) => starts.get(`${deviceId}:${key}`) ?? frame;
    // Stable group order avoids jumping when another message updates an existing stack.
    if (notificationUX === "cinematic") groups.sort((a, b) => firstDelivery(b.key) - firstDelivery(a.key) || a.key.localeCompare(b.key));
    const projected = groups.slice(0, limit).map(({ records: members, ...group }) => {
      const state = states.get(group.key)!;
      return { ...group, items: members.map(cardItem), expansionProgress: displayAs === "list" ? 1 : sample(groupExpansion.get(group.key), frame), progress: theme.motion.reduced ? 1 : state.live
        ? easeOutCubic((frame - state.born) / enterFrames)
        : 1 - easeOutCubic((frame - state.removed) / exitFrames) };
    });
    if (notificationUX === "native" && !theme.motion.reduced) {
      const promoted = groups[0];
      if (promoted && frame < promoted.latestAtFrame + enterFrames) {
        const before = groupRecords(records.filter((record) => record.deliverAtFrame < promoted.latestAtFrame), limit);
        const previousIndex = before.findIndex((group) => group.key === promoted.key);
        if (previousIndex > 0 && projected[0]?.key === promoted.key) {
          const progress = easeOutCubic((frame - promoted.latestAtFrame) / enterFrames);
          const { records: outgoingRecords, ...outgoing } = before[previousIndex];
          projected[0] = { ...projected[0], progress: projected[0].progress * progress };
          // Retain the old slot during promotion so every neighbor reflows using
          // its actual CSS height, including wrapped text and attachments.
          projected.splice(Math.min(previousIndex + 1, projected.length), 0, {
            ...outgoing, items: outgoingRecords.map(cardItem), key: `${promoted.key}:outgoing:${promoted.latestAtFrame}`,
            expansionProgress: displayAs === "list" ? 1 : sample(groupExpansion.get(promoted.key), frame),
            progress: 1 - progress,
          });
        }
      }
    }
    return projected;
  };
  const cardItem = (record: PreparedNotificationRecord) => ({
    ...itemProjection(
      record,
      frame,
      previewLocked,
      program.fps,
      localization.strings,
      animation(frame, record.deliverAtFrame, undefined, enterFrames, 1),
    ), swipeProgress: sample(swipeProgress.get(record.id), frame),
  });

  const bannerRecord = visibleRecords.find(
    (record) =>
      record.delivery.bannerStartFrame !== undefined &&
      record.delivery.bannerEndFrame !== undefined &&
      frame >= record.delivery.bannerStartFrame &&
      frame < record.delivery.bannerEndFrame,
  ) ?? (!theme.motion.reduced ? runtime.orderedIds.map((id) => recordsById.get(id)).find((record) => {
    const dismissedAt = record?.delivery.bannerDismissedAtFrame;
    return record?.delivery.bannerStartFrame !== undefined && dismissedAt !== undefined &&
      dismissedAt > record.delivery.bannerStartFrame && frame >= dismissedAt && frame < dismissedAt + exitFrames;
  }) : undefined);
  const banner = bannerRecord
    ? itemProjection(
        bannerRecord,
        frame,
        previewLocked,
        program.fps,
        localization.strings,
        animation(
          frame,
          bannerRecord.delivery.bannerStartFrame as number,
          bannerRecord.delivery.bannerDismissedAtFrame === undefined && bannerRecord.delivery.bannerInterruptedAtFrame === undefined
            ? bannerRecord.delivery.bannerEndFrame : undefined,
          durationAtFps(theme.motion.bannerEnterFramesAt30, program.fps),
          durationAtFps(theme.motion.bannerExitFramesAt30, program.fps),
        ),
      )
    : undefined;
  if (banner && bannerRecord?.delivery.bannerDismissedAtFrame !== undefined && frame >= bannerRecord.delivery.bannerDismissedAtFrame) {
    // Lifecycle/actions change immediately; only the outgoing paint survives briefly.
    const at = bannerRecord.delivery.bannerDismissedAtFrame;
    const entered = easeOutCubic((at - (bannerRecord.delivery.bannerStartFrame ?? at)) /
      durationAtFps(theme.motion.bannerEnterFramesAt30, program.fps));
    banner.animation = { phase: "exiting", progress: entered * (1 - easeOutCubic((frame - at) / exitFrames)) };
  }
  if (theme.motion.reduced && banner) banner.animation = { phase: "visible", progress: 1 };

  const centerRecords = visibleRecords.filter((record) => record.delivery.centerEligible);
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
  const handoffIds = new Set(program.actionEffects.filter((effect) => effect.deviceId === deviceId && effect.authenticated &&
    frame >= effect.at && !theme.motion.reduced && frame < effect.at + exitFrames).map((effect) => effect.notificationId));
  const lockRecords = deviceContext.isLocked
    ? paintedRecords.filter((record) => record.delivery.lockScreenEligible)
    : paintedRecords.filter((record) => handoffIds.has(record.id));
  const scale = config.pointScale;
  const horizontalMargin = theme.geometry.centerHorizontalMargin * scale;
  const bannerMargin = theme.geometry.bannerHorizontalMargin * scale;
  const centerClosing = !theme.motion.reduced && runtime.centerClosedAtFrame !== undefined &&
    frame < runtime.centerClosedAtFrame + exitFrames;
  const centerProgress = centerClosing ? 1 - easeOutCubic((frame - (runtime.centerClosedAtFrame ?? frame)) / exitFrames)
    : runtime.centerOpen && theme.motion.reduced ? 1 : runtime.centerOpen
    ? easeOutCubic(
        (frame - (runtime.centerOpenedAtFrame ?? frame)) /
          durationAtFps(theme.motion.centerEnterFramesAt30, program.fps),
      )
    : 0;

  return {
    handoffProgress: notificationUX === "native" && !deviceContext.isLocked && !theme.motion.reduced
      ? program.actionEffects.filter((effect) => effect.deviceId === deviceId && effect.authenticated && effect.target.navigation && effect.at <= frame && frame < effect.at + exitFrames)
          .map((effect) => easeOutCubic((frame - effect.at) / exitFrames)).at(-1)
      : undefined,
    notificationUX,
    displayAs,
    countLabel: `${new Intl.NumberFormat(device.locale).format(visibleRecords.length)} ${localization.strings.centerTitle}`,
    deviceId,
    platform: device.platform,
    appearance: device.appearance,
    locale: device.locale,
    direction: localization.direction,
    clockLabel: formatters(device.locale).clock.format(config.clockMs),
    dateLabel: formatters(device.locale).date.format(config.clockMs),
    strings: {
      centerTitle: localization.strings.centerTitle,
      newNotification: localization.strings.newNotification,
      reply: localization.strings.reply,
      timeSensitive: localization.strings.timeSensitive,
      critical: localization.strings.critical,
      options: localization.strings.options,
      clear: localization.strings.clear,
    },
    theme,
    deviceContext,
    banner,
    expanded,
    lockScreenGroups: motionGroups(lockRecords, theme.geometry.maxLockScreenGroups),
    center: {
      scrollPosition: sample(historyScroll, frame),
      open: runtime.centerOpen || centerClosing,
      progress: centerProgress,
      // Native history must expose older groups, not merely scroll the latest
      // preview slice. Keep the compact/cinematic surfaces bounded as before.
      // ponytail: projection remains O(n); native Lock Screen painting windows
      // measured rows. Index projection only if profiling makes it necessary.
      groups: motionGroups(paintedRecords.filter((record) => record.delivery.centerEligible),
        notificationUX === "native" && (runtime.centerOpen || centerClosing)
          ? Number.MAX_SAFE_INTEGER : theme.geometry.maxCenterGroups),
    },
    statusBarIcons,
    cinematicSubjects: {
      banner: banner
        ? {
            x: bannerMargin,
            y: theme.geometry.bannerTop * scale,
            width: config.viewportWidth - bannerMargin * 2,
            height: Math.max(theme.geometry.bannerMinHeight,
              theme.geometry.cardPadding * 2 +
              theme.typography.appSize * 1.2 + 3 +
              theme.typography.titleSize * 1.24 + 3 +
              theme.typography.bodySize * 1.34 * 2 +
              (banner.interruption === "critical" || banner.interruption === "timeSensitive"
                ? theme.typography.timestampSize * 1.15 + 3 : 0),
            ) * scale,
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
      center: runtime.centerOpen || centerClosing
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
