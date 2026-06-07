import { db } from '@/server/db/config/db_config'
import { medicine } from '@/server/db/schema/medicines'
import { section } from '@/server/db/schema'
import { bills, bills_product } from '@/server/db/schema'
import { lte, count, desc, gte, sql, lt } from 'drizzle-orm'
import Link from 'next/link'

export const metadata = { title: 'Dashboard · PharmaCare' }
export const revalidate = 30

async function getDashboardData() {
  const now = Date.now()
  const threeDays = now + 3 * 24 * 60 * 60 * 1000
  const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0)

  const [
    medicineList,
    sectionList,
    expiringMeds,
    lowStockMeds,
    recentBills,
  ] = await Promise.all([
    db.select({ count: count() }).from(medicine),
    db.select({ count: count() }).from(section),
    db.select({ count: count() }).from(medicine).where(lte(medicine.expire, threeDays)),
    db.select({ count: count() }).from(medicine).where(lt(medicine.medicine_Amount, 10)),
    db.select().from(bills).orderBy(desc(bills.bill_Date)).limit(8),
  ])

  return {
    totalMedicines: medicineList[0]?.count ?? 0,
    totalSections: sectionList[0]?.count ?? 0,
    expiringCount: expiringMeds[0]?.count ?? 0,
    lowStockCount: lowStockMeds[0]?.count ?? 0,
    recentBills,
  }
}

function StatCard({ icon, label, value, color, href, urgent }: {
  icon: string; label: string; value: number; color: string; href?: string; urgent?: boolean
}) {
  const content = (
    <div className="glass stat-card" style={{ cursor: href ? 'pointer' : 'default' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <p style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>
            {label}
          </p>
          <p style={{ fontSize: '34px', fontWeight: '800', color, lineHeight: 1 }}>
            {value}
            {urgent && value > 0 && <span style={{ fontSize: '16px', marginLeft: '6px' }} className="pulse">!</span>}
          </p>
        </div>
        <div style={{
          width: '46px', height: '46px', borderRadius: '12px',
          background: `${color}18`, border: `1px solid ${color}30`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px',
        }}>
          {icon}
        </div>
      </div>
    </div>
  )
  return href ? <Link href={href} style={{ textDecoration: 'none' }}>{content}</Link> : content
}

export default async function DashboardPage() {
  const { totalMedicines, totalSections, expiringCount, lowStockCount, recentBills } = await getDashboardData()

  const stats = [
    { icon: '💊', label: 'Total Medicines', value: totalMedicines, color: 'var(--accent)', href: '/medicines' },
    { icon: '📦', label: 'Sections', value: totalSections, color: '#818cf8', href: '/sections' },
    { icon: '⚠️', label: 'Expiring Soon', value: expiringCount, color: 'var(--red)', href: '/medicines/expiring', urgent: true },
    { icon: '📉', label: 'Low Stock', value: lowStockCount, color: 'var(--amber)', href: '/medicines', urgent: true },
  ]

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Welcome back — here's what's happening today</p>
        </div>
      </div>

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        {stats.map(s => <StatCard key={s.label} {...s} />)}
      </div>

      {/* Alerts */}
      {expiringCount > 0 && (
        <Link href="/medicines/expiring" style={{ textDecoration: 'none' }}>
          <div style={{
            background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)',
            borderRadius: '12px', padding: '14px 18px', marginBottom: '24px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '20px' }}>🚨</span>
              <div>
                <span style={{ fontWeight: '700', color: 'var(--red)', fontSize: '14px' }}>
                  {expiringCount} medicine{expiringCount > 1 ? 's' : ''} expiring within 3 days
                </span>
                <span style={{ color: 'var(--text-muted)', fontSize: '13px', marginLeft: '8px' }}>
                  Click to view and send alerts
                </span>
              </div>
            </div>
            <span style={{ color: 'var(--red)', fontSize: '18px' }}>→</span>
          </div>
        </Link>
      )}

      {/* Recent Bills */}
      <div className="glass" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: '700' }}>Recent Bills</h2>
          <Link href="/bills" className="btn-ghost" style={{ fontSize: '13px' }}>
            View all →
          </Link>
        </div>

        {recentBills.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px', fontSize: '14px' }}>
            No bills yet.{' '}
            <Link href="/bills/new" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: '600' }}>
              Create one →
            </Link>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Bill #</th>
                  <th>Date</th>
                  <th>Payment</th>
                  <th>Total</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {recentBills.map((bill) => (
                  <tr key={bill.id}>
                    <td>
                      <span style={{ fontWeight: '700', color: 'var(--accent)' }}>#{bill.id}</span>
                    </td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
                      {new Date(bill.bill_Date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td>
                      <span className={bill.payment_type === 'crad_payment' ? 'badge badge-teal' : 'badge badge-gray'}>
                        {bill.payment_type === 'crad_payment' ? '💳 Card' : '💵 Cash'}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontWeight: '700', color: 'var(--emerald)' }}>
                        {bill.total_price.toLocaleString()} IQD
                      </span>
                    </td>
                    <td>
                      <Link href={`/bills`} className="btn-ghost" style={{ fontSize: '12px', padding: '5px 10px' }}>
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
