
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  TrendingUp, 
  Cpu, 
  Lock, 
  Loader2, 
  UserCircle, 
  Mail, 
  MessageSquare,
  ArrowRight,
  ShieldCheck
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useFirebase, useUser } from "@/firebase"
import { signInAnonymously, signOut } from "firebase/auth"
import { collection, query, where, getDocs, doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore"
import { Role } from "@/lib/types"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const ADMIN_BOOTSTRAP_CODE = 'ALPHALINK_ADMIN_888';

export default function LandingPage() {
  const [step, setStep] = useState<'login' | 'profile'>('login')
  const [code, setCode] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  
  // Profile Form State
  const [displayName, setDisplayName] = useState("")
  const [contactType, setContactType] = useState<'email' | 'other'>('email')
  const [contactInfo, setContactInfo] = useState("")
  const [assignedRole, setAssignedRole] = useState<Role | null>(null)

  const router = useRouter()
  const { toast } = useToast()
  const { auth, firestore } = useFirebase()
  const { user, isUserLoading } = useUser()

  // Effect to redirect already logged in users with complete profiles
  useEffect(() => {
    async function checkExistingProfile() {
      if (!isUserLoading && user && firestore) {
        const userDoc = await getDoc(doc(firestore, "users", user.uid))
        if (userDoc.exists() && userDoc.data().displayName) {
          router.push("/dashboard/feed")
        }
      }
    }
    checkExistingProfile()
  }, [user, isUserLoading, firestore, router])

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isLoading) return
    setIsLoading(true)

    const finalCode = code.trim().toUpperCase()

    try {
      const userCredential = await signInAnonymously(auth)
      const userId = userCredential.user.uid

      let role: Role | null = null

      // 1. Verify Access Code
      if (finalCode === ADMIN_BOOTSTRAP_CODE) {
        role = 'admin'
      } else {
        const invitesRef = collection(firestore, "invites")
        const q = query(invitesRef, where("code", "==", finalCode), where("status", "==", "active"))
        const querySnapshot = await getDocs(q)
        
        if (!querySnapshot.empty) {
          const inviteData = querySnapshot.docs[0].data()
          role = inviteData.role || 'member'
        }
      }

      if (role) {
        setAssignedRole(role)
        
        // 2. Check if user already has a profile in Firestore
        const userDoc = await getDoc(doc(firestore, "users", userId))
        if (userDoc.exists() && userDoc.data().displayName) {
          // Profile exists, skip onboarding
          toast({
            title: "Session Resumed",
            description: `Welcome back, ${userDoc.data().displayName}.`,
          })
          router.push("/dashboard/feed")
        } else {
          // No profile, show onboarding step
          setStep('profile')
        }
      } else {
        await signOut(auth)
        toast({
          title: "Access Denied",
          description: "Invalid or disabled access code.",
          variant: "destructive"
        })
      }
    } catch (err: any) {
      console.error("Login Error:", err)
      toast({
        title: "Connection Error",
        description: "Could not verify credentials.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCompleteProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!auth.currentUser || !assignedRole || isLoading) return
    setIsLoading(true)

    try {
      const userId = auth.currentUser.uid
      await setDoc(doc(firestore, "users", userId), {
        uid: userId,
        role: assignedRole,
        displayName: displayName.trim(),
        contactType,
        contactInfo: contactInfo.trim(),
        accessCode: code.trim().toUpperCase(),
        updatedAt: serverTimestamp(),
        createdAt: serverTimestamp()
      }, { merge: true })

      toast({
        title: "Setup Complete",
        description: `Welcome to the AlphaLink Terminal.`,
      })
      
      router.push("/dashboard/feed")
    } catch (err) {
      toast({
        title: "Save Error",
        description: "Could not finalize your profile.",
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
          <p className="text-muted-foreground uppercase text-[10px] tracking-[0.2em] font-bold">Private Community Terminal</p>
        </div>

        {step === 'login' ? (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex gap-4 p-4 terminal-card bg-secondary/20">
              <Cpu className="w-5 h-5 text-primary shrink-0" />
              <div className="text-left">
                <p className="font-semibold text-sm">Terminal Security</p>
                <p className="text-xs text-muted-foreground">Encryption active. Input unique access key to initialize.</p>
              </div>
            </div>

            <form onSubmit={handleVerifyCode} className="space-y-4">
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input
                  type="password"
                  placeholder="Enter Terminal Access Code"
                  className="pl-10 h-12 bg-secondary border-border focus:ring-primary uppercase font-code tracking-widest"
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
                {isLoading ? "Validating..." : "Initialize Session"}
              </Button>
            </form>
          </div>
        ) : (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="p-6 terminal-card bg-secondary/10 border-primary/20">
              <div className="flex items-center gap-3 mb-6">
                <ShieldCheck className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-bold text-white text-left">Onboarding Profile</h2>
              </div>

              <form onSubmit={handleCompleteProfile} className="space-y-5 text-left">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Full Name</label>
                  <div className="relative">
                    <UserCircle className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="e.g. John Doe"
                      className="pl-10 bg-secondary"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Contact Method</label>
                  <Select value={contactType} onValueChange={(v: any) => setContactType(v)}>
                    <SelectTrigger className="bg-secondary">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="email">Official Email</SelectItem>
                      <SelectItem value="other">Social Handle / Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">
                    {contactType === 'email' ? 'Email Address' : 'Contact Handle'}
                  </label>
                  <div className="relative">
                    {contactType === 'email' ? (
                      <Mail className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                    ) : (
                      <MessageSquare className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                    )}
                    <Input
                      placeholder={contactType === 'email' ? "email@example.com" : "@username or Discord ID"}
                      className="pl-10 bg-secondary"
                      value={contactInfo}
                      onChange={(e) => setContactInfo(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-12 font-bold uppercase tracking-wider bg-primary"
                  disabled={isLoading}
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <ArrowRight className="w-4 h-4 mr-2" />}
                  Finalize Access
                </Button>
              </form>
            </div>
          </div>
        )}

        <p className="text-[10px] text-muted-foreground uppercase tracking-widest pt-12">
          Secured Alpha Connection • Layer 7 Encryption
        </p>
      </div>
    </div>
  )
}
