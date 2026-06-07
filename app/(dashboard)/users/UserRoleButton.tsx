'use client'
import { useTransition } from 'react'
import { setUserRole } from '@/server/auth/action'
import { useRouter } from 'next/navigation'

export default function UserRoleButton({
  userId,
  currentRole,
  isSelf,
  isOwner,
  isUserOwner,
}: {
  userId: number
  currentRole: string
  isSelf: boolean
  isOwner: boolean
  isUserOwner: boolean
}) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()
  const isAdmin = currentRole === 'admin'

  const handleClick = () => {
    startTransition(async () => {
      const newRole = isAdmin ? 'user' : 'admin'
      await setUserRole(userId, newRole)
      router.refresh()
    })
  }

  if (isSelf || isUserOwner) {
    return (
      <span style={{
        fontSize: '12px', color: isUserOwner ? 'var(--amber)' : 'var(--text-muted)',
        padding: '6px 12px', borderRadius: '8px',
        background: isUserOwner ? 'rgba(245,158,11,0.1)' : 'rgba(255,255,255,0.04)',
        border: `1px solid ${isUserOwner ? 'rgba(245,158,11,0.3)' : 'var(--border)'}`,
        fontStyle: isSelf && !isUserOwner ? 'italic' : 'normal',
      }}>
        {isUserOwner ? '🔑 Owner' : '(you)'}
      </span>
    )
  }

  if (!isOwner) {
    return (
      <span style={{
        fontSize: '12px', color: 'var(--text-muted)',
        padding: '6px 12px', borderRadius: '8px',
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid var(--border)',
      }}>
        {isAdmin ? '👑 Admin' : '👤 User'}
      </span>
    )
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      style={{
        padding: '6px 14px',
        borderRadius: '8px',
        border: '1px solid',
        cursor: isPending ? 'not-allowed' : 'pointer',
        fontSize: '12px',
        fontWeight: '600',
        fontFamily: 'Inter, sans-serif',
        transition: 'all 0.2s ease',
        opacity: isPending ? 0.6 : 1,
        background: isAdmin
          ? 'rgba(239,68,68,0.1)'
          : 'rgba(20,184,166,0.1)',
        borderColor: isAdmin
          ? 'rgba(239,68,68,0.3)'
          : 'rgba(20,184,166,0.3)',
        color: isAdmin ? 'var(--red)' : 'var(--accent)',
      }}
    >
      {isPending
        ? '...'
        : isAdmin
        ? '↓ Make User'
        : '↑ Make Admin'}
    </button>
  )
}
