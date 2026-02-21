
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useFirebase, useCollection, useMemoFirebase, useUser, useDoc } from "@/firebase"
import { collection, doc, setDoc, serverTimestamp, updateDoc, deleteDoc } from "firebase/firestore"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Copy, Loader2, ShieldCheck, Tag, Trash2, Edit2, Check, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { format } from "date-fns"
import { useLanguage } from "@/components/language-provider"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"

export default function InvitesPage() {
  const router = useRouter()
  const { user } = useUser()
  const { firestore } = useFirebase()
  const { toast } = useToast()
  const { t } = useLanguage()
  
  const [isGenerating, setIsGenerating] = useState(false)
  const [newCode, setNewCode] = useState<string | null>(null)
  const [inviteLabel, setInviteLabel] = useState("")
  const [mounted, setMounted] = useState(false)

  // Edit State
  const [editingInvite, setEditingInvite] = useState<any>(null)
  const [editLabelValue, setEditLabelValue] = useState("")
  const [isUpdating, setIsUpdating] = useState(false)

  // Fetch current user's role from Firestore
  const userDocRef = useMemoFirebase(() => {
    if (!user || !firestore) return null
    return doc(firestore, "users", user.uid)
  }, [user, firestore])
  
  const { data: userProfile, isLoading: isRoleLoading } = useDoc(userDocRef)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Security Redirect: If user is not an admin, push back to feed
  useEffect(() => {
    if (!isRoleLoading && userProfile && userProfile.role !== "admin") {
      router.push("/dashboard/feed")
      toast({
        title: "Access Denied",
        description: "Admin terminal is restricted to authorized desk personnel.",
        variant: "destructive"
      })
    }
  }, [userProfile, isRoleLoading, router, toast])

  // Only fetch invites if we are sure the user is an admin
  const invitesQuery = useMemoFirebase(() => {
    if (!firestore || !userProfile || userProfile.role !== "admin") return null;
    return collection(firestore, "invites");
  }, [firestore, userProfile]);

  const { data: invites, isLoading: isInvitesLoading } = useCollection(invitesQuery)

  if (isRoleLoading || (userProfile && userProfile.role !== "admin")) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    )
  }

  const generateInvite = async () => {
    if (isGenerating) return
    setIsGenerating(true)
    
    const code = Math.random().toString(36).substring(2, 10).toUpperCase()
    const inviteId = crypto.randomUUID()
    
    try {
      await setDoc(doc(firestore, "invites", inviteId), {
        id: inviteId,
        code: code,
        label: inviteLabel.trim() || "General",
        role: "member",
        status: "active",
        createdAt: serverTimestamp(),
        usedCount: 0
      })
      
      setNewCode(code)
      setInviteLabel("")
      toast({
        title: "Invite Generated",
        description: `Code for "${inviteLabel || 'General'}" is ready.`
      })
    } catch (err: any) {
      toast({
        title: "Error",
        description: "Could not generate invitation code.",
        variant: "destructive"
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const toggleInvite = async (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === "active" ? "disabled" : "active"
    try {
      await updateDoc(doc(firestore, "invites", id), {
        status: nextStatus
      })
      toast({ title: `Invite ${nextStatus === "active" ? "Enabled" : "Disabled"}` })
    } catch (err: any) {
      toast({ title: "Error updating invite", variant: "destructive" })
    }
  }

  const deleteInvite = async (id: string) => {
    if (!confirm(t.invites.confirmDelete)) return
    try {
      await deleteDoc(doc(firestore, "invites", id))
      toast({ title: "Invite Deleted" })
    } catch (err: any) {
      toast({ title: "Error deleting invite", variant: "destructive" })
    }
  }

  const startEdit = (invite: any) => {
    setEditingInvite(invite)
    setEditLabelValue(invite.label || "General")
  }

  const saveEdit = async () => {
    if (!editingInvite || !firestore) return
    setIsUpdating(true)
    try {
      await updateDoc(doc(firestore, "invites", editingInvite.id), {
        label: editLabelValue.trim() || "General"
      })
      setEditingInvite(null)
      toast({ title: "Label Updated" })
    } catch (err: any) {
      toast({ title: "Error updating label", variant: "destructive" })
    } finally {
      setIsUpdating(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({ title: "Copied to Clipboard" })
  }

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary/10 rounded-full">
            <ShieldCheck className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-headline font-bold text-foreground">{t.invites.title}</h1>
            <p className="text-muted-foreground text-sm">{t.invites.description}</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch gap-3">
          <div className="relative">
            <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder={t.invites.labelPlaceholder}
              value={inviteLabel}
              onChange={(e) => setInviteLabel(e.target.value)}
              className="pl-10 h-11 bg-card border-border w-full sm:w-64"
            />
          </div>
          <Button onClick={generateInvite} disabled={isGenerating || isRoleLoading} className="bg-primary hover:bg-primary/90 font-bold gap-2 text-white h-11">
            {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            {t.invites.generateBtn}
          </Button>
        </div>
      </header>

      {newCode && (
        <div className="p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-center justify-between animate-in fade-in slide-in-from-top-4">
          <div>
            <p className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400 tracking-widest mb-1">{t.invites.newlyGenerated}</p>
            <p className="text-4xl font-code font-bold text-emerald-600 dark:text-emerald-400 tracking-tighter">{newCode}</p>
          </div>
          <Button onClick={() => copyToClipboard(newCode)} variant="outline" className="border-emerald-500/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 font-bold">
            <Copy className="w-4 h-4 mr-2" />
            {t.invites.copyBtn}
          </Button>
        </div>
      )}

      <div className="terminal-card bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-secondary/50 border-b border-border">
                <th className="p-4 uppercase text-[10px] text-muted-foreground font-bold tracking-widest">{t.invites.tableCode}</th>
                <th className="p-4 uppercase text-[10px] text-muted-foreground font-bold tracking-widest">{t.invites.tableLabel}</th>
                <th className="p-4 uppercase text-[10px] text-muted-foreground font-bold tracking-widest">{t.invites.tableStatus}</th>
                <th className="p-4 uppercase text-[10px] text-muted-foreground font-bold tracking-widest">{t.invites.tableCreated}</th>
                <th className="p-4 uppercase text-[10px] text-muted-foreground font-bold tracking-widest text-right">{t.invites.tableActions}</th>
              </tr>
            </thead>
            <tbody>
              {isInvitesLoading ? (
                <tr>
                  <td colSpan={5} className="p-10 text-center text-muted-foreground italic">Fetching encrypted terminal data...</td>
                </tr>
              ) : !invites || invites.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-10 text-center text-muted-foreground">No invites generated yet.</td>
                </tr>
              ) : invites?.map((inv: any) => (
                <tr key={inv.id} className="border-b border-border/50 hover:bg-secondary/20 transition-colors group">
                  <td className="p-4 font-code">
                    <span className="text-foreground font-bold text-base">{inv.code}</span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-primary bg-primary/5 px-2 py-1 rounded border border-primary/10">
                        {inv.label || "General"}
                      </span>
                      <button onClick={() => startEdit(inv)} className="text-muted-foreground hover:text-primary transition-colors">
                        <Edit2 className="w-3 h-3" />
                      </button>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                      inv.status === "active" ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20" : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20"
                    }`}>
                      {inv.status === "active" ? t.invites.active : t.invites.disabled}
                    </span>
                  </td>
                  <td className="p-4 text-xs text-muted-foreground font-code">
                    {mounted && inv.createdAt?.toDate 
                      ? format(inv.createdAt.toDate(), "yyyy-MM-dd HH:mm") 
                      : "..."}
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => toggleInvite(inv.id, inv.status)}
                        className={`text-[10px] font-bold uppercase tracking-tighter ${inv.status === "active" ? "hover:text-rose-500 hover:bg-rose-500/10" : "hover:text-emerald-500 hover:bg-emerald-500/10"}`}
                      >
                        {inv.status === "active" ? t.invites.disableAction : t.invites.enableAction}
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => deleteInvite(inv.id)}
                        className="text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 p-2"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editingInvite} onOpenChange={(open) => !open && setEditingInvite(null)}>
        <DialogContent className="terminal-card bg-card border-border">
          <DialogHeader>
            <DialogTitle className="font-headline">{t.invites.editLabel}</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">{t.invites.label}</label>
              <Input 
                value={editLabelValue} 
                onChange={(e) => setEditLabelValue(e.target.value)} 
                className="bg-secondary"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setEditingInvite(null)} className="font-bold">{t.common.cancel}</Button>
            <Button onClick={saveEdit} disabled={isUpdating} className="bg-primary font-bold">
              {isUpdating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Check className="w-4 h-4 mr-2" />}
              {t.invites.saveChanges}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
