'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import type { PublishingChannel, RenderArtifact } from '@tokovo/publishing'

type VariantPlatform = 'x' | 'linkedin' | 'instagram' | 'youtube'

export function PublishComposer({
  artifact,
  channels,
  timezone,
}: {
  artifact: RenderArtifact
  channels: PublishingChannel[]
  timezone: string
}) {
  const router = useRouter()
  const [platform, setPlatform] = useState<VariantPlatform>('x')
  const [channelId, setChannelId] = useState(channels[0]?.id ?? '')
  const [caption, setCaption] = useState(`New Tokovo render: ${artifact.episodeId}`)
  const [title, setTitle] = useState(artifact.episodeId)
  const [settingsJson, setSettingsJson] = useState('{}')
  const [scheduledAt, setScheduledAt] = useState(() => {
    const now = new Date()
    now.setMinutes(now.getMinutes() + 30)
    return now.toISOString().slice(0, 16)
  })
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const eligibleChannels = channels.filter((channel) => channel.platform === platform)

  const submit = async () => {
    setError(null)
    setResult(null)

    const resolvedChannelId = channelId || eligibleChannels[0]?.id
    if (!resolvedChannelId) {
      setError(`No ${platform} channel is connected in Postiz`)
      return
    }

    const variantResponse = await fetch('/api/publishing/variants', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        artifactId: artifact.id,
        platform,
        caption,
        title: title.trim().length > 0 ? title : undefined,
        settingsJson,
      }),
    })

    if (!variantResponse.ok) {
      setError(`Variant creation failed (${variantResponse.status})`)
      return
    }

    const variantBody = (await variantResponse.json()) as { variant: { id: string } }

    const scheduleResponse = await fetch('/api/publishing/schedule', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        variantId: variantBody.variant.id,
        channelId: resolvedChannelId,
        scheduledAt: new Date(scheduledAt).toISOString(),
        timezone,
      }),
    })

    if (!scheduleResponse.ok) {
      setError(`Scheduling failed (${scheduleResponse.status})`)
      return
    }

    const scheduleBody = (await scheduleResponse.json()) as {
      scheduledPost: { id: string; status: string }
    }

    setResult(`Scheduled record ${scheduleBody.scheduledPost.id} (${scheduleBody.scheduledPost.status})`)
    startTransition(() => {
      router.refresh()
    })
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2 text-sm text-slate-300">
          <span className="font-mono text-xs uppercase tracking-[0.22em] text-slate-400">Platform</span>
          <select
            value={platform}
            onChange={(event) => {
              const nextPlatform = event.target.value as VariantPlatform
              setPlatform(nextPlatform)
              const nextChannel = channels.find((channel) => channel.platform === nextPlatform)
              setChannelId(nextChannel?.id ?? '')
            }}
            className="w-full rounded-2xl border border-white/10 bg-[#08111b] px-4 py-3 text-white"
          >
            <option value="x">X</option>
            <option value="linkedin">LinkedIn</option>
            <option value="instagram">Instagram</option>
            <option value="youtube">YouTube</option>
          </select>
        </label>

        <label className="space-y-2 text-sm text-slate-300">
          <span className="font-mono text-xs uppercase tracking-[0.22em] text-slate-400">Channel</span>
          <select
            value={channelId}
            onChange={(event) => setChannelId(event.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-[#08111b] px-4 py-3 text-white"
          >
            {eligibleChannels.length === 0 ? <option value="">No channel connected</option> : null}
            {eligibleChannels.map((channel) => (
              <option key={channel.id} value={channel.id}>
                {channel.displayName}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="block space-y-2 text-sm text-slate-300">
        <span className="font-mono text-xs uppercase tracking-[0.22em] text-slate-400">Caption</span>
        <textarea
          value={caption}
          onChange={(event) => setCaption(event.target.value)}
          rows={5}
          className="w-full rounded-[24px] border border-white/10 bg-[#08111b] px-4 py-3 text-white"
        />
      </label>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2 text-sm text-slate-300">
          <span className="font-mono text-xs uppercase tracking-[0.22em] text-slate-400">Title</span>
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-[#08111b] px-4 py-3 text-white"
          />
        </label>

        <label className="space-y-2 text-sm text-slate-300">
          <span className="font-mono text-xs uppercase tracking-[0.22em] text-slate-400">Scheduled At</span>
          <input
            type="datetime-local"
            value={scheduledAt}
            onChange={(event) => setScheduledAt(event.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-[#08111b] px-4 py-3 text-white"
          />
        </label>
      </div>

      <label className="block space-y-2 text-sm text-slate-300">
        <span className="font-mono text-xs uppercase tracking-[0.22em] text-slate-400">Provider Settings JSON</span>
        <textarea
          value={settingsJson}
          onChange={(event) => setSettingsJson(event.target.value)}
          rows={4}
          className="w-full rounded-[24px] border border-white/10 bg-[#08111b] px-4 py-3 font-mono text-sm text-white"
        />
      </label>

      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={submit}
          disabled={isPending}
          className="rounded-full border border-cyan-300/40 bg-cyan-300/10 px-5 py-3 font-mono text-xs uppercase tracking-[0.22em] text-cyan-100 transition hover:bg-cyan-300/20 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? 'Scheduling…' : 'Create Variant + Schedule'}
        </button>
        <span className="font-mono text-xs uppercase tracking-[0.18em] text-slate-400">{timezone}</span>
      </div>

      {error ? <div className="rounded-2xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{error}</div> : null}
      {result ? <div className="rounded-2xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">{result}</div> : null}
    </div>
  )
}
