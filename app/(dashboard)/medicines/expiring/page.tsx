import { db } from '@/server/db/config/db_config'
import { medicine } from '@/server/db/schema/medicines'
import { section } from '@/server/db/schema'
import { lte, eq } from 'drizzle-orm'
import Link from 'next/link'
import SendExpireEmailButton from './SendExpireEmailButton'

export const metadata = { title: 'Expiring Medicines · PharmaCare' }

export default async function ExpiringPage() {
  const threeDaysFromNow = Date.now() + 3 * 24 * 60 * 60 * 1000

  const expiringMeds = await db
    .select().from(medicine)
    .where(lte(medicine.expire, threeDaysFromNow))
    .orderBy(medicine.expire)

  const sections = await db.select({ sectionid: section.sectionid, name: section.name }).from(section)
  const getSectionName = (id: number | null) => sections.find(s => s.sectionid === id)?.name ?? '—'

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">⚠️ Expiring Medicines</h1>
          <p className="page-subtitle">Medicines expiring within the next 3 days</p>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <SendExpireEmailButton />
          <Link href="/medicines" className="btn-secondary">← Back to Medicines</Link>
        </div>
      </div>

      {/* Alert banner */}
      {expiringMeds.length > 0 && (
        <div style={{
          background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)',
          borderRadius: '14px', padding: '18px 22px', marginBottom: '28px',
          display: 'flex', alignItems: 'center', gap: '14px',
        }}>
          <div style={{ fontSize: '32px' }}>🚨</div>
          <div>
            <p style={{ fontWeight: '700', color: 'var(--red)', fontSize: '16px' }}>
              {expiringMeds.length} medicine{expiringMeds.length > 1 ? 's' : ''} need immediate attention
            </p>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '2px' }}>
              Use the button above to send an alert email about these medicines.
            </p>
          </div>
        </div>
      )}

      {expiringMeds.length === 0 ? (
        <div className="glass" style={{ padding: '80px', textAlign: 'center' }}>
          <div style={{ fontSize: '64px', marginBottom: '16px' }}>✅</div>
          <h2 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--emerald)', marginBottom: '8px' }}>All Good!</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>No medicines are expiring within the next 3 days.</p>
        </div>
      ) : (
        <div className="glass" style={{ padding: '24px' }}>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Medicine</th>
                  <th>Section</th>
                  <th>Stock</th>
                  <th>Expiry Date</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {expiringMeds.map(med => {
                  const now = Date.now()
                  const daysLeft = Math.floor((med.expire - now) / (1000 * 60 * 60 * 24))
                  return (
                    <tr key={med.id}>
                      <td>
                        <div>
                          <p style={{ fontWeight: '600', fontSize: '14px' }}>{med.medicine_name}</p>
                          <p style={{ color: 'var(--text-muted)', fontSize: '12px' }}>{med.manufacture}</p>
                        </div>
                      </td>
                      <td style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
                        {getSectionName(med.section)}
                      </td>
                      <td>
                        {med.medicine_Amount <= 0
                          ? <span className="badge badge-red">Out of Stock</span>
                          : med.medicine_Amount <= 10
                          ? <span className="badge badge-amber">{med.medicine_Amount} left</span>
                          : <span className="badge badge-green">{med.medicine_Amount} units</span>}
                      </td>
                      <td style={{ fontWeight: '600', color: 'var(--red)' }}>
                        {new Date(med.expire).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>
                      <td>
                        {daysLeft < 0
                          ? <span className="badge badge-red">Expired</span>
                          : daysLeft === 0
                          ? <span className="badge badge-red pulse">Today!</span>
                          : <span className="badge badge-red">{daysLeft} day{daysLeft > 1 ? 's' : ''} left</span>}
                      </td>
                      <td>
                        <Link href={`/medicines/${med.id}`} className="btn-ghost" style={{ fontSize: '12px', padding: '5px 10px' }}>
                          View
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
