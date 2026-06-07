import { redirect } from 'next/navigation'
import { db } from '@/server/db/config/db_config'
import { users, session as sessionTable } from '@/server/db/schema'
import { eq } from 'drizzle-orm'
import { cookies } from 'next/headers'
import UserRoleButton from './UserRoleButton'

export const metadata = { title: 'Users · PharmaCare' }

export default async function UsersPage() {
  // Get current session to find who is logged in
  const cookieStore = await cookies()
  const sessionId = cookieStore.get('sessionid')?.value
  if (!sessionId) redirect('/login')

  const [sess] = await db.select().from(sessionTable).where(eq(sessionTable.sessionid, sessionId))
  if (!sess) redirect('/login')

  // Check caller is admin or owner
  const [me] = await db.select().from(users).where(eq(users.id, sess.userid))
  const isOwner = sess.userid === Number(process.env.owner_id)
  if (!me || (me.role !== 'admin' && !isOwner)) redirect('/')

  // Load all users
  const allUsers = await db
    .select({ id: users.id, name: users.name, email: users.email, role: users.role, creatAt: users.creatAt })
    .from(users)
    .orderBy(users.creatAt)

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Users</h1>
          <p className="page-subtitle">Manage user accounts and roles</p>
        </div>
        <span style={{
          fontSize: '13px', color: 'var(--text-muted)',
          background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)',
          borderRadius: '10px', padding: '8px 16px',
        }}>
          👥 {allUsers.length} total
        </span>
      </div>

      {/* Users Table */}
      <div className="glass" style={{ padding: '24px' }}>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Joined</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {allUsers.map((u) => (
                <tr key={u.id}>
                  <td style={{ color: 'var(--text-muted)', fontSize: '13px' }}>{u.id}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{
                        width: '32px', height: '32px', borderRadius: '50%',
                        background: 'linear-gradient(135deg, rgba(20,184,166,0.25), rgba(16,185,129,0.25))',
                        border: '1px solid rgba(20,184,166,0.3)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '13px', fontWeight: '700', color: 'var(--accent)', flexShrink: 0,
                      }}>
                        {u.name.charAt(0).toUpperCase()}
                      </div>
                      <span style={{ fontWeight: '600', fontSize: '14px' }}>{u.name}</span>
                    </div>
                  </td>
                  <td style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>{u.email}</td>
                  <td>
                    {u.id === Number(process.env.owner_id) ? (
                      <span className="badge badge-amber">🔑 Owner</span>
                    ) : u.role === 'admin' ? (
                      <span className="badge badge-teal">👑 Admin</span>
                    ) : (
                      <span className="badge badge-gray">👤 User</span>
                    )}
                  </td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
                    {new Date(u.creatAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </td>
                  <td>
                    <UserRoleButton
                      userId={u.id}
                      currentRole={u.role}
                      isSelf={u.id === sess.userid}
                      isOwner={isOwner}
                      isUserOwner={u.id === Number(process.env.owner_id)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
