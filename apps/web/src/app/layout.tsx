import { type Metadata } from 'next'
import { Inter } from 'next/font/google'
import clsx from 'clsx'

import '@/styles/tailwind.css'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: 'Tokovo — Video content, as code',
  description: 'The programmatic video engine. Define phones, apps, and conversations in TypeScript. Render cinematic social videos at scale.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={clsx('antialiased', inter.variable)}>
      <body className="min-h-screen">{children}</body>
    </html>
  )
}
