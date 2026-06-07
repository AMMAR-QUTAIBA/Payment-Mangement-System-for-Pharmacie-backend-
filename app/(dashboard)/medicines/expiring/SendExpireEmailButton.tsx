'use client'
import { useState } from 'react'

export default function SendExpireEmailButton() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error' | 'no_expiring'>('idle')

  const handleSend = async () => {
    setStatus('loading')
    try {
      const res = await fetch('/api/medicine/medicine/expire')
      const data = await res.json()
      if (res.status === 404) {
        setStatus('no_expiring')
      } else if (res.ok) {
        setStatus('success')
      } else {
        setStatus('error')
      }
      setTimeout(() => setStatus('idle'), 4000)
    } catch {
      setStatus('error')
      setTimeout(() => setStatus('idle'), 4000)
    }
  }

  return (
    <button
      onClick={handleSend}
      disabled={status === 'loading'}
      className="btn-primary"
      style={{
        display: 'flex', alignItems: 'center', gap: '8px',
        opacity: status === 'loading' ? 0.7 : 1,
        background: status === 'success'
          ? 'rgba(16,185,129,0.2)'
          : status === 'error'
          ? 'rgba(239,68,68,0.2)'
          : undefined,
        borderColor: status === 'success'
          ? 'rgba(16,185,129,0.4)'
          : status === 'error'
          ? 'rgba(239,68,68,0.4)'
          : undefined,
        color: status === 'success'
          ? 'var(--emerald)'
          : status === 'error'
          ? 'var(--red)'
          : undefined,
        transition: 'all 0.3s ease',
      }}
    >
      {status === 'loading' && '⏳ Sending...'}
      {status === 'idle' && '📧 Send Expire Alert Email'}
      {status === 'success' && '✅ Email Sent!'}
      {status === 'error' && '❌ Failed, Try Again'}
      {status === 'no_expiring' && '✅ No Expiring Medicines'}
    </button>
  )
}
