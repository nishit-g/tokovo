'use client'

import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'

export function Showcase() {
    const containerRef = useRef(null)
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ['start end', 'end start'],
    })

    const y1 = useTransform(scrollYProgress, [0, 1], [100, -100])
    const y2 = useTransform(scrollYProgress, [0, 1], [0, -200])
    const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0])

    return (
        <section ref={containerRef} className="relative overflow-hidden bg-black py-32 lg:py-48">
            <motion.div style={{ opacity }} className="mx-auto max-w-[1800px] px-6 lg:px-12">
                {/* Giant text */}
                <div className="relative">
                    <motion.div
                        style={{ y: y1 }}
                        className="text-[clamp(4rem,15vw,12rem)] font-bold leading-none tracking-tighter text-white/[0.03]"
                    >
                        TOKOVO
                    </motion.div>

                    <motion.div
                        style={{ y: y2 }}
                        className="absolute inset-0 flex items-center"
                    >
                        <div className="grid gap-8 lg:grid-cols-2 lg:gap-16 items-center w-full">
                            {/* Left: Text */}
                            <div>
                                <motion.span
                                    initial={{ opacity: 0 }}
                                    whileInView={{ opacity: 1 }}
                                    viewport={{ once: true }}
                                    className="font-mono text-xs uppercase tracking-[0.3em] text-gray-600"
                                >
                                    How it works
                                </motion.span>

                                <motion.h2
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                                    className="mt-4 text-3xl font-bold text-white lg:text-5xl leading-tight"
                                >
                                    Write episodes in TypeScript.
                                    <br />
                                    <span className="text-gray-500">Render with Remotion.</span>
                                </motion.h2>

                                <motion.p
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: 0.2, duration: 0.8 }}
                                    className="mt-6 max-w-md text-gray-500 leading-relaxed"
                                >
                                    Define your content declaratively. Hot reload in the browser.
                                    Export to MP4, WebM, or frames when you're ready.
                                </motion.p>
                            </div>

                            {/* Right: Code block */}
                            <motion.div
                                initial={{ opacity: 0, x: 60 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
                            >
                                <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#0a0a0a]">
                                    {/* Terminal header */}
                                    <div className="flex items-center gap-3 border-b border-white/5 px-5 py-4">
                                        <div className="flex gap-2">
                                            <div className="h-3 w-3 rounded-full bg-white/20" />
                                            <div className="h-3 w-3 rounded-full bg-white/20" />
                                            <div className="h-3 w-3 rounded-full bg-white/20" />
                                        </div>
                                        <span className="font-mono text-xs text-gray-600">episode.ts</span>
                                    </div>

                                    {/* Code */}
                                    <div className="p-6 font-mono text-sm leading-7">
                                        <div>
                                            <span className="text-purple-400">defineEpisode</span>
                                            <span className="text-gray-500">(</span>
                                            <span className="text-amber-300">"drama"</span>
                                            <span className="text-gray-500">)</span>
                                        </div>
                                        <div className="pl-4">
                                            <span className="text-gray-600">.</span>
                                            <span className="text-cyan-400">device</span>
                                            <span className="text-gray-500">(</span>
                                            <span className="text-amber-300">"iphone16pro"</span>
                                            <span className="text-gray-500">)</span>
                                        </div>
                                        <div className="pl-4">
                                            <span className="text-gray-600">.</span>
                                            <span className="text-cyan-400">background</span>
                                            <span className="text-gray-500">(</span>
                                            <span className="text-amber-300">"cozy-bedroom"</span>
                                            <span className="text-gray-500">)</span>
                                        </div>
                                        <div className="pl-4">
                                            <span className="text-gray-600">.</span>
                                            <span className="text-cyan-400">track</span>
                                            <span className="text-gray-500">(</span>
                                            <span className="text-amber-300">"whatsapp"</span>
                                            <span className="text-gray-500">,</span>
                                            <span className="text-gray-300"> wa</span>
                                            <span className="text-purple-400"> =&gt;</span>
                                            <span className="text-gray-500"> {"{"}</span>
                                        </div>
                                        <div className="pl-8">
                                            <span className="text-gray-600">wa.</span>
                                            <span className="text-green-400">receive</span>
                                            <span className="text-gray-500">(</span>
                                            <span className="text-amber-300">"We need to talk..."</span>
                                            <span className="text-gray-500">)</span>
                                        </div>
                                        <div className="pl-8">
                                            <span className="text-gray-600">wa.</span>
                                            <span className="text-blue-400">send</span>
                                            <span className="text-gray-500">(</span>
                                            <span className="text-amber-300">"What happened?"</span>
                                            <span className="text-gray-500">)</span>
                                        </div>
                                        <div className="pl-4">
                                            <span className="text-gray-500">{"}"}</span>
                                            <span className="text-gray-500">)</span>
                                        </div>
                                        <div className="pl-4">
                                            <span className="text-gray-600">.</span>
                                            <span className="text-yellow-400">camera</span>
                                            <span className="text-gray-500">(</span>
                                            <span className="text-gray-300">cam</span>
                                            <span className="text-purple-400"> =&gt;</span>
                                            <span className="text-gray-500"> {"{"}</span>
                                        </div>
                                        <div className="pl-8">
                                            <span className="text-gray-600">cam.</span>
                                            <span className="text-cyan-400">focus</span>
                                            <span className="text-gray-500">(</span>
                                            <span className="text-amber-300">"lastMessage"</span>
                                            <span className="text-gray-500">)</span>
                                        </div>
                                        <div className="pl-4">
                                            <span className="text-gray-500">{"}"}</span>
                                            <span className="text-gray-500">)</span>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </motion.div>
                </div>
            </motion.div>
        </section>
    )
}
