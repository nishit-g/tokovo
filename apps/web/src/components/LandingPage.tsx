'use client'

import { useState } from 'react'

export function LandingPage() {
    const [email, setEmail] = useState('')
    const [submitted, setSubmitted] = useState(false)

    return (
        <div className="min-h-screen bg-cream noise">
            {/* ========================================
          HEADER - Minimal, editorial style
      ======================================== */}
            <header className="fixed inset-x-0 top-0 z-50 mix-blend-difference">
                <div className="flex items-center justify-between px-6 py-6 lg:px-12">
                    <span className="font-serif text-2xl italic text-white">tokovo</span>
                    <a
                        href="#access"
                        className="font-mono text-xs uppercase tracking-[0.2em] text-white hover:opacity-60 transition-opacity"
                    >
                        Access
                    </a>
                </div>
            </header>

            {/* ========================================
          HERO - Editorial, asymmetric layout
      ======================================== */}
            <section className="relative min-h-screen overflow-hidden bg-ink text-cream">
                {/* Large background text - watermark effect */}
                <div className="absolute inset-0 flex items-center justify-center overflow-hidden opacity-[0.03]">
                    <span className="font-serif text-[40vw] font-normal whitespace-nowrap">TOKOVO</span>
                </div>

                {/* Content grid */}
                <div className="relative grid min-h-screen lg:grid-cols-12">
                    {/* Left column - Typography */}
                    <div className="flex flex-col justify-end p-6 lg:col-span-7 lg:p-12 lg:pb-20">
                        {/* Eyebrow */}
                        <div className="reveal-up delay-2">
                            <span className="font-mono text-caption uppercase tracking-[0.2em] text-stone">
                                Programmatic Video Engine
                            </span>
                        </div>

                        {/* Main headline - Serif, elegant */}
                        <h1 className="mt-6 font-serif text-display leading-[0.9] tracking-tight">
                            <span className="reveal-up delay-3 block">Video</span>
                            <span className="reveal-up delay-4 block">content,</span>
                            <span className="reveal-up delay-5 block italic text-copper">as code.</span>
                        </h1>

                        {/* Horizontal line */}
                        <div className="mt-12 h-px w-24 bg-stone line-grow delay-6" />

                        {/* Subtext */}
                        <p className="mt-6 max-w-md font-mono text-sm leading-relaxed text-stone reveal-up delay-7">
                            Define phones, apps, and conversations in TypeScript.
                            Render cinematic social videos at scale. No After Effects.
                        </p>
                    </div>

                    {/* Right column - Video */}
                    <div className="relative flex items-center justify-center p-6 lg:col-span-5 lg:p-12">
                        <div className="reveal-up delay-8 w-full max-w-md">
                            {/* Video container with distinctive border treatment */}
                            <div className="relative">
                                {/* Decorative corner brackets */}
                                <div className="absolute -left-4 -top-4 h-8 w-8 border-l-2 border-t-2 border-copper" />
                                <div className="absolute -bottom-4 -right-4 h-8 w-8 border-b-2 border-r-2 border-copper" />

                                {/* Video frame */}
                                <div className="aspect-[9/16] overflow-hidden bg-charcoal">
                                    {/* Placeholder */}
                                    <div className="flex h-full items-center justify-center">
                                        <div className="text-center">
                                            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-stone/30">
                                                <svg className="h-6 w-6 text-cream/60" fill="currentColor" viewBox="0 0 24 24">
                                                    <path d="M8 5v14l11-7z" />
                                                </svg>
                                            </div>
                                            <span className="font-mono text-xs uppercase tracking-widest text-stone">Demo</span>
                                        </div>
                                    </div>
                                    {/* Replace with: <video src="/demo.mp4" autoPlay loop muted playsInline className="h-full w-full object-cover" /> */}
                                </div>
                            </div>

                            {/* Caption */}
                            <p className="mt-6 text-center font-mono text-xs text-stone reveal-fade delay-10">
                                Real-time preview in your browser
                            </p>
                        </div>
                    </div>
                </div>

                {/* Scroll indicator */}
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 reveal-fade delay-15">
                    <div className="flex flex-col items-center gap-2">
                        <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-stone">Scroll</span>
                        <div className="h-12 w-px bg-gradient-to-b from-stone to-transparent" />
                    </div>
                </div>
            </section>

            {/* ========================================
          FEATURES - Editorial grid, generous space
      ======================================== */}
            <section className="bg-cream py-32 lg:py-48">
                <div className="mx-auto max-w-7xl px-6 lg:px-12">
                    {/* Section header */}
                    <div className="grid gap-8 lg:grid-cols-12">
                        <div className="lg:col-span-4">
                            <span className="font-mono text-xs uppercase tracking-[0.2em] text-stone">
                                01 — Capabilities
                            </span>
                        </div>
                        <div className="lg:col-span-8">
                            <h2 className="font-serif text-headline text-ink">
                                Everything you need to <em className="text-copper">ship video</em> at scale.
                            </h2>
                        </div>
                    </div>

                    {/* Feature list - editorial style */}
                    <div className="mt-24 space-y-0">
                        {[
                            { title: 'Pixel-perfect devices', desc: 'iPhone 16, Pixel 9, Galaxy, MacBook. Every bezel rendered with precision.' },
                            { title: 'Native app simulators', desc: 'WhatsApp, iMessage, Instagram, X. Built in React with authentic animations.' },
                            { title: 'Cinematic camera', desc: 'Pan, zoom, focus, shake. Professional camera system with smooth easing.' },
                            { title: 'TypeScript first', desc: 'Full type safety. IntelliSense. Hot reload. Developer experience matters.' },
                            { title: '4K export', desc: 'Render to MP4, WebM, or image sequences. Up to 4K resolution, 60fps.' },
                            { title: 'Render at scale', desc: 'One template, infinite variations. Batch render thousands of unique videos.' },
                        ].map((feature, i) => (
                            <div
                                key={feature.title}
                                className="group grid gap-4 border-t border-ink/10 py-8 lg:grid-cols-12 lg:py-12"
                            >
                                <div className="lg:col-span-1">
                                    <span className="font-mono text-xs text-stone">0{i + 1}</span>
                                </div>
                                <div className="lg:col-span-4">
                                    <h3 className="font-serif text-2xl text-ink group-hover:text-copper transition-colors">
                                        {feature.title}
                                    </h3>
                                </div>
                                <div className="lg:col-span-5 lg:col-start-7">
                                    <p className="font-mono text-sm leading-relaxed text-stone">
                                        {feature.desc}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ========================================
          HOW IT WORKS - Three steps, code preview
      ======================================== */}
            <section className="bg-ink py-32 lg:py-48">
                <div className="mx-auto max-w-7xl px-6 lg:px-12">
                    {/* Header */}
                    <div className="grid gap-8 lg:grid-cols-12">
                        <div className="lg:col-span-4">
                            <span className="font-mono text-xs uppercase tracking-[0.2em] text-stone">
                                02 — Workflow
                            </span>
                        </div>
                        <div className="lg:col-span-8">
                            <h2 className="font-serif text-headline text-cream">
                                Three steps to <em className="text-copper-light">production</em>
                            </h2>
                        </div>
                    </div>

                    {/* Steps */}
                    <div className="mt-24 grid gap-12 lg:grid-cols-3 lg:gap-8">
                        {[
                            { num: '01', title: 'Define', desc: 'Write your episode in TypeScript. Define devices, apps, conversations, and camera.' },
                            { num: '02', title: 'Preview', desc: 'Hot reload in the browser. See changes instantly. Iterate until perfect.' },
                            { num: '03', title: 'Render', desc: 'Export to MP4 at up to 4K. One template generates thousands of variations.' },
                        ].map((step) => (
                            <div key={step.num} className="border-t border-cream/10 pt-8">
                                <span className="font-serif text-6xl text-cream/10">{step.num}</span>
                                <h3 className="mt-4 font-serif text-2xl text-cream">{step.title}</h3>
                                <p className="mt-4 font-mono text-sm leading-relaxed text-stone">{step.desc}</p>
                            </div>
                        ))}
                    </div>

                    {/* Code preview */}
                    <div className="mt-24">
                        <div className="mx-auto max-w-3xl overflow-hidden border border-cream/10">
                            {/* Terminal header */}
                            <div className="flex items-center gap-3 border-b border-cream/5 bg-charcoal px-4 py-3">
                                <span className="font-mono text-xs text-stone">episode.ts</span>
                            </div>

                            {/* Code */}
                            <pre className="overflow-x-auto bg-charcoal p-6 font-mono text-sm leading-loose">
                                <code>
                                    <span className="text-copper">defineEpisode</span>
                                    <span className="text-cream/40">(</span>
                                    <span className="text-cream/70">"drama"</span>
                                    <span className="text-cream/40">)</span>
                                    {'\n'}
                                    <span className="text-cream/40">  .</span>
                                    <span className="text-copper-light">device</span>
                                    <span className="text-cream/40">(</span>
                                    <span className="text-cream/70">"iphone16pro"</span>
                                    <span className="text-cream/40">)</span>
                                    {'\n'}
                                    <span className="text-cream/40">  .</span>
                                    <span className="text-copper-light">track</span>
                                    <span className="text-cream/40">(</span>
                                    <span className="text-cream/70">"whatsapp"</span>
                                    <span className="text-cream/40">, chat =&gt; {'{'}</span>
                                    {'\n'}
                                    <span className="text-cream/40">    chat.</span>
                                    <span className="text-copper-light">receive</span>
                                    <span className="text-cream/40">(</span>
                                    <span className="text-cream/70">"We need to talk..."</span>
                                    <span className="text-cream/40">)</span>
                                    {'\n'}
                                    <span className="text-cream/40">    chat.</span>
                                    <span className="text-copper-light">send</span>
                                    <span className="text-cream/40">(</span>
                                    <span className="text-cream/70">"What happened?"</span>
                                    <span className="text-cream/40">)</span>
                                    {'\n'}
                                    <span className="text-cream/40">  {'}'})</span>
                                    {'\n'}
                                    <span className="text-cream/40">  .</span>
                                    <span className="text-copper-light">camera</span>
                                    <span className="text-cream/40">(cam =&gt; cam.</span>
                                    <span className="text-copper-light">focus</span>
                                    <span className="text-cream/40">(</span>
                                    <span className="text-cream/70">"lastMessage"</span>
                                    <span className="text-cream/40">))</span>
                                </code>
                            </pre>
                        </div>
                    </div>
                </div>
            </section>

            {/* ========================================
          CTA - Elegant, focused
      ======================================== */}
            <section id="access" className="bg-cream py-32 lg:py-48">
                <div className="mx-auto max-w-3xl px-6 text-center lg:px-12">
                    <span className="font-mono text-xs uppercase tracking-[0.2em] text-stone">
                        03 — Early Access
                    </span>

                    <h2 className="mt-8 font-serif text-headline text-ink">
                        Ready to ship <em className="text-copper">video at scale?</em>
                    </h2>

                    <p className="mx-auto mt-6 max-w-md font-mono text-sm text-stone">
                        Join studios and content teams already building with Tokovo.
                        Get early access to the private beta.
                    </p>

                    <div className="mt-12">
                        {!submitted ? (
                            <form
                                onSubmit={(e) => { e.preventDefault(); setSubmitted(true) }}
                                className="flex flex-col gap-4 sm:flex-row sm:justify-center"
                            >
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="your@email.com"
                                    className="border-b-2 border-ink/20 bg-transparent px-0 py-4 font-mono text-ink placeholder:text-stone focus:border-copper focus:outline-none sm:w-72"
                                />
                                <button
                                    type="submit"
                                    className="bg-ink px-8 py-4 font-mono text-xs uppercase tracking-widest text-cream transition-colors hover:bg-copper"
                                >
                                    Request Access
                                </button>
                            </form>
                        ) : (
                            <div className="flex items-center justify-center gap-3 text-copper">
                                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                <span className="font-mono text-sm">You're in. We'll be in touch.</span>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* ========================================
          FOOTER - Minimal
      ======================================== */}
            <footer className="border-t border-ink/10 bg-cream py-12">
                <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-6 sm:flex-row lg:px-12">
                    <span className="font-serif text-lg italic text-ink">tokovo</span>
                    <div className="flex gap-8">
                        <a href="mailto:hello@tokovo.studio" className="font-mono text-xs uppercase tracking-widest text-stone hover:text-ink transition-colors">
                            Contact
                        </a>
                        <a href="#" className="font-mono text-xs uppercase tracking-widest text-stone hover:text-ink transition-colors">
                            Twitter
                        </a>
                    </div>
                    <span className="font-mono text-xs text-stone">© {new Date().getFullYear()}</span>
                </div>
            </footer>
        </div>
    )
}
