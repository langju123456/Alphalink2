
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useFirebase, useCollection, useMemoFirebase, useUser, useDoc } from "@/firebase"
import { collection, doc, setDoc, serverTimestamp, updateDoc, deleteDoc } from "firebase/firestore"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Copy, Loader2, ShieldCheck, Trash2, Edit2, Check, User as UserIcon, Tag } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
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
  const [recipient, setRecipient] = useState("")
  const [mounted, setMounted] = useState(false)

  const [editingInvite, setEditingInvite] = useState<any>(null)
  const [editLabelValue, setEditLabelValue] = useState("")
  const [editRecipientValue, setEditRecipientValue] = useState("")
  const [isUpdating, setIsUpdating] = useState(false)

  const userDocRef = useMemoFirebase(() => {
    if (!user || !firestore) return null
    return doc(firestore, "users", user.uid)
  }, [user, firestore])
  
  const { data: userProfile, isLoading: isRoleLoading } = useDoc(userDocRef)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!isRoleLoading && userProfile && userProfile.role !== "admin") {
      router.push("/dashboard/feed")
    }
  }, [userProfile, isRoleLoading, router])

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
        recipient: recipient.trim() || "Unknown",
        role: "member",
        status: "active",
        createdAt: serverTimestamp(),
        usedCount: 0
      })
      
      setNewCode(code)
      setInviteLabel("")
      setRecipient("")
      toast({
        title: "Invite Generated",
        description: `Code: ${code} for ${recipient || "Unknown"}`
      })
    } catch (err: any) {
      toast({
        title: "Error",
        description: "Could not generate code.",
        variant: "destructive"
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const deleteInvite = async (id: string) => {
    if (!confirm(t.invites.confirmDelete)) return
    try {
      // Direct deletion from firestore
      await deleteDoc(doc(firestore, "invites", id))
      toast({ title: t.common.success, description: "Invitation code purged." })
    } catch (err: any) {
      console.error(err)
      toast({ title: "Error deleting", variant: "destructive" })
    }
  }

  const toggleInvite = async (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === "active" ? "disabled" : "active"
    try {
      await updateDoc(doc(firestore, "invites", id), { status: nextStatus })
    } catch (err: any) {
      toast({ title: "Error", variant: "destructive" })
    }
  }

  const openEditDialog = (inv: any) => {
    setEditingInvite(inv)
    setEditLabelValue(inv.label || "")
    setEditRecipientValue(inv.recipient || "")
  }

  const saveEdit = async () => {
    if (!editingInvite || !firestore) return
    setIsUpdating(true)
    try {
      await updateDoc(doc(firestore, "invites", editingInvite.id), {
        label: editLabelValue.trim() || "General",
        recipient: editRecipientValue.trim() || "Unknown"
      })
      setEditingInvite(null)
      toast({ title: t.common.success })
    } catch (err: any) {
      toast({ title: "Error updating", variant: "destructive" })
    } finally {
      setIsUpdating(false)
    }
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
          <div className="relative w-full sm:w-48">
             <UserIcon className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
             <Input 
              placeholder={t.invites.recipientPlaceholder}
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              className="h-11 bg-card border-border pl-10"
            />
          </div>
          <div className="relative w-full sm:w-48">
             <Tag className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
             <Input 
              placeholder={t.invites.labelPlaceholder}
              value={inviteLabel}
              onChange={(e) => setInviteLabel(e.target.value)}
              className="h-11 bg-card border-border pl-10"
            />
          </div>
          <Button onClick={generateInvite} disabled={isGenerating} className="bg-primary font-bold h-11">
            {isGenerating ? <Loader2 className="animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
            {t.invites.generateBtn}
          </Button>
        </div>
      </header>

      {newCode && (
        <div className="p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-center justify-between animate-in fade-in slide-in-from-top-4">
          <div>
            <p className="text-[10px] uppercase font-bold text-emerald-400 tracking-widest mb-1">
              {t.invites.newlyGenerated}
            </p>
            <p className="text-4xl font-code font-bold text-emerald-400 tracking-tighter">{newCode}</p>
          </div>
          <Button onClick={() => navigator.clipboard.writeText(newCode)} variant="outline" className="border-emerald-500/40 text-emerald-400">
            <Copy className="w-4 h-4 mr-2" />
            {t.invites.copyBtn}
          </Button>
        </div>
      )}

      <div className="terminal-card bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-secondary/50 border-b border-border">
                <th className="p-4 uppercase text-[10px] text-muted-foreground font-bold tracking-widest">{t.invites.tableCode}</th>
                <th className="p-4 uppercase text-[10px] text-muted-foreground font-bold tracking-widest">{t.invites.tableRecipient}</th>
                <th className="p-4 uppercase text-[10px] text-muted-foreground font-bold tracking-widest">{t.invites.tableLabel}</th>
                <th className="p-4 uppercase text-[10px] text-muted-foreground font-bold tracking-widest">{t.invites.tableStatus}</th>
                <th className="p-4 uppercase text-[10px] text-muted-foreground font-bold tracking-widest text-right">{t.invites.tableActions}</th>
              </tr>
            </thead>
            <tbody>
              {isInvitesLoading ? (
                <tr><td colSpan={5} className="p-10 text-center italic">Loading terminal data...</td></tr>
              ) : invites?.length === 0 ? (
                <tr><td colSpan={5} className="p-10 text-center text-muted-foreground">No active invitations found.</td></tr>
              ) : invites?.map((inv: any) => (
                <tr key={inv.id} className="border-b border-border/50 hover:bg-secondary/20 transition-colors group">
                  <td className="p-4 font-code font-bold text-foreground">{inv.code}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <UserIcon className="w-3 h-3 text-muted-foreground" />
                      <span className="text-xs font-semibold">{inv.recipient || "Unknown"}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <Tag className="w-3 h-3 text-muted-foreground" />
                      <span className="text-xs">{inv.label}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${inv.status === "active" ? "text-emerald-400 bg-emerald-400/10" : "text-rose-400 bg-rose-400/10"}`}>
                      {inv.status === "active" ? t.invites.active : t.invites.disabled}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button size="sm" variant="ghost" onClick={() => openEditDialog(inv)} className="text-muted-foreground hover:text-primary">
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => toggleInvite(inv.id, inv.status)} className="text-[10px] uppercase">
                        {inv.status === "active" ? t.invites.disableAction : t.invites.enableAction}
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => deleteInvite(inv.id)} className="text-rose-500 hover:bg-rose-500/10">
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

      <Dialog open={!!editingInvite} onOpenChange={(open) => !open && setEditingInvite(null)}>
        <DialogContent className="bg-card">
          <DialogHeader><DialogTitle>{t.invites.editLabel}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">{t.invites.recipient}</label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input 
                  value={editRecipientValue} 
                  onChange={(e) => setEditRecipientValue(e.target.value)} 
                  placeholder={t.invites.recipientPlaceholder}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">{t.invites.label}</label>
              <div className="relative">
                <Tag className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input 
                  value={editLabelValue} 
                  onChange={(e) => setEditLabelValue(e.target.value)} 
                  placeholder={t.invites.labelPlaceholder}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setEditingInvite(null)}>{t.common.cancel}</Button>
            <Button onClick={saveEdit} disabled={isUpdating} className="bg-primary font-bold">
              {isUpdating ? <Loader2 className="animate-spin" /> : <Check className="w-4 h-4 mr-2" />}
              {t.invites.saveChanges}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
