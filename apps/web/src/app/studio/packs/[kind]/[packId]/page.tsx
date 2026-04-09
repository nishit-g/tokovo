import type { StudioPackKind } from '@tokovo/packs'
import { savePackAction } from '@/app/studio/actions'
import {
  StudioCallout,
  StudioChrome,
  StudioCode,
  StudioPanel,
  StudioTable,
} from '@/components/studio/StudioChrome'
import { StudioPackManifestEditor } from '@/components/studio/StudioEditors'
import { getStudioPackDetail } from '@/lib/studio/service'

type Params = { params: Promise<{ kind: StudioPackKind; packId: string }> }

export default async function StudioPackDetailPage({ params }: Params) {
  const { kind, packId } = await params
  const detail = getStudioPackDetail(kind, packId)

  return (
    <StudioChrome eyebrow="Pack Editor" title={detail.name} pathname={`/studio/packs/${detail.kind}/${detail.id}`}>
      <div className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
        <StudioPanel title="Manifest Editor" kicker={`${detail.kind} · ${detail.id}`}>
          <form action={savePackAction} className="space-y-4">
            <input type="hidden" name="kind" value={detail.kind} />
            <input type="hidden" name="packId" value={detail.id} />
            <StudioPackManifestEditor kind={detail.kind} manifest={detail.manifest} />
          </form>
        </StudioPanel>

        <div className="space-y-6">
          <StudioPanel title="Validation" kicker="Checks">
            {detail.validationErrors.length === 0 ? (
              <StudioCallout tone="green">All file-backed validation checks passed.</StudioCallout>
            ) : (
              <div className="space-y-3">
                {detail.validationErrors.map((error) => (
                  <StudioCallout key={error} tone="amber">{error}</StudioCallout>
                ))}
              </div>
            )}
          </StudioPanel>

          <StudioPanel title="Pack Summary" kicker="Canonical TS">
            <div className="space-y-4 text-sm text-slate-600">
              <StudioTable
                columns={['Field', 'Value']}
                rows={[
                  ['Export name', <span key="export" className="font-mono text-xs text-slate-600">{detail.exportName}</span>],
                  ['Source file', <span key="source" className="font-mono text-xs text-slate-600">{detail.relativeSourcePath}</span>],
                  ['Version', <span key="version" className="font-mono text-xs text-slate-600">{detail.version ?? 'n/a'}</span>],
                ]}
              />
              <StudioCode>{detail.relativeSourcePath}</StudioCode>
            </div>
          </StudioPanel>
        </div>
      </div>
    </StudioChrome>
  )
}
