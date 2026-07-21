import type {
  NotificationAudioCue,
  PreparedNotificationProgram,
} from "../contract/index.js";

/** Project immutable notification delivery decisions into declarative audio. */
export function projectNotificationAudio(
  program: PreparedNotificationProgram | undefined,
): NotificationAudioCue[] {
  if (!program) return [];
  return program.records.flatMap((record) => {
    if (record.delivery.soundAtFrame === undefined) return [];
    const authored = record.sound;
    return [
      {
        id: `notification:${record.id}`,
        at: record.delivery.soundAtFrame,
        deviceId: record.deviceId,
        soundId: typeof authored === "object" ? authored.soundId : undefined,
        volume:
          typeof authored === "object" ? Math.max(0, authored.volume ?? 1) : 1,
        critical: record.interruption === "critical",
      },
    ];
  });
}
