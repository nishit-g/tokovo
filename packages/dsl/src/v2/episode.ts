/**
 * V2 Episode Builder - Fluent API for track-based episodes
 *
 * @description Creates a TrackEpisodeIR using the new track-based DSL.
 * No more beats, just tracks.
 *
 * @example
 * ```typescript
 * const ir = episode("demo", { fps: 30, duration: "60s" })
 *   .device("phone", "iphone16", {
 *     app: "app_whatsapp"
 *   })
 *   .snapshot("app_whatsapp", "phone", { conversations: [] })
 *   .view("app_whatsapp", "phone", { screen: "chat-list" })
 *   .track("camera", cam => {
 *     cam.at("0s").set({ scale: 1 });
 *     cam.at("1s").animate({ scale: 1.2, duration: "0.5s" });
 *   })
 *   .build();
 * ```
 *
 * @see docs/architecture/dsl-v2.md
 */

import {
  TrackEpisodeIR,
  TrackEpisodeConfig,
  DeviceConfig,
  AppSnapshotEntry,
  AppInitialViewEntry,
  OSConfig,
  Marker,
  Section,
  TrackEvent,
  VoiceScriptDefinition,
  VoiceScheduleItem,
  BackgroundConfigIR,
  HandPerformanceIR,
  HandMotionPreset,
  HandTypingMode,
  HandRigAssetsIR,
  HandPerformanceStageIR,
  InputSessionIR,
  InputScriptStepIR,
  InputCadenceIR,
  InputKeyboardIR,
  InputSourceIR,
  InputDirectionIR,
  NotificationIntentIR,
  NotificationInteractionIR,
  ScreenRecordingBootConfig,
  EpisodeCinematicsIR,
} from "@tokovo/ir";
import { type CompilerContext, type CompilerPlugin } from "@tokovo/compiler";
import { parseTimeToFrames } from "./utils/time.js";
import { AudioTrackBuilder } from "./audio-track.js";
import { OSTrackBuilder } from "./os-track.js";
import { DeviceTrackBuilderV2 } from "./device-track.js";
import { OverlayTrackBuilder } from "./overlay-track.js";
import { HandPerformanceTrackBuilder } from "./hand-performance-track.js";
import { createDefaultEpisodeCinematics } from "./default-cinematics.js";

// =============================================================================
// TYPES
// =============================================================================

export interface DeviceOptions {
  app: string;
  os?: OSConfig;
  /** UI theme/strategy to use (e.g., "whatsapp-storybook") */
  theme?: string;
  /** App color appearance, independent of the selected theme variant. */
  appearance?: "light" | "dark";
  /** Start locked at frame 0 */
  locked?: boolean;
  /** Apps installed on the home screen (deterministic icon layout) */
  installedApps?: string[];
  /** Optional home screen layout override */
  homeScreen?: {
    preset?: "ios-default" | "android-default";
    dock?: string[];
    pages?: string[][];
    wallpaper?: string;
  };
  /** Start with an already-active screen recording session. */
  screenRecording?: boolean | ScreenRecordingBootConfig;
}

export interface TrackBuilder {
  _events: TrackEvent[];
  at: (time: string | number) => unknown;
  span: (start: string | number, end: string | number) => unknown;
}

export interface SnapshotOptions {
  version?: number;
}

export interface ViewOptions {
  version?: number;
}

export interface HandPerformanceOptions {
  rigId: string;
  assets: HandRigAssetsIR;
  defaultMotion?: HandMotionPreset;
  defaultTypingMode?: HandTypingMode;
  motionIntensity?: number;
  stage?: HandPerformanceStageIR;
}

export interface InputSessionOptions {
  /** Start time in frames or DSL time syntax. */
  at: string | number;
  /** Optional explicit end time. Omit to use the compiler's natural duration. */
  until?: string | number;
  /** Optional return-key submission time. */
  submitAt?: string | number;
  clearOnSubmit?: boolean;
  id?: string;
  appId?: string;
  appInstanceId?: string;
  initialValue?: string;
  text?: string;
  script?: InputScriptStepIR[];
  expectedFinalValue?: string;
  seed?: string | number;
  source?: InputSourceIR;
  locale?: string;
  direction?: InputDirectionIR;
  keyboard?: InputKeyboardIR;
  cadence?: InputCadenceIR;
}

export type NotificationIntentOptions = Omit<
  NotificationIntentIR,
  "id" | "deviceId" | "appInstanceId" | "deliverAtFrame" | "sequence"
> & {
  at: string | number;
  id?: string;
  appInstanceId?: string;
};

export type NotificationInteractionOptions = Omit<
  NotificationInteractionIR,
  "deviceId" | "atFrame" | "sequence" | "notificationId"
> & {
  at: string | number;
};

// Track factory function type for app-specific builders.
export type TrackFactory<T> = () => T;
export type TrackFn<T> = (track: T) => void;

class VoicePointBuilder<T extends string> {
  private readonly _addItem: (item: VoiceScheduleItem<T>) => void;
  private readonly _frame: number;

  constructor(addItem: (item: VoiceScheduleItem<T>) => void, frame: number) {
    this._addItem = addItem;
    this._frame = frame;
  }

  play(segmentId: T, options?: { volume?: number; speed?: number }): void {
    this._addItem({
      segmentId,
      at: this._frame,
      volume: options?.volume,
      speed: options?.speed,
    });
  }
}

class VoiceTrackBuilderInternal<T extends string> {
  private readonly _fps: number;
  private readonly _script: VoiceScriptDefinition<T>;
  private readonly _schedule: VoiceScheduleItem<T>[] = [];

  constructor(fps: number, script: VoiceScriptDefinition<T>) {
    this._fps = fps;
    this._script = script;
  }

  at(time: string | number): VoicePointBuilder<T> {
    const frame = typeof time === "number" ? time : parseTimeToFrames(time, this._fps);
    return new VoicePointBuilder((item) => this._schedule.push(item), frame);
  }

  get schedule(): VoiceScheduleItem<T>[] {
    return this._schedule;
  }

  get script(): VoiceScriptDefinition<T> {
    return this._script;
  }
}

type NotificationDeliveryOptions = Omit<NotificationIntentOptions, "at">;

export class NotificationPointBuilder {
  constructor(
    private readonly frame: number,
    private readonly deviceId: string,
    private readonly intents: NotificationIntentIR[],
    private readonly interactions: NotificationInteractionIR[],
    private readonly getOrder: () => number,
  ) {}

  deliver(options: NotificationDeliveryOptions): string {
    const id = options.id ?? `notification_${this.deviceId}_${this.frame}_${this.intents.length}`;
    this.intents.push({
      ...options,
      id,
      deviceId: this.deviceId,
      appInstanceId: options.appInstanceId ?? `${this.deviceId}:${options.appId}`,
      deliverAtFrame: this.frame,
      sequence: this.getOrder(),
    });
    return id;
  }

  tap(notificationId: string): void {
    this.interact("tap", notificationId);
  }

  chooseAction(notificationId: string, actionId: string): void {
    this.interact("chooseAction", notificationId, { actionId });
  }

  reply(notificationId: string, replyText: string): void {
    this.interact("reply", notificationId, { replyText });
  }

  dismiss(notificationId: string): void {
    this.interact("dismiss", notificationId);
  }

  clearAll(): void {
    this.interact("clearAll");
  }

  openCenter(): void {
    this.interact("openCenter");
  }

  closeCenter(): void {
    this.interact("closeCenter");
  }

  private interact(
    type: NotificationInteractionIR["type"],
    notificationId?: string,
    options: { actionId?: string; replyText?: string } = {},
  ): void {
    this.interactions.push({
      deviceId: this.deviceId,
      atFrame: this.frame,
      type,
      notificationId,
      actionId: options.actionId,
      replyText: options.replyText,
      sequence: this.getOrder(),
    });
  }
}

export class NotificationTrackBuilder {
  constructor(
    private readonly fps: number,
    private readonly deviceId: string,
    private readonly intents: NotificationIntentIR[],
    private readonly interactions: NotificationInteractionIR[],
    private readonly getOrder: () => number,
  ) {}

  at(time: string | number): NotificationPointBuilder {
    return new NotificationPointBuilder(
      parseTimeToFrames(time, this.fps),
      this.deviceId,
      this.intents,
      this.interactions,
      this.getOrder,
    );
  }
}

// =============================================================================
// EPISODE BUILDER
// =============================================================================

/**
 * Episode builder - fluent API for creating episodes.
 */
export class EpisodeBuilder {
  private _id: string;
  private _fps: number;
  private _durationInFrames: number;
  private _title?: string;
  private _description?: string;
  private _seed?: number | string;
  private _devices: DeviceConfig[] = [];
  private _appSnapshots: AppSnapshotEntry[] = [];
  private _initialViews: AppInitialViewEntry[] = [];
  private _events: TrackEvent[] = [];
  private _inputSessions: InputSessionIR[] = [];
  private _notificationIntents: NotificationIntentIR[] = [];
  private _notificationInteractions: NotificationInteractionIR[] = [];
  private _markers: Marker[] = [];
  private _sections: Section[] = [];
  private _declarationOrder = 0;
  private _plugins: CompilerPlugin[] = [];
  private _voiceConfig:
    | {
        script: VoiceScriptDefinition<string>;
        schedule: VoiceScheduleItem<string>[];
      }
    | undefined;
  private _background?: BackgroundConfigIR;
  private _handPerformances: HandPerformanceIR[] = [];
  private _cinematics?: EpisodeCinematicsIR;

  constructor(id: string, config: TrackEpisodeConfig) {
    this._id = id;
    this._fps = config.fps;
    this._durationInFrames = parseTimeToFrames(config.duration, config.fps);
    this._title = config.title;
    this._description = config.description;
    this._seed = config.seed;
  }

  /**
   * Attach the camera-independent stage and selectable Camera VNext plans.
   * This is replacement authoring data, not a translation into camera events.
   */
  cinematics(programs: EpisodeCinematicsIR): this {
    this._cinematics = programs;
    return this;
  }

  voice<T extends string>(
    script: VoiceScriptDefinition<T>,
    fn: (track: VoiceTrackBuilderInternal<T>) => void,
  ): this {
    const builder = new VoiceTrackBuilderInternal(this._fps, script);
    fn(builder);
    this._voiceConfig = {
      script: script as VoiceScriptDefinition<string>,
      schedule: builder.schedule as VoiceScheduleItem<string>[],
    };
    return this;
  }

  /**
   * Add a device to the episode.
   */
  device(id: string, profile: string, options: DeviceOptions): this {
    this._devices.push({
      id,
      profile,
      app: options.app,
      os: options.os,
      theme: options.theme,
      appearance: options.appearance,
      locked: options.locked,
      installedApps: options.installedApps,
      homeScreen: options.homeScreen,
      screenRecording: options.screenRecording,
    });
    return this;
  }

  snapshot(
    appId: string,
    deviceId: string,
    snapshot: unknown,
    options: SnapshotOptions = {},
  ): this {
    this._appSnapshots = this._appSnapshots.filter(
      (entry) => !(entry.appId === appId && entry.deviceId === deviceId),
    );
    this._appSnapshots.push({
      appId,
      deviceId,
      snapshotVersion: options.version ?? 1,
      snapshot,
    });
    return this;
  }

  view(appId: string, deviceId: string, view: unknown, options: ViewOptions = {}): this {
    this._initialViews = this._initialViews.filter(
      (entry) => !(entry.appId === appId && entry.deviceId === deviceId),
    );
    this._initialViews.push({
      appId,
      deviceId,
      viewVersion: options.version ?? 1,
      view,
    });
    return this;
  }

  /**
   * Set the background for the video canvas.
   * Can be a visual-system backdrop profile ID or a full config.
   *
   * @example
   * // Using preset
   * .background("studio-quiet-dark")
   *
   * @example
   * // Using image
   * .background({ type: "image", src: "/backgrounds/city.jpg", blur: 5 })
   *
   * @example
   * // Using video
   * .background({ type: "video", src: "/backgrounds/loop.mp4", opacity: 0.8 })
   */
  background(config: BackgroundConfigIR): this {
    this._background = config;
    return this;
  }

  /**
   * Attach a deterministic physical hand performance to a device.
   * Keyboard-synchronized thumb poses are derived during rendering.
   */
  hands(
    deviceId: string,
    options: HandPerformanceOptions,
    fn: TrackFn<HandPerformanceTrackBuilder>,
  ): this {
    if (!this._devices.some((device) => device.id === deviceId)) {
      throw new Error(`Cannot attach hand performance to unknown device "${deviceId}"`);
    }

    const builder = new HandPerformanceTrackBuilder(this._fps);
    fn(builder);
    this._handPerformances = this._handPerformances.filter(
      (performance) => performance.deviceId !== deviceId,
    );
    this._handPerformances.push({
      deviceId,
      rigId: options.rigId,
      assets: options.assets,
      defaultMotion: options.defaultMotion,
      defaultTypingMode: options.defaultTypingMode,
      motionIntensity: options.motionIntensity,
      stage: options.stage,
      cues: [...builder._cues].sort((a, b) => a.startFrame - b.startFrame),
    });
    return this;
  }

  /**
   * Add an audio track.
   */
  audio(fn: TrackFn<AudioTrackBuilder>): this {
    const builder = new AudioTrackBuilder(this._fps, () => this._declarationOrder++);
    fn(builder);
    this._events.push(...builder._events);
    return this;
  }

  /**
   * Add a story overlay track (hook/captions/receipts).
   * Renders above devices and is unaffected by camera transforms.
   */
  overlay(fn: TrackFn<OverlayTrackBuilder>): this {
    const builder = new OverlayTrackBuilder(this._fps, () => this._declarationOrder++);
    fn(builder);
    this._events.push(...builder._events);
    return this;
  }

  /**
   * Add an OS track.
   */
  os(fn: TrackFn<OSTrackBuilder>): this {
    const builder = new OSTrackBuilder(this._fps, () => this._declarationOrder++);
    fn(builder);
    this._events.push(...builder._events);
    return this;
  }

  /**
   * Add a first-class device track for a specific device.
   * This is the canonical authoring surface for lock/unlock, app switching,
   * notifications, keyboard, badges, screen recording, etc.
   */
  deviceTrack(deviceId: string, fn: TrackFn<DeviceTrackBuilderV2>): this {
    const builder = new DeviceTrackBuilderV2(this._fps, deviceId, () => this._declarationOrder++);
    fn(builder);
    this._events.push(...builder._events);
    return this;
  }

  /** Author OS-owned notification delivery and interaction data. */
  notificationTrack(deviceId: string, fn: TrackFn<NotificationTrackBuilder>): this {
    if (!this._devices.some((device) => device.id === deviceId)) {
      throw new Error(`Cannot author notification track for unknown device "${deviceId}"`);
    }
    fn(
      new NotificationTrackBuilder(
        this._fps,
        deviceId,
        this._notificationIntents,
        this._notificationInteractions,
        () => this._declarationOrder++,
      ),
    );
    return this;
  }

  /**
   * Author a deterministic, field-scoped text input session.
   *
   * This is intentionally an input capability rather than a keyboard event:
   * the same contract supports software/hardware keyboards, paste, voice and
   * IME composition while keeping draft ownership with the app field.
   */
  input(deviceId: string, fieldId: string, options: InputSessionOptions): this {
    const device = this._devices.find((candidate) => candidate.id === deviceId);
    if (!device) {
      throw new Error(`Cannot author input for unknown device "${deviceId}"`);
    }
    if (!fieldId.trim()) {
      throw new Error("Input fieldId must not be empty");
    }

    const appId = options.appId ?? device.app;
    const startFrame = parseTimeToFrames(options.at, this._fps);
    const endFrame =
      options.until === undefined ? undefined : parseTimeToFrames(options.until, this._fps);
    const submitAtFrame =
      options.submitAt === undefined ? undefined : parseTimeToFrames(options.submitAt, this._fps);

    this._inputSessions.push({
      id: options.id,
      deviceId,
      appInstanceId: options.appInstanceId ?? `${deviceId}:${appId}`,
      fieldId,
      startFrame,
      endFrame,
      submitAtFrame,
      clearOnSubmit: options.clearOnSubmit,
      initialValue: options.initialValue,
      text: options.text,
      script: options.script,
      expectedFinalValue: options.expectedFinalValue,
      seed: options.seed,
      source: options.source,
      locale: options.locale,
      direction: options.direction,
      keyboard: options.keyboard,
      cadence: options.cadence,
    });
    return this;
  }

  /** Author one semantic notification delivery request. */
  notify(deviceId: string, options: NotificationIntentOptions): string {
    const device = this._devices.find((candidate) => candidate.id === deviceId);
    if (!device) {
      throw new Error(`Cannot author notification for unknown device "${deviceId}"`);
    }
    const { at, ...intent } = options;
    const deliverAtFrame = parseTimeToFrames(at, this._fps);
    const id =
      options.id ??
      `notification_${deviceId}_${deliverAtFrame}_${this._notificationIntents.length}`;
    this._notificationIntents.push({
      ...intent,
      id,
      deviceId,
      appInstanceId: options.appInstanceId ?? `${deviceId}:${options.appId}`,
      deliverAtFrame,
      sequence: this._declarationOrder++,
    });
    return id;
  }

  /** Author a tap, action, reply, dismissal, or notification-center operation. */
  interactWithNotification(
    deviceId: string,
    notificationId: string | undefined,
    options: NotificationInteractionOptions,
  ): this {
    if (!this._devices.some((device) => device.id === deviceId)) {
      throw new Error(`Cannot author notification interaction for unknown device "${deviceId}"`);
    }
    const { at, ...interaction } = options;
    this._notificationInteractions.push({
      ...interaction,
      deviceId,
      notificationId,
      atFrame: parseTimeToFrames(at, this._fps),
      sequence: this._declarationOrder++,
    });
    return this;
  }

  setNotificationCenter(deviceId: string, open: boolean, at: string | number): this {
    return this.interactWithNotification(deviceId, undefined, {
      at,
      type: open ? "openCenter" : "closeCenter",
    });
  }

  clearNotifications(deviceId: string, at: string | number): this {
    return this.interactWithNotification(deviceId, undefined, {
      at,
      type: "clearAll",
    });
  }

  /**
   * Add a generic track by ID.
   * Used for plugin tracks (e.g., "app_whatsapp").
   *
   * @param trackId - Track identifier (e.g., "app_whatsapp")
   * @param factory - Factory function that creates the track builder. The episode's
   *                  declaration-order allocator is always supplied; zero-argument
   *                  factories safely ignore it.
   * @param fn - Function that configures the track
   */
  track<T extends TrackBuilder>(
    trackId: string,
    factory: (() => T) | ((getOrder: () => number) => T),
    fn: TrackFn<T>,
  ): this {
    const getOrder = () => this._declarationOrder++;
    // Do not inspect Function.length here: default/rest parameters and transformed
    // functions make runtime arity unreliable. Extra arguments are safe for
    // JavaScript factories and keep every app track on the central counter.
    const builder = (factory as (getOrder: () => number) => T)(getOrder);
    fn(builder);
    this._events.push(...(builder._events as TrackEvent[]));
    return this;
  }

  /**
   * Add a marker at a specific time.
   */
  mark(id: string, time: string | number): this {
    const frame = parseTimeToFrames(time, this._fps);
    this._markers.push({ id, frame });
    this._events.push({
      at: frame,
      kind: "MARKER" as const,
      type: "MARK" as const,
      payload: { id },
      _declarationOrder: this._declarationOrder++,
    });
    return this;
  }

  /**
   * Add a section (region) between two times.
   */
  section(id: string, start: string | number, end: string | number): this {
    const startFrame = parseTimeToFrames(start, this._fps);
    const endFrame = parseTimeToFrames(end, this._fps);
    this._sections.push({ id, startFrame, endFrame });
    this._events.push(
      {
        at: startFrame,
        kind: "MARKER" as const,
        type: "SECTION_START" as const,
        payload: { id },
        _declarationOrder: this._declarationOrder++,
      },
      {
        at: endFrame,
        kind: "MARKER" as const,
        type: "SECTION_END" as const,
        payload: { id },
        _declarationOrder: this._declarationOrder++,
      },
    );
    return this;
  }

  /**
   * Register a compiler plugin.
   * Plugins run during the build() phase to generate additional events.
   */
  use(plugin: CompilerPlugin): this {
    this._plugins.push(plugin);
    return this;
  }

  /**
   * Build the TrackEpisodeIR.
   */
  build(): TrackEpisodeIR {
    let allEvents = [...this._events];
    const plugins = [...this._plugins];

    if (plugins.length > 0) {
      const context = this._buildCompilerContext();
      const orderedPlugins = this._orderPluginsByDependencies(plugins);

      for (const plugin of orderedPlugins) {
        const generatedEvents = plugin.process(allEvents, context);

        for (const event of generatedEvents) {
          if (event._declarationOrder === undefined) {
            event._declarationOrder = this._declarationOrder++;
          }
        }

        allEvents = [...allEvents, ...generatedEvents];
      }
    }

    // Sort events by frame, then by declaration order
    const sortedEvents = [...allEvents].sort((a, b) => {
      if (a.at !== b.at) return a.at - b.at;
      return (a._declarationOrder ?? 0) - (b._declarationOrder ?? 0);
    });

    return {
      id: this._id,
      fps: this._fps,
      durationInFrames: this._durationInFrames,
      title: this._title,
      description: this._description,
      seed: this._seed,
      devices: this._devices,
      appSnapshots: this._appSnapshots,
      initialViews: this._initialViews,
      events: sortedEvents,
      inputSessions: this._inputSessions.length > 0 ? [...this._inputSessions] : undefined,
      notificationIntents:
        this._notificationIntents.length > 0 ? [...this._notificationIntents] : undefined,
      notificationInteractions:
        this._notificationInteractions.length > 0 ? [...this._notificationInteractions] : undefined,
      markers: this._markers,
      sections: this._sections,
      background: this._background,
      handPerformances: this._handPerformances.length > 0 ? this._handPerformances : undefined,
      cinematics:
        this._cinematics ??
        createDefaultEpisodeCinematics({
          fps: this._fps,
          durationInFrames: this._durationInFrames,
          devices: this._devices,
        }),
      voice: this._voiceConfig
        ? {
            manifestPath: this._voiceConfig.script.manifestPath,
            audioPath: this._voiceConfig.script.audioPath,
            usePerSegmentControl: true,
            segmentSchedule: this._voiceConfig.schedule,
            durationMs: this._voiceConfig.script.durationMs,
            segments: Object.values(this._voiceConfig.script.segments).map((seg) => ({
              id: seg.id,
              startMs: seg.startMs,
              endMs: seg.endMs,
              durationMs: seg.endMs - seg.startMs,
              speaker: seg.speaker,
            })),
          }
        : undefined,
    };
  }

  private _buildCompilerContext(): CompilerContext {
    return {
      fps: this._fps,
      durationInFrames: this._durationInFrames,
      devices: this._devices,
    };
  }

  private _orderPluginsByDependencies(plugins: CompilerPlugin[]): CompilerPlugin[] {
    const ordered: CompilerPlugin[] = [];
    const visited = new Set<string>();
    const visiting = new Set<string>();

    const visit = (plugin: CompilerPlugin): void => {
      if (visited.has(plugin.name)) return;
      if (visiting.has(plugin.name)) {
        throw new Error(`Circular dependency detected: ${plugin.name}`);
      }

      visiting.add(plugin.name);

      if (plugin.dependsOn) {
        for (const depName of plugin.dependsOn) {
          const dep = plugins.find((p) => p.name === depName);
          if (!dep) {
            throw new Error(
              `Plugin "${plugin.name}" depends on "${depName}" which is not registered`,
            );
          }
          visit(dep);
        }
      }

      visiting.delete(plugin.name);
      visited.add(plugin.name);
      ordered.push(plugin);
    };

    for (const plugin of plugins) {
      visit(plugin);
    }

    return ordered;
  }
}

// =============================================================================
// FACTORY FUNCTION
// =============================================================================

/**
 * Create a new episode.
 *
 * @param id - Episode ID
 * @param config - Episode configuration
 * @returns EpisodeBuilder for fluent chaining
 *
 * @example
 * ```typescript
 * const ir = episode("demo", { fps: 30, duration: "30s" })
 *   .device("phone", "iphone16", { app: "app_whatsapp" })
 *   .cinematics(cinematicProgram)
 *   .build();
 * ```
 */
export function episode(id: string, config: TrackEpisodeConfig): EpisodeBuilder {
  return new EpisodeBuilder(id, config);
}
