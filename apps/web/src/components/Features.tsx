'use client'

import { useRef } from 'react'
import { motion, useScroll, useTransform, useInView } from 'framer-motion'

const features = [
    {
        title: 'Pixel-perfect devices',
        description: 'iPhone 16, 15, 14, SE. Pixel, Galaxy, MacBook. Every bezel, notch, and dynamic island rendered with obsessive accuracy.',
        visual: 'devices',
    },
    {
        title: 'Native app simulators',
        description: 'WhatsApp, iMessage, X, Instagram. Built from scratch in React with authentic animations, keyboard typing, and interactions.',
        visual: 'apps',
    },
    {
        title: 'Cinematic camera',
        description: 'Pan, zoom, focus, shake, track. A full camera system that follows your content with easing curves and smooth transitions.',
        visual: 'camera',
    },
    {
        title: 'AI-powered audio',
        description: 'ACE-Step integration for custom soundtrack generation. Define your music in the same codebase as your video.',
        visual: 'audio',
    },
]

function FeatureVisual({ type }: { type: string }) {
    return (
        <div className="aspect-square overflow-hidden rounded-2xl bg-[#111] ring-1 ring-white/5">
            <div className="flex h-full items-center justify-center">
                {type === 'devices' && (
                    <div className="flex -space-x-8">
                        {[0, 1, 2].map((i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                viewport={{ once: true }}
                                className="relative"
                                style={{ zIndex: 3 - i }}
                            >
                                <div
                                    className="w-[100px] rounded-[24px] bg-black p-[3px] ring-1 ring-white/10 shadow-2xl"
                                    style={{ transform: `rotate(${(i - 1) * 5}deg)` }}
                                >
                                    <div className="overflow-hidden rounded-[21px] bg-[#1a1a1a]">
                                        <div className="aspect-[9/16]" />
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}

                {type === 'apps' && (
                    <div className="grid grid-cols-2 gap-3">
                        {['W', 'iM', 'X', 'IG'].map((app, i) => (
                            <motion.div
                                key={app}
                                initial={{ opacity: 0, scale: 0.8 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                transition={{ delay: i * 0.1 }}
                                viewport={{ once: true }}
                                className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5 font-mono text-lg text-white/40"
                            >
                                {app}
                            </motion.div>
                        ))}
                    </div>
                )}

                {type === 'camera' && (
                    <motion.div
                        initial={{ scale: 1 }}
                        whileInView={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        viewport={{ once: true }}
                        className="relative"
                    >
                        <div className="h-32 w-32 rounded-full border-2 border-white/20" />
                        <div className="absolute inset-4 rounded-full border border-white/10" />
                        <div className="absolute inset-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-500" />
                    </motion.div>
                )}

                {type === 'audio' && (
                    <div className="flex items-end gap-1">
                        {[...Array(12)].map((_, i) => (
                            <motion.div
                                key={i}
                                initial={{ height: 8 }}
                                animate={{ height: [8, 32 + Math.random() * 32, 8] }}
                                transition={{
                                    duration: 0.5 + Math.random() * 0.5,
                                    repeat: Infinity,
                                    delay: i * 0.1,
                                }}
                                className="w-2 rounded-full bg-amber-500/60"
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

export function Features() {
    return (
        <section id="features" className="relative bg-[#0a0a0a] py-32 lg:py-48">
            {/* Section label */}
            <div className="mx-auto max-w-[1400px] px-6 lg:px-12">
                <span className="font-mono text-xs uppercase tracking-[0.2em] text-white/30">Capabilities</span>

                <div className="mt-16 space-y-32 lg:space-y-48">
                    {features.map((feature, index) => (
                        <motion.div
                            key={feature.title}
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: '-100px' }}
                            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                            className={`grid gap-12 lg:grid-cols-2 lg:gap-24 items-center ${index % 2 === 1 ? 'lg:grid-flow-dense' : ''
                                }`}
                        >
                            {/* Text */}
                            <div className={index % 2 === 1 ? 'lg:col-start-2' : ''}>
                                <h3 className="text-3xl font-bold tracking-tight text-white lg:text-5xl">
                                    {feature.title}
                                </h3>
                                <p className="mt-4 text-lg text-white/50 leading-relaxed">
                                    {feature.description}
                                </p>
                            </div>

                            {/* Visual */}
                            <div className={index % 2 === 1 ? 'lg:col-start-1 lg:row-start-1' : ''}>
                                <FeatureVisual type={feature.visual} />
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}
