import { Hero } from '@/components/Hero'
import { Features } from '@/components/Features'
import { Showcase } from '@/components/Showcase'
import { CallToAction } from '@/components/CallToAction'

export default function Home() {
  return (
    <>
      <Hero />
      <Showcase />
      <Features />
      <CallToAction />
    </>
  )
}
