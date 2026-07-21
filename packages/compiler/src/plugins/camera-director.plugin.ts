import { CameraDirector } from "@tokovo/device-camera";
import { createScopedLogger } from "@tokovo/core";
import type {
  CameraEvent,
  CameraDirectorOptions,
  BehaviorConfig,
  CameraEffect,
} from "@tokovo/device-camera";
import type { CompilerPlugin, CompilerContext } from "./types.js";
import type { EasingType, TrackEvent } from "@tokovo/ir";

const log = createScopedLogger("compiler");

export interface CameraDirectorPluginOptions extends CameraDirectorOptions {
  behaviorConfig?: BehaviorConfig;
  style?: string;
}

const STYLE_BEHAVIORS: Record<string, BehaviorConfig> = {
  ViralDramaV1: {
    MESSAGE_RECEIVED: "fluid-tennis-dramatic",
    MESSAGE_SENT: "fluid-tennis-energetic",
    INTERRUPTION: "interrupt-focus",
    TYPING_START: "drift-anticipation",
  },
  Cinematic: {
    MESSAGE_RECEIVED: "fluid-tennis-energetic",
    MESSAGE_SENT: "fluid-tennis-casual",
    INTERRUPTION: "interrupt-focus",
    TYPING_START: "drift-anticipation",
  },
  Documentary: {
    MESSAGE_RECEIVED: "fluid-tennis-casual",
    MESSAGE_SENT: "fluid-tennis-casual",
    INTERRUPTION: "interrupt-focus",
    TYPING_START: "static",
  },
};

const RECEIVED_EVENT_TYPES = new Set([
  "MESSAGE_RECEIVED",
  "IMESSAGE_MESSAGE_RECEIVE",
  "SNAPCHAT_MESSAGE_RECEIVE",
  "TEAMS_MESSAGE_RECEIVE",
  "POST_COMMENT",
]);

const SENT_EVENT_TYPES = new Set([
  "MESSAGE_SENT",
  "IMESSAGE_MESSAGE_SEND",
  "SNAPCHAT_MESSAGE_SEND",
  "TEAMS_MESSAGE_SEND",
  "DM_SEND",
  "DM_MESSAGE_ADD",
  "TWEET_CREATE",
  "TWEET_REPLY",
  "POST_CREATE",
  "POST_ADD",
]);

const TYPING_EVENT_TYPES = new Set([
  "TYPING_START",
  "IMESSAGE_TYPING_START",
  "SNAPCHAT_TYPING_START",
  "TEAMS_TYPING_START",
]);

const APP_NOTIFICATION_EVENT_TYPES = new Set([
  "NOTIFICATION_ADD",
]);

export class CameraDirectorPlugin implements CompilerPlugin {
  name = "camera-director";
  version = "1.0.0";
  subscribesTo = ["*"];
  emits = [];

  private readonly directorOptions: CameraDirectorOptions;
  private readonly behaviorConfig?: BehaviorConfig;

  constructor(styleOrOptions?: string | CameraDirectorPluginOptions) {
    const style =
      typeof styleOrOptions === "string"
        ? styleOrOptions
        : styleOrOptions?.style;
    const options = typeof styleOrOptions === "object" ? styleOrOptions : {};
    const styleBehaviors = style ? STYLE_BEHAVIORS[style] : undefined;

    this.directorOptions = options;
    this.behaviorConfig =
      options.behaviorConfig ??
      styleBehaviors ??
      (typeof styleOrOptions === "string"
        ? { MESSAGE_RECEIVED: styleOrOptions }
        : undefined);
  }

  process(events: TrackEvent[], context: CompilerContext): TrackEvent[] {
    const director = new CameraDirector({
      ...this.directorOptions,
      fps: context.fps,
    });
    const cameraEvents = this.convertToCameraEvents(events, context.fps);

    if (cameraEvents.length === 0) {
      return [];
    }

    const { effects } = director.choreograph(cameraEvents, this.behaviorConfig);

    return this.convertEffectsToTrackEvents(effects, context.fps);
  }

  private convertToCameraEvents(
    events: TrackEvent[],
    _fps: number,
  ): CameraEvent[] {
    const cameraEvents: CameraEvent[] = [];
    let eventId = 0;

    for (const event of events) {
      const timestamp = event.at;
      const payload = event.payload as Record<string, unknown> | undefined;

      const anchor = this.anchorForEvent(
        event.kind === "APP" ? event.appId : undefined,
        event.type,
      );

      if (event.kind === "APP" && RECEIVED_EVENT_TYPES.has(event.type)) {
        cameraEvents.push({
          id: `plugin-${eventId++}`,
          type: "MESSAGE_RECEIVED",
          timestamp,
          priority: "normal",
          payload: {
            from: typeof payload?.from === "string" ? payload.from : "them",
            text: typeof payload?.text === "string" ? payload.text : "",
            order: eventId - 1,
            anchor,
          },
        });
      } else if (event.kind === "APP" && SENT_EVENT_TYPES.has(event.type)) {
        cameraEvents.push({
          id: `plugin-${eventId++}`,
          type: "MESSAGE_SENT",
          timestamp,
          priority: "normal",
          payload: {
            from: "me",
            text: typeof payload?.text === "string" ? payload.text : "",
            order: eventId - 1,
            anchor,
          },
        });
      } else if (
        event.kind === "APP" &&
        APP_NOTIFICATION_EVENT_TYPES.has(event.type)
      ) {
        cameraEvents.push({
          id: `plugin-${eventId++}`,
          type: "INTERRUPTION",
          timestamp,
          priority: "high",
          payload: {
            anchor: "notification.banner",
            duration: 1.5,
          },
        });
      } else if (event.kind === "APP" && TYPING_EVENT_TYPES.has(event.type)) {
        cameraEvents.push({
          id: `plugin-${eventId++}`,
          type: "TYPING_START",
          timestamp,
          priority: "normal",
          payload: {
            actor: typeof payload?.actor === "string" ? payload.actor : "them",
            anchor: "typingIndicator",
          },
        });
      }
    }

    return cameraEvents;
  }

  private anchorForEvent(appId: string | undefined, eventType: string): string {
    if (
      eventType === "POST_ADD" ||
      eventType === "POST_CREATE" ||
      eventType === "POST_COMMENT"
    ) {
      return appId === "app_linkedin" ? "post_card" : "feed_post";
    }
    if (eventType === "TWEET_CREATE" || eventType === "TWEET_REPLY") {
      return "tweet_card";
    }
    if (appId === "app_instagram") return "dm_message_latest";
    if (appId === "app_linkedin") return "message_thread";
    if (appId === "app_x") return "dm_thread";
    return "lastMessage";
  }

  private convertEffectsToTrackEvents(
    effects: readonly CameraEffect[],
    fps: number,
  ): TrackEvent[] {
    const trackEvents: TrackEvent[] = [];

    for (const effect of effects) {
      if (effect.type === "focus") {
        const params = effect.params as {
          anchor?: string;
          scale?: number;
          padding?: number;
          easing?: string;
        };
        trackEvents.push({
          at: effect.timestamp,
          kind: "CAMERA",
          type: "FOCUS",
          payload: {
            anchorId: params.anchor ?? "lastMessage",
            scale: params.scale,
            padding: params.padding,
            easing: params.easing as EasingType | undefined,
          },
        });
      } else if (effect.type === "shake") {
        const params = effect.params as {
          duration?: number;
          intensityX: number;
          intensityY: number;
          frequency?: number;
          decay?: number;
        };
        const duration = Math.round((params.duration || 0.5) * fps);
        trackEvents.push(
          {
            at: effect.timestamp,
            duration,
            kind: "CAMERA",
            type: "SHAKE_START",
            payload: {
              intensityX: params.intensityX,
              intensityY: params.intensityY,
              frequency: params.frequency,
              decay: params.decay,
            },
          } as TrackEvent,
          {
            at: effect.timestamp + duration,
            kind: "CAMERA",
            type: "SHAKE_END",
            payload: {},
          } as TrackEvent,
        );
      } else if (effect.type === "reset") {
        const params = effect.params as {
          easing?: string;
          spring?: string;
        };
        trackEvents.push({
          at: effect.timestamp,
          kind: "CAMERA",
          type: "RESET",
          payload: {
            easing: params.easing,
            spring: params.spring,
          },
        } as TrackEvent);
      } else if (effect.type === "zoom") {
        const params = effect.params as {
          scale: number;
          duration?: number;
          easing?: string;
        };
        trackEvents.push({
          at: effect.timestamp,
          kind: "CAMERA",
          type: "ZOOM",
          payload: {
            scale: params.scale,
            duration: params.duration,
            easing: params.easing,
          },
        } as TrackEvent);
      } else if (effect.type === "animate") {
        const params = effect.params as {
          x?: number;
          y?: number;
          scale?: number;
          duration?: number;
          easing?: string;
          originX?: number;
          originY?: number;
        };
        trackEvents.push({
          at: effect.timestamp,
          kind: "CAMERA",
          type: "ZOOM",
          payload: {
            scale: params.scale ?? 1,
            translateX: params.x ?? 0,
            translateY: params.y ?? 0,
            duration: params.duration,
            easing: params.easing,
            originX: params.originX,
            originY: params.originY,
          },
        } as TrackEvent);
      } else {
        log.warn(`Unsupported camera effect type: ${effect.type}`, {
          event: "compiler.camera_unsupported_effect",
          effectType: effect.type,
        });
      }
    }

    return trackEvents;
  }
}
