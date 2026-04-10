import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { beforeAll, describe, expect, it } from 'vitest'
import {
  createVariant,
  listArtifacts,
  listVariantsForArtifact,
  syncArtifactManifestsFromDisk,
} from './service'

const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'tokovo-publishing-'))
const artifactRoot = path.join(tempRoot, 'out')
const dbPath = path.join(tempRoot, 'metadata.db')

beforeAll(() => {
  process.env.PUBLISHING_ARTIFACT_SCAN_ROOT = artifactRoot
  process.env.PUBLISHING_DB_PATH = dbPath

  fs.mkdirSync(artifactRoot, { recursive: true })
  fs.writeFileSync(
    path.join(artifactRoot, 'demo.mp4.artifact.json'),
    JSON.stringify({
      id: 'artifact_demo',
      episodeId: 'demo-episode',
      sourceHash: 'hash123',
      videoPath: '/tmp/demo.mp4',
      durationMs: 15000,
      createdAt: '2026-04-10T10:00:00.000Z',
    }),
  )
})

describe('publishing service', () => {
  it('syncs artifact manifests from disk into the local registry', () => {
    expect(syncArtifactManifestsFromDisk()).toBeGreaterThan(0)
    expect(listArtifacts()).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 'artifact_demo',
          episodeId: 'demo-episode',
        }),
      ]),
    )
  })

  it('creates ready variants for stored artifacts', () => {
    const variant = createVariant({
      artifactId: 'artifact_demo',
      platform: 'x',
      caption: 'hello world',
      settingsJson: '{"thread":false}',
    })

    expect(variant.status).toBe('ready')
    expect(listVariantsForArtifact('artifact_demo')).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: variant.id, platform: 'x' })]),
    )
  })
})
