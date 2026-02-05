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
  title: {
    template: '%s - Tokovo Studio',
    default: 'Tokovo Studio - Video Content as Code',
  },
  description:
    'The programmatic video engine for studios and enterprises. Define content as code, render pixel-perfect social videos at scale.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={clsx('bg-gray-950 antialiased', inter.variable)}>
      <body className="min-h-screen bg-gray-950 text-white">{children}</body>
    </html>
  )
}
