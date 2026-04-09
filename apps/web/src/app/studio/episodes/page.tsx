import Link from 'next/link'
import { listStudioEpisodes } from '@/lib/studio/service'
import {
  StudioChrome,
  StudioMetric,
  StudioPanel,
  StudioPill,
  StudioTable,
} from '@/components/studio/StudioChrome'

export default function StudioEpisodesPage() {
  const episodes = listStudioEpisodes()

  return (
    <StudioChrome eyebrow="Creator Studio" title="Story-Kit Episodes" pathname="/studio/episodes">
      <div className="grid gap-4 md:grid-cols-3">
        <StudioMetric label="Editable episodes" value={String(episodes.length)} detail="Only canonical story-kit setups are Studio-editable in V1." />
        <StudioMetric label="Authoring standard" value="storyEpisode" detail="New production episodes should use the creator-side high-level builder." />
        <StudioMetric label="Render workflow" value="Code-first" detail="Studio config here, creative timing and beats in TypeScript." />
      </div>

      <StudioPanel title="Episode Standard" kicker="How these files are meant to work">
        <div className="flex flex-wrap gap-2">
          <StudioPill label="storyEpisode(...)" tone="blue" />
          <StudioPill label="kit.project.*" tone="green" />
          <StudioPill label="sidecar setup" tone="slate" />
        </div>
        <div className="mt-4 text-sm leading-6 text-slate-600">
          The Studio owns only reusable setup. Story code still lives in the runtime episode file so camera, pacing, and narrative structure remain auditable and deterministic.
        </div>
      </StudioPanel>

      <StudioPanel title="Editable Episodes" kicker="Sidecar config">
        <StudioTable
          columns={['Episode', 'ID', 'Studio setup', 'Runtime file']}
          rows={episodes.map((episode) => [
            <Link
              key={episode.id}
              href={`/studio/episodes/${episode.id}`}
              className="font-semibold text-slate-950 transition hover:text-slate-700"
            >
              {episode.title}
            </Link>,
            <span key="id" className="font-mono text-xs text-slate-500">
              {episode.id}
            </span>,
            <span key="setup" className="font-mono text-xs text-slate-500">
              {episode.relativeSetupPath}
            </span>,
            <span key="runtime" className="font-mono text-xs text-slate-500">
              {episode.relativeEpisodePath}
            </span>,
          ])}
        />
      </StudioPanel>
    </StudioChrome>
  )
}
