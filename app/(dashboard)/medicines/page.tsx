import { db } from '@/server/db/config/db_config'
import { medicine } from '@/server/db/schema/medicines'
import { section } from '@/server/db/schema'
import { get_user } from '@/lib/auth/session'
import { users } from '@/server/db/schema'
import { eq } from 'drizzle-orm'
import Link from 'next/link'
import MedicinesList from './MedicinesList'

export const metadata = { title: 'Medicines · PharmaCare' }
export const revalidate = 30

export default async function MedicinesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; category?: string; section?: string; q?: string }>
}) {
  const params = await searchParams
  const page = Number(params.page ?? 1)
  const pagesize = 15

  // Fetch medicines — simple list for now
  const medicines = await db.select().from(medicine).limit(pagesize).offset((page - 1) * pagesize)
  const sections = await db.select({ sectionid: section.sectionid, name: section.name }).from(section)

  // Auth check for admin
  const sessionData = await get_user()
  let isAdmin = false
  if (sessionData && sessionData.length > 0) {
    const [user] = await db.select({ role: users.role }).from(users).where(eq(users.id, sessionData[0].userid))
    isAdmin = user?.role === 'admin' || user?.role === 'owner'
  }

  const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000'

  return (
    <MedicinesList
      initialMedicines={medicines}
      sections={sections}
      isAdmin={isAdmin}
      page={page}
      pagesize={pagesize}
      baseUrl={BASE_URL}
    />
  )
}
