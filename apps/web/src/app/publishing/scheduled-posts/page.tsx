import { PublishingCard, PublishingShell } from '@/components/publishing/PublishingShell'
import { listScheduledPosts } from '@tokovo/publishing/server'

export default function ScheduledPostsPage() {
  const scheduledPosts = listScheduledPosts()

  return (
    <PublishingShell
      title="Scheduled Posts"
      description="Tokovo-side publish records with the Postiz references returned during scheduling."
      pathname="/publishing/scheduled-posts"
    >
      <PublishingCard title="Schedule Ledger" eyebrow="Audit">
        <div className="space-y-3">
          {scheduledPosts.map((entry) => (
            <div key={entry.id} className="rounded-[24px] border border-white/10 bg-black/20 px-5 py-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <div className="text-lg font-semibold text-cream">{entry.channelDisplayName}</div>
                  <div className="mt-1 text-sm text-slate-300">{entry.caption}</div>
                  <div className="mt-2 font-mono text-[11px] uppercase tracking-[0.22em] text-slate-400">
                    {entry.platform} · {entry.episodeId} · {entry.status}
                  </div>
                </div>
                <div className="text-right font-mono text-xs text-slate-500">
                  <div>{entry.scheduledAt}</div>
                  <div className="mt-1">{entry.postizPostId ?? 'pending Postiz id'}</div>
                </div>
              </div>
            </div>
          ))}
          {scheduledPosts.length === 0 ? <p className="text-sm text-slate-400">No scheduled posts have been created yet.</p> : null}
        </div>
      </PublishingCard>
    </PublishingShell>
  )
}
