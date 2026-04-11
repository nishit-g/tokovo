import { getEpisodeAssetRefs } from "./render-data";

async function main(): Promise<void> {
  const episodeId =
    process.argv[2] ?? process.env.EPISODE_ID ?? "render-service-smoke";
  const assetRefs = getEpisodeAssetRefs(episodeId);
  process.stdout.write(
    `${JSON.stringify(
      {
        ok: true,
        episodeId,
        assetRefs,
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
        error:
          error instanceof Error ? error.message : "Unknown asset-refs error",
      },
      null,
      2,
    )}\n`,
  );
  process.exit(1);
});
