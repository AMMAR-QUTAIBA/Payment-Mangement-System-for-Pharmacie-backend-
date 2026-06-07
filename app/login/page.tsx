'use client'
import { useState, useTransition } from 'react'
import { signin, signUp } from '@/server/auth/action'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [tab, setTab] = useState<'signin' | 'signup'>('signin')
  const [error, setError] = useState('')
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  // Sign In
  const [siEmail, setSiEmail] = useState('')
  const [siPassword, setSiPassword] = useState('')

  // Sign Up
  const [suName, setSuName] = useState('')
  const [suEmail, setSuEmail] = useState('')
  const [suPassword, setSuPassword] = useState('')

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    startTransition(async () => {
      const res = await signin(siEmail, siPassword)
      if (res === 'user sucsses') {
        router.push('/')
        router.refresh()
      } else {
        setError(res ?? 'Sign in failed')
      }
    })
  }

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    startTransition(async () => {
      const res = await signUp({ email: suEmail, password: suPassword, name: suName })
      if (res === 'signup success') {
        router.push('/')
        router.refresh()
      } else {
        setError(res ?? 'Sign up failed')
      }
    })
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'radial-gradient(ellipse at 50% 0%, rgba(20,184,166,0.12) 0%, transparent 60%), var(--bg-primary)',
      padding: '20px',
    }}>
      {/* Background decoration */}
      <div style={{
        position: 'fixed', top: '-200px', left: '50%', transform: 'translateX(-50%)',
        width: '600px', height: '600px',
        background: 'radial-gradient(circle, rgba(20,184,166,0.06) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{ width: '100%', maxWidth: '420px', position: 'relative' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            width: '56px', height: '56px', borderRadius: '16px',
            background: 'linear-gradient(135deg, #14b8a6, #10b981)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px', fontSize: '26px',
            boxShadow: '0 8px 32px rgba(20,184,166,0.3)',
          }}>💊</div>
          <h1 style={{ fontSize: '26px', fontWeight: '800', color: 'var(--text-primary)' }}>
            Pharma<span className="gradient-text">Care</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '6px' }}>
            Pharmacy Management System
          </p>
        </div>

        {/* Card */}
        <div className="glass" style={{ padding: '32px' }}>
          {/* Tabs */}
          <div style={{
            display: 'flex', background: 'rgba(255,255,255,0.04)',
            borderRadius: '12px', padding: '4px', marginBottom: '28px',
          }}>
            {(['signin', 'signup'] as const).map((t) => (
              <button key={t} onClick={() => { setTab(t); setError('') }} style={{
                flex: 1, padding: '9px', borderRadius: '9px', border: 'none', cursor: 'pointer',
                fontFamily: 'Inter, sans-serif', fontWeight: '600', fontSize: '13px',
                transition: 'all 0.2s ease',
                background: tab === t ? 'var(--accent)' : 'transparent',
                color: tab === t ? '#fff' : 'var(--text-secondary)',
              }}>
                {t === 'signin' ? 'Sign In' : 'Sign Up'}
              </button>
            ))}
          </div>

          {/* Error */}
          {error && (
            <div style={{
              background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)',
              borderRadius: '10px', padding: '12px 14px', marginBottom: '20px',
              fontSize: '13px', color: 'var(--red)', display: 'flex', alignItems: 'center', gap: '8px',
            }}>
              ⚠️ {error}
            </div>
          )}

          {/* Sign In Form */}
          {tab === 'signin' && (
            <form onSubmit={handleSignIn} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label className="label">Email</label>
                <input className="input" type="email" placeholder="you@example.com"
                  value={siEmail} onChange={e => setSiEmail(e.target.value)} required />
              </div>
              <div>
                <label className="label">Password</label>
                <input className="input" type="password" placeholder="••••••••"
                  value={siPassword} onChange={e => setSiPassword(e.target.value)} required />
              </div>
              <button type="submit" className="btn-primary" disabled={isPending}
                style={{ width: '100%', justifyContent: 'center', marginTop: '4px', padding: '12px' }}>
                {isPending ? '⏳ Signing in...' : '→ Sign In'}
              </button>
            </form>
          )}

          {/* Sign Up Form */}
          {tab === 'signup' && (
            <form onSubmit={handleSignUp} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label className="label">Full Name</label>
                <input className="input" type="text" placeholder="John Doe"
                  value={suName} onChange={e => setSuName(e.target.value)} required />
              </div>
              <div>
                <label className="label">Email</label>
                <input className="input" type="email" placeholder="you@example.com"
                  value={suEmail} onChange={e => setSuEmail(e.target.value)} required />
              </div>
              <div>
                <label className="label">Password</label>
                <input className="input" type="password" placeholder="Min 8 characters"
                  value={suPassword} onChange={e => setSuPassword(e.target.value)} required />
              </div>
              <button type="submit" className="btn-primary" disabled={isPending}
                style={{ width: '100%', justifyContent: 'center', marginTop: '4px', padding: '12px' }}>
                {isPending ? '⏳ Creating account...' : '✓ Create Account'}
              </button>
            </form>
          )}
        </div>


      </div>
    </div>
  )
}
