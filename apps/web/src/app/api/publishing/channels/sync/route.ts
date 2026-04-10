import { NextResponse } from 'next/server'
import { syncChannelsFromPostiz } from '@/lib/publishing/service'

export async function POST() {
  const channels = await syncChannelsFromPostiz()
  return NextResponse.json({ channels })
}
