"use client"

import { useState } from "react"
import { useFirebase, useCollection, useMemoFirebase } from "@/firebase"
import { collection, doc, setDoc, serverTimestamp, updateDoc } from "firebase/firestore"
import { Button } from "@/components/ui/button"
import { Plus, Copy, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { format } from "date-fns"

export default function InvitesPage() {
  const [isGenerating, setIsGenerating] = useState(false)
  const [newCode, setNewCode] = useState<string | null>(null)
  const { toast } = useToast()
  const { firestore } = useFirebase()

  const invitesQuery = useMemoFirebase(() => collection(firestore, "invites"), [firestore])
  const { data: invites, isLoading } = useCollection(invitesQuery)

  const generateInvite = async () => {
    setIsGenerating(true)
    const code = Math.random().toString(36).substring(2, 10).toUpperCase()
    const inviteId = crypto.randomUUID()
    
    try {
      await setDoc(doc(firestore, "invites", inviteId), {
        id: inviteId,
        code: code,
        role: "member",
        status: "active",
        createdAt: serverTimestamp(),
        usedCount: 0
      })
      
      setNewCode(code)
      toast({
        title: "Invite Generated",
        description: "Ensure you copy the code now."
      })
    } catch (err: any) {
      console.error(err)
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
      console.error(err)
      toast({ title: "Error updating invite", variant: "destructive" })
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({ title: "Copied to Clipboard" })
  }

  return (
    <div className="space-y-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-headline font-bold text-white">Access Management</h1>
          <p className="text-muted-foreground text-sm">Generate and manage invitation codes for private members.</p>
        </div>
        <Button onClick={generateInvite} disabled={isGenerating} className="bg-primary hover:bg-primary/90 font-bold gap-2">
          {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
          Generate New Invite
        </Button>
      </header>

      {newCode && (
        <div className="p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase font-bold text-emerald-400 tracking-widest mb-1">Newly Generated Access Code</p>
            <p className="text-3xl font-code font-bold text-white tracking-tighter">{newCode}</p>
          </div>
          <Button onClick={() => copyToClipboard(newCode)} variant="outline" className="border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20">
            <Copy className="w-4 h-4 mr-2" />
            Copy Code
          </Button>
        </div>
      )}

      <div className="terminal-card">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-secondary/50 border-b border-border">
                <th className="p-4 uppercase text-[10px] text-muted-foreground font-bold tracking-widest">Code</th>
                <th className="p-4 uppercase text-[10px] text-muted-foreground font-bold tracking-widest">Status</th>
                <th className="p-4 uppercase text-[10px] text-muted-foreground font-bold tracking-widest">Created</th>
                <th className="p-4 uppercase text-[10px] text-muted-foreground font-bold tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="p-10 text-center text-muted-foreground">Loading terminal data...</td>
                </tr>
              ) : invites && invites.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-10 text-center text-muted-foreground">No invites generated yet.</td>
                </tr>
              ) : invites?.map((inv: any) => (
                <tr key={inv.id} className="border-b border-border/50 hover:bg-secondary/20 transition-colors">
                  <td className="p-4 font-code">
                    <span className="text-white font-bold">{inv.code}</span>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                      inv.status === "active" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                    }`}>
                      {inv.status}
                    </span>
                  </td>
                  <td className="p-4 text-xs text-muted-foreground">
                    {inv.createdAt?.toDate ? format(inv.createdAt.toDate(), "MMM d, HH:mm") : "Pending..."}
                  </td>
                  <td className="p-4">
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={() => toggleInvite(inv.id, inv.status)}
                      className={`text-xs font-bold uppercase ${inv.status === "active" ? "hover:text-rose-400 hover:bg-rose-500/10" : "hover:text-emerald-400 hover:bg-emerald-500/10"}`}
                    >
                      {inv.status === "active" ? "Disable" : "Enable"}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
