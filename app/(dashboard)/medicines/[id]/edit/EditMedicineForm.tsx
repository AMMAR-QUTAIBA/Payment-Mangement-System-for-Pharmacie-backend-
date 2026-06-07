'use client'
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import MedicineImage from '@/components/MedicineImage'

type Medicine = {
  id: number; medicine_name: string; price: number; expire: number
  medicine_Amount: number; category: string; description: string
  manufacture: string; section: number | null; image: string; addedBy: number
}
type Section = { sectionid: number; name: string }

export default function EditMedicineForm({ medicine, sections }: { medicine: Medicine; sections: Section[] }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    const form = e.currentTarget
    const formData = new FormData(form)

    startTransition(async () => {
      try {
        const res = await fetch(`/api/medicine/${medicine.id}`, { method: 'PUT', body: formData })
        const data = await res.json()
        if (!res.ok) { setError(data.error ?? 'Failed to update'); return }
        setSuccess(true)
        setTimeout(() => router.push(`/medicines/${medicine.id}`), 1200)
      } catch {
        setError('Network error, please try again')
      }
    })
  }

  const expiryDate = new Date(medicine.expire).toISOString().split('T')[0]

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '28px', flexWrap: 'wrap' }}>
        <button onClick={() => router.back()} className="btn-ghost" style={{ padding: '8px 12px' }}>← Back</button>
        <div>
          <h1 className="page-title">Edit Medicine</h1>
          <p className="page-subtitle">{medicine.medicine_name}</p>
        </div>
      </div>

      {success && (
        <div style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '12px', padding: '14px 18px', marginBottom: '20px', color: 'var(--emerald)', fontWeight: '600', fontSize: '14px' }}>
          ✅ Medicine updated successfully! Redirecting...
        </div>
      )}
      {error && (
        <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '12px', padding: '14px 18px', marginBottom: '20px', fontSize: '13px', color: 'var(--red)' }}>
          ⚠️ {error}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '24px', alignItems: 'start' }}>
        {/* Current / Preview Image */}
        <div className="glass" style={{ overflow: 'hidden', borderRadius: '16px' }}>
          <div style={{ height: '220px', background: 'rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
            {previewUrl
              ? <img src={previewUrl} alt="New image preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : medicine.image
                ? <MedicineImage src={medicine.image} alt={medicine.medicine_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <span style={{ fontSize: '60px', opacity: 0.3 }}>💊</span>}
          </div>
          <div style={{ padding: '14px 16px' }}>
            <p style={{ fontSize: '12px', color: previewUrl ? 'var(--emerald)' : 'var(--text-muted)' }}>
              {previewUrl ? '✅ New image selected — will be saved on submit.' : 'Current image. Upload a new file below to replace it.'}
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} encType="multipart/form-data">
          <div className="glass" style={{ padding: '24px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label className="label">Medicine Name</label>
                <input className="input" name="medicine_name" defaultValue={medicine.medicine_name} required />
              </div>
              <div>
                <label className="label">Manufacture</label>
                <input className="input" name="manufacture" defaultValue={medicine.manufacture} required />
              </div>
              <div>
                <label className="label">Price (IQD)</label>
                <input className="input" name="price" type="number" defaultValue={medicine.price} required min="251" />
              </div>
              <div>
                <label className="label">Amount in Stock</label>
                <input className="input" name="medicine_Amount" type="number" defaultValue={medicine.medicine_Amount} required min="0" />
              </div>
              <div>
                <label className="label">Expiry Date</label>
                <input className="input" name="expire" type="date" defaultValue={expiryDate} required />
              </div>
              <div>
                <label className="label">Category</label>
                <input className="input" name="category" defaultValue={medicine.category} required />
              </div>
              <div>
                <label className="label">Section</label>
                <select className="select" name="section" defaultValue={medicine.section ?? ''}>
                  <option value="">No section</option>
                  {sections.map(s => <option key={s.sectionid} value={s.sectionid}>{s.name}</option>)}
                </select>
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label className="label">Description</label>
                <textarea className="input" name="description" defaultValue={medicine.description} required style={{ minHeight: '80px', resize: 'vertical' }} />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label className="label">Replace Image (optional)</label>
                <input className="input" name="image" type="file" accept="image/*"
                  style={{ cursor: 'pointer', padding: '8px 14px' }}
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) setPreviewUrl(URL.createObjectURL(file))
                    else setPreviewUrl(null)
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button type="submit" className="btn-primary" disabled={isPending} style={{ flex: 1, justifyContent: 'center', padding: '12px', fontSize: '14px' }}>
                {isPending ? '⏳ Saving...' : '✓ Save Changes'}
              </button>
              <button type="button" onClick={() => router.back()} className="btn-secondary" style={{ padding: '12px 20px' }}>
                Cancel
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
