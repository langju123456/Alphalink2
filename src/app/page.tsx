
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ShieldAlert, TrendingUp, Cpu, Lock, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useFirebase, useUser } from "@/firebase"
import { signInAnonymously } from "firebase/auth"
import { collection, query, where, getDocs, doc, setDoc, serverTimestamp } from "firebase/firestore"

// The new secure master code for administrator access
const ADMIN_BOOTSTRAP_CODE = 'ALPHALINK_ADMIN_888';

export default function LandingPage() {
  const [code, setCode] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const { auth, firestore } = useFirebase()
  const { user, isUserLoading } = useUser()

  useEffect(() => {
    if (user && !isUserLoading) {
      router.push("/dashboard/feed")
    }
  }, [user, isUserLoading, router])

  const handleLogin = async (e?: React.FormEvent, overrideCode?: string) => {
    if (e) e.preventDefault()
    setIsLoading(true)

    const finalCode = (overrideCode || code).trim().toUpperCase()

    try {
      let role: 'admin' | 'member' | null = null

      if (finalCode === ADMIN_BOOTSTRAP_CODE) {
        role = 'admin'
      } else {
        // Check Firestore for valid invite code
        const invitesRef = collection(firestore, "invites")
        const q = query(invitesRef, where("code", "==", finalCode), where("status", "==", "active"))
        const querySnapshot = await getDocs(q)
        
        if (!querySnapshot.empty) {
          role = 'member'
        }
      }

      if (role) {
        const userCredential = await signInAnonymously(auth)
        const userId = userCredential.user.uid
        
        // Create/Update user profile in Firestore
        await setDoc(doc(firestore, "users", userId), {
          uid: userId,
          role: role,
          accessCode: finalCode,
          updatedAt: serverTimestamp()
        }, { merge: true })

        toast({
          title: "Access Granted",
          description: `Welcome to the AlphaLink terminal as ${role}.`,
        })
        router.push("/dashboard/feed")
      } else {
        toast({
          title: "Access Denied",
          description: "Invalid or disabled access code. Please contact an admin.",
          variant: "destructive"
        })
      }
    } catch (err: any) {
      console.error(err)
      toast({
        title: "Connection Error",
        description: "Could not connect to the authentication server.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (isUserLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    )
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

        <div className="space-y-4">
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <Input
                type="password"
                placeholder="Enter Access Code"
                className="pl-10 h-12 bg-secondary border-border focus:ring-primary uppercase"
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
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              {isLoading ? "Validating..." : "Enter Terminal"}
            </Button>
          </form>
        </div>

        <p className="text-[10px] text-muted-foreground uppercase tracking-widest pt-12">
          For educational purposes only • AlphaLink Systems Inc
        </p>
      </div>
    </div>
  )
}
