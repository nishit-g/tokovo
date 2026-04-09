import { NextResponse } from 'next/server'
import { listStudioPacks } from '@/lib/studio/service'

export async function GET() {
  return NextResponse.json({ packs: listStudioPacks() })
}
