import type {
  NotificationActionTargetIR,
  NotificationIntentIR,
  NotificationInteractionIR,
} from "@tokovo/ir";
import {
  resolveNotificationDeviceContext,
  type NotificationDeviceDescriptor,
  type NotificationPrepareInput,
  type PreparedNotificationActionEffect,
  type PreparedNotificationDevice,
  type PreparedNotificationInteraction,
  type PreparedNotificationProgram,
  type PreparedNotificationRecord,
} from "../contract/index.js";

function fail(code: string, message: string): never {
  throw new Error(`${code}: ${message}`);
}

function requireNonEmpty(value: string, label: string): void {
  if (!value.trim()) fail("NOTIFICATION_CONTRACT_INVALID", `${label} must not be empty`);
}

function requireFrame(value: number, label: string): void {
  if (!Number.isInteger(value) || value < 0) {
    fail("NOTIFICATION_CONTRACT_INVALID", `${label} must be a non-negative integer`);
  }
}

function validateActionTarget(
  target: NotificationActionTargetIR,
  label: string,
): void {
  if (!target.navigation && !target.appEvent) {
    fail("NOTIFICATION_ACTION_TARGET_INVALID", `${label} has no effect`);
  }
  if (
    target.navigation &&
    !target.navigation.appId?.trim() &&
    !target.navigation.route?.trim()
  ) {
    fail(
      "NOTIFICATION_ACTION_TARGET_INVALID",
      `${label} navigation must identify an app or route`,
    );
  }
  if (target.appEvent) requireNonEmpty(target.appEvent.type, `${label} app event type`);
}

function defaultPreviewPolicy(
  privacy: NonNullable<NotificationIntentIR["privacy"]>,
): NonNullable<NotificationIntentIR["previewPolicy"]> {
  if (privacy === "public") return "always";
  if (privacy === "private") return "whenUnlocked";
  return "never";
}

function deliveryConditionMatches(
  condition: NonNullable<NotificationIntentIR["deliveryCondition"]>,
  state: ReturnType<typeof resolveNotificationDeviceContext>,
  appId: string,
): boolean {
  switch (condition) {
    case "always":
      return true;
    case "onlyWhenLocked":
      return state.isLocked;
    case "onlyWhenUnlocked":
      return !state.isLocked;
    case "onlyWhenAppClosed":
      return state.foregroundAppId !== appId;
  }
}

function interruptionDurationFrames(
  interruption: PreparedNotificationRecord["interruption"],
  fps: number,
): number {
  const seconds =
    interruption === "critical"
      ? 8
      : interruption === "timeSensitive"
        ? 6
        : 4;
  return Math.max(1, Math.round(seconds * fps));
}

function interactionDismissesRecord(
  interaction: PreparedNotificationInteraction,
  recordId: string,
): boolean {
  return (
    interaction.type === "clearAll" ||
    (interaction.notificationId === recordId &&
      ["tap", "chooseAction", "reply", "dismiss"].includes(
        interaction.type,
      ))
  );
}

function requireActionTarget(
  target: NotificationActionTargetIR | undefined,
  notificationId: string,
  interaction: NotificationInteractionIR,
): NotificationActionTargetIR {
  if (!target) {
    fail(
      "NOTIFICATION_ACTION_TARGET_MISSING",
      `${interaction.type} at frame ${interaction.atFrame} has no target for ${notificationId}`,
    );
  }
  return target;
}

function normalizeActionTarget(
  target: NotificationActionTargetIR,
  appId: string,
): NotificationActionTargetIR {
  const navigation = target.navigation
    ? { ...target.navigation, appId: target.navigation.appId ?? appId }
    : undefined;
  const appEvent = target.appEvent
    ? { ...target.appEvent, appId: target.appEvent.appId ?? appId }
    : undefined;
  if (navigation) return appEvent ? { navigation, appEvent } : { navigation };
  return { appEvent: appEvent as NonNullable<typeof appEvent> };
}

function resolveActionEffects(
  records: readonly PreparedNotificationRecord[],
  interactions: readonly PreparedNotificationInteraction[],
): PreparedNotificationActionEffect[] {
  const recordsById = new Map(records.map((record) => [record.id, record]));
  const effects: PreparedNotificationActionEffect[] = [];

  for (const interaction of interactions) {
    if (
      interaction.type !== "tap" &&
      interaction.type !== "chooseAction" &&
      interaction.type !== "markRead" &&
      interaction.type !== "reply"
    ) {
      continue;
    }
    const notificationId = interaction.notificationId as string;
    const record = recordsById.get(notificationId);
    if (!record) {
      fail(
        "NOTIFICATION_INTERACTION_TARGET_UNKNOWN",
        `${interaction.type} references unknown notification ${notificationId}`,
      );
    }
    let target: NotificationActionTargetIR | undefined;
    let actionId = interaction.actionId;
    if (interaction.type === "markRead") {
      target = { appEvent: interaction.readTarget! };
    } else if (interaction.type === "tap") {
      target = record.defaultAction;
      actionId ??= "default";
    } else if (interaction.type === "chooseAction") {
      const action = record.actions.find(
        (candidate) => candidate.id === interaction.actionId,
      );
      if (!action) {
        fail(
          "NOTIFICATION_ACTION_UNKNOWN",
          `${notificationId} has no action ${JSON.stringify(interaction.actionId)}`,
        );
      }
      target = action.target;
    } else {
      if (!record.reply) {
        fail(
          "NOTIFICATION_REPLY_UNSUPPORTED",
          `${notificationId} is not replyable`,
        );
      }
      target = record.reply.target;
      actionId = record.reply.actionId;
    }
    effects.push({
      at: interaction.atFrame,
      sequence: interaction.sequence,
      deviceId: interaction.deviceId,
      notificationId,
      interactionType: interaction.type,
      badgeCount: interaction.badgeCount,
      actionId,
      replyText: interaction.replyText,
      replyTextField:
        interaction.type === "reply" ? record.reply?.textPayloadKey : undefined,
      target: normalizeActionTarget(
        requireActionTarget(target, notificationId, interaction),
        record.appId,
      ),
    });
  }

  return effects;
}

function validateDevice(
  devices: ReadonlyMap<string, NotificationDeviceDescriptor>,
  deviceId: string,
): NotificationDeviceDescriptor {
  const device = devices.get(deviceId);
  if (!device) {
    fail(
      "NOTIFICATION_DEVICE_UNKNOWN",
      `notification targets unknown device ${JSON.stringify(deviceId)}`,
    );
  }
  return device;
}

export function prepareNotificationProgram(
  input: NotificationPrepareInput,
): PreparedNotificationProgram {
  if (!Number.isFinite(input.fps) || input.fps <= 0) {
    fail("NOTIFICATION_INVALID_FPS", "fps must be greater than zero");
  }
  if (!Number.isInteger(input.durationInFrames) || input.durationInFrames <= 0) {
    fail(
      "NOTIFICATION_INVALID_DURATION",
      "durationInFrames must be a positive integer",
    );
  }

  const deviceDescriptors = new Map<string, NotificationDeviceDescriptor>();
  for (const device of input.devices) {
    requireNonEmpty(device.id, "device id");
    requireNonEmpty(device.locale, `${device.id} locale`);
    const tokens = device.notificationTokens;
    if (tokens) {
      for (const key of ["card", "text", "secondaryText", "accent", "border"] as const) {
        if (tokens[key] !== undefined && (typeof tokens[key] !== "string" || !tokens[key]?.trim())) fail("NOTIFICATION_TOKENS_INVALID", `${key} must be nonempty`);
      }
      for (const [key, min, max] of [["radius", 0, 48], ["padding", 4, 32]] as const) {
        const value = tokens[key];
        if (value !== undefined && (!Number.isFinite(value) || value < min || value > max)) fail("NOTIFICATION_TOKENS_INVALID", `${key} must be between ${min} and ${max}`);
      }
    }
    if (deviceDescriptors.has(device.id)) {
      fail("NOTIFICATION_DEVICE_DUPLICATE", `duplicate device ${device.id}`);
    }
    deviceDescriptors.set(device.id, device);
  }

  const preparedDevices: Record<string, PreparedNotificationDevice> = {};
  for (const device of input.devices) {
    preparedDevices[device.id] = {
      ...device,
      operations: [...(input.deviceOperations ?? [])]
        .filter((operation) => operation.deviceId === device.id)
        .sort((left, right) => left.at - right.at || left.sequence - right.sequence),
    };
  }

  for (const operation of input.deviceOperations ?? []) {
    validateDevice(deviceDescriptors, operation.deviceId);
    requireFrame(operation.at, `${operation.type} frame`);
    requireFrame(operation.sequence, `${operation.type} sequence`);
    if (operation.at >= input.durationInFrames) {
      fail(
        "NOTIFICATION_DEVICE_OPERATION_OUT_OF_RANGE",
        `${operation.type} at ${operation.at} is outside the episode`,
      );
    }
  }

  const interactions: PreparedNotificationInteraction[] = input.interactions
    .map((interaction, index) => ({
      ...interaction,
      sequence: interaction.sequence ?? index,
    }))
    .sort(
      (left, right) =>
        left.atFrame - right.atFrame || left.sequence - right.sequence,
    );

  const ids = new Set<string>();
  const preliminaryRecords: PreparedNotificationRecord[] = input.intents
    .map((intent, index) => ({
      ...intent,
      sequence: intent.sequence ?? index,
    }))
    .sort(
      (left, right) =>
        left.deliverAtFrame - right.deliverAtFrame ||
        left.sequence - right.sequence ||
        left.id.localeCompare(right.id),
    )
    .map((intent) => {
      requireNonEmpty(intent.id, "notification id");
      requireNonEmpty(intent.deviceId, `${intent.id} device id`);
      requireNonEmpty(intent.appId, `${intent.id} app id`);
      requireFrame(intent.deliverAtFrame, `${intent.id} delivery frame`);
      requireFrame(intent.sequence, `${intent.id} sequence`);
      if (!intent.content.title.trim() && !intent.content.body.trim()) {
        fail(
          "NOTIFICATION_CONTENT_EMPTY",
          `${intent.id} must have a title or body`,
        );
      }
      if (ids.has(intent.id)) {
        fail("NOTIFICATION_ID_DUPLICATE", `duplicate notification id ${intent.id}`);
      }
      ids.add(intent.id);
      validateDevice(deviceDescriptors, intent.deviceId);
      if (intent.deliverAtFrame >= input.durationInFrames) {
        fail(
          "NOTIFICATION_DELIVERY_OUT_OF_RANGE",
          `${intent.id} delivers at ${intent.deliverAtFrame}, outside episode duration ${input.durationInFrames}`,
        );
      }
      if (
        intent.retentionUntilFrame !== undefined &&
        intent.retentionUntilFrame < intent.deliverAtFrame
      ) {
        fail(
          "NOTIFICATION_RETENTION_INVALID",
          `${intent.id} expires before it is delivered`,
        );
      }
      const adapter = input.adapters.get(intent.appId);
      if (!adapter) {
        fail(
          "NOTIFICATION_ADAPTER_MISSING",
          `no content adapter is registered for ${intent.appId}`,
        );
      }
      const presentation = adapter.format(intent);
      if (
        !presentation.appName.trim() ||
        !presentation.icon.trim() ||
        !presentation.accentColor.trim()
      ) {
        fail(
          "NOTIFICATION_ADAPTER_INVALID",
          `${intent.appId} returned incomplete presentation metadata`,
        );
      }
      const actionIds = new Set<string>();
      for (const action of intent.actions ?? []) {
        requireNonEmpty(action.id, `${intent.id} action id`);
        requireNonEmpty(action.label, `${intent.id}:${action.id} label`);
        validateActionTarget(action.target, `${intent.id}:${action.id}`);
        if (actionIds.has(action.id)) {
          fail(
            "NOTIFICATION_ACTION_DUPLICATE",
            `${intent.id} declares duplicate action ${action.id}`,
          );
        }
        actionIds.add(action.id);
      }
      const defaultAction =
        intent.defaultAction ?? adapter.defaultAction?.(intent);
      if (!defaultAction) {
        fail(
          "NOTIFICATION_DEFAULT_ACTION_MISSING",
          `${intent.appId} must resolve a default action for ${intent.id}`,
        );
      }
      validateActionTarget(defaultAction, `${intent.id} default action`);
      if (intent.reply) {
        requireNonEmpty(intent.reply.actionId, `${intent.id} reply action id`);
        validateActionTarget(intent.reply.target, `${intent.id} reply action`);
      }
      const privacy = intent.privacy ?? "public";
      const interruption = intent.interruption ?? "active";
      return {
        id: intent.id,
        deviceId: intent.deviceId,
        appId: intent.appId,
        appInstanceId:
          intent.appInstanceId ?? `${intent.deviceId}:${intent.appId}`,
        deliverAtFrame: intent.deliverAtFrame,
        sequence: intent.sequence,
        content: intent.content,
        presentation,
        category: intent.category ?? "message",
        threadId: intent.threadId,
        groupId: intent.groupId,
        interruption,
        privacy,
        previewPolicy:
          intent.previewPolicy ?? defaultPreviewPolicy(privacy),
        deliveryCondition: intent.deliveryCondition ?? "always",
        foregroundBehavior: intent.foregroundBehavior ?? "suppress",
        sound:
          intent.sound ?? (interruption === "passive" ? "silent" : "default"),
        actions: [...(intent.actions ?? [])],
        reply: intent.reply,
        defaultAction,
        metadata: { ...(intent.metadata ?? {}) },
        retentionUntilFrame: intent.retentionUntilFrame,
        delivery: {
          outcome: "delivered" as const,
          centerEligible: true,
          lockScreenEligible: true,
        },
      };
    });

  for (const interaction of interactions) {
    requireFrame(interaction.atFrame, `${interaction.type} frame`);
    requireFrame(interaction.sequence, `${interaction.type} sequence`);
    validateDevice(deviceDescriptors, interaction.deviceId);
    if (interaction.atFrame >= input.durationInFrames) {
      fail(
        "NOTIFICATION_INTERACTION_OUT_OF_RANGE",
        `${interaction.type} at ${interaction.atFrame} is outside the episode`,
      );
    }
    if (interaction.notificationId) {
      const record = preliminaryRecords.find(
        (candidate) => candidate.id === interaction.notificationId,
      );
      if (!record) {
        fail(
          "NOTIFICATION_INTERACTION_TARGET_UNKNOWN",
          `${interaction.type} references unknown notification ${interaction.notificationId}`,
        );
      }
      if (record.deviceId !== interaction.deviceId) {
        fail(
          "NOTIFICATION_INTERACTION_DEVICE_MISMATCH",
          `${interaction.notificationId} belongs to ${record.deviceId}, not ${interaction.deviceId}`,
        );
      }
      if (interaction.atFrame < record.deliverAtFrame) {
        fail(
          "NOTIFICATION_INTERACTION_BEFORE_DELIVERY",
          `${interaction.type} for ${record.id} occurs before delivery`,
        );
      }
      if (
        record.retentionUntilFrame !== undefined &&
        interaction.type !== "markRead" &&
        interaction.atFrame >= record.retentionUntilFrame
      ) {
        fail(
          "NOTIFICATION_INTERACTION_AFTER_EXPIRY",
          `${interaction.type} for ${record.id} occurs after expiry`,
        );
      }
    }
    const targetsOne = ["tap", "chooseAction", "reply", "dismiss", "markRead", "expand", "collapse", "beginReply", "expandGroup", "collapseGroup", "swipeLeft", "swipeRight"].includes(
      interaction.type,
    );
    if (targetsOne && !interaction.notificationId) {
      fail(
        "NOTIFICATION_INTERACTION_TARGET_MISSING",
        `${interaction.type} requires notificationId`,
      );
    }
    if (interaction.type === "chooseAction" && !interaction.actionId?.trim()) {
      fail("NOTIFICATION_ACTION_MISSING", "chooseAction requires actionId");
    }
    if (interaction.type === "setDisplay" && !["count", "stack", "list"].includes(interaction.display ?? "")) fail("NOTIFICATION_DISPLAY_INVALID", "setDisplay requires count, stack or list");
    if (interaction.type === "scrollHistory" && (!Number.isFinite(interaction.scrollPosition) || interaction.scrollPosition! < 0 || interaction.scrollPosition! > 1)) fail("NOTIFICATION_SCROLL_INVALID", "scrollHistory requires a finite position from 0 to 1");
    if (interaction.type === "reply" && interaction.replyText === undefined) {
      fail("NOTIFICATION_REPLY_TEXT_MISSING", "reply requires replyText");
    }
    if (interaction.type === "beginReply") {
      if (!interaction.inputSessionId?.trim()) fail("NOTIFICATION_INPUT_MISSING", "beginReply requires inputSessionId");
      if (!preliminaryRecords.find((record) => record.id === interaction.notificationId)?.reply) {
        fail("NOTIFICATION_REPLY_UNSUPPORTED", "beginReply requires a replyable notification");
      }
    }
    if (interaction.type === "markRead") {
      requireFrame(interaction.badgeCount as number, "markRead badgeCount");
      if (!interaction.readTarget) fail("NOTIFICATION_READ_TARGET_MISSING", "markRead requires an app-owned readTarget");
      validateActionTarget({ appEvent: interaction.readTarget }, "markRead");
      const source = preliminaryRecords.find((record) => record.id === interaction.notificationId);
      if (interaction.readTarget.appId !== undefined && interaction.readTarget.appId !== source?.appId) {
        fail("NOTIFICATION_READ_APP_MISMATCH", "Read acknowledgement must target the notification's app");
      }
    } else if (interaction.badgeCount !== undefined || interaction.readTarget !== undefined) {
      fail("NOTIFICATION_READ_FIELDS_INVALID", "Only markRead can author read state and badges");
    }
  }

  for (const device of Object.values(preparedDevices)) {
    device.operations = [...device.operations, ...interactions.filter((interaction) => interaction.deviceId === device.id && interaction.type === "authenticate")
      .map((interaction) => ({ deviceId: device.id, at: interaction.atFrame, sequence: interaction.sequence, type: "authenticate" as const }))];
  }
  const actionEffects: PreparedNotificationActionEffect[] = [];
  for (const effect of resolveActionEffects(preliminaryRecords, interactions)) {
    // Context indexes cache immutable arrays; preparation is still accumulating effects.
    const context = resolveNotificationDeviceContext(preparedDevices[effect.deviceId], effect.at, [...actionEffects]);
    if (!context.isLocked || effect.interactionType === "markRead") { actionEffects.push(effect); continue; }
    if (context.isAuthenticated) { actionEffects.push({ ...effect, authenticated: Boolean(effect.target.navigation) }); continue; }
    const authentication = interactions.find((interaction) => interaction.type === "authenticate" &&
      interaction.deviceId === effect.deviceId && (!interaction.notificationId || interaction.notificationId === effect.notificationId) && interaction.atFrame >= effect.at);
    if (!authentication) continue; // An unauthenticated tap remains pending, never navigates.
    const cancelled = interactions.some((interaction) => interaction.deviceId === effect.deviceId &&
      interaction.atFrame >= effect.at && interaction.atFrame <= authentication.atFrame &&
      (interaction.type === "clearAll" || (interaction.type === "dismiss" && interaction.notificationId === effect.notificationId)));
    if (!cancelled) actionEffects.push({ ...effect, requestedAtFrame: effect.at, at: authentication.atFrame, sequence: authentication.sequence, authenticated: Boolean(effect.target.navigation) });
  }
  const lastBannerEndByDevice = new Map<string, number>();
  const bannerGap = Math.max(1, Math.round(input.fps * 0.2));
  const contextFrames = new Map(Object.values(preparedDevices).map((device) => [device.id,
    [...new Set([
      ...device.operations.map((operation) => operation.at),
      ...actionEffects.filter((effect) => effect.deviceId === device.id && effect.target.navigation).map((effect) => effect.at),
    ])].sort((a, b) => a - b),
  ]));

  const records = preliminaryRecords.map((record) => {
    const device = preparedDevices[record.deviceId];
    const context = resolveNotificationDeviceContext(
      device,
      record.deliverAtFrame,
      actionEffects,
    );
    if (
      !deliveryConditionMatches(
        record.deliveryCondition,
        context,
        record.appId,
      )
    ) {
      return {
        ...record,
        delivery: {
          outcome: "suppressed" as const,
          suppressionReason: "deliveryCondition" as const,
          centerEligible: false,
          lockScreenEligible: false,
        },
      };
    }

    const focusSuppresses =
      context.dnd &&
      record.interruption !== "timeSensitive" &&
      record.interruption !== "critical";
    const foregroundSuppresses =
      !context.isLocked &&
      context.foregroundAppId === record.appId &&
      record.foregroundBehavior !== "present";
    const alertSuppressionReason = focusSuppresses
      ? ("focus" as const)
      : foregroundSuppresses
        ? ("foreground" as const)
        : undefined;
    const wantsBanner =
      !context.isLocked &&
      record.interruption !== "passive" &&
      !focusSuppresses &&
      !foregroundSuppresses;
    let bannerStartFrame: number | undefined;
    let bannerEndFrame: number | undefined;
    let bannerDismissedAtFrame: number | undefined;
    let bannerInterruptedAtFrame: number | undefined;

    if (wantsBanner) {
      const previousEnd = lastBannerEndByDevice.get(record.deviceId);
      const start = Math.max(
        record.deliverAtFrame,
        previousEnd === undefined ? 0 : previousEnd + bannerGap,
      );
      const authoredIntent = input.intents.find(
        (candidate) => candidate.id === record.id,
      );
      let end =
        start +
        (authoredIntent?.bannerDurationFrames ??
          interruptionDurationFrames(record.interruption, input.fps));
      end = Math.min(
        end,
        input.durationInFrames,
        record.retentionUntilFrame ?? input.durationInFrames,
      );
      const dismissal = interactions.find(
        (interaction) =>
          interaction.deviceId === record.deviceId &&
          interaction.atFrame >= record.deliverAtFrame &&
          interaction.atFrame <= end &&
          interactionDismissesRecord(interaction, record.id),
      );
      if (dismissal) {
        end = dismissal.atFrame;
        bannerDismissedAtFrame = dismissal.atFrame;
      }
      for (const at of [start, ...(contextFrames.get(record.deviceId) ?? [])]) {
        if (at < start || at >= end) continue;
        const current = resolveNotificationDeviceContext(device, at, actionEffects);
        if (current.isLocked ||
          (current.dnd && record.interruption !== "timeSensitive" && record.interruption !== "critical") ||
          (current.foregroundAppId === record.appId && record.foregroundBehavior !== "present")) {
          end = at;
          bannerInterruptedAtFrame = at;
          bannerDismissedAtFrame = undefined;
          break;
        }
      }
      if (end > start) {
        bannerStartFrame = start;
        bannerEndFrame = end;
        lastBannerEndByDevice.set(record.deviceId, end);
      }
    }

    const soundAllowed =
      record.sound !== "silent" &&
      record.interruption !== "passive" &&
      !focusSuppresses &&
      !foregroundSuppresses;

    return {
      ...record,
      delivery: {
        outcome: "delivered" as const,
        alertSuppressionReason,
        centerEligible: true,
        lockScreenEligible: true,
        bannerStartFrame,
        bannerEndFrame,
        bannerDismissedAtFrame,
        bannerInterruptedAtFrame,
        soundAtFrame: soundAllowed ? record.deliverAtFrame : undefined,
      },
    };
  });

  const recordsById = new Map(records.map((record) => [record.id, record]));
  for (const interaction of interactions) {
    if (!interaction.notificationId) continue;
    const record = recordsById.get(interaction.notificationId);
    if (record?.delivery.outcome === "suppressed") {
      fail(
        "NOTIFICATION_INTERACTION_TARGET_UNDELIVERED",
        `${interaction.type} cannot target suppressed notification ${record.id}`,
      );
    }
  }

  return {
    version: "1",
    fps: input.fps,
    durationInFrames: input.durationInFrames,
    records,
    interactions,
    devices: preparedDevices,
    actionEffects,
  };
}
