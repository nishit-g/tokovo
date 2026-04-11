import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Tokovo Privacy Policy',
  description: 'Privacy policy for Tokovo and Tokovo publishing integrations.',
}

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-[#0a0a0a] px-6 py-24 text-white lg:px-12">
      <div className="mx-auto max-w-3xl">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-white/50">Legal</p>
        <h1 className="mt-4 font-serif text-4xl tracking-tight lg:text-5xl">Privacy Policy</h1>
        <p className="mt-4 font-mono text-sm text-white/60">Last updated: April 11, 2026</p>

        <div className="mt-12 space-y-10 font-mono text-sm leading-7 text-white/80">
          <section className="space-y-3">
            <h2 className="font-serif text-2xl text-white">Overview</h2>
            <p>
              Tokovo provides software for creating, rendering, and managing social video content.
              This policy explains what information we collect, how we use it, and the choices
              available to users and customers.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif text-2xl text-white">Information We Collect</h2>
            <p>
              We may collect account information, contact details, uploaded media, publishing
              metadata, analytics, and technical logs required to operate Tokovo and connected
              integrations.
            </p>
            <p>
              When you connect third-party platforms such as TikTok, YouTube, Instagram, or
              Facebook, Tokovo and connected publishing infrastructure may process tokens, channel
              identifiers, post metadata, and media needed to complete publishing actions.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif text-2xl text-white">How We Use Information</h2>
            <p>
              We use data to provide the product, authenticate users, render content, schedule and
              publish posts, provide support, improve reliability, prevent abuse, and comply with
              legal obligations.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif text-2xl text-white">Sharing</h2>
            <p>
              We may share information with infrastructure providers, hosting providers, analytics
              providers, and social platform APIs strictly as needed to operate Tokovo and complete
              requested publishing workflows.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif text-2xl text-white">Retention</h2>
            <p>
              We retain information for as long as necessary to provide the service, maintain
              operational records, resolve disputes, and satisfy legal or security requirements.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif text-2xl text-white">Security</h2>
            <p>
              We use reasonable administrative, technical, and organizational measures to protect
              information. No system is perfectly secure, and we cannot guarantee absolute
              protection.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif text-2xl text-white">Contact</h2>
            <p>
              For privacy questions or requests, contact{' '}
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
