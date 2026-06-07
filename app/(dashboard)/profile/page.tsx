import { get_user } from '@/lib/auth/session'
import { db } from '@/server/db/config/db_config'
import { users } from '@/server/db/schema'
import { eq } from 'drizzle-orm'
import { redirect } from 'next/navigation'
import LogoutButton from './LogoutButton'

export const metadata = { title: 'Profile · PharmaCare' }

export default async function ProfilePage() {
  const sessionData = await get_user()
  if (!sessionData || sessionData.length === 0) redirect('/login')

  const [user] = await db
    .select({ id: users.id, name: users.name, email: users.email, role: users.role, creatAt: users.creatAt })
    .from(users)
    .where(eq(users.id, sessionData[0].userid))

  if (!user) redirect('/login')

  const initials = user.name.split(' ').map(n => n.charAt(0)).join('').toUpperCase().slice(0, 2)

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Profile</h1>
          <p className="page-subtitle">Your account information</p>
        </div>
      </div>

      <div style={{ maxWidth: '560px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Avatar & Name */}
        <div className="glass" style={{ padding: '32px', display: 'flex', alignItems: 'center', gap: '24px' }}>
          <div style={{
            width: '80px', height: '80px', borderRadius: '50%', flexShrink: 0,
            background: 'linear-gradient(135deg, rgba(20,184,166,0.3), rgba(16,185,129,0.3))',
            border: '2px solid rgba(20,184,166,0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '28px', fontWeight: '800', color: 'var(--accent)',
          }}>
            {initials}
          </div>
          <div>
            <h2 style={{ fontSize: '22px', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '6px' }}>{user.name}</h2>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '10px' }}>{user.email}</p>
            {user.role === 'admin'
              ? <span className="badge badge-teal">⭐ Admin</span>
              : <span className="badge badge-gray">👤 User</span>}
          </div>
        </div>

        {/* Info */}
        <div className="glass" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '16px' }}>Account Details</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[
              { label: 'User ID', value: `#${user.id}` },
              { label: 'Full Name', value: user.name },
              { label: 'Email Address', value: user.email },
              { label: 'Role', value: user.role === 'admin' ? 'Administrator' : 'Standard User' },
              { label: 'Member Since', value: user.creatAt ? new Date(user.creatAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }) : '—' },
            ].map(({ label, value }) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</span>
                <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Logout */}
        <div className="glass" style={{ padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <p style={{ fontWeight: '600', fontSize: '14px', marginBottom: '2px' }}>Sign Out</p>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>End your current session</p>
          </div>
          <LogoutButton />
        </div>
      </div>
    </div>
  )
}
