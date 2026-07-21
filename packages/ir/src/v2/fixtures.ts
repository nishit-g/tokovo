import type {
  AppInitialViewEntry,
  AppSnapshotEntry,
  DeviceConfig,
  TrackEpisodeIR,
  VoiceConfig,
} from "./episode-ir.js";
import type { InputSessionIR } from "./input-session.js";
import type {
  NotificationIntentIR,
  NotificationInteractionIR,
} from "./notification.js";
import type { TrackEvent } from "./track-event.js";

export interface CanonicalTrackEpisodeFixtureOptions {
  id?: string;
  fps?: number;
  durationInFrames?: number;
  devices?: DeviceConfig[];
  appSnapshots?: AppSnapshotEntry[];
  initialViews?: AppInitialViewEntry[];
  events?: TrackEvent[];
  inputSessions?: InputSessionIR[];
  notificationIntents?: NotificationIntentIR[];
  notificationInteractions?: NotificationInteractionIR[];
  voice?: VoiceConfig;
}

export function createCanonicalDeviceConfig(overrides: Partial<DeviceConfig> = {}): DeviceConfig {
  return {
    id: "phone",
    profile: "iphone16",
    app: "app_whatsapp",
    ...overrides,
  };
}

export function createCanonicalTrackEpisodeIR(
  overrides: CanonicalTrackEpisodeFixtureOptions = {},
): TrackEpisodeIR {
  return {
    id: overrides.id ?? "fixture-episode",
    fps: overrides.fps ?? 30,
    durationInFrames: overrides.durationInFrames ?? 300,
    title: "Fixture Episode",
    description: "Canonical fixture for contract tests",
    devices: overrides.devices ?? [createCanonicalDeviceConfig()],
    appSnapshots: overrides.appSnapshots ?? [],
    initialViews: overrides.initialViews ?? [],
    events: overrides.events ?? [
      {
        at: 0,
        deviceId: "phone",
        kind: "DEVICE",
        type: "UNLOCK",
        payload: {},
        _declarationOrder: 0,
      },
      {
        at: 2,
        deviceId: "phone",
        kind: "DEVICE",
        type: "OPEN_APP",
        payload: { appId: "app_whatsapp" },
        _declarationOrder: 1,
      },
    ],
    inputSessions: overrides.inputSessions,
    notificationIntents: overrides.notificationIntents,
    notificationInteractions: overrides.notificationInteractions,
    markers: [],
    sections: [],
    voice: overrides.voice,
  };
}
