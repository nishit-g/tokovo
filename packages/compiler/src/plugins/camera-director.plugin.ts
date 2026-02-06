import { CameraDirector } from "@tokovo/device-camera";
import type {
  CameraEvent,
  CameraDirectorOptions,
  BehaviorConfig,
  CameraEffect,
} from "@tokovo/device-camera";
import type { CompilerPlugin, CompilerContext } from "./types.js";
import type { TrackEvent } from "@tokovo/ir";

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
    fps: number,
  ): CameraEvent[] {
    const cameraEvents: CameraEvent[] = [];
    let eventId = 0;

    for (const event of events) {
      const e = event as any;
      const timestamp = event.at;
      const payload = event.payload as Record<string, unknown>;

      if (e.kind === "APP" && e.type === "MESSAGE_RECEIVED") {
        cameraEvents.push({
          id: `plugin-${eventId++}`,
          type: "MESSAGE_RECEIVED",
          timestamp,
          priority: "normal",
          payload: {
            from: payload.from as string,
            text: payload.text as string,
            order: eventId - 1,
            anchor: "lastMessage",
          },
        });
      } else if (e.kind === "APP" && e.type === "MESSAGE_SENT") {
        cameraEvents.push({
          id: `plugin-${eventId++}`,
          type: "MESSAGE_SENT",
          timestamp,
          priority: "normal",
          payload: {
            from: "me",
            text: payload.text as string,
            order: eventId - 1,
            anchor: "lastMessage",
          },
        });
      } else if (e.kind === "DEVICE" && e.type === "NOTIFICATION_SHOW") {
        cameraEvents.push({
          id: `plugin-${eventId++}`,
          type: "NOTIFICATION_SHOWN",
          timestamp,
          priority: "high",
          payload: {
            app: payload.appId as string,
            title: payload.title as string,
            body: payload.body as string,
            anchor: "headsUpNotification",
            duration: 1.5,
          },
        });
      } else if (e.kind === "APP" && e.type === "TYPING_START") {
        cameraEvents.push({
          id: `plugin-${eventId++}`,
          type: "TYPING_START",
          timestamp,
          priority: "normal",
          payload: {
            actor: payload.actor as string,
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
      const e = effect as any;

      if (e.type === "focus") {
        trackEvents.push({
          at: e.timestamp,
          kind: "CAMERA",
          type: "FOCUS",
          payload: {
            anchorId: e.params.anchor,
            scale: e.params.scale,
            padding: e.params.padding,
            easing: e.params.easing,
          },
        } as unknown as TrackEvent);
      } else if (e.type === "shake") {
        const duration = Math.round((e.params.duration || 0.5) * fps);
        trackEvents.push(
          {
            at: e.timestamp,
            duration,
            kind: "CAMERA",
            type: "SHAKE_START",
            payload: {
              intensityX: e.params.intensityX,
              intensityY: e.params.intensityY,
              frequency: e.params.frequency,
              decay: e.params.decay,
            },
          } as TrackEvent,
          {
            at: e.timestamp + duration,
            kind: "CAMERA",
            type: "SHAKE_END",
            payload: {},
          } as TrackEvent,
        );
      } else if (e.type === "reset") {
        trackEvents.push({
          at: e.timestamp,
          kind: "CAMERA",
          type: "RESET",
          payload: {
            easing: e.params.easing,
            spring: e.params.spring,
          },
        } as TrackEvent);
      } else if (e.type === "zoom") {
        trackEvents.push({
          at: e.timestamp,
          kind: "CAMERA",
          type: "ZOOM",
          payload: {
            scale: e.params.scale,
            duration: e.params.duration,
            easing: e.params.easing,
          },
        } as TrackEvent);
      } else {
        console.warn(
          `[CameraDirectorPlugin] Unsupported effect type: ${e.type}`,
        );
      }
    }

    return trackEvents;
  }
}
