"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

export function LandingPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="min-h-screen bg-cream noise">
      {/* ========================================
          HEADER
      ======================================== */}
      <header className="fixed inset-x-0 top-0 z-50 mix-blend-difference">
        <div className="flex items-center justify-between px-6 py-6 lg:px-12">
          <Link href="/" className="font-serif text-2xl italic text-white">
            tokovo
          </Link>
          <nav className="flex items-center gap-8">
            <a
              href="#features"
              className="hidden font-mono text-xs uppercase tracking-[0.2em] text-white/60 hover:text-white transition-opacity sm:block"
            >
              Features
            </a>
            <a
              href="#how"
              className="hidden font-mono text-xs uppercase tracking-[0.2em] text-white/60 hover:text-white transition-opacity sm:block"
            >
              How it works
            </a>
            <a
              href="#access"
              className="font-mono text-xs uppercase tracking-[0.2em] text-white hover:opacity-60 transition-opacity"
            >
              Start
            </a>
          </nav>
        </div>
      </header>

      {/* ========================================
          HERO
      ======================================== */}
      <section className="relative min-h-screen overflow-hidden bg-ink text-cream">
        {/* Background watermark */}
        <div className="absolute inset-0 flex items-center justify-center overflow-hidden opacity-[0.02]">
          <span className="font-serif text-[40vw] font-normal whitespace-nowrap select-none">
            TOKOVO
          </span>
        </div>

        {/* Content grid */}
        <div className="relative grid min-h-screen lg:grid-cols-12">
          {/* Left column */}
          <div className="flex flex-col justify-end p-6 lg:col-span-7 lg:p-12 lg:pb-24">
            {/* Badge */}
            <div
              className={`transition-all duration-700 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
              style={{ transitionDelay: "200ms" }}
            >
              <div className="inline-flex items-center gap-2 border border-stone/30 px-3 py-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-copper animate-pulse" />
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-stone">
                  Public v1 release
                </span>
              </div>
            </div>

            {/* Headline */}
            <h1 className="mt-8 font-serif text-display leading-[0.9] tracking-tight">
              <span
                className={`block transition-all duration-700 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
                style={{ transitionDelay: "300ms" }}
              >
                Video
              </span>
              <span
                className={`block transition-all duration-700 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
                style={{ transitionDelay: "400ms" }}
              >
                content,
              </span>
              <span
                className={`block italic text-copper transition-all duration-700 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
                style={{ transitionDelay: "500ms" }}
              >
                as code.
              </span>
            </h1>

            {/* Line */}
            <div
              className={`mt-12 h-px w-24 bg-stone transition-all duration-1000 origin-left ${mounted ? "scale-x-100" : "scale-x-0"}`}
              style={{ transitionDelay: "600ms" }}
            />

            {/* Subtext */}
            <p
              className={`mt-6 max-w-md font-mono text-sm leading-relaxed text-stone transition-all duration-700 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
              style={{ transitionDelay: "700ms" }}
            >
              The programmatic phone-simulation engine for studios and creators. Define phones,
              apps, conversations, camera movement, and audio in TypeScript. Render cinematic
              vertical video without rebuilding every shot by hand.
            </p>

            {/* Quick stats */}
            <div
              className={`mt-12 flex gap-12 transition-all duration-700 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
              style={{ transitionDelay: "800ms" }}
            >
              <div>
                <span className="font-serif text-3xl text-cream">10+</span>
                <p className="mt-1 font-mono text-[10px] uppercase tracking-widest text-stone">
                  Devices
                </p>
              </div>
              <div>
                <span className="font-serif text-3xl text-cream">5</span>
                <p className="mt-1 font-mono text-[10px] uppercase tracking-widest text-stone">
                  App Sims
                </p>
              </div>
              <div>
                <span className="font-serif text-3xl text-cream">4K</span>
                <p className="mt-1 font-mono text-[10px] uppercase tracking-widest text-stone">
                  Resolution
                </p>
              </div>
            </div>
          </div>

          {/* Right column - Video */}
          <div className="relative flex items-center justify-center p-6 lg:col-span-5 lg:p-12">
            <div
              className={`w-full max-w-md transition-all duration-1000 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
              style={{ transitionDelay: "600ms" }}
            >
              {/* Video container */}
              <div className="relative">
                {/* Corner brackets */}
                <div className="absolute -left-4 -top-4 h-8 w-8 border-l-2 border-t-2 border-copper" />
                <div className="absolute -bottom-4 -right-4 h-8 w-8 border-b-2 border-r-2 border-copper" />

                {/* Frame */}
                <div className="aspect-[9/16] overflow-hidden bg-charcoal">
                  <div className="flex h-full items-center justify-center">
                    <div className="text-center">
                      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-stone/30 transition-colors hover:border-copper hover:bg-copper/10 cursor-pointer">
                        <svg
                          className="h-6 w-6 text-cream/60"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </div>
                      <span className="font-mono text-xs uppercase tracking-widest text-stone">
                        Watch Demo
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Caption */}
              <p className="mt-6 text-center font-mono text-xs text-stone">
                Real-time preview • Hot reload in browser
              </p>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div
          className={`absolute bottom-8 left-1/2 -translate-x-1/2 transition-all duration-700 ${mounted ? "opacity-100" : "opacity-0"}`}
          style={{ transitionDelay: "1200ms" }}
        >
          <div className="flex flex-col items-center gap-2">
            <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-stone">
              Scroll
            </span>
            <div className="h-12 w-px bg-gradient-to-b from-stone to-transparent" />
          </div>
        </div>
      </section>

      {/* ========================================
          TRUSTED BY - Logo marquee
      ======================================== */}
      <section className="border-y border-ink/5 bg-cream py-8">
        <div className="mx-auto max-w-7xl px-6 lg:px-12">
          <div className="flex items-center gap-12">
            <span className="shrink-0 font-mono text-[10px] uppercase tracking-[0.2em] text-stone">
              Built for
            </span>
            <div className="flex gap-16 overflow-hidden">
              {[
                "Content Studios",
                "Creator Teams",
                "Agencies",
                "Indie Creators",
                "Series Writers",
              ].map((name) => (
                <span key={name} className="shrink-0 font-mono text-sm text-ink/30">
                  {name}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ========================================
          PROBLEM / SOLUTION
      ======================================== */}
      <section className="bg-cream py-32 lg:py-40">
        <div className="mx-auto max-w-7xl px-6 lg:px-12">
          <div className="grid gap-16 lg:grid-cols-2 lg:gap-24">
            {/* Problem */}
            <div className="lg:border-r lg:border-ink/10 lg:pr-16">
              <span className="font-mono text-xs uppercase tracking-[0.2em] text-stone">
                The Problem
              </span>
              <h2 className="mt-6 font-serif text-3xl text-ink lg:text-4xl">
                Phone stories should not be rebuilt by hand.
              </h2>
              <p className="mt-6 font-mono text-sm leading-relaxed text-stone">
                Text conversations, DM arcs, app recordings, and phone-first episodes usually live
                in timeline editors. One change means nudging layers, rerecording screens, and
                checking every frame again.
              </p>
            </div>

            {/* Solution */}
            <div>
              <span className="font-mono text-xs uppercase tracking-[0.2em] text-copper">
                The Solution
              </span>
              <h2 className="mt-6 font-serif text-3xl text-ink lg:text-4xl">
                Script once. Render every cut.
              </h2>
              <p className="mt-6 font-mono text-sm leading-relaxed text-stone">
                Tokovo turns TypeScript episodes into deterministic phone-native video. Change the
                script, app state, camera path, or language, then render a fresh cut from the same
                source of truth.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================
          FEATURES
      ======================================== */}
      <section id="features" className="bg-cream py-32 lg:py-40">
        <div className="mx-auto max-w-7xl px-6 lg:px-12">
          {/* Header */}
          <div className="grid gap-8 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <span className="font-mono text-xs uppercase tracking-[0.2em] text-stone">
                01 — Capabilities
              </span>
            </div>
            <div className="lg:col-span-8">
              <h2 className="font-serif text-headline text-ink">
                Everything you need to <em className="text-copper">ship phone stories</em> at
                production scale.
              </h2>
            </div>
          </div>

          {/* Feature grid */}
          <div className="mt-24 space-y-0">
            {[
              {
                title: "Pixel-perfect device frames",
                desc: "iPhone 16 Pro, 15, 14, SE. Google Pixel 9. Samsung Galaxy. MacBook Pro. Every bezel, notch, and Dynamic Island rendered with obsessive accuracy. Always up-to-date.",
              },
              {
                title: "Native app simulators",
                desc: "WhatsApp, iMessage, Instagram DMs, Twitter/X. Built from scratch in React with authentic typing animations, read receipts, reactions, and keyboard interactions.",
              },
              {
                title: "Cinematic camera system",
                desc: "Pan, zoom, focus, shake, track. Attach the camera to any element. Smooth easing curves. Keyframe support. Professional motion design without the timeline.",
              },
              {
                title: "Developer-first workflow",
                desc: "Full TypeScript support with IntelliSense. Hot reload in the browser. Git-friendly. Version control your video templates. CI/CD integration for automated rendering.",
              },
              {
                title: "Export anywhere",
                desc: "Render to MP4, WebM, or image sequences. Up to 4K resolution at 60fps. Optimized for social: TikTok, Reels, Shorts, Stories. Batch export hundreds of variations.",
              },
              {
                title: "Scale infinitely",
                desc: "One episode template, many cuts. Swap text, images, timing, actors, and language for UGC campaigns, localization, serialized formats, and A/B testing.",
              },
            ].map((feature, i) => (
              <div
                key={feature.title}
                className="group grid gap-4 border-t border-ink/10 py-10 lg:grid-cols-12 lg:py-14"
              >
                <div className="lg:col-span-1">
                  <span className="font-mono text-xs text-stone">0{i + 1}</span>
                </div>
                <div className="lg:col-span-4">
                  <h3 className="font-serif text-xl text-ink group-hover:text-copper transition-colors lg:text-2xl">
                    {feature.title}
                  </h3>
                </div>
                <div className="lg:col-span-6 lg:col-start-7">
                  <p className="font-mono text-sm leading-relaxed text-stone">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================
          HOW IT WORKS
      ======================================== */}
      <section id="how" className="bg-ink py-32 lg:py-40">
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
                From code to video in <em className="text-copper-light">three steps</em>
              </h2>
            </div>
          </div>

          {/* Steps */}
          <div className="mt-24 grid gap-12 lg:grid-cols-3 lg:gap-8">
            {[
              {
                num: "01",
                title: "Define your episode",
                desc: "Write TypeScript that describes your video: which device, which app, what messages, how the camera moves. Use our fluent API — it reads like English.",
              },
              {
                num: "02",
                title: "Preview in browser",
                desc: "Hot reload lets you see every change instantly. Scrub the timeline. Adjust timing. No waiting for renders. Iterate until it's perfect.",
              },
              {
                num: "03",
                title: "Render at scale",
                desc: "Export a single video or batch render thousands. Swap variables, generate variations, localize for every market. Ship content that would take teams weeks.",
              },
            ].map((step) => (
              <div key={step.num} className="border-t border-cream/10 pt-8">
                <span className="font-serif text-5xl text-cream/10 lg:text-6xl">{step.num}</span>
                <h3 className="mt-6 font-serif text-xl text-cream lg:text-2xl">{step.title}</h3>
                <p className="mt-4 font-mono text-sm leading-relaxed text-stone">{step.desc}</p>
              </div>
            ))}
          </div>

          {/* Code preview */}
          <div className="mt-24">
            <div className="mx-auto max-w-4xl overflow-hidden border border-cream/10">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-cream/5 bg-charcoal px-4 py-3">
                <span className="font-mono text-xs text-stone">drama-episode.ts</span>
                <span className="font-mono text-[10px] uppercase tracking-widest text-stone/50">
                  TypeScript
                </span>
              </div>

              {/* Code */}
              <pre className="overflow-x-auto bg-charcoal p-6 font-mono text-sm leading-loose lg:p-8">
                <code>
                  <span className="text-stone">// Define a dramatic WhatsApp conversation</span>
                  {"\n"}
                  <span className="text-copper">export const</span>
                  <span className="text-cream"> episode </span>
                  <span className="text-cream/40">=</span>
                  <span className="text-copper"> defineEpisode</span>
                  <span className="text-cream/40">(</span>
                  <span className="text-cream/70">"episode-one-cold-open"</span>
                  <span className="text-cream/40">)</span>
                  {"\n"}
                  <span className="text-cream/40"> .</span>
                  <span className="text-copper-light">device</span>
                  <span className="text-cream/40">(</span>
                  <span className="text-cream/70">"iphone16pro"</span>
                  <span className="text-cream/40">)</span>
                  {"\n"}
                  <span className="text-cream/40"> .</span>
                  <span className="text-copper-light">background</span>
                  <span className="text-cream/40">(</span>
                  <span className="text-cream/70">"cozy-bedroom"</span>
                  <span className="text-cream/40">)</span>
                  {"\n"}
                  <span className="text-cream/40"> .</span>
                  <span className="text-copper-light">track</span>
                  <span className="text-cream/40">(</span>
                  <span className="text-cream/70">"whatsapp"</span>
                  <span className="text-cream/40">, </span>
                  <span className="text-cream">chat</span>
                  <span className="text-cream/40">
                    {" "}
                    {"=>"} {"{"}
                  </span>
                  {"\n"}
                  <span className="text-cream/40"> chat.</span>
                  <span className="text-copper-light">from</span>
                  <span className="text-cream/40">(</span>
                  <span className="text-cream/70">"Jordan 💔"</span>
                  <span className="text-cream/40">)</span>
                  {"\n"}
                  <span className="text-cream/40"> chat.</span>
                  <span className="text-copper-light">receive</span>
                  <span className="text-cream/40">(</span>
                  <span className="text-cream/70">"We need to talk..."</span>
                  <span className="text-cream/40">)</span>
                  {"\n"}
                  <span className="text-cream/40"> chat.</span>
                  <span className="text-copper-light">send</span>
                  <span className="text-cream/40">(</span>
                  <span className="text-cream/70">"What's wrong?"</span>
                  <span className="text-cream/40">)</span>
                  {"\n"}
                  <span className="text-cream/40"> chat.</span>
                  <span className="text-copper-light">receive</span>
                  <span className="text-cream/40">(</span>
                  <span className="text-cream/70">"I saw the messages."</span>
                  <span className="text-cream/40">)</span>
                  {"\n"}
                  <span className="text-cream/40"> chat.</span>
                  <span className="text-copper-light">receive</span>
                  <span className="text-cream/40">(</span>
                  <span className="text-cream/70">"All of them."</span>
                  <span className="text-cream/40">)</span>
                  {"\n"}
                  <span className="text-cream/40"> {"}"})</span>
                  {"\n"}
                  <span className="text-cream/40"> .</span>
                  <span className="text-copper-light">camera</span>
                  <span className="text-cream/40">(</span>
                  <span className="text-cream">cam</span>
                  <span className="text-cream/40"> {"=>"} </span>
                  <span className="text-cream">cam</span>
                  <span className="text-cream/40">.</span>
                  <span className="text-copper-light">slowZoom</span>
                  <span className="text-cream/40">().</span>
                  <span className="text-copper-light">focusOn</span>
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
          USE CASES
      ======================================== */}
      <section className="bg-cream py-32 lg:py-40">
        <div className="mx-auto max-w-7xl px-6 lg:px-12">
          <div className="grid gap-8 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <span className="font-mono text-xs uppercase tracking-[0.2em] text-stone">
                03 — Use Cases
              </span>
            </div>
            <div className="lg:col-span-8">
              <h2 className="font-serif text-headline text-ink">
                What teams are building with <em className="text-copper">Tokovo</em>
              </h2>
            </div>
          </div>

          <div className="mt-16 grid gap-8 lg:grid-cols-3">
            {[
              {
                title: "Drama & Story Content",
                desc: "Create text conversations, DM arcs, cliffhangers, and dramatic reveals for TikTok, Reels, Shorts, and serialized story formats.",
              },
              {
                title: "Product Demos",
                desc: "Show your app in action with realistic device frames. No screen recording jitter. Perfect every time.",
              },
              {
                title: "UGC Campaigns",
                desc: "Generate many video variations for paid social. Personalize by name, location, language, or story branch.",
              },
            ].map((useCase) => (
              <div
                key={useCase.title}
                className="border border-ink/10 p-8 transition-colors hover:border-copper/30"
              >
                <h3 className="font-serif text-xl text-ink">{useCase.title}</h3>
                <p className="mt-4 font-mono text-sm leading-relaxed text-stone">{useCase.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================
          CTA
      ======================================== */}
      <section id="access" className="bg-ink py-32 lg:py-40">
        <div className="mx-auto max-w-3xl px-6 text-center lg:px-12">
          <span className="font-mono text-xs uppercase tracking-[0.2em] text-stone">
            04 — Public V1
          </span>

          <h2 className="mt-8 font-serif text-headline text-cream">
            Ready to ship video <em className="text-copper-light">at scale?</em>
          </h2>

          <p className="mx-auto mt-6 max-w-lg font-mono text-sm text-stone leading-relaxed">
            Start from the public repository, run a showcase episode, and adapt the scripts for
            shorts, reels, episodes, and creator-led series.
          </p>

          <div className="mt-12 flex flex-col gap-4 sm:flex-row sm:justify-center">
            <a
              href="https://github.com/nishit-g/tokovo"
              className="bg-cream px-8 py-4 font-mono text-xs uppercase tracking-widest text-ink transition-colors hover:bg-copper hover:text-cream"
            >
              Open Repository
            </a>
            <a
              href="https://github.com/nishit-g/tokovo/tree/master/apps/docs/app"
              className="border border-cream/20 px-8 py-4 font-mono text-xs uppercase tracking-widest text-cream transition-colors hover:border-copper hover:text-copper-light"
            >
              Read Docs
            </a>
          </div>

          {/* Trust signals */}
          <p className="mt-12 font-mono text-[10px] uppercase tracking-widest text-stone/50">
            MIT licensed • TypeScript episodes • Remotion rendering
          </p>
        </div>
      </section>

      {/* ========================================
          FOOTER
      ======================================== */}
      <footer className="border-t border-cream/10 bg-ink py-12">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-6 sm:flex-row lg:px-12">
          <Link href="/" className="font-serif text-lg italic text-cream/40">
            tokovo
          </Link>
          <div className="flex gap-8">
            <a
              href="/legal/privacy"
              className="font-mono text-xs uppercase tracking-widest text-stone hover:text-cream transition-colors"
            >
              Privacy
            </a>
            <a
              href="/legal/terms"
              className="font-mono text-xs uppercase tracking-widest text-stone hover:text-cream transition-colors"
            >
              Terms
            </a>
            <a
              href="mailto:hello@tokovo.io"
              className="font-mono text-xs uppercase tracking-widest text-stone hover:text-cream transition-colors"
            >
              Contact
            </a>
          </div>
          <span className="font-mono text-xs text-stone/50">Tokovo 2026</span>
        </div>
      </footer>
    </div>
  );
}
