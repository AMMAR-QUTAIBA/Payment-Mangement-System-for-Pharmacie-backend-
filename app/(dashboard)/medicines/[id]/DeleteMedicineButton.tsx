'use client'
import { useRouter } from 'next/navigation'
import { useTransition, useState } from 'react'

export default function DeleteMedicineButton({ id }: { id: number }) {
  const [isPending, startTransition] = useTransition()
  const [confirming, setConfirming] = useState(false)
  const router = useRouter()

  const handleDelete = () => {
    startTransition(async () => {
      const res = await fetch(`/api/medicine/${id}`, { method: 'DELETE' })
      if (res.ok) {
        router.push('/medicines')
        router.refresh()
      }
    })
  }

  if (confirming) {
    return (
      <div style={{ display: 'flex', gap: '8px' }}>
        <button onClick={handleDelete} className="btn-danger" disabled={isPending}>
          {isPending ? '⏳ Deleting...' : '✓ Confirm Delete'}
        </button>
        <button onClick={() => setConfirming(false)} className="btn-ghost">Cancel</button>
      </div>
    )
  }

  return (
    <button onClick={() => setConfirming(true)} className="btn-danger">
      🗑️ Delete
    </button>
  )
}
