import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'

import { bundle } from '@remotion/bundler'
import {
  openBrowser,
  renderMedia,
  renderStill,
  selectComposition,
} from '@remotion/renderer'

import { releaseCompositionId, repoRoot, videoRunnerEntryPoint, videoRunnerRoot } from './constants'
import { getBrowserExecutable, getPublicAssetBaseUrl } from './env'
import { type RenderLogger } from './logger'
import { type RenderProfile } from './profiles'
import { createPresignedAssetUrlMap } from './storage'

const rootConfigFiles = [
  'package.json',
  'pnpm-lock.yaml',
  'pnpm-workspace.yaml',
  'turbo.json',
  'tsconfig.json',
]

let serveUrlPromise: Promise<string> | null = null
let serveUrlSignature = ''
let browserPromise: Promise<Awaited<ReturnType<typeof openBrowser>>> | null = null
const videoRunnerCliDir = path.join(repoRoot, 'apps', 'render-service')
const assetRefsCliPath = path.join(repoRoot, 'apps', 'video-runner', 'src', 'asset-refs-cli.ts')
const previewDataCliPath = path.join(repoRoot, 'apps', 'video-runner', 'src', 'preview-data-cli.ts')

function readJson(filePath: string): Record<string, unknown> {
  return JSON.parse(fs.readFileSync(filePath, 'utf8')) as Record<string, unknown>
}

function runVideoRunnerCliJson<T>(
  scriptPath: string,
  args: string[],
  env?: Record<string, string>,
): T {
  const stdout = execFileSync(
    'node',
    ['--import', 'tsx', scriptPath, ...args],
    {
      cwd: videoRunnerCliDir,
      encoding: 'utf8',
      env: {
        ...process.env,
        ...env,
      },
    },
  )
  return JSON.parse(stdout) as T
}

function getEpisodeAssetSources(episodeId: string): string[] {
  const result = runVideoRunnerCliJson<{
    ok: boolean
    assetRefs: Array<{ src: string }>
  }>(assetRefsCliPath, [episodeId])
  return result.assetRefs.map((ref) => ref.src)
}

function getPreparedRenderData(input: {
  episodeId: string
  assetUrlMap: Record<string, string>
}) {
  const env =
    Object.keys(input.assetUrlMap).length > 0
      ? { TOKOVO_ASSET_URL_MAP: JSON.stringify(input.assetUrlMap) }
      : undefined
  const result = runVideoRunnerCliJson<{
    ok: boolean
    preview: {
      inputProps: {
        renderData: Record<string, unknown>
      }
    }
  }>(previewDataCliPath, [input.episodeId], env)
  return result.preview.inputProps.renderData
}

function listGitLines(args: string[]): string[] {
  return execFileSync('git', args, {
    cwd: repoRoot,
    encoding: 'utf8',
  })
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
}

function getGitScalar(args: string[], fallback = ''): string {
  try {
    return execFileSync('git', args, {
      cwd: repoRoot,
      encoding: 'utf8',
    }).trim()
  } catch {
    return fallback
  }
}

function toPosixPath(filePath: string): string {
  return filePath.split(path.sep).join('/')
}

function getWorkspacePackageDirs(): Map<string, string> {
  const packagesDir = path.join(repoRoot, 'packages')
  const appsDir = path.join(repoRoot, 'apps')
  const packageDirs = new Map<string, string>()

  for (const rootDir of [packagesDir, appsDir]) {
    if (!fs.existsSync(rootDir)) continue
    for (const entry of fs.readdirSync(rootDir, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue
      const packageDir = path.join(rootDir, entry.name)
      const packageJsonPath = path.join(packageDir, 'package.json')
      if (!fs.existsSync(packageJsonPath)) continue
      const packageJson = readJson(packageJsonPath)
      if (typeof packageJson.name === 'string') {
        packageDirs.set(packageJson.name, packageDir)
      }
    }
  }

  return packageDirs
}

function getWorkspaceDependencyNames(packageJson: Record<string, unknown>): string[] {
  const names = new Set<string>()
  for (const field of ['dependencies', 'devDependencies', 'optionalDependencies', 'peerDependencies']) {
    const record = packageJson[field] as Record<string, string> | undefined
    for (const name of Object.keys(record ?? {})) {
      if (name.startsWith('@tokovo/') || name === '@tokovo/render-service' || name === 'video-runner') {
        names.add(name)
      }
    }
  }

  return [...names]
}

function resolveBundleRoots(): string[] {
  const packageDirs = getWorkspacePackageDirs()
  const roots = new Set([videoRunnerRoot, path.join(repoRoot, 'apps', 'render-service')])
  const queue = [...roots]
  const visited = new Set<string>()

  while (queue.length > 0) {
    const currentDir = queue.shift()
    if (!currentDir) continue
    const packageJsonPath = path.join(currentDir, 'package.json')
    if (!fs.existsSync(packageJsonPath)) continue
    const packageJson = readJson(packageJsonPath)
    const packageName =
      typeof packageJson.name === 'string' ? packageJson.name : currentDir
    if (visited.has(packageName)) continue
    visited.add(packageName)

    for (const dependencyName of getWorkspaceDependencyNames(packageJson)) {
      const dependencyDir = packageDirs.get(dependencyName)
      if (!dependencyDir) continue
      if (!roots.has(dependencyDir)) roots.add(dependencyDir)
      queue.push(dependencyDir)
    }
  }

  return [...roots].sort()
}

function getRelevantPathspecs(): string[] {
  const bundleRoots = resolveBundleRoots().map((dir) =>
    toPosixPath(path.relative(repoRoot, dir)),
  )
  const publicDir = path.join(videoRunnerRoot, 'public')
  const configFiles = rootConfigFiles.filter((file) =>
    fs.existsSync(path.join(repoRoot, file)),
  )
  if (fs.existsSync(publicDir)) {
    bundleRoots.push(toPosixPath(path.relative(repoRoot, publicDir)))
  }
  return [...configFiles, ...bundleRoots]
}

function getDirtyFiles(pathspecs: string[]): Set<string> {
  const statusLines = listGitLines([
    'status',
    '--short',
    '--untracked-files=normal',
    '--',
    ...pathspecs,
  ])
  const dirtyFiles = new Set<string>()

  for (const line of statusLines) {
    const match = line.match(/^[ MARCUD?!]{2}\s+(.+)$/)
    if (!match?.[1]) continue
    const relativePath = match[1].split(' -> ').pop()?.trim()
    if (relativePath) dirtyFiles.add(relativePath)
  }

  return dirtyFiles
}

function getFileSignature(relativePath: string): string {
  const absolutePath = path.join(repoRoot, relativePath)
  if (!fs.existsSync(absolutePath)) return `${relativePath}:deleted`

  const stat = fs.statSync(absolutePath)
  if (stat.isDirectory()) return `${relativePath}:directory:${stat.mtimeMs}`
  return `${relativePath}:file:${stat.size}:${Math.trunc(stat.mtimeMs)}`
}

export function createSourceSignature(): string {
  const pathspecs = getRelevantPathspecs()
  const dirtyFiles = getDirtyFiles(pathspecs)
  const headRevision = getGitScalar(['rev-parse', 'HEAD'], 'no-git-head')
  const studioCatalogMode = process.env.TOKOVO_STUDIO_CATALOG ?? '0'
  const signatureParts = [
    `head:${headRevision}`,
    `studioCatalog:${studioCatalogMode}`,
    `roots:${pathspecs.join('|')}`,
    ...[...dirtyFiles].sort().map((relativePath) => getFileSignature(relativePath)),
  ]

  return createHash('sha256')
    .update(signatureParts.join('\n'))
    .digest('hex')
    .slice(0, 32)
}

export async function getServeUrl(logger?: RenderLogger): Promise<{ serveUrl: string; sourceSignature: string }> {
  const studioCatalogMode = process.env.TOKOVO_STUDIO_CATALOG ?? '0'
  const sourceSignature = createSourceSignature()
  if (serveUrlPromise && serveUrlSignature === sourceSignature) {
    return { serveUrl: await serveUrlPromise, sourceSignature }
  }

  const bundleDir = path.join(repoRoot, '.remotion', 'bundles', sourceSignature)
  const indexPath = path.join(bundleDir, 'index.html')
  if (fs.existsSync(indexPath)) {
    await logger?.info('bundle.reuse', 'Reusing cached Remotion bundle', {
      sourceSignature,
      bundleDir,
    })
    serveUrlSignature = sourceSignature
    serveUrlPromise = Promise.resolve(bundleDir)
    return { serveUrl: bundleDir, sourceSignature }
  }

  fs.mkdirSync(bundleDir, { recursive: true })
  await logger?.info('bundle.start', 'Bundling Remotion entrypoint', {
    sourceSignature,
    bundleDir,
  })
  serveUrlSignature = sourceSignature
  const previousStudioCatalog = process.env.TOKOVO_STUDIO_CATALOG
  process.env.TOKOVO_STUDIO_CATALOG = studioCatalogMode
  serveUrlPromise = bundle({
    entryPoint: videoRunnerEntryPoint,
    outDir: bundleDir,
    rootDir: videoRunnerRoot,
    enableCaching: true,
  }).finally(() => {
    if (previousStudioCatalog === undefined) {
      delete process.env.TOKOVO_STUDIO_CATALOG
    } else {
      process.env.TOKOVO_STUDIO_CATALOG = previousStudioCatalog
    }
  })
  const serveUrl = await serveUrlPromise
  await logger?.info('bundle.done', 'Bundled Remotion entrypoint', {
    sourceSignature,
    bundleDir,
  })
  return { serveUrl, sourceSignature }
}

export async function getBrowser(logger?: RenderLogger) {
  if (!browserPromise) {
    await logger?.info('browser.launch', 'Launching reusable render browser', {
      browserExecutable: getBrowserExecutable() ?? 'auto',
    })
    browserPromise = openBrowser('chrome', {
      browserExecutable: getBrowserExecutable(),
      chromeMode: 'headless-shell',
      chromiumOptions: {
        gl: 'angle',
        enableMultiProcessOnLinux: false,
      },
      logLevel: 'error',
    })
  }

  const browser = await browserPromise
  await logger?.info('browser.open', 'Opened reusable render browser', {
    browserExecutable: getBrowserExecutable() ?? 'auto',
  })
  return browser
}

export async function closeBrowser(): Promise<void> {
  if (!browserPromise) return
  const browser = await browserPromise
  await browser.close({ silent: true })
  browserPromise = null
}

export async function renderEpisodeMedia(input: {
  episodeId: string
  profile: RenderProfile
  outputLocation: string
  posterLocation: string
  logger: RenderLogger
}) {
  const browser = await getBrowser(input.logger)
  const publicAssetBaseUrl = getPublicAssetBaseUrl()
  const assetSources = getEpisodeAssetSources(input.episodeId)
  const presignedAssetUrlMap = await createPresignedAssetUrlMap(
    assetSources,
    Math.max(3600, Math.floor(input.profile.timeoutInMilliseconds / 1000) + 300),
  )
  const renderData = getPreparedRenderData({
    episodeId: input.episodeId,
    assetUrlMap: presignedAssetUrlMap,
  })
  const inputProps = {
    episodeId: input.episodeId,
    renderData,
  }
  const renderEnvVariables = {
    TOKOVO_RENDER_PROFILE: input.profile.id,
    TOKOVO_RENDER_EXECUTOR: 'render-service',
    ...(publicAssetBaseUrl
      ? { TOKOVO_PUBLIC_ASSET_BASE_URL: publicAssetBaseUrl }
      : {}),
    ...(Object.keys(presignedAssetUrlMap).length > 0
      ? { TOKOVO_ASSET_URL_MAP: JSON.stringify(presignedAssetUrlMap) }
      : {}),
  }
  const bundleStartedAt = Date.now()
  const { serveUrl, sourceSignature } = await getServeUrl(input.logger)
  const bundleMs = Date.now() - bundleStartedAt

  const selectStartedAt = Date.now()
  await input.logger.info('composition.select.start', 'Selecting composition', {
    compositionId: releaseCompositionId,
    episodeId: input.episodeId,
    serveUrl,
    precomputedAssetCount: assetSources.length,
    signedAssetCount: Object.keys(presignedAssetUrlMap).length,
  })
  const composition = await selectComposition({
    serveUrl,
    id: releaseCompositionId,
    inputProps,
    browserExecutable: getBrowserExecutable(),
    puppeteerInstance: browser,
    timeoutInMilliseconds: input.profile.timeoutInMilliseconds,
    envVariables: renderEnvVariables,
    logLevel: 'error',
  })
  const selectCompositionMs = Date.now() - selectStartedAt
  await input.logger.info('composition.select.done', 'Selected composition', {
    compositionId: composition.id,
    durationInFrames: composition.durationInFrames,
    fps: composition.fps,
    width: composition.width,
    height: composition.height,
    durationMs: selectCompositionMs,
  })

  const renderStartedAt = Date.now()
  await input.logger.info('render.media.start', 'Rendering video artifact', {
    outputLocation: input.outputLocation,
    concurrency: Math.max(1, Math.min(input.profile.concurrency, os.cpus().length)),
  })
  await renderMedia({
    composition,
    serveUrl,
    inputProps,
    outputLocation: input.outputLocation,
    codec: input.profile.codec,
    audioCodec: input.profile.audioCodec,
    concurrency: Math.max(1, Math.min(input.profile.concurrency, os.cpus().length)),
    videoBitrate: input.profile.videoBitrate,
    x264Preset: input.profile.x264Preset,
    hardwareAcceleration: input.profile.hardwareAcceleration,
    browserExecutable: getBrowserExecutable(),
    puppeteerInstance: browser,
    timeoutInMilliseconds: input.profile.timeoutInMilliseconds,
    imageFormat: input.profile.imageFormat,
    chromiumOptions: {
      gl: input.profile.chromiumGl,
    },
    envVariables: renderEnvVariables,
    overwrite: true,
    logLevel: 'error',
  })
  const renderMediaMs = Date.now() - renderStartedAt
  await input.logger.info('render.media.done', 'Rendered video artifact', {
    outputLocation: input.outputLocation,
    durationMs: renderMediaMs,
  })

  const stillStartedAt = Date.now()
  await input.logger.info('render.poster.start', 'Rendering poster frame', {
    outputLocation: input.posterLocation,
  })
  await renderStill({
    composition,
    serveUrl,
    inputProps,
    output: input.posterLocation,
    imageFormat: 'png',
    frame: Math.max(0, Math.floor(composition.durationInFrames / 2)),
    browserExecutable: getBrowserExecutable(),
    puppeteerInstance: browser,
    timeoutInMilliseconds: input.profile.timeoutInMilliseconds,
    chromiumOptions: {
      gl: input.profile.chromiumGl,
    },
    envVariables: renderEnvVariables,
    overwrite: true,
    logLevel: 'error',
  })
  const renderStillMs = Date.now() - stillStartedAt
  await input.logger.info('render.poster.done', 'Rendered poster frame', {
    outputLocation: input.posterLocation,
    durationMs: renderStillMs,
  })

  return {
    sourceSignature,
    composition,
    timingMs: {
      bundle: bundleMs,
      selectComposition: selectCompositionMs,
      renderMedia: renderMediaMs,
      renderStill: renderStillMs,
    },
  }
}
