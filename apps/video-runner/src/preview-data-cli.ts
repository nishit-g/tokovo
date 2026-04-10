import { getEpisodeRenderData } from './render-data'

async function main(): Promise<void> {
  const episodeId = process.argv[2] ?? process.env.EPISODE_ID ?? 'payload-first-smoke'
  const originalConsoleLog = console.log
  const originalConsoleInfo = console.info
  const originalConsoleWarn = console.warn

  console.log = () => {}
  console.info = () => {}
  console.warn = () => {}

  const renderData = await getEpisodeRenderData(episodeId)
  try {
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
    )
  } finally {
    console.log = originalConsoleLog
    console.info = originalConsoleInfo
    console.warn = originalConsoleWarn
  }
}

main().catch((error) => {
  process.stderr.write(
    `${JSON.stringify(
      {
        ok: false,
        error: error instanceof Error ? error.message : 'Unknown preview-data error',
      },
      null,
      2,
    )}\n`,
  )
  process.exit(1)
})
