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

export class CameraDirectorPlugin implements CompilerPlugin {
  name = "camera-director";
  version = "1.0.0";
  subscribesTo = ["*"];
  emits = [];

  private readonly director: CameraDirector;
  private readonly behaviorConfig?: BehaviorConfig;

  constructor(styleOrOptions?: string | CameraDirectorPluginOptions) {
    const options =
      typeof styleOrOptions === "string"
        ? { behaviors: { MESSAGE_RECEIVED: styleOrOptions } }
        : styleOrOptions || {};

    this.director = new CameraDirector(options);
    this.behaviorConfig = options.behaviorConfig;
  }

  process(events: TrackEvent[], context: CompilerContext): TrackEvent[] {
    const cameraEvents = this.convertToCameraEvents(events, context.fps);

    if (cameraEvents.length === 0) {
      return [];
    }

    const { effects } = this.director.choreograph(
      cameraEvents,
      this.behaviorConfig,
    );

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

      if (event.kind === "APP" && event.type === "MESSAGE_RECEIVED") {
        cameraEvents.push({
          id: `plugin-${eventId++}`,
          type: "MESSAGE_RECEIVED",
          timestamp,
          priority: "normal",
          payload: {
            from: typeof payload?.from === "string" ? payload.from : "them",
            text: typeof payload?.text === "string" ? payload.text : "",
            order: eventId - 1,
            anchor: "lastMessage",
          },
        });
      } else if (event.kind === "APP" && event.type === "MESSAGE_SENT") {
        cameraEvents.push({
          id: `plugin-${eventId++}`,
          type: "MESSAGE_SENT",
          timestamp,
          priority: "normal",
          payload: {
            from: "me",
            text: typeof payload?.text === "string" ? payload.text : "",
            order: eventId - 1,
            anchor: "lastMessage",
          },
        });
      } else if (event.kind === "DEVICE" && event.type === "NOTIFICATION_SHOW") {
        cameraEvents.push({
          id: `plugin-${eventId++}`,
          type: "NOTIFICATION_SHOWN",
          timestamp,
          priority: "high",
          payload: {
            app: typeof payload?.appId === "string" ? payload.appId : "unknown",
            title: typeof payload?.title === "string" ? payload.title : "",
            body: typeof payload?.body === "string" ? payload.body : "",
            anchor: "headsUpNotification",
            duration: 1.5,
          },
        });
      } else if (event.kind === "APP" && event.type === "TYPING_START") {
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
