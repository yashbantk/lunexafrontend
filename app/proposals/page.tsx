'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function ProposalsPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to the new my-proposals page
    router.replace('/my-proposals')
  }, [router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting to My Proposals...</p>
      </div>
    </div>
  )
}