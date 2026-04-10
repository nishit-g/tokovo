import fs from 'node:fs'
import path from 'node:path'
import { createHash, randomUUID } from 'node:crypto'
import {
  normalizePublishStatus,
  publishVariantSchema,
  renderArtifactManifestSchema,
  scheduledPostSchema,
  type PostizPostReference,
  type PostizUpload,
  type PublishVariant,
  type PublishingChannel,
  type RenderArtifact,
  type RenderArtifactManifest,
  type ScheduledPost,
} from '@tokovo/publishing'
import { getArtifactScanRoot } from './config'
import { getPublishingDb } from './db'
import { PostizPublisher } from './postiz'

type SqliteRecord = Record<string, unknown>

function now(): string {
  return new Date().toISOString()
}

function mapArtifact(row: SqliteRecord): RenderArtifact {
  return {
    id: String(row.id),
    episodeId: String(row.episode_id),
    sourceHash: String(row.source_hash),
    videoPath: String(row.video_path),
    thumbnailPath: typeof row.thumbnail_path === 'string' ? row.thumbnail_path : undefined,
    durationMs: Number(row.duration_ms),
    createdAt: String(row.created_at),
    syncedAt: String(row.synced_at),
  }
}

function mapChannel(row: SqliteRecord): PublishingChannel {
  return {
    id: String(row.id),
    platform: String(row.platform) as PublishingChannel['platform'],
    postizIntegrationId: String(row.postiz_integration_id),
    displayName: String(row.display_name),
    status: String(row.status) as PublishingChannel['status'],
    metadataJson: typeof row.metadata_json === 'string' ? row.metadata_json : null,
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  }
}

function mapVariant(row: SqliteRecord): PublishVariant {
  return publishVariantSchema.parse({
    id: String(row.id),
    artifactId: String(row.artifact_id),
    platform: String(row.platform),
    caption: String(row.caption),
    title: typeof row.title === 'string' ? row.title : null,
    settingsJson: String(row.settings_json),
    status: String(row.status),
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  })
}

function mapScheduledPost(row: SqliteRecord): ScheduledPost {
  return scheduledPostSchema.parse({
    id: String(row.id),
    variantId: String(row.variant_id),
    channelId: String(row.channel_id),
    scheduledAt: String(row.scheduled_at),
    timezone: String(row.timezone),
    status: String(row.status),
    postizPostId: typeof row.postiz_post_id === 'string' ? row.postiz_post_id : null,
    postizResponseJson:
      typeof row.postiz_response_json === 'string' ? row.postiz_response_json : null,
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  })
}

function walkDir(root: string, results: string[]): void {
  if (!fs.existsSync(root)) return
  for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
    const fullPath = path.join(root, entry.name)
    if (entry.isDirectory()) {
      walkDir(fullPath, results)
      continue
    }
    if (entry.isFile() && entry.name.endsWith('.artifact.json')) {
      results.push(fullPath)
    }
  }
}

function listArtifactManifestPaths(): string[] {
  const root = getArtifactScanRoot()
  const results: string[] = []
  walkDir(root, results)
  return results
}

function recordArtifactManifest(manifest: RenderArtifactManifest): void {
  const db = getPublishingDb()
  const syncedAt = now()
  db.prepare(`
    INSERT INTO render_artifacts (id, episode_id, source_hash, video_path, thumbnail_path, duration_ms, created_at, synced_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      episode_id = excluded.episode_id,
      source_hash = excluded.source_hash,
      video_path = excluded.video_path,
      thumbnail_path = excluded.thumbnail_path,
      duration_ms = excluded.duration_ms,
      created_at = excluded.created_at,
      synced_at = excluded.synced_at
  `).run(
    manifest.id,
    manifest.episodeId,
    manifest.sourceHash,
    manifest.videoPath,
    manifest.thumbnailPath ?? null,
    manifest.durationMs,
    manifest.createdAt,
    syncedAt,
  )
}

export function syncArtifactManifestsFromDisk(): number {
  let count = 0
  for (const manifestPath of listArtifactManifestPaths()) {
    const raw = fs.readFileSync(manifestPath, 'utf8')
    const manifest = renderArtifactManifestSchema.parse(JSON.parse(raw))
    recordArtifactManifest(manifest)
    count += 1
  }
  return count
}

export function listArtifacts(): RenderArtifact[] {
  syncArtifactManifestsFromDisk()
  const db = getPublishingDb()
  return db
    .prepare('SELECT * FROM render_artifacts ORDER BY created_at DESC')
    .all()
    .map((row) => mapArtifact(row as SqliteRecord))
}

export function getArtifact(artifactId: string): RenderArtifact | null {
  syncArtifactManifestsFromDisk()
  const row = getPublishingDb()
    .prepare('SELECT * FROM render_artifacts WHERE id = ?')
    .get(artifactId)
  return row ? mapArtifact(row as SqliteRecord) : null
}

export async function syncChannelsFromPostiz(): Promise<PublishingChannel[]> {
  const publisher = new PostizPublisher()
  const channels = await publisher.listChannels()
  const db = getPublishingDb()

  for (const channel of channels) {
    const timestamp = now()
    db.prepare(`
      INSERT INTO publishing_channels (id, platform, postiz_integration_id, display_name, status, metadata_json, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(postiz_integration_id) DO UPDATE SET
        id = excluded.id,
        platform = excluded.platform,
        display_name = excluded.display_name,
        status = excluded.status,
        metadata_json = excluded.metadata_json,
        updated_at = excluded.updated_at
    `).run(
      channel.id,
      channel.platform,
      channel.postizIntegrationId,
      channel.displayName,
      channel.status,
      channel.metadataJson ?? null,
      timestamp,
      timestamp,
    )
  }

  return listChannels()
}

export function listChannels(): PublishingChannel[] {
  return getPublishingDb()
    .prepare('SELECT * FROM publishing_channels ORDER BY platform, display_name')
    .all()
    .map((row) => mapChannel(row as SqliteRecord))
}

export function createVariant(input: {
  artifactId: string
  platform: PublishVariant['platform']
  caption: string
  title?: string
  settingsJson?: string
}): PublishVariant {
  const artifact = getArtifact(input.artifactId)
  if (!artifact) {
    throw new Error(`Unknown artifact: ${input.artifactId}`)
  }

  const timestamp = now()
  const id = `variant_${randomUUID()}`
  const settingsJson = input.settingsJson ?? JSON.stringify({})
  const db = getPublishingDb()

  db.prepare(`
    INSERT INTO publish_variants (id, artifact_id, platform, caption, title, settings_json, status, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    artifact.id,
    input.platform,
    input.caption,
    input.title ?? null,
    settingsJson,
    'ready',
    timestamp,
    timestamp,
  )

  const row = db.prepare('SELECT * FROM publish_variants WHERE id = ?').get(id)
  return mapVariant(row as SqliteRecord)
}

export function listVariantsForArtifact(artifactId: string): PublishVariant[] {
  return getPublishingDb()
    .prepare('SELECT * FROM publish_variants WHERE artifact_id = ? ORDER BY created_at DESC')
    .all(artifactId)
    .map((row) => mapVariant(row as SqliteRecord))
}

export function getVariant(variantId: string): PublishVariant | null {
  const row = getPublishingDb().prepare('SELECT * FROM publish_variants WHERE id = ?').get(variantId)
  return row ? mapVariant(row as SqliteRecord) : null
}

function getChannel(channelId: string): PublishingChannel | null {
  const row = getPublishingDb().prepare('SELECT * FROM publishing_channels WHERE id = ?').get(channelId)
  return row ? mapChannel(row as SqliteRecord) : null
}

function hashScheduleRequest(input: {
  variantId: string
  channelId: string
  scheduledAt: string
}): string {
  return createHash('sha256')
    .update(`${input.variantId}:${input.channelId}:${input.scheduledAt}`)
    .digest('hex')
    .slice(0, 12)
}

function upsertScheduledPostRecord(input: {
  id: string
  variantId: string
  channelId: string
  scheduledAt: string
  timezone: string
  status: string
  postizPostId?: string | null
  postizResponseJson?: string | null
}): ScheduledPost {
  const db = getPublishingDb()
  const timestamp = now()
  db.prepare(`
    INSERT INTO scheduled_posts (id, variant_id, channel_id, scheduled_at, timezone, status, postiz_post_id, postiz_response_json, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(variant_id, channel_id, scheduled_at) DO UPDATE SET
      status = excluded.status,
      postiz_post_id = excluded.postiz_post_id,
      postiz_response_json = excluded.postiz_response_json,
      updated_at = excluded.updated_at
  `).run(
    input.id,
    input.variantId,
    input.channelId,
    input.scheduledAt,
    input.timezone,
    input.status,
    input.postizPostId ?? null,
    input.postizResponseJson ?? null,
    timestamp,
    timestamp,
  )

  const row = db
    .prepare('SELECT * FROM scheduled_posts WHERE variant_id = ? AND channel_id = ? AND scheduled_at = ?')
    .get(input.variantId, input.channelId, input.scheduledAt)
  return mapScheduledPost(row as SqliteRecord)
}

function updateVariantStatus(variantId: string, status: string): void {
  getPublishingDb()
    .prepare('UPDATE publish_variants SET status = ?, updated_at = ? WHERE id = ?')
    .run(status, now(), variantId)
}

export async function scheduleVariant(input: {
  variantId: string
  channelId: string
  scheduledAt: string
  timezone: string
}): Promise<ScheduledPost> {
  const variant = getVariant(input.variantId)
  if (!variant) throw new Error(`Unknown variant: ${input.variantId}`)

  const channel = getChannel(input.channelId)
  if (!channel) throw new Error(`Unknown channel: ${input.channelId}`)

  const artifact = getArtifact(variant.artifactId)
  if (!artifact) throw new Error(`Unknown artifact: ${variant.artifactId}`)
  if (!fs.existsSync(artifact.videoPath)) {
    throw new Error(`Artifact video not found: ${artifact.videoPath}`)
  }

  const publisher = new PostizPublisher()
  const recordId = `sched_${hashScheduleRequest(input)}`

  updateVariantStatus(variant.id, 'ready')

  let upload: PostizUpload
  try {
    upload = await publisher.uploadMedia({ filePath: artifact.videoPath })
  } catch (error) {
    updateVariantStatus(variant.id, 'failed')
    return upsertScheduledPostRecord({
      id: recordId,
      variantId: variant.id,
      channelId: channel.id,
      scheduledAt: input.scheduledAt,
      timezone: input.timezone,
      status: 'failed',
      postizResponseJson: JSON.stringify({ stage: 'upload', message: String(error) }),
    })
  }

  let post: PostizPostReference
  try {
    post = await publisher.schedulePost({
      channel,
      variant,
      scheduledAt: input.scheduledAt,
      timezone: input.timezone,
      media: [upload],
    })
  } catch (error) {
    updateVariantStatus(variant.id, 'failed')
    return upsertScheduledPostRecord({
      id: recordId,
      variantId: variant.id,
      channelId: channel.id,
      scheduledAt: input.scheduledAt,
      timezone: input.timezone,
      status: 'failed',
      postizResponseJson: JSON.stringify({ stage: 'schedule', message: String(error) }),
    })
  }

  const status = normalizePublishStatus(post.status ?? 'scheduled')
  updateVariantStatus(variant.id, status)
  return upsertScheduledPostRecord({
    id: recordId,
    variantId: variant.id,
    channelId: channel.id,
    scheduledAt: input.scheduledAt,
    timezone: input.timezone,
    status,
    postizPostId: post.id,
    postizResponseJson: post.rawJson ?? null,
  })
}

export function listScheduledPosts(): Array<
  ScheduledPost & {
    channelDisplayName: string
    platform: string
    artifactId: string
    episodeId: string
    caption: string
    title?: string | null
  }
> {
  const rows = getPublishingDb()
    .prepare(`
      SELECT
        scheduled_posts.*,
        publishing_channels.display_name AS channel_display_name,
        publishing_channels.platform AS platform,
        publish_variants.artifact_id AS artifact_id,
        publish_variants.caption AS caption,
        publish_variants.title AS title,
        render_artifacts.episode_id AS episode_id
      FROM scheduled_posts
      INNER JOIN publishing_channels ON publishing_channels.id = scheduled_posts.channel_id
      INNER JOIN publish_variants ON publish_variants.id = scheduled_posts.variant_id
      INNER JOIN render_artifacts ON render_artifacts.id = publish_variants.artifact_id
      ORDER BY scheduled_posts.scheduled_at DESC
    `)
    .all()

  return rows.map((row) => {
    const scheduled = mapScheduledPost(row as SqliteRecord)
    return {
      ...scheduled,
      channelDisplayName: String((row as SqliteRecord).channel_display_name),
      platform: String((row as SqliteRecord).platform),
      artifactId: String((row as SqliteRecord).artifact_id),
      episodeId: String((row as SqliteRecord).episode_id),
      caption: String((row as SqliteRecord).caption),
      title: typeof (row as SqliteRecord).title === 'string' ? String((row as SqliteRecord).title) : null,
    }
  })
}
