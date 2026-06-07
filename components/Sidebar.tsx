'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { logout } from '@/server/auth/action'
import { useTransition } from 'react'

const navItems = [
  { href: '/', label: 'Dashboard', icon: '⬡' },
  { href: '/medicines', label: 'Medicines', icon: '💊' },
  { href: '/sections', label: 'Sections', icon: '📦' },
  { href: '/bills', label: 'Bills', icon: '🧾' },
  { href: '/medicines/expiring', label: 'Expiring', icon: '⚠️' },
  { href: '/profile', label: 'Profile', icon: '👤' },
]

export default function Sidebar({ userName, isAdmin, isOwner }: { userName: string; isAdmin: boolean; isOwner: boolean }) {
  const pathname = usePathname()
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const handleLogout = () => {
    startTransition(async () => {
      await logout()
      router.push('/login')
      router.refresh()
    })
  }

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div style={{
        padding: '24px 20px 20px',
        borderBottom: '1px solid var(--border)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '38px', height: '38px', borderRadius: '10px',
            background: 'linear-gradient(135deg, #14b8a6, #10b981)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '18px', flexShrink: 0,
            boxShadow: '0 4px 12px rgba(20,184,166,0.3)',
          }}>💊</div>
          <div>
            <div style={{ fontWeight: '800', fontSize: '15px', color: 'var(--text-primary)', lineHeight: 1 }}>
              Pharma<span className="gradient-text">Care</span>
            </div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Management
            </div>
          </div>
        </div>
      </div>

      {/* User info */}
      <div style={{
        padding: '16px 20px',
        borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', gap: '10px',
      }}>
        <div style={{
          width: '34px', height: '34px', borderRadius: '50%',
          background: 'linear-gradient(135deg, rgba(20,184,166,0.3), rgba(16,185,129,0.3))',
          border: '1px solid rgba(20,184,166,0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '14px', fontWeight: '700', color: 'var(--accent)', flexShrink: 0,
        }}>
          {userName.charAt(0).toUpperCase()}
        </div>
        <div style={{ overflow: 'hidden', minWidth: 0 }}>
          <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {userName}
          </div>
          <div style={{ marginTop: '2px' }}>
            {isOwner ? (
              <span className="badge badge-amber" style={{ fontSize: '9px', padding: '1px 7px' }}>🔑 Owner</span>
            ) : isAdmin ? (
              <span className="badge badge-teal" style={{ fontSize: '9px', padding: '1px 7px' }}>Admin</span>
            ) : (
              <span className="badge badge-gray" style={{ fontSize: '9px', padding: '1px 7px' }}>User</span>
            )}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: '12px 12px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
        <div style={{ fontSize: '10px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', padding: '4px 8px 8px' }}>
          Menu
        </div>
        {navItems.map((item) => {
          const isActive = item.href === '/'
            ? pathname === '/'
            : pathname.startsWith(item.href)
          return (
            <Link key={item.href} href={item.href} style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '10px 12px', borderRadius: '10px',
              textDecoration: 'none',
              fontSize: '14px', fontWeight: isActive ? '600' : '500',
              transition: 'all 0.15s ease',
              background: isActive ? 'rgba(20,184,166,0.12)' : 'transparent',
              color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
              borderLeft: isActive ? '2px solid var(--accent)' : '2px solid transparent',
            }}>
              <span style={{ fontSize: '16px', lineHeight: 1 }}>{item.icon}</span>
              {item.label}
              {item.href === '/medicines/expiring' && (
                <span style={{
                  marginLeft: 'auto', background: 'rgba(239,68,68,0.2)', color: 'var(--red)',
                  fontSize: '10px', fontWeight: '700', padding: '1px 6px', borderRadius: '999px',
                  border: '1px solid rgba(239,68,68,0.3)',
                }} className="pulse">!</span>
              )}
            </Link>
          )
        })}
        {/* Admin-only: Users management */}
        {isAdmin && (() => {
          const isActive = pathname.startsWith('/users')
          return (
            <Link href="/users" style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '10px 12px', borderRadius: '10px',
              textDecoration: 'none',
              fontSize: '14px', fontWeight: isActive ? '600' : '500',
              transition: 'all 0.15s ease',
              background: isActive ? 'rgba(20,184,166,0.12)' : 'transparent',
              color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
              borderLeft: isActive ? '2px solid var(--accent)' : '2px solid transparent',
            }}>
              <span style={{ fontSize: '16px', lineHeight: 1 }}>👥</span>
              Users
            </Link>
          )
        })()}
      </nav>

      {/* Logout */}
      <div style={{ padding: '12px 12px', borderTop: '1px solid var(--border)' }}>
        <button onClick={handleLogout} disabled={isPending}
          className="btn-ghost"
          style={{ width: '100%', justifyContent: 'flex-start', padding: '10px 12px', borderRadius: '10px' }}>
          <span>🚪</span>
          {isPending ? 'Signing out...' : 'Sign Out'}
        </button>
      </div>
    </aside>
  )
}
