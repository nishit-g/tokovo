import React from "react";
import { Composition, Folder } from "remotion";

import { EpisodeRenderer } from "./EpisodeRenderer";
import { calculateEpisodeMetadata } from "./episode-metadata";
import { episodeRendererSchema } from "./episode-renderer-contract";
import { RenderRuntimeProvider } from "./RenderRuntimeContext";
import { RELEASE_COMPOSITION_ID } from "./Root";

const DEFAULT_RELEASE_EPISODE_ID = "v2-creator-series-showcase";

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
          defaultProps={{ episodeId: DEFAULT_RELEASE_EPISODE_ID }}
          calculateMetadata={calculateEpisodeMetadata}
          schema={episodeRendererSchema}
        />
      </Folder>
    </RenderRuntimeProvider>
  );
};
