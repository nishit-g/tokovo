import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Tokovo Terms of Service',
  description: 'Terms of service for Tokovo and Tokovo publishing workflows.',
}

export default function TermsOfServicePage() {
  return (
    <main className="min-h-screen bg-[#0a0a0a] px-6 py-24 text-white lg:px-12">
      <div className="mx-auto max-w-3xl">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-white/50">Legal</p>
        <h1 className="mt-4 font-serif text-4xl tracking-tight lg:text-5xl">Terms of Service</h1>
        <p className="mt-4 font-mono text-sm text-white/60">Last updated: April 11, 2026</p>

        <div className="mt-12 space-y-10 font-mono text-sm leading-7 text-white/80">
          <section className="space-y-3">
            <h2 className="font-serif text-2xl text-white">Use of Service</h2>
            <p>
              Tokovo provides tools for programmatic video creation, rendering, and social content
              publishing. You may use the service only in compliance with applicable law, platform
              rules, and these terms.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif text-2xl text-white">Accounts and Integrations</h2>
            <p>
              You are responsible for the accuracy of information you provide, the third-party
              accounts you connect, and the content you publish through Tokovo or connected
              publishing systems.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif text-2xl text-white">Content Responsibility</h2>
            <p>
              You retain responsibility for your media, captions, metadata, and publishing actions.
              You must have all rights necessary to upload, render, and distribute your content.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif text-2xl text-white">Acceptable Use</h2>
            <p>
              You may not use Tokovo to violate laws, infringe intellectual property, evade
              platform restrictions, distribute harmful material, or interfere with service
              operation.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif text-2xl text-white">Availability</h2>
            <p>
              Tokovo may change, suspend, or discontinue features at any time. We do not guarantee
              uninterrupted availability or compatibility with every third-party platform.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif text-2xl text-white">Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by law, Tokovo is provided on an as-is basis without
              warranties of any kind, and Tokovo will not be liable for indirect, incidental,
              special, consequential, or exemplary damages.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif text-2xl text-white">Contact</h2>
            <p>
              For questions about these terms, contact{' '}
              <a className="text-[#d08b5b] hover:underline" href="mailto:hello@tokovo.io">
                hello@tokovo.io
              </a>
              .
            </p>
          </section>
        </div>
      </div>
    </main>
  )
}
