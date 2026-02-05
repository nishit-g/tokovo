'use client'

import { useRef, useState } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { Button } from '@/components/Button'

export function CallToAction() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const containerRef = useRef(null)

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'center center'],
  })

  const scale = useTransform(scrollYProgress, [0, 1], [0.8, 1])
  const opacity = useTransform(scrollYProgress, [0, 0.5], [0, 1])

  return (
    <section ref={containerRef} id="early-access" className="relative bg-black py-32 lg:py-48">
      <motion.div
        style={{ scale, opacity }}
        className="mx-auto max-w-[1800px] px-6 lg:px-12"
      >
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.03] to-transparent p-12 lg:p-20">
          {/* Background gradient */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(6,182,212,0.15),_transparent_50%)]" />

          <div className="relative text-center">
            <motion.span
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="font-mono text-xs uppercase tracking-[0.3em] text-gray-600"
            >
              Early Access
            </motion.span>

            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="mx-auto mt-4 max-w-2xl text-4xl font-bold tracking-tight text-white lg:text-6xl"
            >
              Ready to ship video at scale?
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1, duration: 0.8 }}
              className="mx-auto mt-6 max-w-md text-gray-500"
            >
              Join the waitlist. We're onboarding studios and enterprises who want to define content as code.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="mt-10 flex justify-center"
            >
              {!submitted ? (
                <form
                  onSubmit={(e) => { e.preventDefault(); setSubmitted(true) }}
                  className="flex flex-col gap-4 sm:flex-row"
                >
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="w-72 rounded-full border border-white/10 bg-white/5 px-6 py-4 text-white placeholder:text-gray-600 focus:border-cyan-500 focus:outline-none transition-colors"
                  />
                  <Button type="submit" color="cyan" className="rounded-full px-8 py-4">
                    Request Access
                  </Button>
                </form>
              ) : (
                <div className="flex items-center gap-3 text-emerald-400">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-lg">You're in. We'll be in touch.</span>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </motion.div>
    </section>
  )
}
