import { db } from '@/server/db/config/db_config'
import { bills, bills_product } from '@/server/db/schema'
import { medicine } from '@/server/db/schema/medicines'
import { eq, desc } from 'drizzle-orm'
import BillsList from './BillsList'

export const metadata = { title: 'Bills · PharmaCare' }


export const revalidate = 30

export default async function BillsPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const params = await searchParams
  const page = Number(params.page ?? 1)
  const pagesize = 20

  
  const rows = await db
    .select({
      id: bills.id,
      date: bills.bill_Date,
      payment_type: bills.payment_type,
      total_price: bills.total_price,
      card_last4: bills.custumer_last_4Number,
      user_sell: bills.user_sell,
      medicine_name: medicine.medicine_name,
      quantity: bills_product.quantity,
      product_price: bills_product.product_price,
    })
    .from(bills)
    .leftJoin(bills_product, eq(bills_product.bill_id, bills.id))
    .leftJoin(medicine, eq(medicine.id, bills_product.medicine_id))
    .orderBy(desc(bills.bill_Date))
    .limit(pagesize * 10) 
    .offset((page - 1) * pagesize)

  
  const billMap = new Map<number, {
    id: number; date: number; payment_type: string; total_price: number;
    card_last4: string | null; user_sell: number;
    products: { medicine_name: string; quantity: number; product_price: number }[]
  }>()

  for (const row of rows) {
    if (!billMap.has(row.id)) {
      billMap.set(row.id, {
        id: row.id,
        date: row.date,
        payment_type: row.payment_type,
        total_price: row.total_price,
        card_last4: row.card_last4,
        user_sell: row.user_sell,
        products: [],
      })
    }
    if (row.medicine_name) {
      billMap.get(row.id)!.products.push({
        medicine_name: row.medicine_name,
        quantity: row.quantity ?? 0,
        product_price: row.product_price ?? 0,
      })
    }
  }

  const grouped = Array.from(billMap.values()).slice(0, pagesize)

  return <BillsList bills={grouped} page={page} pagesize={pagesize} />
}
