import type { CompilerPlugin, CompilerContext } from "./types.js";
import type { TrackEvent } from "@tokovo/ir";

export interface CharacterKeyboardProfile {
  charDelay?: number;
  enabled?: boolean;
}

export interface KeyboardPluginOptions {
  enabled?: boolean;
  defaultCharDelay?: number;
  onlyForSentMessages?: boolean;
  onlyForReceivedMessages?: boolean;
  characterProfiles?: Record<string, CharacterKeyboardProfile>;
  excludeShortMessages?: number;
  customTiming?: {
    showDelay?: number;
    typeDelay?: number;
    hideDelay?: number;
  };
}

const DEFAULT_OPTIONS: Required<
  Omit<KeyboardPluginOptions, "characterProfiles" | "customTiming">
> & {
  characterProfiles: Record<string, CharacterKeyboardProfile>;
  customTiming: { showDelay?: number; typeDelay?: number; hideDelay?: number };
} = {
  enabled: true,
  defaultCharDelay: 3,
  onlyForSentMessages: true,
  onlyForReceivedMessages: false,
  characterProfiles: {},
  excludeShortMessages: 0,
  customTiming: {},
};

export class KeyboardPlugin implements CompilerPlugin {
  name = "keyboard";
  version = "1.0.0";
  subscribesTo = ["MESSAGE_SENT", "MESSAGE_RECEIVED"];
  emits = [];

  private options: Required<
    Omit<KeyboardPluginOptions, "characterProfiles" | "customTiming">
  > & {
    characterProfiles: Record<string, CharacterKeyboardProfile>;
    customTiming: {
      showDelay?: number;
      typeDelay?: number;
      hideDelay?: number;
    };
  };

  constructor(options: KeyboardPluginOptions = {}) {
    this.options = {
      ...DEFAULT_OPTIONS,
      ...options,
      characterProfiles: {
        ...DEFAULT_OPTIONS.characterProfiles,
        ...options.characterProfiles,
      },
      customTiming: {
        ...DEFAULT_OPTIONS.customTiming,
        ...options.customTiming,
      },
    };
  }

  process(events: TrackEvent[], context: CompilerContext): TrackEvent[] {
    if (!this.options.enabled) {
      return [];
    }

    for (const event of events) {
      const e = event as any;

      if (e.kind !== "APP") continue;
      if (e.type !== "MESSAGE_SENT" && e.type !== "MESSAGE_RECEIVED") continue;

      if (this.options.onlyForSentMessages && e.type !== "MESSAGE_SENT")
        continue;
      if (this.options.onlyForReceivedMessages && e.type !== "MESSAGE_RECEIVED")
        continue;

      const messageText = e.payload?.text || "";

      if (
        this.options.excludeShortMessages > 0 &&
        messageText.length < this.options.excludeShortMessages
      ) {
        continue;
      }

      if (e.payload?.typed) {
        continue;
      }

      const actor =
        e.type === "MESSAGE_RECEIVED" ? e.payload?.from || "them" : "me";
      const profile = this.options.characterProfiles[actor];

      if (profile && profile.enabled === false) {
        continue;
      }

      const charDelay = profile?.charDelay ?? this.options.defaultCharDelay;

      e.payload = {
        ...e.payload,
        typed: true,
        charDelay,
      };
    }

    return [];
  }
}
