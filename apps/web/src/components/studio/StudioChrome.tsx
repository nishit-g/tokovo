import Link from 'next/link'
import type * as React from 'react'
import {
  Braces,
  Clapperboard,
  Database,
  LayoutDashboard,
  Palette,
  Smartphone,
  User,
  Play,
  Search,
  Sparkles,
  Image,
} from 'lucide-react'

type StudioNavItem = {
  href: string
  label: string
  icon: React.ReactNode
  badge?: string
  external?: boolean
}

const studioNavGroups: readonly {
  title: string
  items: readonly StudioNavItem[]
}[] = [
  {
    title: 'Studio',
    items: [
      { href: '/studio', label: 'Dashboard', icon: <LayoutDashboard className="h-4 w-4" /> },
      { href: '/studio/packs/personas', label: 'Personas', icon: <User className="h-4 w-4" /> },
      { href: '/studio/packs/assets', label: 'Assets', icon: <Image className="h-4 w-4" /> },
      { href: '/studio/packs/styles', label: 'Styles', icon: <Palette className="h-4 w-4" /> },
      { href: '/studio/packs/devices', label: 'Devices', icon: <Smartphone className="h-4 w-4" /> },
      {
        href: '/studio/episodes',
        label: 'Episodes',
        icon: <Clapperboard className="h-4 w-4" />,
      },
    ],
  },
  {
    title: 'Runtime',
    items: [
      {
        href: 'http://localhost:3002',
        label: 'Remotion Studio',
        icon: <Play className="h-4 w-4" />,
        external: true,
      },
      {
        href: '/studio/api/packs',
        label: 'Pack API',
        icon: <Braces className="h-4 w-4" />,
      },
      {
        href: '/studio/api/episodes',
        label: 'Episode API',
        icon: <Database className="h-4 w-4" />,
      },
    ],
  },
] as const

function normalizePathname(pathname?: string): string {
  if (!pathname || pathname === '/') return '/studio'
  return pathname
}

function navIsActive(href: string, pathname: string): boolean {
  if (href === '/studio') return pathname === '/studio'
  return pathname === href || pathname.startsWith(`${href}/`)
}

function buildBreadcrumb(pathname: string): string[] {
  const normalized = normalizePathname(pathname)
  if (normalized === '/studio') return ['Studio', 'Dashboard']
  const parts = normalized
    .replace(/^\/studio\/?/, '')
    .split('/')
    .filter(Boolean)
    .map((part) => part.replace(/[-_]/g, ' '))
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))

  return ['Studio', ...parts]
}

export function StudioChrome({
  title,
  eyebrow,
  pathname,
  actions,
  children,
}: {
  title: string
  eyebrow: string
  pathname?: string
  actions?: React.ReactNode
  children: React.ReactNode
}) {
  const currentPath = normalizePathname(pathname)
  const breadcrumb = buildBreadcrumb(currentPath)

  return (
    <div className="min-h-screen bg-slate-100 text-slate-950 [font-family:var(--font-inter),ui-sans-serif,system-ui,sans-serif]">
      <div className="flex min-h-screen">
        <aside className="hidden w-72 shrink-0 border-r border-slate-200 bg-white lg:flex lg:flex-col">
          <div className="border-b border-slate-200 p-4">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-sm font-semibold tracking-[0.22em] text-white">
                  TK
                </div>
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold text-slate-950">Tokovo Studio</div>
                  <div className="truncate text-xs text-slate-500">File-backed creator control plane</div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-3">
            {studioNavGroups.map((group) => (
              <div key={group.title} className="mb-6">
                <div className="px-3 pb-2 text-xs font-medium uppercase tracking-[0.16em] text-slate-400">
                  {group.title}
                </div>
                <div className="space-y-1">
                  {group.items.map((item) =>
                    item.external ? (
                      <a
                        key={item.href}
                        href={item.href}
                        className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-950"
                      >
                        <span className="text-slate-500">{item.icon}</span>
                        <span className="flex-1">{item.label}</span>
                        {item.badge ? (
                          <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[11px] text-slate-700">
                            {item.badge}
                          </span>
                        ) : null}
                      </a>
                    ) : (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                          navIsActive(item.href, currentPath)
                            ? 'bg-slate-900 text-white'
                            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'
                        }`}
                      >
                        <span className={navIsActive(item.href, currentPath) ? 'text-slate-200' : 'text-slate-500'}>
                          {item.icon}
                        </span>
                        <span className="flex-1">{item.label}</span>
                        {item.badge ? (
                          <span
                            className={`rounded-full px-2 py-0.5 text-[11px] ${
                              navIsActive(item.href, currentPath)
                                ? 'bg-white/10 text-white'
                                : 'bg-slate-200 text-slate-700'
                            }`}
                          >
                            {item.badge}
                          </span>
                        ) : null}
                      </Link>
                    ),
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-slate-200 p-3">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-900 text-sm font-semibold text-white">
                  TS
                </div>
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold text-slate-950">Story-kit standard</div>
                  <div className="truncate text-xs text-slate-500">Canonical setup lives in code</div>
                </div>
              </div>
            </div>
          </div>
        </aside>

        <div className="flex min-h-screen min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur">
            <div className="flex h-16 items-center gap-4 px-4 lg:px-6">
              <div className="hidden h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 lg:flex">
                <Sparkles className="h-4 w-4" />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                  {breadcrumb.map((part, index) => (
                    <span key={`${part}-${index}`} className="flex items-center gap-2">
                      {index > 0 ? <span className="text-slate-300">/</span> : null}
                      <span>{part}</span>
                    </span>
                  ))}
                </div>
                <div className="mt-0.5 text-sm font-medium text-slate-900">{eyebrow}</div>
              </div>

              <div className="hidden items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500 xl:flex">
                <Search className="h-4 w-4" />
                <span>Search packs, episodes, actors</span>
              </div>

              {actions ? <div className="shrink-0">{actions}</div> : null}
            </div>
          </header>

          <main className="flex-1 p-4 lg:p-6">
            <div className="mx-auto max-w-7xl space-y-6">
              <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                  <div>
                    <div className="text-sm font-medium text-slate-500">{eyebrow}</div>
                    <h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-950">{title}</h1>
                    <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                      File-backed creator studio for packs, casting, device defaults, and resolved story-kit previews.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <StudioPill label="Canonical story-kit" tone="blue" />
                    <StudioPill label="File-backed" tone="slate" />
                    <StudioPill label="No DB truth" tone="green" />
                  </div>
                </div>
              </section>

              <div>{children}</div>
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}

export function StudioPanel({
  title,
  kicker,
  actions,
  children,
}: {
  title: string
  kicker?: string
  actions?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          {kicker ? <div className="text-xs font-medium uppercase tracking-[0.14em] text-slate-500">{kicker}</div> : null}
          <h2 className="mt-1 text-lg font-semibold text-slate-950">{title}</h2>
        </div>
        {actions ? <div>{actions}</div> : null}
      </div>
      <div className="p-5">{children}</div>
    </section>
  )
}

export function StudioMetric({
  label,
  value,
  detail,
}: {
  label: string
  value: string
  detail?: string
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="text-sm font-medium text-slate-500">{label}</div>
      <div className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">{value}</div>
      {detail ? <div className="mt-2 text-sm leading-6 text-slate-600">{detail}</div> : null}
    </div>
  )
}

export function StudioCode({ children }: { children: string }) {
  return (
    <pre className="overflow-x-auto rounded-xl border border-slate-200 bg-slate-950 p-4 text-xs leading-6 text-slate-100">
      <code>{children}</code>
    </pre>
  )
}

export function StudioTable({
  columns,
  rows,
}: {
  columns: readonly string[]
  rows: readonly React.ReactNode[][]
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200">
      <table className="min-w-full divide-y divide-slate-200">
        <thead className="bg-slate-50">
          <tr>
            {columns.map((column) => (
              <th
                key={column}
                className="px-4 py-3 text-left text-xs font-medium uppercase tracking-[0.12em] text-slate-500"
              >
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 bg-white">
          {rows.map((row, index) => (
            <tr key={index} className="align-top">
              {row.map((cell, cellIndex) => (
                <td key={cellIndex} className="px-4 py-4 text-sm text-slate-700">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function StudioCallout({
  tone = 'blue',
  children,
}: {
  tone?: 'blue' | 'green' | 'amber'
  children: React.ReactNode
}) {
  const toneClass =
    tone === 'green'
      ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
      : tone === 'amber'
        ? 'border-amber-200 bg-amber-50 text-amber-900'
        : 'border-blue-200 bg-blue-50 text-blue-900'

  return <div className={`rounded-xl border px-4 py-3 text-sm leading-6 ${toneClass}`}>{children}</div>
}

export function StudioPill({
  label,
  tone,
}: {
  label: string
  tone: 'blue' | 'green' | 'slate'
}) {
  const toneClass =
    tone === 'green'
      ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
      : tone === 'slate'
        ? 'border-slate-200 bg-slate-100 text-slate-700'
        : 'border-blue-200 bg-blue-50 text-blue-700'

  return (
    <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${toneClass}`}>
      {label}
    </span>
  )
}
