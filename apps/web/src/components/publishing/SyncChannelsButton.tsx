'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'

export function SyncChannelsButton() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const sync = async () => {
    setError(null)
    const response = await fetch('/api/publishing/channels/sync', { method: 'POST' })
    if (!response.ok) {
      setError(`Sync failed (${response.status})`)
      return
    }
    startTransition(() => {
      router.refresh()
    })
  }

  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={sync}
        disabled={isPending}
        className="rounded-full border border-cyan-300/40 bg-cyan-300/10 px-4 py-2 font-mono text-xs uppercase tracking-[0.22em] text-cyan-100 transition hover:bg-cyan-300/20 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? 'Syncing…' : 'Sync Channels'}
      </button>
      {error ? <span className="text-sm text-rose-300">{error}</span> : null}
    </div>
  )
}
