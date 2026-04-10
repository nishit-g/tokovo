import type { CalculateMetadataFunction } from "remotion";
import type { EpisodeRendererProps } from "./episode-renderer-contract";
import { getEpisodeRenderData, primeEpisodeRenderData } from "./render-data";

export const calculateEpisodeMetadata: CalculateMetadataFunction<
  EpisodeRendererProps
> = async ({ props, abortSignal, isRendering }) => {
  if (props.renderData) {
    return {
      durationInFrames: props.renderData.durationInFrames,
      fps: props.renderData.format.fps,
      width: props.renderData.format.width,
      height: props.renderData.format.height,
      defaultOutName: props.episodeId,
      props,
    };
  }

  if (isRendering) {
    const renderData = await getEpisodeRenderData(props.episodeId, abortSignal);
    return {
      durationInFrames: renderData.durationInFrames,
      fps: renderData.format.fps,
      width: renderData.format.width,
      height: renderData.format.height,
      defaultOutName: props.episodeId,
      props: {
        episodeId: props.episodeId,
        renderData,
      },
    };
  }

  const renderData = await primeEpisodeRenderData(props.episodeId, abortSignal);

  return {
    durationInFrames: renderData.durationInFrames,
    fps: renderData.format.fps,
    width: renderData.format.width,
    height: renderData.format.height,
    defaultOutName: props.episodeId,
    props: {
      episodeId: props.episodeId,
      renderDataKey: renderData.cacheKey,
    },
  };
};
