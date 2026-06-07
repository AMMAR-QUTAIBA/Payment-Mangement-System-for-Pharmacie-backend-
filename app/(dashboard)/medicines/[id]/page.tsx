import { db } from '@/server/db/config/db_config'
import { medicine } from '@/server/db/schema/medicines'
import { section } from '@/server/db/schema'
import { users } from '@/server/db/schema'
import { get_user } from '@/lib/auth/session'
import { eq } from 'drizzle-orm'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import DeleteMedicineButton from './DeleteMedicineButton'
import MedicineImage from '@/components/MedicineImage'

export default async function MedicineDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const medId = Number(id)
  if (isNaN(medId)) notFound()

  const [med] = await db.select().from(medicine).where(eq(medicine.id, medId))
  if (!med) notFound()

  const [sec] = med.section
    ? await db.select({ name: section.name }).from(section).where(eq(section.sectionid, med.section))
    : [null]

  // Look up the user who added / last updated this medicine
  const [addedByUser] = med.addedBy
    ? await db.select({ name: users.name }).from(users).where(eq(users.id, med.addedBy))
    : [null]

  
  const sessionData = await get_user()
  let isAdmin = false
  if (sessionData && sessionData.length > 0) {
    const [user] = await db.select({ role: users.role }).from(users).where(eq(users.id, sessionData[0].userid))
    isAdmin = user?.role === 'admin' || user?.role === 'owner'
  }

  const now = Date.now()
  const daysLeft = Math.floor((med.expire - now) / (1000 * 60 * 60 * 24))
  const expiryColor = daysLeft < 0 ? 'var(--red)' : daysLeft <= 3 ? 'var(--red)' : daysLeft <= 30 ? 'var(--amber)' : 'var(--emerald)'

  return (
    <div>
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Link href="/medicines" className="btn-ghost" style={{ padding: '8px 12px' }}>← Back</Link>
          <div>
            <h1 className="page-title">{med.medicine_name}</h1>
            <p className="page-subtitle">{med.manufacture}</p>
          </div>
        </div>
        {isAdmin && (
          <div style={{ display: 'flex', gap: '10px' }}>
            <Link href={`/medicines/${medId}/edit`} className="btn-secondary">✏️ Edit</Link>
            <DeleteMedicineButton id={medId} />
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(280px,380px) 1fr', gap: '24px', alignItems: 'start' }}>
        {/* Image */}
        <div className="glass" style={{ overflow: 'hidden', borderRadius: '16px' }}>
          <div style={{ height: '300px', background: 'rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
            {med.image ? (
            <MedicineImage
              src={med.image}
              alt={med.medicine_name}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <span style={{ fontSize: '80px', opacity: 0.3 }}>💊</span>
          )}
          </div>
          <div style={{ padding: '20px' }}>
            <div style={{ fontSize: '28px', fontWeight: '800', color: 'var(--emerald)', marginBottom: '4px' }}>
              {med.price.toLocaleString()} IQD
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Per unit price</p>
          </div>
        </div>

        {/* Details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Badges */}
          <div className="glass" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '14px' }}>Status</h3>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <span className="badge badge-gray">{med.category}</span>
              {med.medicine_Amount <= 0 ? <span className="badge badge-red">Out of Stock</span>
                : med.medicine_Amount <= 10 ? <span className="badge badge-amber">Low Stock: {med.medicine_Amount}</span>
                : <span className="badge badge-green">In Stock: {med.medicine_Amount}</span>}
              {sec && <span className="badge badge-teal">📦 {sec.name}</span>}
            </div>
          </div>

          {/* Info grid */}
          <div className="glass" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '16px' }}>Details</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              {[
                { label: 'Manufacture', value: med.manufacture },
                { label: 'Category', value: med.category },
                { label: 'Stock', value: `${med.medicine_Amount} units` },
                { label: 'Section', value: sec?.name ?? '—' },
                { label: 'Expiry Date', value: new Date(med.expire).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }), color: expiryColor },
                { label: 'Days Remaining', value: daysLeft < 0 ? 'Expired' : `${daysLeft} days`, color: expiryColor },
                { label: 'Added / Updated By', value: addedByUser?.name ?? `User #${med.addedBy}` },
              ].map(({ label, value, color }) => (
                <div key={label}>
                  <p style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>{label}</p>
                  <p style={{ fontSize: '15px', fontWeight: '600', color: color ?? 'var(--text-primary)' }}>{value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Description */}
          <div className="glass" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '10px' }}>Description</h3>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.7 }}>{med.description}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
