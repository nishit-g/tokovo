import Link from 'next/link'
import { Logo } from '@/components/Logo'

export function Footer() {
  return (
    <footer className="border-t border-white/5 bg-black py-16">
      <div className="mx-auto max-w-[1800px] px-6 lg:px-12">
        <div className="flex flex-col items-center justify-between gap-8 lg:flex-row">
          {/* Left */}
          <div className="flex items-center gap-12">
            <Logo className="h-5 opacity-50" />
            <nav className="flex gap-8">
              <Link href="#features" className="font-mono text-xs uppercase tracking-widest text-gray-600 transition-colors hover:text-white">
                Features
              </Link>
              <Link href="mailto:hello@tokovo.studio" className="font-mono text-xs uppercase tracking-widest text-gray-600 transition-colors hover:text-white">
                Contact
              </Link>
            </nav>
          </div>

          {/* Right */}
          <p className="font-mono text-xs text-gray-700">
            © {new Date().getFullYear()} Tokovo Studio
          </p>
        </div>
      </div>
    </footer>
  )
}
