import { notFound } from 'next/navigation'
import { PublishComposer } from '@/components/publishing/PublishComposer'
import { PublishingCard, PublishingShell } from '@/components/publishing/PublishingShell'
import { getArtifact, listChannels, listVariantsForArtifact } from '@tokovo/publishing/server'

type Params = { params: Promise<{ artifactId: string }> }

export default async function ArtifactDetailPage({ params }: Params) {
  const { artifactId } = await params
  const artifact = getArtifact(artifactId)
  if (!artifact) notFound()

  const channels = listChannels()
  const variants = listVariantsForArtifact(artifact.id)
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'

  return (
    <PublishingShell
      title={artifact.episodeId}
      description="Create platform-specific variants, then schedule them into Postiz using a connected channel."
      pathname="/publishing"
    >
      <div className="grid gap-6 xl:grid-cols-[0.88fr_1.12fr]">
        <PublishingCard title="Artifact Metadata" eyebrow="Render Output">
          <div className="space-y-3 text-sm leading-7 text-slate-300">
            <p><span className="text-slate-500">Artifact ID:</span> {artifact.id}</p>
            <p><span className="text-slate-500">Video:</span> {artifact.videoPath}</p>
            <p><span className="text-slate-500">Duration:</span> {Math.round(artifact.durationMs / 1000)} seconds</p>
            <p><span className="text-slate-500">Source Hash:</span> {artifact.sourceHash}</p>
            <p><span className="text-slate-500">Created:</span> {artifact.createdAt}</p>
          </div>
        </PublishingCard>

        <PublishingCard title="Publish Composer" eyebrow="Operator Workflow">
          <PublishComposer artifact={artifact} channels={channels} timezone={timezone} />
        </PublishingCard>
      </div>

      <div className="mt-6">
        <PublishingCard title="Saved Variants" eyebrow="Tokovo State">
          <div className="space-y-3">
            {variants.map((variant) => (
              <div key={variant.id} className="rounded-[24px] border border-white/10 bg-black/20 px-5 py-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-cyan-200">
                      {variant.platform} · {variant.status}
                    </div>
                    <div className="mt-2 text-sm text-slate-300">{variant.caption}</div>
                  </div>
                  <div className="font-mono text-xs text-slate-500">{variant.id}</div>
                </div>
              </div>
            ))}
            {variants.length === 0 ? <p className="text-sm text-slate-400">No variants created for this artifact yet.</p> : null}
          </div>
        </PublishingCard>
      </div>
    </PublishingShell>
  )
}
