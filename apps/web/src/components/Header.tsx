'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, useScroll, useMotionValueEvent } from 'framer-motion'

export function Header() {
  const [hidden, setHidden] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { scrollY } = useScroll()

  useMotionValueEvent(scrollY, 'change', (latest) => {
    const previous = scrollY.getPrevious() ?? 0
    setHidden(latest > previous && latest > 100)
    setScrolled(latest > 50)
  })

  return (
    <motion.header
      variants={{
        visible: { y: 0, opacity: 1 },
        hidden: { y: -100, opacity: 0 },
      }}
      animate={hidden ? 'hidden' : 'visible'}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${scrolled
          ? 'border-b border-white/5 bg-[#0a0a0a]/90 backdrop-blur-xl'
          : 'bg-transparent'
        }`}
    >
      <div className="mx-auto flex h-20 max-w-[1800px] items-center justify-between px-6 lg:px-12">
        {/* Logo */}
        <Link href="/" className="font-medium tracking-tight text-white">
          tokovo<span className="text-white/30">.</span><span className="text-white/40">studio</span>
        </Link>

        {/* Nav */}
        <nav className="flex items-center gap-8">
          <Link
            href="#features"
            className="hidden text-sm text-white/40 transition-colors hover:text-white sm:block"
          >
            Features
          </Link>
          <a
            href="#early-access"
            className="rounded-full bg-white px-5 py-2.5 text-sm font-medium text-black transition-colors hover:bg-amber-500"
          >
            Get Access
          </a>
        </nav>
      </div>
    </motion.header>
  )
}
