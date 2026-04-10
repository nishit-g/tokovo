import React from "react";
import { Composition, Folder } from "remotion";
import { z } from "zod";

import { EpisodeRenderer } from "./EpisodeRenderer";
import { calculateEpisodeMetadata } from "./episode-metadata";
import { RenderRuntimeProvider } from "./RenderRuntimeContext";
import { RELEASE_COMPOSITION_ID } from "./Root";

const episodeRendererSchema = z.object({
  episodeId: z.string(),
  renderDataKey: z.string().optional(),
  renderData: z.unknown().optional(),
});

export const RenderRemotionRoot: React.FC = () => {
  return (
    <RenderRuntimeProvider>
      <Folder name="System">
        <Composition
          id={RELEASE_COMPOSITION_ID}
          component={EpisodeRenderer}
          durationInFrames={300}
          fps={30}
          width={1080}
          height={1920}
          defaultProps={{ episodeId: "mega-x" }}
          calculateMetadata={calculateEpisodeMetadata}
          schema={episodeRendererSchema as any}
        />
      </Folder>
    </RenderRuntimeProvider>
  );
};
