
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useFirebase, useCollection, useMemoFirebase, useUser, useDoc } from "@/firebase"
import { collection, doc, setDoc, serverTimestamp, updateDoc, deleteDoc, query, where, getDocs, writeBatch } from "firebase/firestore"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Copy, Loader2, ShieldCheck, Trash2, Edit2, Check, User as UserIcon, Tag, Mail, Info, UserX } from "lucide-react"
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
  const [isWiping, setIsWiping] = useState<string | null>(null)

  // Edit States
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
    if (!isRoleLoading && userProfile && userProfile.role !== "admin") {
      router.push("/dashboard/feed")
    }
  }, [userProfile, isRoleLoading, router])

  const invitesQuery = useMemoFirebase(() => {
    if (!firestore || !userProfile || userProfile.role !== "admin") return null;
    return collection(firestore, "invites");
  }, [firestore, userProfile]);

  const usersQuery = useMemoFirebase(() => {
    if (!firestore || !userProfile || userProfile.role !== "admin") return null;
    return collection(firestore, "users");
  }, [firestore, userProfile]);

  const { data: invites, isLoading: isInvitesLoading } = useCollection(invitesQuery)
  const { data: registeredUsers } = useCollection(usersQuery)

  if (isRoleLoading || (userProfile && userProfile.role !== "admin")) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    )
  }

  const generateInvite = async () => {
    if (isGenerating || !firestore) return
    setIsGenerating(true)
    
    const code = Math.random().toString(36).substring(2, 10).toUpperCase()
    const inviteId = crypto.randomUUID()
    const docRef = doc(firestore, "invites", inviteId)
    
    setDoc(docRef, {
      id: inviteId,
      code: code,
      label: inviteLabel.trim() || "General",
      recipient: recipient.trim() || "Unassigned",
      role: "member",
      status: "active",
      createdAt: serverTimestamp(),
      usedCount: 0
    }).then(() => {
      setNewCode(code)
      setInviteLabel("")
      setRecipient("")
      toast({ title: t.common.success, description: `Code: ${code}` })
    }).catch((err) => {
      toast({ title: "Error", description: "Could not generate code.", variant: "destructive" })
    }).finally(() => {
      setIsGenerating(false)
    })
  }

  const deleteInvite = async (id: string) => {
    if (!firestore) return;
    const docRef = doc(firestore, "invites", id);
    deleteDoc(docRef).then(() => {
      toast({ title: "Invite Deleted" });
    });
  }

  const wipeMemberData = async (memberUid: string, inviteCode: string) => {
    if (!firestore || isWiping) return;
    if (!confirm("CRITICAL ACTION: This will delete the user profile AND all their trade ideas. Continue?")) return;

    setIsWiping(memberUid);
    toast({ title: "Wiping Member Data...", description: "Removing user and all associated research notes." });

    try {
      const batch = writeBatch(firestore);
      
      // 1. Delete User Document
      batch.delete(doc(firestore, "users", memberUid));

      // 2. Find and delete all trade ideas by this user
      const ideasRef = collection(firestore, "tradeIdeas");
      const q = query(ideasRef, where("userId", "==", memberUid));
      const ideasSnap = await getDocs(q);
      
      ideasSnap.forEach((ideaDoc) => {
        batch.delete(doc(firestore, "tradeIdeas", ideaDoc.id));
      });

      await batch.commit();
      toast({ title: "Wipe Complete", description: `User ${memberUid} and ${ideasSnap.size} posts removed.` });
    } catch (err: any) {
      console.error("WIPE_FAILED", err);
      toast({ title: "Wipe Failed", description: err.message, variant: "destructive" });
    } finally {
      setIsWiping(null);
    }
  }

  const toggleInvite = async (id: string, currentStatus: string) => {
    if (!firestore) return
    const nextStatus = currentStatus === "active" ? "disabled" : "active"
    updateDoc(doc(firestore, "invites", id), { status: nextStatus })
  }

  const openEditDialog = (inv: any) => {
    setEditingInvite(inv)
    setEditLabelValue(inv.label || "")
    setEditRecipientValue(inv.recipient || "")
  }

  const saveEdit = async () => {
    if (!editingInvite || !firestore) return
    setIsUpdating(true)
    updateDoc(doc(firestore, "invites", editingInvite.id), {
      label: editLabelValue.trim() || "General",
      recipient: editRecipientValue.trim() || "Unassigned"
    }).then(() => {
      setEditingInvite(null)
      toast({ title: t.common.success })
    }).finally(() => {
      setIsUpdating(false)
    })
  }

  const getRegisteredInfo = (code: string) => {
    return registeredUsers?.find(u => u.accessCode === code && u.role !== 'admin');
  }

  return (
    <div className="space-y-10 pb-20">
      <header className="flex items-center gap-5">
        <div className="p-3.5 bg-primary/10 rounded-xl border border-primary/20">
          <ShieldCheck className="w-7 h-7 text-primary" />
        </div>
        <div className="space-y-1">
          <h1 className="text-[28px] font-semibold tracking-tight text-foreground leading-none">
            {t.invites.title}
          </h1>
          <p className="text-sm text-muted-foreground/80 font-medium">
            {t.invites.description}
          </p>
        </div>
      </header>

      <section className="terminal-card bg-card/50 backdrop-blur-sm p-6 border-border/60">
        <div className="flex flex-col md:flex-row items-end gap-5">
          <div className="flex-1 space-y-2.5 w-full">
            <label className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider ml-1">
              {t.invites.recipient}
            </label>
            <div className="relative">
               <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" />
               <Input 
                placeholder={t.invites.recipientPlaceholder}
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                className="h-12 bg-background/50 border-border/80 pl-10 focus:ring-primary/20"
              />
            </div>
          </div>

          <div className="flex-1 space-y-2.5 w-full">
            <label className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider ml-1">
              {t.invites.label}
            </label>
            <div className="relative">
               <Tag className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" />
               <Input 
                placeholder={t.invites.labelPlaceholder}
                value={inviteLabel}
                onChange={(e) => setInviteLabel(e.target.value)}
                className="h-12 bg-background/50 border-border/80 pl-10 focus:ring-primary/20"
              />
            </div>
          </div>

          <Button 
            onClick={generateInvite} 
            disabled={isGenerating} 
            className="h-12 px-8 bg-primary hover:bg-primary/90 text-white font-bold transition-all shadow-lg shadow-primary/20"
          >
            {isGenerating ? <Loader2 className="animate-spin" /> : <Plus className="w-5 h-5 mr-2" />}
            {t.invites.generateBtn}
          </Button>
        </div>
      </section>

      {newCode && (
        <div className="p-7 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-between animate-in fade-in slide-in-from-top-6 duration-500">
          <div className="space-y-1">
            <p className="text-[10px] uppercase font-black text-emerald-400 tracking-[0.2em] mb-1 opacity-80">
              {t.invites.newlyGenerated}
            </p>
            <p className="text-5xl font-code font-bold text-emerald-400 tracking-tighter">
              {newCode}
            </p>
          </div>
          <Button 
            onClick={() => {
              navigator.clipboard.writeText(newCode);
              toast({ title: "Copied", description: "Access code copied to clipboard." });
            }} 
            variant="outline" 
            className="h-12 px-6 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 font-bold"
          >
            <Copy className="w-4 h-4 mr-2" />
            {t.invites.copyBtn}
          </Button>
        </div>
      )}

      <div className="terminal-card bg-card overflow-hidden border-border/60">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-separate border-spacing-0">
            <thead>
              <tr className="bg-secondary/30">
                <th className="p-5 border-b border-border/60 uppercase text-[10px] text-muted-foreground font-black tracking-[0.15em]">{t.invites.tableCode}</th>
                <th className="p-5 border-b border-border/60 uppercase text-[10px] text-muted-foreground font-black tracking-[0.15em]">{t.invites.tableRecipient}</th>
                <th className="p-5 border-b border-border/60 uppercase text-[10px] text-muted-foreground font-black tracking-[0.15em]">Member Data</th>
                <th className="p-5 border-b border-border/60 uppercase text-[10px] text-muted-foreground font-black tracking-[0.15em]">{t.invites.tableStatus}</th>
                <th className="p-5 border-b border-border/60 uppercase text-[10px] text-muted-foreground font-black tracking-[0.15em] text-right">{t.invites.tableActions}</th>
              </tr>
            </thead>
            <tbody>
              {isInvitesLoading ? (
                <tr><td colSpan={5} className="p-20 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-primary/40" /></td></tr>
              ) : invites?.length === 0 ? (
                <tr><td colSpan={5} className="p-20 text-center text-muted-foreground font-medium italic">No active invitations found.</td></tr>
              ) : invites?.map((inv: any) => {
                const reg = getRegisteredInfo(inv.code);
                return (
                  <tr key={inv.id} className="group hover:bg-secondary/20 transition-all border-b border-border/40">
                    <td className="p-5">
                      <div className="flex flex-col gap-1">
                        <span className="font-code font-bold text-foreground text-lg tracking-tight">{inv.code}</span>
                        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground/60 font-bold uppercase">
                          <Tag className="w-3 h-3" /> {inv.label}
                        </div>
                      </div>
                    </td>
                    <td className="p-5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center border border-border/50">
                          <UserIcon className="w-4 h-4 text-muted-foreground" />
                        </div>
                        <span className="text-sm font-semibold text-foreground/90">{inv.recipient || "Unassigned"}</span>
                      </div>
                    </td>
                    <td className="p-5">
                      {reg ? (
                        <div className="flex items-center justify-between gap-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-emerald-400 font-bold">
                              <Check className="w-3.5 h-3.5" />
                              <span>{reg.displayName}</span>
                            </div>
                            <div className="flex items-center gap-2 text-[11px] text-muted-foreground/70">
                              <Mail className="w-3 h-3" />
                              <span className="font-medium">{reg.contactInfo}</span>
                            </div>
                          </div>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => wipeMemberData(reg.uid, inv.code)}
                            disabled={isWiping === reg.uid}
                            className="h-8 text-[10px] font-bold uppercase border-rose-500/30 text-rose-500 hover:bg-rose-500/10"
                          >
                            {isWiping === reg.uid ? <Loader2 className="w-3 h-3 animate-spin" /> : <UserX className="w-3 h-3 mr-1" />}
                            Wipe All Data
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-muted-foreground/30 italic text-xs font-medium">
                          <Info className="w-3.5 h-3.5 opacity-50" />
                          <span>Awaiting activation</span>
                        </div>
                      )}
                    </td>
                    <td className="p-5">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${inv.status === "active" ? "text-emerald-400 bg-emerald-400/10 border border-emerald-400/20" : "text-rose-400 bg-rose-400/10 border border-rose-400/20"}`}>
                        {inv.status === "active" ? t.invites.active : t.invites.disabled}
                      </span>
                    </td>
                    <td className="p-5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button size="icon" variant="ghost" onClick={() => openEditDialog(inv)} className="h-9 w-9 text-muted-foreground/60 hover:text-primary hover:bg-primary/10">
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => toggleInvite(inv.id, inv.status)} className="h-9 text-[10px] font-black uppercase tracking-widest px-3 hover:bg-secondary">
                          {inv.status === "active" ? t.invites.disableAction : t.invites.enableAction}
                        </Button>
                        <Button size="icon" variant="ghost" onClick={() => deleteInvite(inv.id)} className="h-9 w-9 text-rose-500/60 hover:text-rose-500 hover:bg-rose-500/10 cursor-pointer">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={!!editingInvite} onOpenChange={(open) => !open && setEditingInvite(null)}>
        <DialogContent className="max-w-md terminal-card bg-card border-border/80">
          <DialogHeader>
            <DialogTitle className="text-xl font-headline font-bold text-foreground">
              {t.invites.editLabel}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-5 py-6">
            <div className="space-y-2">
              <label className="text-[11px] uppercase font-bold text-muted-foreground tracking-widest ml-1">{t.invites.recipient}</label>
              <div className="relative">
                <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" />
                <Input 
                  value={editRecipientValue} 
                  onChange={(e) => setEditRecipientValue(e.target.value)} 
                  placeholder={t.invites.recipientPlaceholder}
                  className="h-11 pl-10 bg-secondary/20"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[11px] uppercase font-bold text-muted-foreground tracking-widest ml-1">{t.invites.label}</label>
              <div className="relative">
                <Tag className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" />
                <Input 
                  value={editLabelValue} 
                  onChange={(e) => setEditLabelValue(e.target.value)} 
                  placeholder={t.invites.labelPlaceholder}
                  className="h-11 pl-10 bg-secondary/20"
                />
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="ghost" onClick={() => setEditingInvite(null)} className="font-bold">{t.common.cancel}</Button>
            <Button onClick={saveEdit} disabled={isUpdating} className="bg-primary font-bold px-6">
              {isUpdating ? <Loader2 className="animate-spin" /> : <Check className="w-4 h-4 mr-2" />}
              {t.invites.saveChanges}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
