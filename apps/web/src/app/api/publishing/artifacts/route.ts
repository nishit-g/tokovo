import { NextResponse } from 'next/server'
import { listArtifacts, syncArtifactManifestsFromDisk } from '@/lib/publishing/service'

export async function GET() {
  const synced = syncArtifactManifestsFromDisk()
  return NextResponse.json({ synced, artifacts: listArtifacts() })
}
