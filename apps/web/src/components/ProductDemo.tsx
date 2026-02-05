'use client'

import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'

const steps = [
    {
        number: '01',
        title: 'Define',
        subtitle: 'Write your episode in TypeScript',
        code: `defineEpisode("drama")
  .device("iphone16pro")
  .background("cozy-bedroom")
  .track("whatsapp", wa => {
    wa.receive("We need to talk...")
    wa.send("What?")
    wa.receive("Check your DMs...")
  })
  .camera(cam => {
    cam.focus("lastMessage")
  })`,
    },
    {
        number: '02',
        title: 'Preview',
        subtitle: 'Hot reload in the browser',
        visual: 'preview',
    },
    {
        number: '03',
        title: 'Render',
        subtitle: 'Export MP4 at scale',
        visual: 'export',
    },
]

function CodeBlock({ code }: { code: string }) {
    return (
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0d0d0d]">
            {/* Header */}
            <div className="flex items-center gap-3 border-b border-white/5 px-5 py-3">
                <div className="flex gap-1.5">
                    <div className="h-3 w-3 rounded-full bg-white/10" />
                    <div className="h-3 w-3 rounded-full bg-white/10" />
                    <div className="h-3 w-3 rounded-full bg-white/10" />
                </div>
                <span className="font-mono text-xs text-white/30">episode.ts</span>
            </div>

            {/* Code */}
            <pre className="overflow-x-auto p-6 font-mono text-sm leading-relaxed">
                <code>
                    {code.split('\n').map((line, i) => (
                        <div key={i} className="flex">
                            <span className="w-8 select-none text-white/20">{i + 1}</span>
                            <span className="text-white/70">
                                {/* Basic syntax highlighting */}
                                {line
                                    .replace(/(".*?")/g, '<amber>$1</amber>')
                                    .replace(/(defineEpisode|device|background|track|camera|receive|send|focus)/g, '<cyan>$1</cyan>')
                                    .replace(/(\.\w+)/g, '<muted>$1</muted>')
                                    .split(/(<amber>.*?<\/amber>|<cyan>.*?<\/cyan>|<muted>.*?<\/muted>)/)
                                    .map((part, j) => {
                                        if (part.startsWith('<amber>')) {
                                            return <span key={j} className="text-amber-400">{part.replace(/<\/?amber>/g, '')}</span>
                                        }
                                        if (part.startsWith('<cyan>')) {
                                            return <span key={j} className="text-cyan-400">{part.replace(/<\/?cyan>/g, '')}</span>
                                        }
                                        if (part.startsWith('<muted>')) {
                                            return <span key={j} className="text-white/40">{part.replace(/<\/?muted>/g, '')}</span>
                                        }
                                        return part
                                    })
                                }
                            </span>
                        </div>
                    ))}
                </code>
            </pre>
        </div>
    )
}

function PreviewVisual() {
    return (
        <div className="relative aspect-video overflow-hidden rounded-2xl border border-white/10 bg-[#0d0d0d]">
            {/* Toolbar */}
            <div className="flex items-center justify-between border-b border-white/5 px-4 py-3">
                <div className="flex gap-1.5">
                    <div className="h-3 w-3 rounded-full bg-white/10" />
                    <div className="h-3 w-3 rounded-full bg-white/10" />
                    <div className="h-3 w-3 rounded-full bg-white/10" />
                </div>
                <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-green-500" />
                    <span className="font-mono text-xs text-green-500">Hot reload active</span>
                </div>
            </div>

            {/* Preview content */}
            <div className="flex h-full items-center justify-center p-8">
                <div className="relative">
                    {/* Phone */}
                    <div className="w-[180px] rounded-[30px] bg-black p-[4px] ring-1 ring-white/10">
                        <div className="overflow-hidden rounded-[26px] bg-[#111]">
                            <div className="flex justify-center pt-2">
                                <div className="h-4 w-16 rounded-full bg-black" />
                            </div>
                            <div className="aspect-[9/16] bg-gradient-to-b from-[#0f1419] to-[#0a0a0a]" />
                        </div>
                    </div>

                    {/* Play indicator */}
                    <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 text-white/30">
                        <div className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                        <span className="font-mono text-[10px]">PLAYING</span>
                    </div>
                </div>
            </div>
        </div>
    )
}

function ExportVisual() {
    return (
        <div className="relative aspect-video overflow-hidden rounded-2xl border border-white/10 bg-[#0d0d0d]">
            {/* Content */}
            <div className="flex h-full flex-col items-center justify-center p-8">
                <div className="grid grid-cols-3 gap-3">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, scale: 0.8 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.1 }}
                            viewport={{ once: true }}
                            className="h-16 w-16 rounded-lg bg-white/5 flex items-center justify-center"
                        >
                            <svg className="h-6 w-6 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </motion.div>
                    ))}
                </div>

                {/* Export stats */}
                <div className="mt-8 flex gap-8 text-center">
                    <div>
                        <div className="font-mono text-2xl font-bold text-amber-500">1,247</div>
                        <div className="text-xs text-white/40">Videos rendered</div>
                    </div>
                    <div>
                        <div className="font-mono text-2xl font-bold text-white">MP4</div>
                        <div className="text-xs text-white/40">Format</div>
                    </div>
                    <div>
                        <div className="font-mono text-2xl font-bold text-white">4K</div>
                        <div className="text-xs text-white/40">Resolution</div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export function ProductDemo() {
    const containerRef = useRef<HTMLDivElement>(null)
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ['start start', 'end end'],
    })

    const x = useTransform(scrollYProgress, [0, 1], ['0%', '-66.67%'])

    return (
        <section ref={containerRef} className="relative h-[300vh] bg-[#0a0a0a]">
            {/* Section label */}
            <div className="absolute left-6 top-8 lg:left-12">
                <span className="font-mono text-xs uppercase tracking-[0.2em] text-white/30">How it works</span>
            </div>

            {/* Sticky horizontal scroll container */}
            <div className="sticky top-0 flex h-screen items-center overflow-hidden">
                <motion.div
                    style={{ x }}
                    className="flex"
                >
                    {steps.map((step, index) => (
                        <div
                            key={step.number}
                            className="flex h-screen w-screen flex-shrink-0 items-center px-6 lg:px-12"
                        >
                            <div className="mx-auto grid max-w-[1400px] gap-12 lg:grid-cols-2 lg:gap-24 items-center">
                                {/* Left: Text */}
                                <div>
                                    <span className="font-mono text-sm text-amber-500">{step.number}</span>
                                    <h2 className="mt-4 text-5xl font-bold tracking-tight text-white lg:text-7xl">
                                        {step.title}
                                    </h2>
                                    <p className="mt-4 text-xl text-white/50">
                                        {step.subtitle}
                                    </p>
                                </div>

                                {/* Right: Visual */}
                                <div>
                                    {step.code && <CodeBlock code={step.code} />}
                                    {step.visual === 'preview' && <PreviewVisual />}
                                    {step.visual === 'export' && <ExportVisual />}
                                </div>
                            </div>
                        </div>
                    ))}
                </motion.div>
            </div>

            {/* Progress indicator */}
            <div className="fixed bottom-8 left-1/2 z-10 -translate-x-1/2">
                <div className="flex gap-2">
                    {steps.map((_, i) => (
                        <motion.div
                            key={i}
                            className="h-1 w-8 rounded-full bg-white/10 overflow-hidden"
                        >
                            <motion.div
                                className="h-full bg-amber-500"
                                style={{
                                    scaleX: useTransform(
                                        scrollYProgress,
                                        [i / steps.length, (i + 1) / steps.length],
                                        [0, 1]
                                    ),
                                    transformOrigin: 'left',
                                }}
                            />
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}
