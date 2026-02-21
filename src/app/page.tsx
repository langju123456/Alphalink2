
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
  ShieldCheck,
  Languages
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useFirebase, useUser } from "@/firebase"
import { signInAnonymously, signOut } from "firebase/auth"
import { collection, query, where, getDocs, doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore"
import { Role } from "@/lib/types"
import { useLanguage } from "@/components/language-provider"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const ADMIN_BOOTSTRAP_CODE = 'ALPHALINK_ADMIN_888';

export default function LandingPage() {
  const { language, setLanguage, t } = useLanguage()
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
        
        const userDocRef = doc(firestore, "users", userId)
        const userDoc = await getDoc(userDocRef)

        if (role === 'admin') {
          if (!userDoc.exists() || !userDoc.data().displayName) {
            await setDoc(userDocRef, {
              uid: userId,
              role: 'admin',
              displayName: 'System Administrator',
              contactType: 'email',
              contactInfo: 'admin@alphalink.terminal',
              accessCode: finalCode,
              updatedAt: serverTimestamp(),
              createdAt: serverTimestamp()
            }, { merge: true })
          }
          
          toast({ title: t.landing.toastAdminAccess, description: t.landing.toastInitializing })
          router.push("/dashboard/feed")
        } else if (userDoc.exists() && userDoc.data().displayName) {
          toast({ title: t.landing.toastAccessGranted, description: t.landing.toastWelcomeBack })
          router.push("/dashboard/feed")
        } else {
          setStep('profile')
          toast({ title: t.landing.toastCodeVerified, description: t.landing.toastCompleteProfile })
        }
      } else {
        await signOut(auth)
        toast({ title: t.landing.toastDenied, description: t.landing.toastInvalidCode, variant: "destructive" })
      }
    } catch (err: any) {
      console.error("Login Error:", err)
      toast({ title: t.landing.toastConnError, description: "Could not verify credentials.", variant: "destructive" })
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

      toast({ title: t.landing.toastRegComplete, description: "Your profile has been created." })
      router.push("/dashboard/feed")
    } catch (err) {
      toast({ title: t.landing.toastRegError, description: "Could not finalize your profile.", variant: "destructive" })
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
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-background relative">
      {/* Language Toggle in Top Right */}
      <div className="absolute top-6 right-6">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setLanguage(language === 'en' ? 'zh' : 'en')}
          className="border-border/60 hover:bg-secondary/50 font-bold gap-2"
        >
          <Languages className="w-4 h-4" />
          {language === 'en' ? '中文' : 'English'}
        </Button>
      </div>

      <div className="max-w-md w-full space-y-8 text-center">
        <div className="space-y-2">
          <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-full mb-4">
            <TrendingUp className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-4xl font-headline font-bold tracking-tight text-white">{t.landing.title}</h1>
          <p className="text-muted-foreground uppercase text-[10px] tracking-[0.2em] font-bold">{t.landing.subtitle}</p>
        </div>

        {step === 'login' ? (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex gap-4 p-4 terminal-card bg-secondary/20">
              <Cpu className="w-5 h-5 text-primary shrink-0" />
              <div className="text-left">
                <p className="font-semibold text-sm">{t.landing.securityTitle}</p>
                <p className="text-xs text-muted-foreground">{t.landing.securityDesc}</p>
              </div>
            </div>

            <form onSubmit={handleVerifyCode} className="space-y-4">
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <input
                  type="password"
                  placeholder={t.landing.placeholderCode}
                  className="w-full pl-10 h-12 bg-secondary border border-border rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary uppercase font-code tracking-widest placeholder:text-muted-foreground/50"
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
                {isLoading ? t.landing.btnValidating : t.landing.btnInitialize}
              </Button>
            </form>
          </div>
        ) : (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="p-6 terminal-card bg-secondary/10 border-primary/20">
              <div className="flex items-center gap-3 mb-6">
                <ShieldCheck className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-bold text-white text-left">{t.landing.regTitle}</h2>
              </div>

              <form onSubmit={handleCompleteProfile} className="space-y-5 text-left">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">{t.landing.labelFullName}</label>
                  <div className="relative">
                    <UserCircle className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder={t.landing.placeholderName}
                      className="pl-10 bg-secondary"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">{t.landing.labelContactMethod}</label>
                  <Select value={contactType} onValueChange={(v: any) => setContactType(v)}>
                    <SelectTrigger className="bg-secondary">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="email">{t.landing.optionEmail}</SelectItem>
                      <SelectItem value="other">{t.landing.optionOther}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">
                    {contactType === 'email' ? t.landing.labelEmail : t.landing.labelHandle}
                  </label>
                  <div className="relative">
                    {contactType === 'email' ? (
                      <Mail className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                    ) : (
                      <MessageSquare className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                    )}
                    <Input
                      placeholder={contactType === 'email' ? t.landing.placeholderEmail : t.landing.placeholderHandle}
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
                  {t.landing.btnRegister}
                </Button>
              </form>
            </div>
          </div>
        )}

        <p className="text-[10px] text-muted-foreground uppercase tracking-widest pt-12">
          {t.landing.footer}
        </p>
      </div>
    </div>
  )
}
