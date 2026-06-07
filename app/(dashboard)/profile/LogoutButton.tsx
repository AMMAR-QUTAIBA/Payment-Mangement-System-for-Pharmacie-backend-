'use client'
import { logout } from '@/server/auth/action'
import { useRouter } from 'next/navigation'
import { useTransition } from 'react'

export default function LogoutButton() {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  return (
    <button className="btn-danger" disabled={isPending}
      onClick={() => startTransition(async () => {
        await logout()
        router.push('/login')
        router.refresh()
      })}>
      {isPending ? '⏳ Signing out...' : '🚪 Sign Out'}
    </button>
  )
}
