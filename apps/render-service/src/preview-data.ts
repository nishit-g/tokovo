import { getEpisodeRenderData } from "video-runner/render-data";

const DEFAULT_EPISODE_ID = "v2-creator-series-showcase";

async function main(): Promise<void> {
  const episodeId = process.argv[2] ?? process.env.EPISODE_ID ?? DEFAULT_EPISODE_ID;
  const renderData = await getEpisodeRenderData(episodeId);
  process.stdout.write(
    `${JSON.stringify(
      {
        ok: true,
        preview: {
          episodeId,
          durationInFrames: renderData.durationInFrames,
          fps: renderData.format.fps,
          width: renderData.format.width,
          height: renderData.format.height,
          inputProps: {
            episodeId,
            renderData,
          },
        },
      },
      null,
      2,
    )}\n`,
  );
}

main().catch((error) => {
  process.stderr.write(
    `${JSON.stringify(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Unknown preview-data error",
      },
      null,
      2,
    )}\n`,
  );
  process.exit(1);
});
