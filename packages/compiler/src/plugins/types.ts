import type { TrackEvent, TrackEpisodeIR, DeviceConfig } from "@tokovo/ir";

export interface ComponentType<P = unknown> {
  (props: P): JSX.Element | null;
}

/**
 * Context provided to plugins during compilation
 * Contains metadata and resources available at compile-time
 */
export interface CompilerContext {
  /** Frames per second for the episode */
  fps: number;

  /** Total duration in frames */
  durationInFrames: number;

  /** All devices in the episode */
  devices: DeviceConfig[];

  /** Registry of available semantic anchors */
  anchors: AnchorRegistry;
}

/**
 * Registry of semantic anchors available in the episode
 * Plugins can query this to find valid anchor IDs
 */
export interface AnchorRegistry {
  /** Get all anchor IDs */
  list(): string[];

  /** Check if anchor exists */
  has(anchorId: string): boolean;

  /** Get anchor by ID (if exists) */
  get(anchorId: string): AnchorInfo | undefined;

  /** Filter anchors by predicate */
  filter(predicate: (anchor: AnchorInfo) => boolean): AnchorInfo[];
}

/**
 * Information about a semantic anchor
 */
export interface AnchorInfo {
  id: string;
  deviceId?: string;
  appId?: string;
}

/**
 * Props passed to track rendering components
 */
export interface TrackRenderProps {
  /** Events relevant to this track (pre-filtered) */
  events: TrackEvent[];
}

/**
 * Definition of a rendering track/layer
 * Plugins provide this to specify how their events should be rendered
 */
export interface RenderTrackDefinition {
  /** Unique name for the track (e.g., "Camera", "Subtitles") */
  name: string;

  /** Layer ordering (0 = bottom, 100+ = top) */
  zIndex: number;

  /** Color for timeline editor (optional) */
  color?: string;

  /** React component that renders this track */
  Component: ComponentType<TrackRenderProps>;

  /** Filter function to extract relevant events */
  filterEvents: (events: TrackEvent[]) => TrackEvent[];

  /** Parent track name for nested composition (optional) */
  parentTrack?: string;
}

/**
 * Validation result from plugin
 */
export interface ValidationResult {
  valid: boolean;
  errors?: ValidationError[];
  warnings?: ValidationWarning[];
}

export interface ValidationError {
  message: string;
  events?: string[];
  location?: string;
}

export interface ValidationWarning {
  message: string;
  suggestion?: string;
}

/**
 * Compiler plugin interface
 * Plugins implement this to generate events and provide rendering
 */
export interface CompilerPlugin {
  /** Plugin name (unique identifier) */
  name: string;

  /** Plugin version (semver) */
  version: string;

  /** Event types this plugin subscribes to (reads) */
  subscribesTo: string[];

  /** Event kinds this plugin emits (writes) */
  emits: string[];

  /**
   * Process events and generate new events
   * Called during compilation Pass 2
   *
   * @param events - All IR events so far (from tracks + previous plugins)
   * @param context - Compiler context (fps, anchors, devices, etc.)
   * @returns New events to add to IR
   */
  process(events: TrackEvent[], context: CompilerContext): TrackEvent[];

  /**
   * Rendering track definition (optional)
   * If provided, plugin will register this track for rendering
   */
  renderTrack?: RenderTrackDefinition;

  /**
   * Validate final IR after all plugins have run (optional)
   * Called during compilation Pass 4
   *
   * @param ir - Final compiled IR
   * @returns Validation result
   */
  validate?(ir: TrackEpisodeIR): ValidationResult;

  /**
   * Plugin dependencies (optional)
   * List of plugin names that must run before this one
   */
  dependsOn?: string[];
}
