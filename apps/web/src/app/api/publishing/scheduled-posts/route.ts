import { NextResponse } from 'next/server'
import { listScheduledPosts } from '@tokovo/publishing/server'

export async function GET() {
  return NextResponse.json({ scheduledPosts: listScheduledPosts() })
}
