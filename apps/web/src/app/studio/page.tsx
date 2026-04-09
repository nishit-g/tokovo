import Link from 'next/link'
import { listStudioEpisodes, listStudioPacks } from '@/lib/studio/service'
import {
  StudioChrome,
  StudioCallout,
  StudioMetric,
  StudioPanel,
  StudioPill,
  StudioTable,
} from '@/components/studio/StudioChrome'

export default function StudioPage() {
  const packs = listStudioPacks()
  const episodes = listStudioEpisodes()
  const packRows = packs.map((pack) => [
    <Link
      key={`${pack.kind}:${pack.id}`}
      href={`/studio/packs/${pack.kind}/${pack.id}`}
      className="font-semibold text-slate-950 transition hover:text-slate-700"
    >
      {pack.name}
    </Link>,
    <span key="kind" className="text-[11px] uppercase tracking-[0.14em] text-slate-500">
      {pack.kind}
    </span>,
    <span key="path" className="font-mono text-xs text-slate-500">
      {pack.relativeSourcePath}
    </span>,
  ])
  const episodeRows = episodes.map((episode) => [
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
    <div key="paths" className="space-y-1 font-mono text-xs text-slate-500">
      <div>{episode.relativeSetupPath}</div>
      <div>{episode.relativeEpisodePath}</div>
    </div>,
  ])

  return (
    <StudioChrome eyebrow="Creator Studio" title="Dashboard" pathname="/studio">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StudioMetric
          label="Editable packs"
          value={String(packs.length)}
          detail="Persona, asset, style, and device manifests exposed to Studio."
        />
        <StudioMetric
          label="Story-kit episodes"
          value={String(episodes.length)}
          detail="Canonical sidecar-backed episodes with Studio-owned setup."
        />
        <StudioMetric label="Source of truth" value="TypeScript" detail="No database for authoring truth in V1." />
        <StudioMetric label="Authoring mode" value="File-backed" detail="Packs and setup are repo-native and reviewable." />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <StudioPanel title="System Snapshot" kicker="Creator standard">
          <div className="grid gap-4">
            <StudioCallout tone="blue">
              Story-kit is the canonical production setup layer. Studio edits packs and sidecars. Scenes, timing, camera, and audio still stay in code.
            </StudioCallout>
            <div className="grid gap-3 text-sm leading-6 text-slate-600">
              <p>Use `storyEpisode(...)`, source packs from `@tokovo/packs`, and project app-facing objects through `kit.project.*`.</p>
              <p>The point of Studio is not to replace creative authoring. It removes repeated setup work so episodes stop re-implementing the same personas, devices, and styles.</p>
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              <StudioPill label="storyEpisode" tone="blue" />
              <StudioPill label="kit.project.*" tone="blue" />
              <StudioPill label="*.story-kit.ts" tone="green" />
              <StudioPill label="reviewable diffs" tone="slate" />
            </div>
          </div>
        </StudioPanel>

        <StudioPanel title="Operator Flow" kicker="How this should be used">
          <div className="space-y-3">
            {[
              'Choose a pack baseline instead of hardcoding cast, devices, and assets again.',
              'Inspect the resolved actor and device view before touching story code.',
              'Use Remotion for playback and rendering, not Studio for timeline editing.',
              'Keep beats, camera, and choreography in TypeScript where they belong.',
            ].map((step, index) => (
              <div key={step} className="flex gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-sm font-semibold text-white">
                  {index + 1}
                </div>
                <div className="text-sm leading-6 text-slate-600">{step}</div>
              </div>
            ))}
          </div>
        </StudioPanel>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.04fr_0.96fr]">
        <StudioPanel
          title="Pack Catalog"
          kicker="Registry"
          actions={
            <Link href="/studio/packs" className="text-sm font-medium text-slate-600 transition hover:text-slate-950">
              View all
            </Link>
          }
        >
          <StudioTable columns={['Name', 'Kind', 'Source']} rows={packRows} />
        </StudioPanel>

        <StudioPanel
          title="Canonical Episodes"
          kicker="Studio-owned setup"
          actions={
            <Link href="/studio/episodes" className="text-sm font-medium text-slate-600 transition hover:text-slate-950">
              View all
            </Link>
          }
        >
          <StudioTable columns={['Episode', 'ID', 'Files']} rows={episodeRows} />
        </StudioPanel>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <StudioPanel title="What Studio Owns" kicker="Boundary">
          <div className="flex flex-wrap gap-3">
            <StudioPill label="packs" tone="blue" />
            <StudioPill label="cast" tone="green" />
            <StudioPill label="device defaults" tone="blue" />
            <StudioPill label="validation" tone="slate" />
          </div>
          <div className="mt-5 space-y-2 text-sm leading-6 text-slate-600">
            <p>Studio edits reusable setup and file-backed story-kit sidecars.</p>
            <p>It does not replace code for beats, camera, audio, or choreography.</p>
          </div>
        </StudioPanel>

        <StudioPanel title="What Still Needs Work" kicker="Honest gap list">
          <div className="grid gap-3 md:grid-cols-2">
            {[
              'Real asset browser and visual picker',
              'Render queue and review workflow',
              'More Studio-editable production episodes',
              'Docs refresh execution across README, architecture, and app docs',
            ].map((item) => (
              <div key={item} className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-600">
                {item}
              </div>
            ))}
          </div>
        </StudioPanel>
      </div>

      <StudioPanel title="Docs Refresh Plan" kicker="Latest-version alignment">
        <div className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-600">
            The repo plan for updating docs to the latest product state is now captured in
            <span className="ml-1 font-mono text-xs text-slate-700">docs/DOCS_REFRESH_PLAN.md</span>.
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {[
              'Wave 1: README, ARCHITECTURE, STORY_KIT',
              'Wave 2: Creator Studio and rendering workflow docs',
              'Wave 3: WhatsApp, X, and example-library refresh',
              'Acceptance criteria tied to current story-kit and Studio behavior',
            ].map((item) => (
              <div key={item} className="rounded-xl border border-slate-200 bg-white p-4 text-sm leading-6 text-slate-600">
                {item}
              </div>
            ))}
          </div>
        </div>
      </StudioPanel>
    </StudioChrome>
  )
}
