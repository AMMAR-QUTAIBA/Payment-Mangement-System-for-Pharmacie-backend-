import { redirect } from 'next/navigation'
import { get_user } from '@/lib/auth/session'
import { db } from '@/server/db/config/db_config'
import { users, session as sessionTable } from '@/server/db/schema'
import { eq } from 'drizzle-orm'
import Sidebar from '@/components/Sidebar'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  // Auth guard
  const sessionData = await get_user()
  if (!sessionData || sessionData.length === 0) {
    redirect('/login')
  }

  // Get user info
  const [user] = await db
    .select({ name: users.name, role: users.role })
    .from(users)
    .where(eq(users.id, sessionData[0].userid))

  if (!user) redirect('/login')

  const isOwner = sessionData[0].userid === Number(process.env.owner_id)
  const isAdmin = user.role === 'admin' || isOwner

  return (
    <div className="app-shell">
      <Sidebar userName={user.name} isAdmin={isAdmin} isOwner={isOwner} />
      <main className="main-content">
        {children}
      </main>
    </div>
  )
}
