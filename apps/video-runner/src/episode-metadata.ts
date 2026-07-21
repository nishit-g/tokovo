import type { CalculateMetadataFunction } from "remotion";
import type { EpisodeRendererProps } from "./episode-renderer-contract";
import type { EpisodeRenderData } from "./render-data";
import {
  getCachedEpisodeRenderData,
  getEpisodeRenderData,
  primeEpisodeRenderData,
} from "./render-data";

function compositionDimensions(
  renderData: EpisodeRenderData,
  cameraRenderLayer: EpisodeRendererProps["cameraRenderLayer"],
): { width: number; height: number } {
  if (cameraRenderLayer === "camera-projection-data") {
    return { width: 2, height: 2 };
  }
  if (cameraRenderLayer !== "camera-plate") {
    return renderData.format;
  }
  const stageProgram = renderData.prepared.cinematics?.stageProgram.program;
  const root = stageProgram?.nodes.find((node) => node.id === stageProgram.rootNodeId);
  if (!root) {
    throw new Error(
      "CAM_TEXTURE_STAGE_ROOT_MISSING: A camera plate requires a prepared VNext stage root.",
    );
  }
  if (root.localBounds.x !== 0 || root.localBounds.y !== 0) {
    throw new Error(
      `CAM_TEXTURE_STAGE_ORIGIN_INVALID: Camera plate stage roots must begin at 0,0; received ${root.localBounds.x},${root.localBounds.y}.`,
    );
  }
  return {
    width: root.localBounds.width,
    height: root.localBounds.height,
  };
}

export const calculateEpisodeMetadata: CalculateMetadataFunction<EpisodeRendererProps> = async ({
  props,
  abortSignal,
  isRendering,
}) => {
  if (props.renderData) {
    const dimensions = compositionDimensions(props.renderData, props.cameraRenderLayer);
    return {
      durationInFrames: props.renderData.durationInFrames,
      fps: props.renderData.format.fps,
      width: dimensions.width,
      height: dimensions.height,
      defaultOutName: props.episodeId,
      props,
    };
  }

  if (isRendering) {
    const renderData = await getEpisodeRenderData(props.episodeId, abortSignal);
    const dimensions = compositionDimensions(renderData, props.cameraRenderLayer);
    return {
      durationInFrames: renderData.durationInFrames,
      fps: renderData.format.fps,
      width: dimensions.width,
      height: dimensions.height,
      defaultOutName: props.episodeId,
      props: {
        episodeId: props.episodeId,
        renderData,
        cameraPlanId: props.cameraPlanId,
        cameraProjectionMode: props.cameraProjectionMode,
        cameraRenderLayer: props.cameraRenderLayer,
      },
    };
  }

  const renderData = await primeEpisodeRenderData(props.episodeId, abortSignal);
  const cachedRenderData = getCachedEpisodeRenderData(renderData.cacheKey);
  if (
    (props.cameraRenderLayer === "camera-plate" ||
      props.cameraRenderLayer === "camera-projection-data") &&
    !cachedRenderData
  ) {
    throw new Error("CAM_TEXTURE_RENDER_DATA_MISSING: Primed camera render data was not cached.");
  }
  const dimensions =
    cachedRenderData &&
    (props.cameraRenderLayer === "camera-plate" ||
      props.cameraRenderLayer === "camera-projection-data")
      ? compositionDimensions(cachedRenderData, props.cameraRenderLayer)
      : renderData.format;

  return {
    durationInFrames: renderData.durationInFrames,
    fps: renderData.format.fps,
    width: dimensions.width,
    height: dimensions.height,
    defaultOutName: props.episodeId,
    props: {
      episodeId: props.episodeId,
      renderDataKey: renderData.cacheKey,
      cameraPlanId: props.cameraPlanId,
      cameraProjectionMode: props.cameraProjectionMode,
      cameraRenderLayer: props.cameraRenderLayer,
    },
  };
};
