import Link from 'next/link'
import { PublishingCard, PublishingShell } from '@/components/publishing/PublishingShell'
import { listArtifacts } from '@/lib/publishing/service'

export default function PublishingArtifactsPage() {
  const artifacts = listArtifacts()

  return (
    <PublishingShell
      title="Artifacts"
      description="Render manifests discovered from local Tokovo outputs. Scheduling starts from these immutable artifacts."
      pathname="/publishing/artifacts"
    >
      <PublishingCard title="Artifact Registry" eyebrow="Render Manifests">
        <div className="space-y-3">
          {artifacts.map((artifact) => (
            <Link
              key={artifact.id}
              href={`/publishing/artifacts/${artifact.id}`}
              className="block rounded-[24px] border border-white/10 bg-black/20 px-5 py-4 transition hover:border-cyan-300/30 hover:bg-cyan-300/5"
            >
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-cyan-200">{artifact.episodeId}</div>
                  <div className="mt-2 text-sm text-slate-300">{artifact.videoPath}</div>
                  <div className="mt-2 font-mono text-xs text-slate-500">{artifact.sourceHash}</div>
                </div>
                <div className="text-right font-mono text-xs text-slate-500">
                  <div>{Math.round(artifact.durationMs / 1000)}s</div>
                  <div className="mt-1">{artifact.createdAt}</div>
                </div>
              </div>
            </Link>
          ))}
          {artifacts.length === 0 ? <p className="text-sm text-slate-400">No artifact manifests found yet.</p> : null}
        </div>
      </PublishingCard>
    </PublishingShell>
  )
}
