
"use client"

import { TradeIdea } from "@/lib/types"
import { formatDistanceToNow } from "date-fns"
import { 
  BarChart2, 
  Info, 
  TrendingUp, 
  TrendingDown, 
  Calendar,
  AlertTriangle,
  Lightbulb,
  Heart,
  Trash2,
  Loader2
} from "lucide-react"
import { useState, useEffect } from "react"
import { Button } from "./ui/button"
import { useUser, useFirebase, useMemoFirebase, useDoc } from "@/firebase"
import { doc, updateDoc, increment, deleteDoc } from "firebase/firestore"
import { useToast } from "@/hooks/use-toast"
import { PostTradeIdea } from "./post-trade-idea"

export function TradeIdeaCard({ idea }: { idea: TradeIdea }) {
  const { user } = useUser()
  const { firestore } = useFirebase()
  const { toast } = useToast()
  
  const [likes, setLikes] = useState(idea.likeCount || 0)
  const [isDeleting, setIsDeleting] = useState(false)
  const [mounted, setMounted] = useState(false)
  
  const userDocRef = useMemoFirebase(() => {
    if (!user || !firestore) return null
    return doc(firestore, "users", user.uid)
  }, [user, firestore])
  
  const { data: userProfile } = useDoc(userDocRef)

  useEffect(() => {
    setMounted(true)
  }, [])

  const isStock = idea.instrumentType === "STOCK"
  const direction = isStock ? idea.direction : (idea.legs?.[0]?.type === "CALL" ? "LONG" : "SHORT")

  const getPostedAt = () => {
    if (!mounted || !idea.createdAt) return "..."
    const date = typeof idea.createdAt === 'number' 
      ? idea.createdAt 
      : (idea.createdAt as any).toDate?.() || new Date()
    return `${formatDistanceToNow(date)} ago`
  }

  const isOwner = user?.uid === idea.userId
  const isAdmin = userProfile?.role === "admin"
  const canManage = isOwner || isAdmin

  const handleDelete = async () => {
    if (!firestore || !canManage) return;
    
    setIsDeleting(true);
    toast({ title: "Removing note...", description: "Terminal request initiated." });

    const docRef = doc(firestore, "tradeIdeas", idea.id);
    
    try {
      await deleteDoc(docRef);
      toast({ title: "Deleted", description: "Research note removed successfully." });
    } catch (err: any) {
      console.error("DELETE_ERROR", err);
      toast({ 
        title: "Delete Failed", 
        description: `Error: ${err.code || "Permission Denied"}`, 
        variant: "destructive" 
      });
    } finally {
      setIsDeleting(false);
    }
  }

  const handleLike = async () => {
    if (!firestore) return
    setLikes(prev => prev + 1)
    updateDoc(doc(firestore, "tradeIdeas", idea.id), {
      likeCount: increment(1)
    }).catch(err => console.error("Like failed:", err))
  }

  return (
    <div className="terminal-card mb-6 group relative">
      <div className="p-6">
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-secondary flex items-center justify-center rounded-lg border border-border">
              <span className="text-xl font-headline font-bold text-white">
                {isStock ? idea.ticker : idea.underlying}
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className={direction === "LONG" ? "badge-long" : "badge-short"}>
                  {direction === "LONG" ? <TrendingUp className="w-3 h-3 inline mr-1" /> : <TrendingDown className="w-3 h-3 inline mr-1" />}
                  {direction}
                </span>
                <span className="text-xs font-bold text-muted-foreground uppercase bg-secondary/50 px-2 py-0.5 rounded border border-border">
                  {idea.instrumentType}
                </span>
                {isStock && (
                  <span className="text-xs font-bold text-primary uppercase bg-primary/10 px-2 py-0.5 rounded border border-primary/20">
                    {idea.timeframe}
                  </span>
                )}
              </div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
                Posted {getPostedAt()} by {idea.createdBy || "Inactive Member"}
              </p>
            </div>
          </div>
          
          <div className="text-right">
            <p className="text-sm font-bold text-white uppercase tracking-tight">{isStock ? idea.action : idea.strategyType?.replace("_", " ")}</p>
            <p className="text-[10px] text-muted-foreground uppercase">Target Allocation: 2%</p>
          </div>
        </div>

        <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-primary/5 border border-primary/10 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <BarChart2 className="w-4 h-4 text-primary" />
              <span className="text-xs font-bold uppercase tracking-wider text-primary">AI Research Summary</span>
            </div>
            <ul className="space-y-2">
              {idea.aiSummaryBullets.map((bullet, i) => (
                <li key={i} className="text-sm text-foreground/90 flex gap-2">
                  <span className="text-primary">•</span> {bullet}
                </li>
              ))}
            </ul>
          </div>
          
          <div className="space-y-4">
            <div className="p-4 bg-rose-500/5 border border-rose-500/10 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-rose-400">Risk Assessment</span>
              </div>
              <p className="text-sm text-rose-200/80 italic leading-snug">{idea.riskLine}</p>
            </div>
            <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Lightbulb className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Payoff Scenario</span>
              </div>
              <p className="text-sm text-emerald-200/80 leading-snug">{idea.payoffHint}</p>
            </div>
          </div>
        </div>

        {!isStock && idea.legs && (
          <div className="mb-6 overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-secondary/50">
                  <th className="p-3 border-b border-border uppercase text-[10px] text-muted-foreground font-bold">Side</th>
                  <th className="p-3 border-b border-border uppercase text-[10px] text-muted-foreground font-bold">Type</th>
                  <th className="p-3 border-b border-border uppercase text-[10px] text-muted-foreground font-bold">Strike</th>
                  <th className="p-3 border-b border-border uppercase text-[10px] text-muted-foreground font-bold">Exp</th>
                  <th className="p-3 border-b border-border uppercase text-[10px] text-muted-foreground font-bold">Qty</th>
                </tr>
              </thead>
              <tbody>
                {idea.legs.map((leg, i) => (
                  <tr key={i} className="border-b border-border/50 hover:bg-secondary/20 transition-colors">
                    <td className="p-3 font-bold">{leg.side}</td>
                    <td className="p-3">
                      <span className={leg.type === "CALL" ? "text-emerald-400" : "text-rose-400"}>{leg.type}</span>
                    </td>
                    <td className="p-3 font-code">${leg.strike.toFixed(2)}</td>
                    <td className="p-3 font-code">{leg.expiration}</td>
                    <td className="p-3">{leg.contracts}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {isStock && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="p-3 border border-border rounded-md bg-secondary/10">
              <p className="text-[10px] uppercase text-muted-foreground mb-1">Entry Plan</p>
              <p className="text-sm font-semibold">{idea.entryPlan || "N/A"}</p>
            </div>
            <div className="p-3 border border-border rounded-md bg-secondary/10">
              <p className="text-[10px] uppercase text-muted-foreground mb-1">Stop Loss</p>
              <p className="text-sm font-semibold text-rose-400">{idea.stopLoss || "N/A"}</p>
            </div>
            <div className="p-3 border border-border rounded-md bg-secondary/10">
              <p className="text-[10px] uppercase text-muted-foreground mb-1">Invalidation</p>
              <p className="text-sm font-semibold">{idea.invalidation || "N/A"}</p>
            </div>
          </div>
        )}

        <div className="p-4 bg-secondary/20 rounded-lg mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Info className="w-4 h-4 text-muted-foreground" />
            <span className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">Research Notes</span>
          </div>
          <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-line">{idea.note}</p>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-border">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleLike}
              className="text-muted-foreground hover:text-rose-400 hover:bg-rose-500/10 gap-2"
            >
              <Heart className="w-4 h-4" />
              <span className="text-xs font-bold">{likes}</span>
            </Button>
            
            {canManage && (
              <div className="flex items-center gap-2 border-l border-border pl-4">
                <PostTradeIdea ideaToEdit={idea} />
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 gap-2 cursor-pointer"
                >
                  {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  <span className="text-xs font-bold">Delete</span>
                </Button>
              </div>
            )}
          </div>
          <p className="text-[10px] text-muted-foreground font-bold tracking-tighter uppercase italic">
            For educational purposes only. Not financial advice.
          </p>
        </div>
      </div>
    </div>
  )
}
