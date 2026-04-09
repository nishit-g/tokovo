import { NextRequest, NextResponse } from 'next/server'
import type { StudioPackKind } from '@tokovo/packs'
import { getStudioPackDetail, updateStudioPack } from '@/lib/studio/service'

type Params = { params: Promise<{ kind: string; packId: string }> }

export async function GET(_: NextRequest, { params }: Params) {
  const { kind, packId } = await params
  return NextResponse.json(getStudioPackDetail(kind as StudioPackKind, packId))
}

export async function POST(request: NextRequest, { params }: Params) {
  const { kind, packId } = await params
  const body = (await request.json()) as { manifest: Parameters<typeof updateStudioPack>[2] }
  return NextResponse.json(updateStudioPack(kind as StudioPackKind, packId, body.manifest))
}
