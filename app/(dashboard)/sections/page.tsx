import { db } from '@/server/db/config/db_config'
import { section } from '@/server/db/schema'
import { medicine } from '@/server/db/schema/medicines'
import { get_user } from '@/lib/auth/session'
import { users } from '@/server/db/schema'
import { eq, count } from 'drizzle-orm'
import SectionsList from './SectionsList'

export const metadata = { title: 'Sections · PharmaCare' }
export const revalidate = 30

export default async function SectionsPage() {
  const sessionData = await get_user()
  let isAdmin = false
  if (sessionData && sessionData.length > 0) {
    const [user] = await db.select({ role: users.role }).from(users).where(eq(users.id, sessionData[0].userid))
    isAdmin = user?.role === 'admin' || user?.role === 'owner'
  }

  const sections = await db.select({ sectionid: section.sectionid, name: section.name, description: section.description }).from(section)

  // Count medicines per section
  const medicineCounts = await db
    .select({ section: medicine.section, count: count() })
    .from(medicine)
    .groupBy(medicine.section)

  const sectionsWithCount = sections.map(s => ({
    ...s,
    medicineCount: medicineCounts.find(m => m.section === s.sectionid)?.count ?? 0,
  }))

  return <SectionsList sections={sectionsWithCount} isAdmin={isAdmin} />
}
