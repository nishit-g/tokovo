import Link from 'next/link'

export function Footer() {
  return (
    <footer className="border-t border-white/5 bg-[#0a0a0a] py-16">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-12">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-center sm:justify-between">
          {/* Left */}
          <div className="flex items-center gap-12">
            <span className="font-medium tracking-tight text-white/40">
              tokovo<span className="text-white/20">.</span><span className="text-white/20">studio</span>
            </span>
            <nav className="flex gap-8">
              <Link
                href="#features"
                className="font-mono text-xs uppercase tracking-widest text-white/30 transition-colors hover:text-white"
              >
                Features
              </Link>
              <a
                href="mailto:hello@tokovo.studio"
                className="font-mono text-xs uppercase tracking-widest text-white/30 transition-colors hover:text-white"
              >
                Contact
              </a>
            </nav>
          </div>

          {/* Right */}
          <p className="font-mono text-xs text-white/20">
            © {new Date().getFullYear()} Tokovo Studio
          </p>
        </div>
      </div>
    </footer>
  )
}
