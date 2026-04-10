import { NextResponse } from 'next/server'
import { listScheduledPosts } from '@/lib/publishing/service'

export async function GET() {
  return NextResponse.json({ scheduledPosts: listScheduledPosts() })
}
