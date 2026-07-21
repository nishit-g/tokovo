import type {
  NotificationRecordRuntimeState,
  NotificationRuntimeState,
  PreparedNotificationInteraction,
  PreparedNotificationProgram,
  PreparedNotificationRecord,
} from "../contract/index.js";

function fail(message: string): never {
  throw new Error(`NOTIFICATION_EVALUATION_INVALID: ${message}`);
}

type TerminalInteraction = PreparedNotificationInteraction & {
  type: "tap" | "chooseAction" | "reply" | "dismiss" | "clearAll";
};

type CenterTransition = PreparedNotificationInteraction & {
  type: "openCenter" | "closeCenter" | "tap" | "chooseAction" | "reply";
};

interface NotificationDeviceRuntimeIndex {
  records: readonly PreparedNotificationRecord[];
  orderedRecords: readonly PreparedNotificationRecord[];
  terminalByRecord: ReadonlyMap<string, TerminalInteraction>;
  centerTransitions: readonly CenterTransition[];
}

interface NotificationRuntimeIndex {
  byDevice: ReadonlyMap<string, NotificationDeviceRuntimeIndex>;
}

const runtimeIndexes = new WeakMap<
  PreparedNotificationProgram,
  NotificationRuntimeIndex
>();

function isTerminalInteraction(
  interaction: PreparedNotificationInteraction,
): interaction is TerminalInteraction {
  return (
    interaction.type === "tap" ||
    interaction.type === "chooseAction" ||
    interaction.type === "reply" ||
    interaction.type === "dismiss" ||
    interaction.type === "clearAll"
  );
}

function isCenterTransition(
  interaction: PreparedNotificationInteraction,
): interaction is CenterTransition {
  return (
    interaction.type === "openCenter" ||
    interaction.type === "closeCenter" ||
    interaction.type === "tap" ||
    interaction.type === "chooseAction" ||
    interaction.type === "reply"
  );
}

function buildRuntimeIndex(
  program: PreparedNotificationProgram,
): NotificationRuntimeIndex {
  const byDevice = new Map<string, NotificationDeviceRuntimeIndex>();

  for (const deviceId of Object.keys(program.devices)) {
    const records = program.records.filter(
      (record) => record.deviceId === deviceId,
    );
    const interactions = program.interactions.filter(
      (interaction) => interaction.deviceId === deviceId,
    );
    const terminalInteractions = interactions.filter(isTerminalInteraction);
    const terminalByRecord = new Map<string, TerminalInteraction>();

    for (const record of records) {
      const terminal = terminalInteractions.find(
        (interaction) =>
          interaction.atFrame >= record.deliverAtFrame &&
          (record.retentionUntilFrame === undefined ||
            interaction.atFrame < record.retentionUntilFrame) &&
          (interaction.type === "clearAll" ||
            interaction.notificationId === record.id),
      );
      if (terminal) terminalByRecord.set(record.id, terminal);
    }

    byDevice.set(deviceId, {
      records,
      orderedRecords: [...records].sort(
        (left, right) =>
          right.deliverAtFrame - left.deliverAtFrame ||
          right.sequence - left.sequence ||
          right.id.localeCompare(left.id),
      ),
      terminalByRecord,
      centerTransitions: interactions.filter(isCenterTransition),
    });
  }

  return { byDevice };
}

function getRuntimeIndex(
  program: PreparedNotificationProgram,
): NotificationRuntimeIndex {
  const existing = runtimeIndexes.get(program);
  if (existing) return existing;
  const created = buildRuntimeIndex(program);
  runtimeIndexes.set(program, created);
  return created;
}

function lastTransitionAtFrame(
  transitions: readonly CenterTransition[],
  frame: number,
): CenterTransition | undefined {
  let low = 0;
  let high = transitions.length;
  while (low < high) {
    const middle = low + Math.floor((high - low) / 2);
    if (transitions[middle].atFrame <= frame) low = middle + 1;
    else high = middle;
  }
  return low > 0 ? transitions[low - 1] : undefined;
}

/**
 * Random-access notification evaluator. Its result depends only on the prepared
 * program, device id and frame; render order and prior frames are irrelevant.
 * A derived immutable index removes per-frame filtering, nested interaction
 * scans and resorting without introducing mutable playback state.
 */
export function evaluateNotificationProgram(
  program: PreparedNotificationProgram,
  deviceId: string,
  frame: number,
): NotificationRuntimeState {
  if (!program.devices[deviceId]) fail(`unknown device ${deviceId}`);
  if (!Number.isFinite(frame)) fail("frame must be finite");

  const deviceIndex = getRuntimeIndex(program).byDevice.get(deviceId);
  if (!deviceIndex) fail(`missing runtime index for device ${deviceId}`);
  const records: Record<string, NotificationRecordRuntimeState> = {};

  for (const record of deviceIndex.records) {
    const state: NotificationRecordRuntimeState = {
      id: record.id,
      lifecycle: "scheduled",
    };
    if (frame < record.deliverAtFrame) {
      records[record.id] = state;
      continue;
    }
    if (record.delivery.outcome === "suppressed") {
      state.lifecycle = "suppressed";
      records[record.id] = state;
      continue;
    }

    state.lifecycle = "delivered";
    state.deliveredAtFrame = record.deliverAtFrame;
    const terminal = deviceIndex.terminalByRecord.get(record.id);
    if (terminal && terminal.atFrame <= frame) {
      if (
        terminal.type === "tap" ||
        terminal.type === "chooseAction" ||
        terminal.type === "reply"
      ) {
        state.lifecycle = "acted";
        state.actedAtFrame = terminal.atFrame;
        state.actionId =
          terminal.type === "tap"
            ? "default"
            : terminal.type === "reply"
              ? record.reply?.actionId
              : terminal.actionId;
        state.replyText = terminal.replyText;
      } else {
        state.lifecycle = "dismissed";
        state.dismissedAtFrame = terminal.atFrame;
      }
    } else if (
      record.retentionUntilFrame !== undefined &&
      frame >= record.retentionUntilFrame
    ) {
      state.lifecycle = "expired";
    }
    records[record.id] = state;
  }

  const centerTransition = lastTransitionAtFrame(
    deviceIndex.centerTransitions,
    frame,
  );
  const centerOpen = centerTransition?.type === "openCenter";

  return {
    records,
    orderedIds: deviceIndex.orderedRecords
      .filter((record) => record.deliverAtFrame <= frame)
      .map((record) => record.id),
    centerOpen,
    centerOpenedAtFrame: centerOpen ? centerTransition.atFrame : undefined,
  };
}
