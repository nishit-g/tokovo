'use client'

import { useRef } from 'react'
import { motion, useScroll, useTransform, useInView } from 'framer-motion'

const features = [
    {
        number: '01',
        title: 'TypeScript-native DSL',
        description: 'Full intellisense, type safety, and autocompletion. Your IDE becomes your video editor.',
    },
    {
        number: '02',
        title: 'Pixel-perfect devices',
        description: 'iPhone 16, Pixel, Galaxy — every bezel, notch, and dynamic island rendered exactly right.',
    },
    {
        number: '03',
        title: 'Native app simulators',
        description: 'WhatsApp, iMessage, X, Instagram — built from scratch with authentic animations.',
    },
    {
        number: '04',
        title: 'Cinematic camera',
        description: 'Pan, zoom, focus, shake, track — easing curves that make your content feel alive.',
    },
]

function FeatureItem({ feature, index }: { feature: typeof features[0]; index: number }) {
    const ref = useRef(null)
    const isInView = useInView(ref, { once: true, margin: '-20%' })

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 60 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="group grid grid-cols-12 items-start gap-4 border-t border-white/10 py-12 lg:py-16"
        >
            {/* Number */}
            <div className="col-span-2 lg:col-span-1">
                <span className="font-mono text-sm text-gray-600">{feature.number}</span>
            </div>

            {/* Title */}
            <div className="col-span-10 lg:col-span-4">
                <h3 className="text-2xl font-medium text-white lg:text-3xl group-hover:text-cyan-400 transition-colors duration-300">
                    {feature.title}
                </h3>
            </div>

            {/* Description */}
            <div className="col-span-12 lg:col-span-5 lg:col-start-7">
                <p className="text-gray-500 leading-relaxed lg:text-lg">
                    {feature.description}
                </p>
            </div>
        </motion.div>
    )
}

export function Features() {
    const containerRef = useRef(null)
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ['start end', 'end start'],
    })

    const lineWidth = useTransform(scrollYProgress, [0, 0.5], ['0%', '100%'])

    return (
        <section ref={containerRef} id="features" className="relative bg-black py-32 lg:py-48">
            <div className="mx-auto max-w-[1800px] px-6 lg:px-12">
                {/* Section header */}
                <div className="mb-20 lg:mb-32">
                    <motion.span
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        className="font-mono text-xs uppercase tracking-[0.3em] text-gray-600"
                    >
                        Capabilities
                    </motion.span>

                    <motion.h2
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                        className="mt-4 max-w-3xl text-4xl font-bold tracking-tight text-white lg:text-6xl"
                    >
                        Everything you need to ship video at scale
                    </motion.h2>

                    {/* Animated line */}
                    <motion.div
                        className="mt-8 h-px bg-gradient-to-r from-cyan-500 to-emerald-500"
                        style={{ width: lineWidth }}
                    />
                </div>

                {/* Feature list */}
                <div>
                    {features.map((feature, index) => (
                        <FeatureItem key={feature.number} feature={feature} index={index} />
                    ))}
                </div>
            </div>
        </section>
    )
}
