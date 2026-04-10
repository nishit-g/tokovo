import Link from 'next/link'
import clsx from 'clsx'

const nav = [
  { href: '/publishing', label: 'Overview' },
  { href: '/publishing/artifacts', label: 'Artifacts' },
  { href: '/publishing/channels', label: 'Channels' },
  { href: '/publishing/scheduled-posts', label: 'Scheduled' },
]

export function PublishingShell({
  title,
  description,
  pathname,
  children,
}: {
  title: string
  description: string
  pathname: string
  children: React.ReactNode
}) {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#16314a_0%,#091019_38%,#05070c_100%)] text-white">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-10 flex flex-col gap-6 border-b border-white/10 pb-8 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="mb-3 font-mono text-xs uppercase tracking-[0.28em] text-cyan-300/80">
              Tokovo Publishing
            </div>
            <h1 className="font-serif text-5xl leading-none text-cream">{title}</h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300">{description}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  'rounded-full border px-4 py-2 font-mono text-xs uppercase tracking-[0.22em] transition',
                  pathname === item.href
                    ? 'border-cyan-300 bg-cyan-300/10 text-cyan-100'
                    : 'border-white/10 bg-white/5 text-slate-300 hover:border-white/20 hover:text-white',
                )}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
        {children}
      </div>
    </main>
  )
}

export function PublishingCard({
  title,
  eyebrow,
  children,
}: {
  title: string
  eyebrow?: string
  children: React.ReactNode
}) {
  return (
    <section className="rounded-[28px] border border-white/10 bg-white/5 p-6 backdrop-blur">
      {eyebrow ? (
        <div className="mb-3 font-mono text-[11px] uppercase tracking-[0.24em] text-cyan-300/80">
          {eyebrow}
        </div>
      ) : null}
      <h2 className="text-xl font-semibold text-cream">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  )
}
