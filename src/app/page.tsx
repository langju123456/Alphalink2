"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { storage, ADMIN_BOOTSTRAP_CODE } from "@/lib/storage"
import { ShieldAlert, TrendingUp, Cpu, Lock } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function LandingPage() {
  const [code, setCode] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    if (storage.getSession()) {
      router.push("/dashboard/feed")
    }
  }, [router])

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Check admin bootstrap
    if (code === ADMIN_BOOTSTRAP_CODE) {
      storage.saveSession({
        role: "admin",
        accessCode: code,
        loggedInAt: Date.now()
      })
      router.push("/dashboard/feed")
      return
    }

    // Check member invites
    const invites = storage.getInvites()
    const validInvite = invites.find(inv => inv.code === code && inv.status === "active")

    if (validInvite) {
      storage.saveSession({
        role: "member",
        accessCode: code,
        loggedInAt: Date.now()
      })
      router.push("/dashboard/feed")
    } else {
      toast({
        title: "Access Denied",
        description: "Invalid or disabled access code. Please contact an admin.",
        variant: "destructive"
      })
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-background">
      <div className="max-w-md w-full space-y-8 text-center">
        <div className="space-y-2">
          <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-full mb-4">
            <TrendingUp className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-4xl font-headline font-bold tracking-tight text-white">AlphaLink v2</h1>
          <p className="text-muted-foreground">Private Research Community</p>
        </div>

        <div className="grid grid-cols-1 gap-4 text-left py-8">
          <div className="flex gap-4 p-4 terminal-card bg-secondary/20">
            <Cpu className="w-5 h-5 text-primary shrink-0" />
            <div>
              <p className="font-semibold text-sm">AlphaBot Integration</p>
              <p className="text-xs text-muted-foreground">AI-powered summaries and real-time market assistance.</p>
            </div>
          </div>
          <div className="flex gap-4 p-4 terminal-card bg-secondary/20">
            <ShieldAlert className="w-5 h-5 text-emerald-400 shrink-0" />
            <div>
              <p className="font-semibold text-sm">Institutional Grade</p>
              <p className="text-xs text-muted-foreground">Professional trade ideas across stocks and options.</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="relative">
            <Lock className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
            <Input
              type="password"
              placeholder="Enter Access Code"
              className="pl-10 h-12 bg-secondary border-border focus:ring-primary"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
            />
          </div>
          <Button 
            type="submit" 
            className="w-full h-12 font-bold uppercase tracking-wider bg-primary hover:bg-primary/90"
            disabled={isLoading}
          >
            {isLoading ? "Validating..." : "Enter Terminal"}
          </Button>
        </form>

        <p className="text-[10px] text-muted-foreground uppercase tracking-widest pt-8">
          For educational purposes only • AlphaLink Systems Inc
        </p>
      </div>
    </div>
  )
}