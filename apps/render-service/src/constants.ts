import path from 'node:path'
import { fileURLToPath } from 'node:url'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export const renderServiceRoot = path.resolve(dirname, '..')
export const repoRoot = path.resolve(renderServiceRoot, '..', '..')
export const videoRunnerRoot = path.join(repoRoot, 'apps', 'video-runner')
export const videoRunnerEntryPoint = path.join(videoRunnerRoot, 'src', 'render-index.ts')
export const outputRoot = path.join(repoRoot, 'out')
export const rendersRoot = path.join(outputRoot, 'renders')
export const releaseCompositionId = 'episode-render'
