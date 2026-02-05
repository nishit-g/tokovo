'use client'

import { motion } from 'framer-motion'
import { Container } from '@/components/Container'

const steps = [
    {
        number: '01',
        title: 'Define your episode',
        description: 'Write TypeScript that describes your content — devices, apps, messages, timing, camera movements.',
        code: `defineEpisode("drama")
  .device("iphone16pro")
  .track("whatsapp", wa => {
    wa.receive("Hey...")
    wa.send("What?")
  })`,
    },
    {
        number: '02',
        title: 'Preview in real-time',
        description: 'Hot reload your episode in the browser. See changes instantly as you code.',
        code: `pnpm dev:video

# Opens localhost:5174
# Select your episode
# Watch it render live`,
    },
    {
        number: '03',
        title: 'Render at scale',
        description: 'Export to MP4, WebM, or frames. Batch render thousands of variations programmatically.',
        code: `pnpm render --episode drama \\
  --format mp4 \\
  --output ./exports`,
    },
]

export function HowItWorks() {
    return (
        <section id="how-it-works" className="relative overflow-hidden bg-[#030712] py-24 sm:py-32">
            {/* Subtle top border */}
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />

            <Container>
                <div className="mx-auto max-w-2xl text-center">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-3xl font-bold tracking-tight text-white sm:text-4xl"
                    >
                        How it works
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="mt-4 text-gray-400"
                    >
                        From code to cinematic video in three steps
                    </motion.p>
                </div>

                <div className="mt-16 space-y-12 lg:space-y-0 lg:grid lg:grid-cols-3 lg:gap-8">
                    {steps.map((step, index) => (
                        <motion.div
                            key={step.number}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className="relative"
                        >
                            {/* Step number */}
                            <div className="mb-4 text-sm font-mono text-cyan-500">{step.number}</div>

                            {/* Title */}
                            <h3 className="text-xl font-semibold text-white">{step.title}</h3>

                            {/* Description */}
                            <p className="mt-2 text-gray-400">{step.description}</p>

                            {/* Code block */}
                            <div className="mt-4 overflow-hidden rounded-lg bg-gray-900/50 ring-1 ring-white/5">
                                <div className="flex items-center gap-2 border-b border-white/5 px-4 py-2">
                                    <div className="h-2.5 w-2.5 rounded-full bg-red-500/60" />
                                    <div className="h-2.5 w-2.5 rounded-full bg-yellow-500/60" />
                                    <div className="h-2.5 w-2.5 rounded-full bg-green-500/60" />
                                </div>
                                <pre className="p-4 text-sm text-gray-300 overflow-x-auto">
                                    <code>{step.code}</code>
                                </pre>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </Container>
        </section>
    )
}
