import { NextResponse } from 'next/server'
import { listArtifacts, syncArtifactManifestsFromDisk } from '@tokovo/publishing/server'

export async function GET() {
  const synced = syncArtifactManifestsFromDisk()
  return NextResponse.json({ synced, artifacts: listArtifacts() })
}
