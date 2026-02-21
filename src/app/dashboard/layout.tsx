"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { storage } from "@/lib/storage"
import { DashboardNav } from "@/components/nav"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isReady, setIsReady] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const session = storage.getSession()
    if (!session) {
      router.push("/")
    } else {
      setIsReady(true)
    }
  }, [router])

  if (!isReady) return null

  return (
    <div className="flex bg-background min-h-screen">
      <DashboardNav />
      <main className="flex-1 overflow-auto p-8">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}