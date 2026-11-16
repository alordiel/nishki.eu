'use client'
import React, { useCallback, useEffect, useState } from 'react'

type Status = {
  state?: 'idle' | 'running' | 'success' | 'failed' | 'triggered'
  queued?: boolean
  busy?: boolean
  finishedAt?: string
  lastSuccessAt?: string
  message?: string
}

const fmt = (iso?: string) =>
  iso ? new Date(iso).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' }) : '—'

/** "Publish site" button in the admin header, with the last build result. */
export function PublishButton() {
  const [status, setStatus] = useState<Status | null>(null)
  const [sending, setSending] = useState(false)

  const load = useCallback(async () => {
    const res = await fetch('/api/publish', { credentials: 'include' })
    if (res.ok) setStatus(await res.json())
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  useEffect(() => {
    if (!status?.busy) return
    const t = setInterval(load, 5000)
    return () => clearInterval(t)
  }, [status?.busy, load])

  if (!status) return null // not allowed (or still loading)

  const publish = async () => {
    setSending(true)
    try {
      await fetch('/api/publish', { method: 'POST', credentials: 'include' })
    } finally {
      setSending(false)
      void load()
    }
  }

  let note: string
  if (status.busy) note = status.queued ? 'Publishing… (one more update queued)' : 'Publishing…'
  else if (status.state === 'failed') note = `Last publish failed ${fmt(status.finishedAt)}`
  else note = `Live since ${fmt(status.lastSuccessAt)}`

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <span
        title={status.message || undefined}
        style={{ fontSize: 12, color: status.state === 'failed' ? 'var(--theme-error-500)' : 'var(--theme-elevation-500)' }}
      >
        {note}
      </span>
      <button
        type="button"
        className="btn btn--style-primary btn--size-small"
        style={{ margin: 0 }}
        disabled={sending || (status.busy && status.queued)}
        onClick={publish}
      >
        {status.busy ? 'Publish again' : 'Publish site'}
      </button>
    </div>
  )
}
