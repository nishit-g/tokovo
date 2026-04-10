import { PublishingCard, PublishingShell } from '@/components/publishing/PublishingShell'
import { SyncChannelsButton } from '@/components/publishing/SyncChannelsButton'
import { listChannels } from '@/lib/publishing/service'

export default function PublishingChannelsPage() {
  const channels = listChannels()

  return (
    <PublishingShell
      title="Connected Channels"
      description="These records mirror Postiz integrations. Tokovo stores only references and status."
      pathname="/publishing/channels"
    >
      <PublishingCard title="Postiz Channel Inventory" eyebrow="Sync">
        <div className="mb-5">
          <SyncChannelsButton />
        </div>
        <div className="space-y-3">
          {channels.map((channel) => (
            <div key={channel.id} className="rounded-[24px] border border-white/10 bg-black/20 px-5 py-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="text-lg font-semibold text-cream">{channel.displayName}</div>
                  <div className="mt-1 font-mono text-[11px] uppercase tracking-[0.22em] text-slate-400">
                    {channel.platform} · {channel.status}
                  </div>
                </div>
                <div className="font-mono text-xs text-slate-500">{channel.postizIntegrationId}</div>
              </div>
            </div>
          ))}
          {channels.length === 0 ? <p className="text-sm text-slate-400">No channels are synced from Postiz yet.</p> : null}
        </div>
      </PublishingCard>
    </PublishingShell>
  )
}
