import Link from 'next/link'
import type { StudioPackKind } from '@tokovo/packs'
import {
  listStudioPacksByKind,
} from '@/lib/studio/service'
import { StudioChrome, StudioMetric, StudioPanel, StudioTable } from '@/components/studio/StudioChrome'

type Params = { params: Promise<{ kind: StudioPackKind }> }

function titleForKind(kind: StudioPackKind): string {
  switch (kind) {
    case 'personas':
      return 'Personas'
    case 'assets':
      return 'Assets'
    case 'styles':
      return 'Styles'
    case 'devices':
      return 'Devices'
  }
}

export default async function StudioPackKindPage({ params }: Params) {
  const { kind } = await params
  const entries = listStudioPacksByKind(kind)
  const title = titleForKind(kind)

  return (
    <StudioChrome eyebrow="Creator Studio" title={title} pathname={`/studio/packs/${kind}`}>
      <div className="grid gap-4 md:grid-cols-3">
        <StudioMetric label={`${title} packs`} value={String(entries.length)} detail={`Studio-visible ${kind} manifests.`} />
        <StudioMetric label="Authoring model" value="file-backed" detail="Edit the manifest here; save back to canonical TypeScript." />
        <StudioMetric label="Editing mode" value="structured" detail="Common fields first, raw files only when needed." />
      </div>

      <StudioPanel title={`${title} Catalog`} kicker="Studio-visible manifests">
        <StudioTable
          columns={['Pack', 'ID', 'Source']}
          rows={entries.map((pack) => [
            <Link
              key={`${pack.kind}:${pack.id}`}
              href={`/studio/packs/${pack.kind}/${pack.id}`}
              className="font-semibold text-slate-950 transition hover:text-slate-700"
            >
              {pack.name}
            </Link>,
            <span key="id" className="font-mono text-xs text-slate-500">
              {pack.id}
            </span>,
            <span key="path" className="font-mono text-xs text-slate-500">
              {pack.relativeSourcePath}
            </span>,
          ])}
        />
      </StudioPanel>
    </StudioChrome>
  )
}
