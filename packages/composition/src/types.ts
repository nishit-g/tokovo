import type { PreparedTrackEpisode } from "@tokovo/compiler";
import type { EngineRegistries } from "@tokovo/core";
import type { BackgroundConfigIR, VoiceConfig } from "@tokovo/ir";
import type { PluginManagerClass } from "@tokovo/react";
import type {
  CinematicCameraDebugFrame,
  RendererRegistries,
} from "@tokovo/renderer";
import type { VoiceManifest } from "@tokovo/voice";

export type SerializablePreparedEpisode = Pick<
  PreparedTrackEpisode,
  | "id"
  | "fps"
  | "durationInFrames"
  | "events"
  | "keyframeInterval"
  | "eventSignature"
  | "initialWorld"
  | "inputProgram"
  | "notificationProgram"
  | "cinematics"
  | "assetRefs"
  | "metadata"
>;

export interface SerializableEpisodeRenderData {
  episodeId: string;
  sourceSignature: string;
  durationInFrames: number;
  format: {
    width: number;
    height: number;
    fps: number;
  };
  prepared: SerializablePreparedEpisode;
  backgroundConfig: BackgroundConfigIR | null;
  voiceConfig: VoiceConfig | null;
  voiceManifest: VoiceManifest | null;
}

export interface EpisodeCompositionRuntime {
  pluginManager: PluginManagerClass;
  rendererRegistries: RendererRegistries;
  engineRegistries: EngineRegistries;
}

export type CameraRenderLayer =
  | "final"
  | "underlay"
  | "camera-plate"
  | "camera-projection-data"
  | "foreground-plate";

export interface EpisodeCompositionProps {
  [key: string]: unknown;
  episodeId: string;
  renderData: SerializableEpisodeRenderData;
  runtime: EpisodeCompositionRuntime;
  cameraPlanId?: string;
  cameraProjectionMode?: "preview" | "render";
  cameraRenderLayer?: CameraRenderLayer;
  cameraDebugEnabled?: boolean;
  onCinematicCameraDebugFrame?: (
    frame: CinematicCameraDebugFrame,
  ) => void;
}
