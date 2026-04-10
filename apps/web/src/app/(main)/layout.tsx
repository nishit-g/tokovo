import { SmoothScroll } from '@/components/SmoothScroll'
import { Layout } from '@/components/Layout'

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <SmoothScroll>
        <Layout>{children}</Layout>
      </SmoothScroll>
    </div>
  )
}
