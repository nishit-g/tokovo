import { getEpisodeAssetRefs } from "./render-data";

async function main(): Promise<void> {
  const episodeId = process.argv[2] ?? process.env.EPISODE_ID ?? "payload-first-smoke";
  const originalConsoleLog = console.log;
  const originalConsoleInfo = console.info;
  const originalConsoleWarn = console.warn;

  console.log = () => {};
  console.info = () => {};
  console.warn = () => {};

  try {
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
  } finally {
    console.log = originalConsoleLog;
    console.info = originalConsoleInfo;
    console.warn = originalConsoleWarn;
  }
}

main().catch((error) => {
  process.stderr.write(
    `${JSON.stringify(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Unknown asset-refs error",
      },
      null,
      2,
    )}\n`,
  );
  process.exit(1);
});
