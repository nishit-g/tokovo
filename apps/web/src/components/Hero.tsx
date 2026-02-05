'use client'

import { useRef, useState, useEffect } from 'react'
import { motion, useScroll, useTransform, useSpring, useInView } from 'framer-motion'

// Smooth number counter
function Counter({ value, suffix = '' }: { value: number; suffix?: string }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (isInView) {
      let start = 0
      const end = value
      const duration = 2000
      const increment = end / (duration / 16)

      const timer = setInterval(() => {
        start += increment
        if (start >= end) {
          setCount(end)
          clearInterval(timer)
        } else {
          setCount(Math.floor(start))
        }
      }, 16)

      return () => clearInterval(timer)
    }
  }, [isInView, value])

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>
}

// Text reveal animation
function RevealText({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <span className="inline-block overflow-hidden">
      <motion.span
        className="inline-block"
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        transition={{
          duration: 1,
          delay,
          ease: [0.22, 1, 0.36, 1]
        }}
      >
        {children}
      </motion.span>
    </span>
  )
}

// Magnetic hover effect for buttons
function MagneticButton({ children, className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { className?: string }) {
  const ref = useRef<HTMLButtonElement>(null)
  const [position, setPosition] = useState({ x: 0, y: 0 })

  const handleMouse = (e: React.MouseEvent) => {
    const { clientX, clientY } = e
    const { left, top, width, height } = ref.current!.getBoundingClientRect()
    const x = (clientX - left - width / 2) * 0.15
    const y = (clientY - top - height / 2) * 0.15
    setPosition({ x, y })
  }

  return (
    <motion.button
      ref={ref}
      onMouseMove={handleMouse}
      onMouseLeave={() => setPosition({ x: 0, y: 0 })}
      animate={{ x: position.x, y: position.y }}
      transition={{ type: 'spring', stiffness: 150, damping: 15 }}
      className={className}
      {...props}
    />
  )
}

export function Hero() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  })

  const videoScale = useTransform(scrollYProgress, [0, 0.5], [1, 0.9])
  const videoY = useTransform(scrollYProgress, [0, 0.5], [0, 50])
  const videoSpringScale = useSpring(videoScale, { stiffness: 100, damping: 30 })
  const videoSpringY = useSpring(videoY, { stiffness: 100, damping: 30 })

  return (
    <div ref={containerRef} className="relative min-h-[200vh] bg-black">
      {/* Gradient background */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(255,255,255,0.03),_transparent_50%)]" />

      {/* Sticky hero */}
      <div className="sticky top-0 flex min-h-screen flex-col">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="relative z-20 flex items-center justify-between px-8 py-8 lg:px-16"
        >
          <span className="text-lg font-medium tracking-tight text-white">
            tokovo
          </span>
          <a
            href="#access"
            className="group flex items-center gap-2 text-sm text-white/50 transition-colors hover:text-white"
          >
            Request access
            <svg
              className="h-4 w-4 transition-transform group-hover:translate-x-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </a>
        </motion.header>

        {/* Main content */}
        <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 pb-12">
          {/* Eyebrow */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <span className="mb-6 inline-block rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium uppercase tracking-widest text-white/60">
              For studios & enterprises
            </span>
          </motion.div>

          {/* Headline */}
          <h1 className="max-w-4xl text-center text-5xl font-bold leading-[1.1] tracking-tight text-white sm:text-6xl lg:text-7xl">
            <RevealText delay={0.3}>Video content,</RevealText>
            <br />
            <span className="text-white/40">
              <RevealText delay={0.4}>as code</RevealText>
            </span>
          </h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="mt-6 max-w-xl text-center text-lg text-white/40"
          >
            Define phones, apps, and conversations in TypeScript.
            Render cinematic social videos at scale.
          </motion.p>

          {/* Video container */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.9, ease: [0.22, 1, 0.36, 1] }}
            style={{ scale: videoSpringScale, y: videoSpringY }}
            className="mt-16 w-full max-w-5xl"
          >
            <div className="group relative">
              {/* Glow effect */}
              <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-white/10 via-white/5 to-white/10 opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-100" />

              {/* Video frame */}
              <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/50 backdrop-blur">
                {/* Browser chrome */}
                <div className="flex items-center gap-3 border-b border-white/5 bg-white/[0.02] px-4 py-3">
                  <div className="flex gap-1.5">
                    <div className="h-2.5 w-2.5 rounded-full bg-white/10" />
                    <div className="h-2.5 w-2.5 rounded-full bg-white/10" />
                    <div className="h-2.5 w-2.5 rounded-full bg-white/10" />
                  </div>
                  <div className="flex-1 text-center">
                    <span className="text-xs text-white/20">tokovo.studio</span>
                  </div>
                </div>

                {/* Video area */}
                <div className="relative aspect-video bg-black">
                  {/* Video placeholder - replace with actual video */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <motion.div
                      className="flex flex-col items-center gap-4"
                      whileHover={{ scale: 1.05 }}
                      transition={{ type: 'spring', stiffness: 300 }}
                    >
                      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white/5 ring-1 ring-white/10 transition-colors hover:bg-white/10">
                        <svg className="h-8 w-8 text-white/60" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </div>
                      <span className="text-sm text-white/30">Watch demo</span>
                    </motion.div>
                  </div>

                  {/* 
                    Replace placeholder with:
                    <video 
                      src="/demo.mp4" 
                      autoPlay 
                      loop 
                      muted 
                      playsInline
                      className="h-full w-full object-cover"
                    />
                  */}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Bottom section - scrolls into view */}
      <div id="access" className="relative bg-black px-6 py-32">
        <div className="mx-auto max-w-4xl">
          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="mb-24 grid grid-cols-3 gap-8 border-b border-white/5 pb-16"
          >
            <div className="text-center">
              <div className="text-4xl font-bold text-white lg:text-5xl">
                <Counter value={10} suffix="+" />
              </div>
              <div className="mt-2 text-sm text-white/30">Device models</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-white lg:text-5xl">
                <Counter value={5} />
              </div>
              <div className="mt-2 text-sm text-white/30">App simulators</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-white lg:text-5xl">
                <Counter value={4} suffix="K" />
              </div>
              <div className="mt-2 text-sm text-white/30">Max resolution</div>
            </div>
          </motion.div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-center"
          >
            <h2 className="text-3xl font-bold text-white sm:text-4xl">
              Ready to ship video at scale?
            </h2>
            <p className="mt-4 text-white/40">
              Join the waitlist for early access.
            </p>

            <div className="mt-10 flex justify-center">
              {!submitted ? (
                <form
                  onSubmit={(e) => { e.preventDefault(); setSubmitted(true) }}
                  className="flex w-full max-w-md flex-col gap-3 sm:flex-row"
                >
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="flex-1 rounded-xl border border-white/10 bg-white/5 px-5 py-4 text-white placeholder:text-white/20 focus:border-white/20 focus:outline-none transition-colors"
                  />
                  <MagneticButton
                    type="submit"
                    className="rounded-xl bg-white px-8 py-4 font-medium text-black transition-colors hover:bg-white/90"
                  >
                    Request access
                  </MagneticButton>
                </form>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center gap-3 text-white"
                >
                  <svg className="h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  You're in. We'll be in touch.
                </motion.div>
              )}
            </div>
          </motion.div>

          {/* Footer */}
          <div className="mt-32 flex items-center justify-between border-t border-white/5 pt-8">
            <span className="text-sm text-white/20">© {new Date().getFullYear()} Tokovo</span>
            <a href="mailto:hello@tokovo.studio" className="text-sm text-white/20 hover:text-white/50 transition-colors">
              Contact
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
