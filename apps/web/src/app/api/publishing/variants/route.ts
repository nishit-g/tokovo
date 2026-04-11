import { NextRequest, NextResponse } from 'next/server'
import type { PublishVariant } from '@tokovo/publishing'
import { createVariant } from '@tokovo/publishing/server'

export async function POST(request: NextRequest) {
  const body = (await request.json()) as {
    artifactId: string
    platform: PublishVariant['platform']
    caption: string
    title?: string
    settingsJson?: string
  }

  const variant = createVariant(body)
  return NextResponse.json({ variant })
}
