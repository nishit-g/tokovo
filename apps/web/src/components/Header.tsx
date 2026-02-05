'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, useScroll, useMotionValueEvent } from 'framer-motion'
import { Button } from '@/components/Button'
import { Logo } from '@/components/Logo'

export function Header() {
  const [hidden, setHidden] = useState(false)
  const [atTop, setAtTop] = useState(true)
  const { scrollY } = useScroll()

  useMotionValueEvent(scrollY, 'change', (latest) => {
    const previous = scrollY.getPrevious() ?? 0
    setHidden(latest > previous && latest > 150)
    setAtTop(latest < 50)
  })

  return (
    <motion.header
      variants={{
        visible: { y: 0 },
        hidden: { y: '-100%' },
      }}
      animate={hidden ? 'hidden' : 'visible'}
      transition={{ duration: 0.35, ease: 'easeInOut' }}
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${atTop ? 'bg-transparent' : 'border-b border-white/5 bg-black/80 backdrop-blur-xl'
        }`}
    >
      <div className="mx-auto flex h-20 max-w-[1800px] items-center justify-between px-6 lg:px-12">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Link href="/">
            <Logo className="h-5" />
          </Link>
        </motion.div>

        <motion.nav
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="flex items-center gap-8"
        >
          <Link
            href="#features"
            className="hidden text-sm text-gray-500 transition-colors hover:text-white sm:block"
          >
            Features
          </Link>
          <Button href="#early-access" color="cyan" className="rounded-full px-5 py-2.5 text-sm">
            Get Access
          </Button>
        </motion.nav>
      </div>
    </motion.header>
  )
}
