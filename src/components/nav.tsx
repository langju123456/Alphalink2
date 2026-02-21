"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { 
  TrendingUp, 
  LayoutGrid, 
  MessageSquare, 
  Users, 
  LogOut,
  Award
} from "lucide-react"
import { storage } from "@/lib/storage"
import { Button } from "./ui/button"

export function DashboardNav() {
  const pathname = usePathname()
  const router = useRouter()
  const session = storage.getSession()
  const isAdmin = session?.role === "admin"

  const links = [
    { href: "/dashboard/feed", icon: LayoutGrid, label: "Market Feed" },
    { href: "/dashboard/highlights", icon: Award, label: "Performance" },
    { href: "/dashboard/assistant", icon: MessageSquare, label: "AlphaBot AI" },
  ]

  if (isAdmin) {
    links.push({ href: "/dashboard/admin/invites", icon: Users, label: "Invites" })
  }

  const handleLogout = () => {
    storage.clearSession()
    router.push("/")
  }

  return (
    <div className="w-64 border-r border-border bg-card flex flex-col h-screen sticky top-0">
      <div className="p-6">
        <Link href="/dashboard/feed" className="flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-primary" />
          <span className="font-headline font-bold text-xl tracking-tight text-white">AlphaLink</span>
        </Link>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        {links.map((link) => {
          const Icon = link.icon
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-md transition-colors font-medium text-sm",
                pathname === link.href 
                  ? "bg-primary/10 text-primary border-r-2 border-primary" 
                  : "text-muted-foreground hover:bg-secondary/50 hover:text-white"
              )}
            >
              <Icon className="w-4 h-4" />
              {link.label}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-border mt-auto">
        <div className="px-4 py-3 mb-4 rounded-md bg-secondary/30">
          <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest mb-1">Session Role</p>
          <p className="text-sm font-semibold capitalize text-primary">{session?.role || "Guest"}</p>
        </div>
        <Button 
          variant="ghost" 
          onClick={handleLogout}
          className="w-full flex items-center justify-start gap-3 px-4 py-3 text-muted-foreground hover:text-rose-400 hover:bg-rose-500/10"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </Button>
      </div>
    </div>
  )
}