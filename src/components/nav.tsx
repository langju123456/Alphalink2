
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
  Award,
  Moon,
  Sun,
  Languages,
  Crown,
  Star,
  User as UserIcon
} from "lucide-react"
import { useAuth, useUser, useDoc, useMemoFirebase } from "@/firebase"
import { doc, getFirestore } from "firebase/firestore"
import { Button } from "./ui/button"
import { useTheme } from "next-themes"
import { useLanguage } from "./language-provider"
import { Tier } from "@/lib/types"

export function DashboardNav() {
  const pathname = usePathname()
  const router = useRouter()
  const auth = useAuth()
  const { user } = useUser()
  const { theme, setTheme } = useTheme()
  const { language, setLanguage, t } = useLanguage()
  
  const firestore = getFirestore()
  
  const userDocRef = useMemoFirebase(() => {
    if (!user || !firestore) return null
    return doc(firestore, "users", user.uid)
  }, [user, firestore])
  
  const { data: userProfile } = useDoc(userDocRef)
  const isAdmin = userProfile?.role === "admin"
  const userTier: Tier = userProfile?.tier || 'standard'

  const links = [
    { href: "/dashboard/feed", icon: LayoutGrid, label: t.nav.marketFeed },
    { href: "/dashboard/highlights", icon: Award, label: t.nav.performance },
    { href: "/dashboard/assistant", icon: MessageSquare, label: t.nav.alphaBot },
  ]

  if (isAdmin) {
    links.push({ href: "/dashboard/admin/invites", icon: Users, label: t.nav.invites })
  }

  const handleLogout = async () => {
    await auth.signOut()
    router.push("/")
  }

  const getTierBadge = (tier: Tier) => {
    switch (tier) {
      case 'premium': return <div className="flex items-center gap-1.5 text-amber-400 bg-amber-400/10 px-2 py-1 rounded border border-amber-400/20"><Crown className="w-3 h-3" /><span className="text-[10px] font-bold uppercase">{t.tiers.premium}</span></div>
      case 'vip': return <div className="flex items-center gap-1.5 text-primary bg-primary/10 px-2 py-1 rounded border border-primary/20"><Star className="w-3 h-3" /><span className="text-[10px] font-bold uppercase">{t.tiers.vip}</span></div>
      default: return <div className="flex items-center gap-1.5 text-muted-foreground bg-secondary/30 px-2 py-1 rounded border border-border"><UserIcon className="w-3 h-3" /><span className="text-[10px] font-bold uppercase">{t.tiers.standard}</span></div>
    }
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

      <div className="p-4 border-t border-border mt-auto space-y-2">
        <div className="flex items-center justify-between px-4 py-1">
           <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">{t.nav.theme}</p>
           <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="p-1.5 rounded-md hover:bg-secondary/50 text-muted-foreground transition-colors">
             {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
           </button>
        </div>

        <div className="flex items-center justify-between px-4 py-1">
           <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">{t.nav.language}</p>
           <button onClick={() => setLanguage(language === 'en' ? 'zh' : 'en')} className="p-1.5 rounded-md hover:bg-secondary/50 text-muted-foreground transition-colors flex items-center gap-1">
             <Languages className="w-4 h-4" />
             <span className="text-[10px] font-bold">{language === 'en' ? 'EN' : '中'}</span>
           </button>
        </div>

        <div className="px-4 py-3 rounded-md bg-secondary/20 space-y-2">
          <div>
            <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest mb-1">{t.nav.sessionRole}</p>
            <p className="text-sm font-semibold capitalize text-foreground">
              {isAdmin ? t.nav.admin : t.nav.member}
            </p>
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest mb-1">{t.nav.tier}</p>
            {getTierBadge(userTier)}
          </div>
        </div>
        
        <Button variant="ghost" onClick={handleLogout} className="w-full flex items-center justify-start gap-3 text-muted-foreground hover:text-rose-400 hover:bg-rose-500/10">
          <LogOut className="w-4 h-4" />
          {t.nav.logout}
        </Button>
      </div>
    </div>
  )
}
