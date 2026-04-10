import Link from 'next/link'
import { PublishingShell, PublishingCard } from '@/components/publishing/PublishingShell'
import { SyncChannelsButton } from '@/components/publishing/SyncChannelsButton'
import { listArtifacts, listChannels, listScheduledPosts } from '@/lib/publishing/service'

export default function PublishingOverviewPage() {
  const artifacts = listArtifacts()
  const channels = listChannels()
  const scheduledPosts = listScheduledPosts()

  return (
    <PublishingShell
      title="Publishing Console"
      description="Tokovo owns render artifacts and publish intent. Postiz owns account connections and delivery."
      pathname="/publishing"
    >
      <div className="grid gap-6 lg:grid-cols-3">
        <PublishingCard title={String(artifacts.length)} eyebrow="Artifacts">
          <p className="text-sm leading-7 text-slate-300">Versioned render outputs discovered from local artifact manifests.</p>
        </PublishingCard>
        <PublishingCard title={String(channels.length)} eyebrow="Channels">
          <p className="text-sm leading-7 text-slate-300">Connected Postiz channels that can receive scheduled content.</p>
        </PublishingCard>
        <PublishingCard title={String(scheduledPosts.length)} eyebrow="Scheduled">
          <p className="text-sm leading-7 text-slate-300">Tokovo-side scheduling records with Postiz post references.</p>
        </PublishingCard>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <PublishingCard title="Recent Artifacts" eyebrow="Render Registry">
          <div className="space-y-3">
            {artifacts.slice(0, 6).map((artifact) => (
              <Link
                key={artifact.id}
                href={`/publishing/artifacts/${artifact.id}`}
                className="block rounded-[22px] border border-white/10 bg-black/20 px-4 py-4 transition hover:border-cyan-300/30 hover:bg-cyan-300/5"
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-cyan-200">{artifact.episodeId}</div>
                    <div className="mt-2 text-sm text-slate-300">{artifact.videoPath}</div>
                  </div>
                  <div className="font-mono text-xs text-slate-400">{Math.round(artifact.durationMs / 1000)}s</div>
                </div>
              </Link>
            ))}
            {artifacts.length === 0 ? <p className="text-sm text-slate-400">No artifact manifests found under `out/` yet.</p> : null}
          </div>
        </PublishingCard>

        <PublishingCard title="Channel Sync" eyebrow="Postiz">
          <div className="space-y-4">
            <p className="text-sm leading-7 text-slate-300">Refresh channel inventory from Postiz after connecting or disconnecting social accounts.</p>
            <SyncChannelsButton />
            <div className="space-y-2">
              {channels.slice(0, 6).map((channel) => (
                <div key={channel.id} className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm">
                  <span>{channel.displayName}</span>
                  <span className="font-mono text-xs uppercase tracking-[0.18em] text-slate-400">{channel.platform}</span>
                </div>
              ))}
              {channels.length === 0 ? <p className="text-sm text-slate-400">No synced channels yet.</p> : null}
            </div>
          </div>
        </PublishingCard>
      </div>
    </PublishingShell>
  )
}
