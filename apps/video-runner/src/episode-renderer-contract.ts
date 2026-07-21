import { z } from "zod";
import type { EpisodeRenderData } from "./render-data";

export type EpisodeRendererProps = {
  episodeId: string;
  renderDataKey?: string;
  renderData?: EpisodeRenderData;
  /** Selects a prepared Camera VNext plan without rebuilding story state. */
  cameraPlanId?: string;
};

export const episodeRendererSchema = z.object({
  episodeId: z.string(),
  renderDataKey: z.string().optional(),
  renderData: z.unknown().optional(),
  cameraPlanId: z.string().optional(),
});
