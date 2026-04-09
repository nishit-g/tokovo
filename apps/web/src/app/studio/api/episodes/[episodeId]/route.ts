import { NextRequest, NextResponse } from 'next/server'
import type { StoryKitStudioConfig } from '@tokovo/creator/story-kit'
import { getStudioEpisodeDetail, updateStudioEpisodeConfig } from '@/lib/studio/service'

type Params = { params: Promise<{ episodeId: string }> }

export async function GET(_: NextRequest, { params }: Params) {
  const { episodeId } = await params
  return NextResponse.json(getStudioEpisodeDetail(episodeId))
}

export async function POST(request: NextRequest, { params }: Params) {
  const { episodeId } = await params
  const body = (await request.json()) as { config: StoryKitStudioConfig }
  return NextResponse.json(updateStudioEpisodeConfig(episodeId, body.config))
}
