'use client'
import { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import AddMedicineModal from './AddMedicineModal'

type Medicine = {
  id: number
  medicine_name: string
  price: number
  expire: number
  medicine_Amount: number
  category: string
  description: string
  manufacture: string
  section: number | null
  image: string
  addedBy: number
  addedAt: string
}

type Section = { sectionid: number; name: string }

type Props = {
  initialMedicines: Medicine[]
  sections: Section[]
  isAdmin: boolean
  page: number
  pagesize: number
  baseUrl: string
}

function ExpiryBadge({ expire }: { expire: number }) {
  const now = Date.now()
  const days = Math.floor((expire - now) / (1000 * 60 * 60 * 24))
  if (days < 0) return <span className="badge badge-red">Expired</span>
  if (days <= 3) return <span className="badge badge-red pulse">Exp: {days}d</span>
  if (days <= 30) return <span className="badge badge-amber">Exp: {days}d</span>
  return <span className="badge badge-green">Exp: {new Date(expire).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
}

function StockBadge({ amount }: { amount: number }) {
  if (amount <= 0) return <span className="badge badge-red">Out of Stock</span>
  if (amount <= 10) return <span className="badge badge-amber">Low: {amount}</span>
  return <span className="badge badge-green">{amount} units</span>
}

export default function MedicinesList({ initialMedicines, sections, isAdmin, page, pagesize, baseUrl }: Props) {
  const router = useRouter()
  const [medicines, setMedicines] = useState<Medicine[]>(initialMedicines)
  const [search, setSearch] = useState('')
  const [filterCategory, setFilterCategory] = useState('')
  const [filterSection, setFilterSection] = useState('')
  const [loading, setLoading] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [currentPage, setCurrentPage] = useState(page)
  const [categories, setCategories] = useState<string[]>(() =>
    Array.from(new Set(initialMedicines.map(m => m.category)))
  )

  // Fetch all distinct categories from DB (not just the first page)
  useEffect(() => {
    fetch('/api/medicine/categories')
      .then(r => r.json())
      .then((data: string[]) => { if (Array.isArray(data)) setCategories(data) })
      .catch(() => {})
  }, [])

  const handleSearch = useCallback(async (pageOverride?: number) => {
    const activePage = pageOverride ?? currentPage
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.set('medicine_name', search)
      if (filterCategory) params.set('category', filterCategory)
      if (filterSection) params.set('section', filterSection)
      params.set('page', String(activePage))
      const res = await fetch(`/api/medicine/filter?${params}`)
      const data = await res.json()
      setMedicines(Array.isArray(data) ? data : [])
    } catch {
      // keep old data on error
    } finally {
      setLoading(false)
    }
  }, [search, filterCategory, filterSection, currentPage])

  const handleReset = async () => {
    setSearch(''); setFilterCategory(''); setFilterSection('')
    setLoading(true)
    const res = await fetch(`/api/medicine/filter?page=1`)
    const data = await res.json()
    setMedicines(Array.isArray(data) ? data : initialMedicines)
    setLoading(false)
  }

  const getSectionName = (id: number | null) => sections.find(s => s.sectionid === id)?.name ?? '—'

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Medicines</h1>
          <p className="page-subtitle">{medicines.length} items shown</p>
        </div>
        {isAdmin && (
          <button onClick={() => setShowAddModal(true)} className="btn-primary">
            + Add Medicine
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="glass" style={{ padding: '16px 20px', marginBottom: '24px', display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <div style={{ flex: '1 1 200px' }}>
          <label className="label">Search</label>
          <input className="input" placeholder="Medicine name..." value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()} />
        </div>
        <div style={{ flex: '1 1 150px' }}>
          <label className="label">Category</label>
          <select className="select" value={filterCategory} onChange={e => setFilterCategory(e.target.value)}>
            <option value="">All</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div style={{ flex: '1 1 150px' }}>
          <label className="label">Section</label>
          <select className="select" value={filterSection} onChange={e => setFilterSection(e.target.value)}>
            <option value="">All</option>
            {sections.map(s => <option key={s.sectionid} value={String(s.sectionid)}>{s.name}</option>)}
          </select>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={() => handleSearch()} className="btn-primary" disabled={loading}>
            {loading ? '⏳' : '🔍 Search'}
          </button>
          <button onClick={handleReset} className="btn-secondary">Reset</button>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '80px', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: '32px', marginBottom: '12px' }} className="pulse">💊</div>
          Loading medicines...
        </div>
      ) : medicines.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
          <p style={{ fontSize: '16px', fontWeight: '600' }}>No medicines found</p>
          <button onClick={handleReset} className="btn-secondary" style={{ marginTop: '16px' }}>Clear filters</button>
        </div>
      ) : (
        <div className="cards-grid">
          {medicines.map(med => (
            <div key={med.id} className="glass" style={{
              overflow: 'hidden', transition: 'all 0.25s ease',
              display: 'flex', flexDirection: 'column',
            }}>
              {/* Image */}
              <div style={{
                height: '160px', background: 'rgba(255,255,255,0.03)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                overflow: 'hidden', position: 'relative',
              }}>
                {med.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={med.image} alt={med.medicine_name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                  />
                ) : (
                  <span style={{ fontSize: '48px', opacity: 0.4 }}>💊</span>
                )}
                {/* Price tag */}
                <div style={{
                  position: 'absolute', top: '10px', right: '10px',
                  background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)',
                  borderRadius: '8px', padding: '4px 10px',
                  fontWeight: '700', fontSize: '13px', color: 'var(--emerald)',
                }}>
                  {med.price.toLocaleString()} IQD
                </div>
              </div>

              {/* Content */}
              <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div>
                  <h3 style={{ fontWeight: '700', fontSize: '15px', color: 'var(--text-primary)', marginBottom: '3px' }}>
                    {med.medicine_name}
                  </h3>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    {med.manufacture} · {getSectionName(med.section)}
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  <span className="badge badge-gray">{med.category}</span>
                  <StockBadge amount={med.medicine_Amount} />
                  <ExpiryBadge expire={med.expire} />
                </div>

                {/* Actions */}
                <div style={{ marginTop: 'auto', paddingTop: '12px', display: 'flex', gap: '8px', borderTop: '1px solid var(--border)' }}>
                  <Link href={`/medicines/${med.id}`} className="btn-secondary" style={{ fontSize: '12px', padding: '6px 14px', flex: 1, justifyContent: 'center' }}>
                    Details
                  </Link>
                  {isAdmin && (
                    <Link href={`/medicines/${med.id}/edit`} className="btn-ghost" style={{ fontSize: '12px', padding: '6px 12px' }}>
                      ✏️
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '32px' }}>
        {currentPage > 1 && (
          <button className="btn-secondary" onClick={() => {
            const prev = currentPage - 1
            setCurrentPage(prev)
            handleSearch(prev)
          }}>
            ← Prev
          </button>
        )}
        <span className="glass" style={{ padding: '10px 20px', borderRadius: '10px', fontSize: '14px', color: 'var(--text-secondary)' }}>
          Page {currentPage}
        </span>
        {medicines.length === pagesize && (
          <button className="btn-secondary" onClick={() => {
            const next = currentPage + 1
            setCurrentPage(next)
            handleSearch(next)
          }}>
            Next →
          </button>
        )}
      </div>

      {/* Add Medicine Modal */}
      {showAddModal && (
        <AddMedicineModal
          sections={sections}
          onClose={() => setShowAddModal(false)}
          onSuccess={async () => {
            setShowAddModal(false)
            await handleReset()
            router.refresh()
          }}
        />
      )}
    </div>
  )
}
