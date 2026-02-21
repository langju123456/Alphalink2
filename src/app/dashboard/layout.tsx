"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { DashboardNav } from "@/components/nav"
import { useUser } from "@/firebase"
import { Loader2 } from "lucide-react"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const { user, isUserLoading } = useUser()

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push("/")
    }
  }, [user, isUserLoading, router])

  if (isUserLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    )
  }

  if (!user) return null

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
