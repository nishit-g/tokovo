import { NextResponse } from 'next/server'
import { listChannels } from '@/lib/publishing/service'

export async function GET() {
  return NextResponse.json({ channels: listChannels() })
}
