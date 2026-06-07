'use client'
import { useState, useTransition, useEffect } from 'react'
import Link from 'next/link'

type SectionWithCount = { sectionid: number; name: string; description: string; medicineCount: number }
type UnassignedMedicine = { id: number; medicine_name: string; category: string; manufacture: string }

export default function SectionsList({ sections: initialSections, isAdmin }: { sections: SectionWithCount[]; isAdmin: boolean }) {
  const [sections, setSections] = useState(initialSections)
  const [showAdd, setShowAdd] = useState(false)
  const [editId, setEditId] = useState<number | null>(null)
  const [addName, setAddName] = useState('')
  const [addDesc, setAddDesc] = useState('')
  const [editName, setEditName] = useState('')
  const [editDesc, setEditDesc] = useState('')
  const [error, setError] = useState('')
  const [isPending, startTransition] = useTransition()

  // Unassigned medicines state
  const [unassigned, setUnassigned] = useState<UnassignedMedicine[]>([])
  const [loadingUnassigned, setLoadingUnassigned] = useState(false)
  const [showUnassigned, setShowUnassigned] = useState(false)
  const [assigningId, setAssigningId] = useState<number | null>(null)
  const [selectedSection, setSelectedSection] = useState<Record<number, string>>({})
  const [assignError, setAssignError] = useState('')

  const loadUnassigned = async () => {
    setLoadingUnassigned(true)
    try {
      const res = await fetch('/api/medicine/medicine_without_section')
      const data = await res.json()
      setUnassigned(Array.isArray(data) ? data : [])
    } catch {
      setUnassigned([])
    } finally {
      setLoadingUnassigned(false)
    }
  }

  useEffect(() => {
    loadUnassigned()
  }, [])

  const reload = async () => {
    const res = await fetch('/api/section/get_sections')
    const data = await res.json()
    setSections(data)
  }

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault(); setError('')
    startTransition(async () => {
      const res = await fetch('/api/section/creat_section', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: addName, description: addDesc }) })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Failed to create'); return }
      setShowAdd(false); setAddName(''); setAddDesc('')
      await reload()
    })
  }

  const handleEdit = (e: React.FormEvent, id: number) => {
    e.preventDefault(); setError('')
    startTransition(async () => {
      const res = await fetch(`/api/section/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: editName, description: editDesc }) })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Failed to update'); return }
      setEditId(null)
      await reload()
    })
  }

  const handleDelete = (id: number) => {
    startTransition(async () => {
      await fetch(`/api/section/${id}`, { method: 'DELETE' })
      await reload()
      await loadUnassigned() // medicines orphaned by delete appear here
    })
  }

  const handleAssign = async (medicineId: number) => {
    const sectionId = selectedSection[medicineId]
    if (!sectionId) { setAssignError('Please choose a section first'); return }
    setAssignError('')
    setAssigningId(medicineId)
    try {
      const res = await fetch('/api/section/assign_medicine', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ medicine_id: medicineId, section_id: Number(sectionId) }),
      })
      const data = await res.json()
      if (!res.ok) { setAssignError(data.error ?? 'Failed to assign'); return }
      // Remove from unassigned list + update section count
      setUnassigned(prev => prev.filter(m => m.id !== medicineId))
      await reload()
    } catch {
      setAssignError('Network error, please try again')
    } finally {
      setAssigningId(null)
    }
  }

  const sectionColors = ['#14b8a6', '#818cf8', '#f59e0b', '#10b981', '#f472b6', '#60a5fa']

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Sections</h1>
          <p className="page-subtitle">{sections.length} sections total</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          {isAdmin && <button onClick={() => setShowAdd(true)} className="btn-primary">+ Add Section</button>}
          <button
            onClick={() => { setShowUnassigned(v => !v); if (!showUnassigned) loadUnassigned() }}
            className="btn-secondary"
            style={{ position: 'relative' }}
          >
            📦 Unassigned
            {unassigned.length > 0 && (
              <span style={{
                position: 'absolute', top: '-6px', right: '-6px',
                background: '#ef4444', color: '#fff', borderRadius: '50%',
                width: '18px', height: '18px', fontSize: '11px', fontWeight: '700',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {unassigned.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {error && (
        <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '10px', padding: '12px 16px', marginBottom: '20px', fontSize: '13px', color: 'var(--red)' }}>
          ⚠️ {error}
        </div>
      )}

      {/* ── Unassigned Medicines Panel ── */}
      {showUnassigned && (
        <div className="glass" style={{ marginBottom: '28px', padding: '20px 24px', borderTop: '3px solid #f59e0b' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)' }}>
              📦 Medicines Without a Section
              <span style={{ marginLeft: '10px', fontSize: '13px', fontWeight: '500', color: 'var(--text-muted)' }}>
                ({unassigned.length} found)
              </span>
            </h2>
            <button onClick={() => setShowUnassigned(false)} className="btn-ghost" style={{ fontSize: '18px', padding: '4px 10px' }}>×</button>
          </div>

          {assignError && (
            <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '8px', padding: '10px 14px', marginBottom: '14px', fontSize: '13px', color: 'var(--red)' }}>
              ⚠️ {assignError}
            </div>
          )}

          {loadingUnassigned ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: '28px', marginBottom: '10px' }} className="pulse">💊</div>
              Loading...
            </div>
          ) : unassigned.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: '36px', marginBottom: '10px' }}>✅</div>
              <p>All medicines are assigned to a section.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {unassigned.map(med => (
                <div key={med.id} style={{
                  display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap',
                  background: 'rgba(255,255,255,0.04)', borderRadius: '10px',
                  border: '1px solid var(--border)', padding: '12px 16px',
                }}>
                  <div style={{ flex: 1, minWidth: '160px' }}>
                    <p style={{ fontWeight: '700', fontSize: '14px', color: 'var(--text-primary)', margin: 0 }}>{med.medicine_name}</p>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>{med.category} · {med.manufacture}</p>
                  </div>
                  {isAdmin ? (
                    <>
                      <select
                        className="select"
                        style={{ minWidth: '160px', fontSize: '13px', padding: '7px 10px' }}
                        value={selectedSection[med.id] ?? ''}
                        onChange={e => setSelectedSection(prev => ({ ...prev, [med.id]: e.target.value }))}
                      >
                        <option value="">— choose section —</option>
                        {sections.map(s => (
                          <option key={s.sectionid} value={s.sectionid}>{s.name}</option>
                        ))}
                      </select>
                      <button
                        className="btn-primary"
                        style={{ fontSize: '13px', padding: '7px 16px', whiteSpace: 'nowrap' }}
                        disabled={assigningId === med.id || !selectedSection[med.id]}
                        onClick={() => handleAssign(med.id)}
                      >
                        {assigningId === med.id ? '⏳' : '✓ Assign'}
                      </button>
                    </>
                  ) : (
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>No section</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Add Section Modal */}
      {showAdd && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowAdd(false)}>
          <div className="modal-box">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '700' }}>New Section</h2>
              <button onClick={() => setShowAdd(false)} className="btn-ghost" style={{ fontSize: '18px', padding: '6px 10px' }}>×</button>
            </div>
            <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div><label className="label">Section Name</label><input className="input" value={addName} onChange={e => setAddName(e.target.value)} required placeholder="e.g. Antibiotics" /></div>
              <div><label className="label">Description</label><textarea className="input" value={addDesc} onChange={e => setAddDesc(e.target.value)} required placeholder="Describe this section..." style={{ minHeight: '80px', resize: 'vertical' }} /></div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="submit" className="btn-primary" disabled={isPending} style={{ flex: 1, justifyContent: 'center', padding: '12px' }}>{isPending ? '⏳ Creating...' : '+ Create'}</button>
                <button type="button" onClick={() => setShowAdd(false)} className="btn-secondary" style={{ padding: '12px 20px' }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editId !== null && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setEditId(null)}>
          <div className="modal-box">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '700' }}>Edit Section</h2>
              <button onClick={() => setEditId(null)} className="btn-ghost" style={{ fontSize: '18px', padding: '6px 10px' }}>×</button>
            </div>
            <form onSubmit={e => handleEdit(e, editId)} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div><label className="label">Section Name</label><input className="input" value={editName} onChange={e => setEditName(e.target.value)} required /></div>
              <div><label className="label">Description</label><textarea className="input" value={editDesc} onChange={e => setEditDesc(e.target.value)} required style={{ minHeight: '80px', resize: 'vertical' }} /></div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="submit" className="btn-primary" disabled={isPending} style={{ flex: 1, justifyContent: 'center', padding: '12px' }}>{isPending ? '⏳ Saving...' : '✓ Save'}</button>
                <button type="button" onClick={() => setEditId(null)} className="btn-secondary" style={{ padding: '12px 20px' }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Grid */}
      {sections.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📦</div>
          <p>No sections yet.</p>
        </div>
      ) : (
        <div className="cards-grid">
          {sections.map((s, i) => {
            const color = sectionColors[i % sectionColors.length]
            return (
              <div key={s.sectionid} className="glass" style={{ padding: '24px', borderTop: `3px solid ${color}`, transition: 'all 0.25s ease' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: `${color}18`, border: `1px solid ${color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>
                    📦
                  </div>
                  {isAdmin && (
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button onClick={() => { setEditId(s.sectionid); setEditName(s.name); setEditDesc(s.description) }} className="btn-ghost" style={{ padding: '5px 9px', fontSize: '13px' }}>✏️</button>
                      <button onClick={() => handleDelete(s.sectionid)} className="btn-danger" style={{ padding: '5px 9px', fontSize: '13px' }}>🗑️</button>
                    </div>
                  )}
                </div>
                <h3 style={{ fontWeight: '700', fontSize: '16px', marginBottom: '6px', color: 'var(--text-primary)' }}>{s.name}</h3>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: 1.6 }}>{s.description}</p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '13px', fontWeight: '700', color }}>
                    {s.medicineCount} medicine{s.medicineCount !== 1 ? 's' : ''}
                  </span>
                  <Link href={`/medicines?section=${s.sectionid}`} className="btn-ghost" style={{ fontSize: '12px', padding: '5px 12px' }}>
                    View →
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
