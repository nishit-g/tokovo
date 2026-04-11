import { NextResponse } from 'next/server'
import { syncChannelsFromPostiz } from '@tokovo/publishing/server'

export async function POST() {
  const channels = await syncChannelsFromPostiz()
  return NextResponse.json({ channels })
}
