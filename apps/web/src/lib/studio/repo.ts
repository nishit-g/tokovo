import fs from 'node:fs'
import path from 'node:path'

let cachedRepoRoot: string | null = null

function isRepoRoot(candidate: string): boolean {
  const packageJsonPath = path.join(candidate, 'package.json')
  if (!fs.existsSync(packageJsonPath)) return false
  try {
    const parsed = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8')) as {
      name?: string
    }
    return parsed.name === 'tokovo-monorepo'
  } catch {
    return false
  }
}

export function getRepoRoot(): string {
  if (cachedRepoRoot) return cachedRepoRoot

  let current = process.cwd()
  while (true) {
    if (isRepoRoot(current)) {
      cachedRepoRoot = current
      return current
    }
    const parent = path.dirname(current)
    if (parent === current) {
      throw new Error('Unable to locate Tokovo repo root from apps/web')
    }
    current = parent
  }
}

export function resolveRepoPath(relativePath: string): string {
  return path.join(getRepoRoot(), relativePath)
}

export function resolvePublicAssetPath(publicPath: string): string | null {
  if (!publicPath.startsWith('/')) return null
  const relative = publicPath.replace(/^\//, '')
  const candidates = [
    resolveRepoPath(path.join('apps/video-runner/public', relative)),
    resolveRepoPath(path.join('apps/web/public', relative)),
  ]
  return candidates.find((candidate) => fs.existsSync(candidate)) ?? null
}
