'use client'

import { useRef, useEffect, useState } from 'react'
import { motion, useScroll, useTransform, useSpring, useInView } from 'framer-motion'
import { Button } from '@/components/Button'

// Magnetic button effect
function MagneticButton({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const [position, setPosition] = useState({ x: 0, y: 0 })

  const handleMouse = (e: React.MouseEvent) => {
    const { clientX, clientY } = e
    const { left, top, width, height } = ref.current!.getBoundingClientRect()
    const x = (clientX - left - width / 2) * 0.3
    const y = (clientY - top - height / 2) * 0.3
    setPosition({ x, y })
  }

  const reset = () => setPosition({ x: 0, y: 0 })

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouse}
      onMouseLeave={reset}
      animate={{ x: position.x, y: position.y }}
      transition={{ type: 'spring', stiffness: 150, damping: 15 }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// Reveal text animation
function RevealText({ children, delay = 0 }: { children: string; delay?: number }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <span ref={ref} className="inline-block overflow-hidden">
      <motion.span
        className="inline-block"
        initial={{ y: '100%' }}
        animate={isInView ? { y: 0 } : { y: '100%' }}
        transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }}
      >
        {children}
      </motion.span>
    </span>
  )
}

// Floating phone mockup
function PhoneMockup() {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })

  const y = useTransform(scrollYProgress, [0, 1], [100, -100])
  const rotate = useTransform(scrollYProgress, [0, 1], [5, -5])
  const springY = useSpring(y, { stiffness: 100, damping: 30 })
  const springRotate = useSpring(rotate, { stiffness: 100, damping: 30 })

  return (
    <motion.div
      ref={ref}
      style={{ y: springY, rotateZ: springRotate }}
      className="relative"
    >
      {/* Phone shell */}
      <div className="relative w-[280px] rounded-[50px] bg-black p-[8px] shadow-2xl shadow-black/50">
        <div className="overflow-hidden rounded-[42px] bg-[#1a1a1a]">
          {/* Dynamic island */}
          <div className="flex justify-center pt-3">
            <div className="h-8 w-28 rounded-full bg-black" />
          </div>

          {/* Screen content */}
          <div className="aspect-[9/16] bg-gradient-to-b from-[#111b21] to-[#0b1014]">
            {/* WhatsApp header */}
            <div className="flex items-center gap-3 bg-[#202c33] px-4 py-3">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500" />
              <div>
                <div className="h-3 w-20 rounded bg-white/30" />
                <div className="mt-1.5 h-2 w-12 rounded bg-white/10" />
              </div>
            </div>

            {/* Messages */}
            <div className="space-y-3 p-4">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="w-3/4 rounded-2xl rounded-tl-md bg-[#202c33] p-3"
              >
                <div className="h-2 w-full rounded bg-white/20" />
                <div className="mt-2 h-2 w-2/3 rounded bg-white/10" />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1 }}
                className="ml-auto w-2/3 rounded-2xl rounded-tr-md bg-[#005c4b] p-3"
              >
                <div className="h-2 w-full rounded bg-white/30" />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.5 }}
                className="w-4/5 rounded-2xl rounded-tl-md bg-[#202c33] p-3"
              >
                <div className="h-2 w-full rounded bg-white/20" />
                <div className="mt-2 h-2 w-1/2 rounded bg-white/10" />
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Glow */}
      <div className="absolute -inset-10 -z-10 rounded-full bg-cyan-500/20 blur-3xl" />
    </motion.div>
  )
}

export function Hero() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const containerRef = useRef(null)

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  })

  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.95])

  return (
    <section ref={containerRef} className="relative min-h-[200vh]">
      {/* Fixed hero content */}
      <motion.div
        style={{ opacity, scale }}
        className="sticky top-0 flex min-h-screen items-center overflow-hidden bg-black"
      >
        {/* Grid lines */}
        <div className="absolute inset-0 opacity-[0.03]">
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="absolute top-0 bottom-0 w-px bg-white"
              style={{ left: `${(i / 20) * 100}%` }}
            />
          ))}
        </div>

        <div className="relative z-10 mx-auto w-full max-w-[1800px] px-6 lg:px-12">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-0 lg:items-center">
            {/* Left: Typography */}
            <div className="max-w-2xl">
              {/* Eyebrow */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, delay: 0.2 }}
                className="mb-8"
              >
                <span className="font-mono text-xs uppercase tracking-[0.3em] text-gray-500">
                  Programmatic Video Engine
                </span>
              </motion.div>

              {/* Main headline - massive, bold */}
              <h1 className="text-[clamp(3rem,10vw,8rem)] font-bold leading-[0.85] tracking-[-0.04em] text-white">
                <RevealText delay={0}>Video</RevealText>
                <br />
                <RevealText delay={0.1}>content,</RevealText>
                <br />
                <span className="bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent">
                  <RevealText delay={0.2}>as code.</RevealText>
                </span>
              </h1>

              {/* Subtext */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="mt-8 max-w-md text-lg text-gray-500 leading-relaxed"
              >
                Define phones, apps, and conversations in TypeScript.
                Render cinematic social videos at scale.
              </motion.p>

              {/* Email form */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.8 }}
                className="mt-12"
              >
                {!submitted ? (
                  <form
                    onSubmit={(e) => { e.preventDefault(); setSubmitted(true) }}
                    className="flex flex-col gap-4 sm:flex-row sm:items-center"
                  >
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      className="w-full sm:w-72 border-b-2 border-gray-800 bg-transparent py-4 text-white placeholder:text-gray-600 focus:border-cyan-500 focus:outline-none transition-colors"
                    />
                    <MagneticButton>
                      <Button type="submit" color="cyan" className="rounded-full px-8 py-4">
                        Request Access
                      </Button>
                    </MagneticButton>
                  </form>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center gap-3 text-emerald-400"
                  >
                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-lg">You're in. We'll be in touch.</span>
                  </motion.div>
                )}
              </motion.div>
            </div>

            {/* Right: Phone mockup */}
            <motion.div
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="flex justify-center lg:justify-end"
            >
              <PhoneMockup />
            </motion.div>
          </div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-12 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="flex flex-col items-center gap-2 text-gray-600"
          >
            <span className="font-mono text-xs uppercase tracking-widest">Scroll</span>
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  )
}
