import { db } from '@/server/db/config/db_config'
import { medicine } from '@/server/db/schema/medicines'
import { section } from '@/server/db/schema'
import { get_user } from '@/lib/auth/session'
import { users } from '@/server/db/schema'
import { eq } from 'drizzle-orm'
import { notFound, redirect } from 'next/navigation'
import EditMedicineForm from './EditMedicineForm'

export default async function EditMedicinePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const medId = Number(id)
  if (isNaN(medId)) notFound()

  
  const sessionData = await get_user()
  if (!sessionData || sessionData.length === 0) redirect('/login')
  const [user] = await db.select({ role: users.role }).from(users).where(eq(users.id, sessionData[0].userid))
  if (user?.role !== 'admin') redirect(`/medicines/${medId}`)

  const [med] = await db.select().from(medicine).where(eq(medicine.id, medId))
  if (!med) notFound()

  const sections = await db.select({ sectionid: section.sectionid, name: section.name }).from(section)

  return <EditMedicineForm medicine={med} sections={sections} />
}
