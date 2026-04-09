import Link from 'next/link'
import { listStudioPacks } from '@/lib/studio/service'
import { StudioChrome, StudioMetric, StudioPanel, StudioPill, StudioTable } from '@/components/studio/StudioChrome'

export default function StudioPacksPage() {
  const packs = listStudioPacks()
  const grouped = Object.groupBy(packs, (pack) => pack.kind)

  return (
    <StudioChrome eyebrow="Creator Studio" title="Pack Catalog" pathname="/studio/packs">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StudioMetric label="Total packs" value={String(packs.length)} detail="All Studio-visible manifests." />
        <StudioMetric label="Persona packs" value={String(grouped.personas?.length ?? 0)} detail="Reusable cast universes and app metadata." />
        <StudioMetric label="Asset packs" value={String(grouped.assets?.length ?? 0)} detail="Wallpapers, avatars, media, maps, and docs." />
        <StudioMetric label="Style & device" value={String((grouped.styles?.length ?? 0) + (grouped.devices?.length ?? 0))} detail="Visual defaults and logical phones." />
      </div>

      <StudioPanel title="Pack Standard" kicker="How packs should be used">
        <div className="flex flex-wrap gap-2">
          <StudioPill label="typed manifests" tone="blue" />
          <StudioPill label="file-backed" tone="green" />
          <StudioPill label="reviewable" tone="slate" />
        </div>
        <div className="mt-4 text-sm leading-6 text-slate-600">
          Packs exist so episodes stop redefining the same personas, assets, style defaults, and logical devices. New production episodes should reference packs first and override only what is unique.
        </div>
      </StudioPanel>

      <div className="space-y-6">
        {Object.entries(grouped).map(([kind, entries]) => (
          <StudioPanel key={kind} title={`${kind} packs`} kicker="Source files">
            <StudioTable
              columns={['Pack', 'ID', 'Source']}
              rows={(entries ?? []).map((pack) => [
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
        ))}
      </div>
    </StudioChrome>
  )
}
