'use client'
import { useState, useTransition } from 'react'

type Section = { sectionid: number; name: string }

export default function AddMedicineModal({
  sections, onClose, onSuccess,
}: { sections: Section[]; onClose: () => void; onSuccess: () => void }) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState('')

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    const form = e.currentTarget
    const formData = new FormData(form)

    startTransition(async () => {
      try {
        const res = await fetch('/api/medicine', {
          method: 'POST',
          body: formData,
        })
        const data = await res.json()
        if (!res.ok) {
          setError(data.error ?? 'Failed to add medicine')
          return
        }
        onSuccess()
      } catch {
        setError('Network error, please try again')
      }
    })
  }

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '700' }}>Add New Medicine</h2>
          <button onClick={onClose} className="btn-ghost" style={{ padding: '6px 10px', fontSize: '18px' }}>×</button>
        </div>

        {error && (
          <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '10px', padding: '12px 14px', marginBottom: '16px', fontSize: '13px', color: 'var(--red)' }}>
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} encType="multipart/form-data" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div>
              <label className="label">Medicine Name</label>
              <input className="input" name="medicine_name" required placeholder="e.g. Paracetamol" />
            </div>
            <div>
              <label className="label">Manufacture</label>
              <input className="input" name="manufacture" required placeholder="Manufacturer" />
            </div>
            <div>
              <label className="label">Price (IQD)</label>
              <input className="input" name="price" type="number" required placeholder="e.g. 3000" min="251" />
            </div>
            <div>
              <label className="label">Amount in Stock</label>
              <input className="input" name="medicine_Amount" type="number" required placeholder="e.g. 100" min="1" />
            </div>
            <div>
              <label className="label">Expiry Date</label>
              <input className="input" name="expire" type="date" required />
            </div>
            <div>
              <label className="label">Category</label>
              <input className="input" name="category" required placeholder="e.g. Antibiotic" />
            </div>
            <div>
              <label className="label">Section</label>
              <select className="select" name="section" required>
                <option value="">Select section</option>
                {sections.map(s => <option key={s.sectionid} value={s.sectionid}>{s.name}</option>)}
              </select>
            </div>

          </div>

          <div>
            <label className="label">Description</label>
            <textarea className="input" name="description" required placeholder="Medicine description..."
              style={{ resize: 'vertical', minHeight: '80px' }} />
          </div>

          <div>
            <label className="label">Medicine Image</label>
            <input className="input" name="image" type="file" accept="image/*" required
              style={{ cursor: 'pointer', padding: '8px 14px' }} />
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
            <button type="submit" className="btn-primary" disabled={isPending} style={{ flex: 1, justifyContent: 'center', padding: '12px' }}>
              {isPending ? '⏳ Adding...' : '+ Add Medicine'}
            </button>
            <button type="button" onClick={onClose} className="btn-secondary" style={{ padding: '12px 20px' }}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
