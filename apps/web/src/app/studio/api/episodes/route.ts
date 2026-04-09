import { NextResponse } from 'next/server'
import { listStudioEpisodes } from '@/lib/studio/service'

export async function GET() {
  return NextResponse.json({ episodes: listStudioEpisodes() })
}
