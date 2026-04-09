import Link from 'next/link'
import { saveEpisodeAction } from '@/app/studio/actions'
import {
  StudioCallout,
  StudioChrome,
  StudioCode,
  StudioPanel,
  StudioPill,
  StudioTable,
} from '@/components/studio/StudioChrome'
import { StudioEpisodeSetupEditor } from '@/components/studio/StudioEditors'
import {
  getStudioEpisodeDetail,
  getStudioEpisodeEditorOptions,
  listStudioPackOptions,
} from '@/lib/studio/service'

type Params = { params: Promise<{ episodeId: string }> }

export default async function StudioEpisodeDetailPage({ params }: Params) {
  const { episodeId } = await params
  const detail = getStudioEpisodeDetail(episodeId)
  const packOptions = listStudioPackOptions()
  const editorOptions = getStudioEpisodeEditorOptions(detail.config)

  return (
    <StudioChrome
      eyebrow="Episode Setup"
      title={detail.title}
      pathname={`/studio/episodes/${detail.id}`}
      actions={
        <Link
          href={`http://localhost:3002/?compositionId=${detail.id}`}
          className="inline-flex items-center rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
        >
          Open Remotion
        </Link>
      }
    >
      <div className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
        <StudioPanel title="Story-Kit Setup" kicker={detail.id}>
          <form action={saveEpisodeAction} className="space-y-4">
            <StudioEpisodeSetupEditor
              config={detail.config}
              packOptions={packOptions}
              personaIds={editorOptions.personaIds}
              avatarAliases={editorOptions.avatarAliases}
              deviceIds={editorOptions.deviceIds}
              appIds={editorOptions.appIds}
            />
          </form>
        </StudioPanel>

        <div className="space-y-6">
          <StudioPanel title="Resolved Preview" kicker="Actors & Devices">
            <div className="mb-5 flex flex-wrap gap-3">
              <StudioPill label={`${detail.preview.actors.length} actors`} tone="blue" />
              <StudioPill label={`${detail.preview.devices.length} devices`} tone="green" />
              <StudioPill label={`${detail.preview.warnings.length} warnings`} tone={detail.preview.warnings.length > 0 ? 'slate' : 'green'} />
            </div>
            <div className="space-y-4">
              {detail.preview.actors.map((actor) => (
                <div
                  key={actor.role}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-700"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <div className="text-[11px] uppercase tracking-[0.22em] text-slate-500">
                        {actor.role}
                      </div>
                      <div className="mt-1 text-lg font-semibold text-slate-950">{actor.name}</div>
                    </div>
                    <div className="text-xs text-slate-500">{actor.deviceId ?? 'unassigned'}</div>
                  </div>
                  <div className="mt-3 text-xs leading-6 text-slate-600">
                    {actor.handle} · {actor.bio}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-5 space-y-3">
              {detail.preview.devices.map((device) => (
                <div
                  key={device.id}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-700"
                >
                  <div className="flex items-center justify-between">
                    <div className="font-semibold text-slate-950">{device.id}</div>
                    <div className="text-xs text-slate-500">{device.profile}</div>
                  </div>
                  <div className="mt-2 text-xs leading-6 text-slate-600">
                    {device.app} · theme {device.theme ?? 'inherit'}
                  </div>
                </div>
              ))}
            </div>
          </StudioPanel>

          <StudioPanel title="Lint & Validation" kicker="Creator Resolver">
            {detail.preview.warnings.length === 0 ? (
              <StudioCallout tone="green">No creator-side warnings on this story-kit setup.</StudioCallout>
            ) : (
              <div className="space-y-3">
                {detail.preview.warnings.map((warning) => (
                  <StudioCallout key={warning} tone="amber">{warning}</StudioCallout>
                ))}
              </div>
            )}
          </StudioPanel>

          <StudioPanel title="Source Paths" kicker="Canonical Files">
            <div className="space-y-4">
              <StudioTable
                columns={['File', 'Path']}
                rows={[
                  ['Studio setup', <span key="setup" className="font-mono text-xs text-slate-600">{detail.relativeSetupPath}</span>],
                  ['Episode runtime', <span key="runtime" className="font-mono text-xs text-slate-600">{detail.relativeEpisodePath}</span>],
                ]}
              />
              <StudioCode>{detail.relativeSetupPath}</StudioCode>
              <StudioCode>{detail.relativeEpisodePath}</StudioCode>
            </div>
          </StudioPanel>
        </div>
      </div>
    </StudioChrome>
  )
}
