import { NextResponse } from 'next/server'
import { listChannels } from '@tokovo/publishing/server'

export async function GET() {
  return NextResponse.json({ channels: listChannels() })
}
