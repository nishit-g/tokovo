import { z } from "zod";
import type { EpisodeRenderData } from "./render-data";
import type { CameraRenderLayer } from "@tokovo/composition";

export type EpisodeRendererProps = {
  episodeId: string;
  renderDataKey?: string;
  renderData?: EpisodeRenderData;
  /** Selects a prepared Camera VNext plan without rebuilding story state. */
  cameraPlanId?: string;
  /**
   * Internal export override. Local fast previews may use the reference SVG
   * painter; release jobs omit this and therefore require the texture backend.
   */
  cameraProjectionMode?: "preview";
  /** Internal layer selection used by the offline texture compositor. */
  cameraRenderLayer?: CameraRenderLayer;
};

export const episodeRendererSchema = z.object({
  episodeId: z.string(),
  renderDataKey: z.string().optional(),
  renderData: z.unknown().optional(),
  cameraPlanId: z.string().optional(),
  cameraProjectionMode: z.literal("preview").optional(),
  cameraRenderLayer: z
    .enum(["final", "underlay", "camera-plate", "camera-projection-data", "foreground-plate"])
    .optional(),
});
