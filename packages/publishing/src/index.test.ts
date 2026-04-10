import { describe, expect, it } from 'vitest'
import { normalizePlatform, normalizePublishStatus, renderArtifactManifestSchema } from './index'

describe('@tokovo/publishing', () => {
  it('normalizes supported Postiz provider labels into Tokovo platforms', () => {
    expect(normalizePlatform('twitter')).toBe('x')
    expect(normalizePlatform('linkedin-company')).toBe('linkedin')
    expect(normalizePlatform('instagram-business')).toBe('instagram')
    expect(normalizePlatform('youtube-channel')).toBe('youtube')
  })

  it('maps unknown provider statuses into Tokovo lifecycle defaults', () => {
    expect(normalizePublishStatus('queue')).toBe('scheduled')
    expect(normalizePublishStatus('error')).toBe('failed')
    expect(normalizePublishStatus('anything-else')).toBe('draft')
  })

  it('validates the shared artifact manifest contract', () => {
    const manifest = renderArtifactManifestSchema.parse({
      id: 'artifact_123',
      episodeId: 'demo-episode',
      sourceHash: 'abc123',
      videoPath: '/tmp/demo.mp4',
      durationMs: 12000,
      createdAt: '2026-04-10T10:00:00.000Z',
    })

    expect(manifest.videoPath).toContain('demo.mp4')
  })
})
