"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ShieldAlert, TrendingUp, Cpu, Lock, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useFirebase, useUser } from "@/firebase"
import { signInAnonymously, signOut } from "firebase/auth"
import { collection, query, where, getDocs, doc, setDoc, serverTimestamp } from "firebase/firestore"

// The secure master code for administrator access
const ADMIN_BOOTSTRAP_CODE = 'ALPHALINK_ADMIN_888';

export default function LandingPage() {
  const [code, setCode] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const { auth, firestore } = useFirebase()
  const { user, isUserLoading } = useUser()

  useEffect(() => {
    // If the user already has a role defined in Firestore, they can go to the dashboard
    // We don't redirect purely on auth existence because anonymous users might not have a profile yet
  }, [user, isUserLoading, router])

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (isLoading) return
    setIsLoading(true)

    const finalCode = code.trim().toUpperCase()

    try {
      // Step 1: Sign in anonymously first to have a valid session for Firestore rules
      const userCredential = await signInAnonymously(auth)
      const userId = userCredential.user.uid

      let role: 'admin' | 'member' | null = null

      // Step 2: Validate the code
      if (finalCode === ADMIN_BOOTSTRAP_CODE) {
        role = 'admin'
      } else {
        // Check Firestore for valid active invite code
        const invitesRef = collection(firestore, "invites")
        const q = query(invitesRef, where("code", "==", finalCode), where("status", "==", "active"))
        const querySnapshot = await getDocs(q)
        
        if (!querySnapshot.empty) {
          role = 'member'
        }
      }

      // Step 3: If code is valid, finalize the user profile
      if (role) {
        await setDoc(doc(firestore, "users", userId), {
          uid: userId,
          role: role,
          accessCode: finalCode,
          updatedAt: serverTimestamp(),
          createdAt: serverTimestamp()
        }, { merge: true })

        toast({
          title: "Access Granted",
          description: `Welcome to the AlphaLink terminal. Authenticated as ${role}.`,
        })
        
        // Wait a tiny bit for the session to stabilize before redirecting
        setTimeout(() => {
          router.push("/dashboard/feed")
        }, 500)
      } else {
        // Step 4: If invalid, sign out and show error
        await signOut(auth)
        toast({
          title: "Access Denied",
          description: "Invalid or disabled access code. Please contact an admin.",
          variant: "destructive"
        })
      }
    } catch (err: any) {
      console.error("Login Error:", err)
      // Attempt cleanup if error occurred during process
      if (auth.currentUser) await signOut(auth)
      
      toast({
        title: "Connection Error",
        description: "Could not verify credentials. Ensure you have a stable network connection.",
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