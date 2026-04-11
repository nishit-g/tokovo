import { NextRequest, NextResponse } from 'next/server'
import { scheduleVariant } from '@tokovo/publishing/server'

export async function POST(request: NextRequest) {
  const body = (await request.json()) as {
    variantId: string
    channelId: string
    scheduledAt: string
    timezone: string
  }

  const scheduledPost = await scheduleVariant(body)
  return NextResponse.json({ scheduledPost })
}
