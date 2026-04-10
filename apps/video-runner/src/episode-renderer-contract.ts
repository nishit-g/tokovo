import { z } from "zod";
import type { EpisodeRenderData } from "./render-data";

export type EpisodeRendererProps = {
  episodeId: string;
  renderDataKey?: string;
  renderData?: EpisodeRenderData;
};

export const episodeRendererSchema = z.object({
  episodeId: z.string(),
  renderDataKey: z.string().optional(),
  renderData: z.unknown().optional(),
});
