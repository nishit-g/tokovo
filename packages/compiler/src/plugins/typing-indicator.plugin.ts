import type { CompilerPlugin, CompilerContext } from "./types";
import type { TrackEvent } from "@tokovo/ir";

export interface CharacterTypingProfile {
  charsPerSecond?: number;
  pauseFrequency?: number;
  burstTyping?: boolean;
  realisticPauses?: boolean;
}

export interface TypingIndicatorPluginOptions {
  mode?: "auto" | "fixed";
  fixedDuration?: number;
  minDuration?: number;
  maxDuration?: number;
  charsPerSecond?: number;
  delayBefore?: number;
  onlyFor?: "them" | "me";
  skipIfShorterThan?: number;
  characterProfiles?: Record<string, CharacterTypingProfile>;
  enableRealisticPauses?: boolean;
  enableBurstTyping?: boolean;
  pauseAfterChars?: number;
  pauseDuration?: number;
}

const DEFAULT_OPTIONS: Required<
  Omit<TypingIndicatorPluginOptions, "characterProfiles">
> & { characterProfiles: Record<string, CharacterTypingProfile> } = {
  mode: "auto",
  fixedDuration: 2,
  minDuration: 0.5,
  maxDuration: 5,
  charsPerSecond: 10,
  delayBefore: 0.5,
  onlyFor: undefined as any,
  skipIfShorterThan: 0,
  characterProfiles: {},
  enableRealisticPauses: false,
  enableBurstTyping: false,
  pauseAfterChars: 50,
  pauseDuration: 1.5,
};

export class TypingIndicatorPlugin implements CompilerPlugin {
  name = "typing-indicator";
  version = "1.0.0";
  subscribesTo = ["MESSAGE_RECEIVED", "MESSAGE_SENT"];
  emits = ["TYPING_START", "TYPING_END"];

  private options: Required<
    Omit<TypingIndicatorPluginOptions, "characterProfiles">
  > & { characterProfiles: Record<string, CharacterTypingProfile> };

  constructor(options: TypingIndicatorPluginOptions = {}) {
    this.options = {
      ...DEFAULT_OPTIONS,
      ...options,
      characterProfiles: {
        ...DEFAULT_OPTIONS.characterProfiles,
        ...options.characterProfiles,
      },
    };
  }

  process(events: TrackEvent[], context: CompilerContext): TrackEvent[] {
    const typingEvents: TrackEvent[] = [];
    const messageEvents = this.extractMessageEvents(events);
    const sortedMessages = messageEvents.sort((a, b) => a.at - b.at);

    for (let i = 0; i < sortedMessages.length; i++) {
      const event = sortedMessages[i];
      const nextEvent = sortedMessages[i + 1];

      const typing = this.generateTypingIndicator(
        event,
        nextEvent,
        context.fps,
      );

      if (typing) {
        typingEvents.push(...typing);
      }
    }

    return typingEvents;
  }

  private extractMessageEvents(events: TrackEvent[]): Array<{
    at: number;
    type: "MESSAGE_RECEIVED" | "MESSAGE_SENT";
    payload: { conversationId: string; text: string; from?: string };
    deviceId?: string;
    appId?: string;
  }> {
    const filtered: Array<{
      at: number;
      type: "MESSAGE_RECEIVED" | "MESSAGE_SENT";
      payload: { conversationId: string; text: string; from?: string };
      deviceId?: string;
      appId?: string;
    }> = [];

    for (const e of events) {
      const event = e as any;
      if (event.kind !== "APP") continue;
      if (event.type !== "MESSAGE_RECEIVED" && event.type !== "MESSAGE_SENT")
        continue;

      if (this.options.onlyFor === "them" && event.type !== "MESSAGE_RECEIVED")
        continue;
      if (this.options.onlyFor === "me" && event.type !== "MESSAGE_SENT")
        continue;

      filtered.push({
        at: event.at,
        type: event.type,
        payload: event.payload,
        deviceId: event.deviceId,
        appId: event.appId,
      });
    }

    return filtered;
  }

  private generateTypingIndicator(
    event: {
      at: number;
      type: "MESSAGE_RECEIVED" | "MESSAGE_SENT";
      payload: { conversationId: string; text: string; from?: string };
      deviceId?: string;
      appId?: string;
    },
    nextEvent: { at: number } | undefined,
    fps: number,
  ): TrackEvent[] | null {
    const { payload } = event;
    const messageText = payload.text || "";
    const actor =
      event.type === "MESSAGE_RECEIVED" ? payload.from || "them" : "me";

    const profile = this.options.characterProfiles[actor];
    const charsPerSecond =
      profile?.charsPerSecond ?? this.options.charsPerSecond;
    const enablePauses =
      profile?.realisticPauses ?? this.options.enableRealisticPauses;
    const enableBurst = profile?.burstTyping ?? this.options.enableBurstTyping;

    const durationSeconds = this.calculateTypingDuration(
      messageText,
      charsPerSecond,
      enablePauses,
    );

    if (durationSeconds < this.options.skipIfShorterThan) {
      return null;
    }

    const delayFrames = Math.round(this.options.delayBefore * fps);
    const typingDurationFrames = Math.round(durationSeconds * fps);

    const typingStartFrame = Math.max(
      0,
      event.at - delayFrames - typingDurationFrames,
    );
    const typingEndFrame = Math.max(0, event.at - delayFrames);

    if (nextEvent && typingEndFrame > nextEvent.at) {
      return null;
    }

    const baseEvent = {
      deviceId: event.deviceId,
      kind: "APP" as const,
      appId: event.appId || "app_whatsapp",
      conversationId: payload.conversationId,
    };

    const typingEvents: TrackEvent[] = [
      {
        ...baseEvent,
        at: typingStartFrame,
        duration: typingDurationFrames,
        type: "TYPING_START" as const,
        payload: {
          conversationId: payload.conversationId,
          actor,
        },
        _declarationOrder: 0,
      } as any,
      {
        ...baseEvent,
        at: typingEndFrame,
        type: "TYPING_END" as const,
        payload: {
          conversationId: payload.conversationId,
          actor,
        },
        _declarationOrder: 0,
      } as any,
    ];

    if (enableBurst && messageText.length > 30) {
      const midPoint = typingStartFrame + Math.floor(typingDurationFrames / 2);
      const pauseDuration = Math.round(0.5 * fps);

      typingEvents.push(
        {
          ...baseEvent,
          at: midPoint,
          type: "TYPING_END" as const,
          payload: { conversationId: payload.conversationId, actor },
          _declarationOrder: 0,
        } as any,
        {
          ...baseEvent,
          at: midPoint + pauseDuration,
          duration: typingEndFrame - (midPoint + pauseDuration),
          type: "TYPING_START" as const,
          payload: { conversationId: payload.conversationId, actor },
          _declarationOrder: 0,
        } as any,
      );
    }

    return typingEvents;
  }

  private calculateTypingDuration(
    text: string,
    charsPerSecond: number,
    enablePauses: boolean,
  ): number {
    if (this.options.mode === "fixed") {
      return this.options.fixedDuration;
    }

    const charCount = text.length;
    let baseDuration = charCount / charsPerSecond;

    if (enablePauses && charCount > this.options.pauseAfterChars) {
      const pauseCount = Math.floor(charCount / this.options.pauseAfterChars);
      baseDuration += pauseCount * this.options.pauseDuration;
    }

    return Math.max(
      this.options.minDuration,
      Math.min(this.options.maxDuration, baseDuration),
    );
  }
}
