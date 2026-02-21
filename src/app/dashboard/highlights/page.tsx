"use client"

import { useState } from "react"
import { useFirebase, useCollection, useMemoFirebase, useUser, useDoc } from "@/firebase"
import { collection, query, orderBy, doc, setDoc, serverTimestamp, deleteDoc } from "firebase/firestore"
import { 
  Award, 
  Calendar, 
  Plus,
  Trash2,
  Loader2,
  TrendingUp
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { format } from "date-fns"

export default function HighlightsPage() {
  const { firestore } = useFirebase()
  const { user } = useUser()
  const { toast } = useToast()

  const userDocRef = useMemoFirebase(() => {
    if (!user || !firestore) return null
    return doc(firestore, "users", user.uid)
  }, [user, firestore])
  
  const { data: userProfile } = useDoc(userDocRef)
  const isAdmin = userProfile?.role === "admin"

  const highlightsQuery = useMemoFirebase(() => {
    if (!firestore) return null
    return query(collection(firestore, "highlights"), orderBy("createdAt", "desc"))
  }, [firestore])

  const { data: highlights, isLoading } = useCollection(highlightsQuery)

  // Form State
  const [title, setTitle] = useState("")
  const [ticker, setTicker] = useState("")
  const [returnPct, setReturnPct] = useState("")
  const [date, setDate] = useState("")
  const [desc, setDesc] = useState("")
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!firestore) return
    
    setIsSubmitting(true)
    const highlightId = crypto.randomUUID()
    
    try {
      await setDoc(doc(firestore, "highlights", highlightId), {
        id: highlightId,
        title,
        tickerOrUnderlying: ticker.toUpperCase(),
        returnPct: Number(returnPct),
        date,
        description: desc,
        createdAt: serverTimestamp()
      })
      
      setOpen(false)
      setTitle(""); setTicker(""); setReturnPct(""); setDate(""); setDesc("")
      toast({ title: "Highlight Published" })
    } catch (err: any) {
      console.error(err)
      toast({ title: "Error", description: "Failed to publish highlight.", variant: "destructive" })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!firestore) return
    try {
      await deleteDoc(doc(firestore, "highlights", id))
      toast({ title: "Highlight Removed" })
    } catch (err) {
      console.error(err)
      toast({ title: "Error", description: "Failed to remove highlight.", variant: "destructive" })
    }
  }

  return (
    <div className="space-y-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-headline font-bold text-white">Alpha Desk Performance</h1>
          <p className="text-muted-foreground text-sm">Verified trade results and community win highlights.</p>
        </div>
        {isAdmin && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90 font-bold gap-2">
                <Plus className="w-4 h-4" />
                Add Win Highlight
              </Button>
            </DialogTrigger>
            <DialogContent className="terminal-card bg-card border-border">
              <DialogHeader>
                <DialogTitle className="font-headline">Publish Performance Win</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAdd} className="space-y-4 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <Input placeholder="Ticker" value={ticker} onChange={e => setTicker(e.target.value)} className="bg-secondary" required />
                  <Input placeholder="Return % (e.g. 45)" type="number" value={returnPct} onChange={e => setReturnPct(e.target.value)} className="bg-secondary" required />
                </div>
                <Input placeholder="Title / Strategy" value={title} onChange={e => setTitle(e.target.value)} className="bg-secondary" required />
                <Input type="date" value={date} onChange={e => setDate(e.target.value)} className="bg-secondary" required />
                <Textarea placeholder="Description..." value={desc} onChange={e => setDesc(e.target.value)} className="bg-secondary" required />
                <DialogFooter>
                  <Button type="submit" disabled={isSubmitting} className="w-full bg-primary font-bold uppercase">
                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Publish to Wall of Fame"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="col-span-full py-20 flex justify-center">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : !highlights || highlights.length === 0 ? (
          <div className="col-span-full py-20 text-center terminal-card bg-secondary/10 flex flex-col items-center justify-center space-y-4">
            <TrendingUp className="w-12 h-12 text-muted-foreground opacity-20" />
            <p className="text-muted-foreground font-semibold">No performance highlights documented yet.</p>
          </div>
        ) : highlights.map((h: any) => (
          <div key={h.id} className="terminal-card bg-secondary/20 relative group">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 rounded bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <span className="font-headline font-bold text-primary">{h.tickerOrUnderlying}</span>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-headline font-bold text-emerald-400">+{h.returnPct}%</p>
                  <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Return</p>
                </div>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">{h.title}</h3>
              <p className="text-sm text-muted-foreground mb-6 line-clamp-3 leading-relaxed">{h.description}</p>
              <div className="flex items-center justify-between text-[10px] uppercase font-bold text-muted-foreground tracking-widest">
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {h.date}
                </div>
                <div className="flex items-center gap-1 text-primary">
                  <Award className="w-3 h-3" />
                  Desk Verified
                </div>
              </div>
            </div>
            {isAdmin && (
              <button 
                onClick={() => handleDelete(h.id)}
                className="absolute top-2 right-2 p-2 bg-rose-500/10 text-rose-500 rounded opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-500 hover:text-white"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
