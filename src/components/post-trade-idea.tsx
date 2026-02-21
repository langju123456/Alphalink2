"use client"

import { useState } from "react"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Textarea } from "./ui/textarea"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from "./ui/dialog"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "./ui/select"
import { Plus, Sparkles, Loader2, ArrowRight } from "lucide-react"
import { storage } from "@/lib/storage"
import { summarizeTradeIdea, SummarizeTradeIdeaInput } from "@/ai/flows/summarize-trade-idea"
import { useToast } from "@/hooks/use-toast"
import { InstrumentType, TradeIdea, OptionLeg } from "@/lib/types"

export function PostTradeIdea({ onSuccess }: { onSuccess: () => void }) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  // Form State
  const [type, setType] = useState<InstrumentType>("STOCK")
  const [note, setNote] = useState("")
  
  // Stock State
  const [ticker, setTicker] = useState("")
  const [direction, setDirection] = useState<"LONG" | "SHORT">("LONG")
  const [action, setAction] = useState<"BUY" | "SELL" | "HOLD">("BUY")
  const [timeframe, setTimeframe] = useState<"SCALP" | "SWING" | "LONG">("SWING")
  const [entry, setEntry] = useState("")
  const [stop, setStop] = useState("")
  const [invalidation, setInvalidation] = useState("")

  // Options State
  const [underlying, setUnderlying] = useState("")
  const [strategy, setStrategy] = useState<"SINGLE" | "VERTICAL_SPREAD">("SINGLE")
  const [legs, setLegs] = useState<OptionLeg[]>([{ side: "BUY", type: "CALL", strike: 0, expiration: "", contracts: 1 }])

  const addLeg = () => {
    if (legs.length < 2) {
      setLegs([...legs, { side: "SELL", type: "CALL", strike: 0, expiration: "", contracts: 1 }])
    }
  }

  const removeLeg = (index: number) => {
    setLegs(legs.filter((_, i) => i !== index))
  }

  const updateLeg = (index: number, field: keyof OptionLeg, value: any) => {
    const newLegs = [...legs]
    newLegs[index] = { ...newLegs[index], [field]: value }
    setLegs(newLegs)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const summaryInput: SummarizeTradeIdeaInput = type === "STOCK" 
        ? {
            instrumentType: "STOCK",
            note,
            ticker: ticker.toUpperCase(),
            direction,
            action,
            timeframe,
            entryPlan: entry,
            stopLoss: stop,
            invalidation
          }
        : {
            instrumentType: "OPTIONS",
            note,
            underlying: underlying.toUpperCase(),
            strategyType: strategy,
            legs: legs.map(l => ({ ...l, strike: Number(l.strike), contracts: Number(l.contracts) }))
          }

      // Call AI Summarize Flow
      const aiResponse = await summarizeTradeIdea(summaryInput)

      const newIdea: TradeIdea = {
        id: crypto.randomUUID(),
        instrumentType: type,
        note,
        aiSummaryBullets: aiResponse.aiSummaryBullets,
        riskLine: aiResponse.riskLine,
        payoffHint: aiResponse.payoffHint,
        createdAt: Date.now(),
        createdBy: "Admin",
        likeCount: 0,
        ...(type === "STOCK" ? {
          ticker: ticker.toUpperCase(),
          direction,
          action,
          timeframe,
          entryPlan: entry,
          stopLoss: stop,
          invalidation
        } : {
          underlying: underlying.toUpperCase(),
          strategyType: strategy,
          legs
        })
      }

      storage.saveIdea(newIdea)
      setOpen(false)
      onSuccess()
      toast({ title: "Trade Idea Published", description: "AI research summary generated and posted to feed." })
      
      // Reset
      setNote(""); setTicker(""); setUnderlying("")
    } catch (err) {
      console.error(err)
      toast({ title: "Error", description: "Failed to generate AI summary. Check your inputs.", variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-primary hover:bg-primary/90 font-bold gap-2">
          <Plus className="w-4 h-4" />
          Post Trade Idea
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl terminal-card bg-card border-border max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-headline flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Issue New Research Note
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Asset Class</label>
              <Select value={type} onValueChange={(v: InstrumentType) => setType(v)}>
                <SelectTrigger className="bg-secondary border-border h-11">
                  <SelectValue placeholder="Select Asset Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="STOCK">Stocks / Equity</SelectItem>
                  <SelectItem value="OPTIONS">Derivatives / Options</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {type === "STOCK" ? (
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Ticker Symbol</label>
                <Input placeholder="e.g. NVDA" value={ticker} onChange={e => setTicker(e.target.value)} className="bg-secondary border-border h-11" required />
              </div>
            ) : (
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Underlying Asset</label>
                <Input placeholder="e.g. SPY" value={underlying} onChange={e => setUnderlying(e.target.value)} className="bg-secondary border-border h-11" required />
              </div>
            )}
          </div>

          {type === "STOCK" && (
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Direction</label>
                <Select value={direction} onValueChange={(v: any) => setDirection(v)}>
                  <SelectTrigger className="bg-secondary border-border h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LONG">Long (Bullish)</SelectItem>
                    <SelectItem value="SHORT">Short (Bearish)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Action</label>
                <Select value={action} onValueChange={(v: any) => setAction(v)}>
                  <SelectTrigger className="bg-secondary border-border h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BUY">BUY</SelectItem>
                    <SelectItem value="SELL">SELL</SelectItem>
                    <SelectItem value="HOLD">HOLD</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Horizon</label>
                <Select value={timeframe} onValueChange={(v: any) => setTimeframe(v)}>
                  <SelectTrigger className="bg-secondary border-border h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SCALP">SCALP (Intraday)</SelectItem>
                    <SelectItem value="SWING">SWING (Days/Weeks)</SelectItem>
                    <SelectItem value="LONG">LONG (Months/Years)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {type === "OPTIONS" && (
            <div className="space-y-4">
               <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Strategy Type</label>
                <Select value={strategy} onValueChange={(v: any) => setStrategy(v)}>
                  <SelectTrigger className="bg-secondary border-border h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SINGLE">Single Leg</SelectItem>
                    <SelectItem value="VERTICAL_SPREAD">Vertical Spread</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center mb-2">
                  <label className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Option Legs</label>
                  {legs.length < 2 && strategy === "VERTICAL_SPREAD" && (
                    <Button type="button" variant="outline" size="sm" onClick={addLeg} className="h-7 text-xs">Add Leg</Button>
                  )}
                </div>
                {legs.map((leg, i) => (
                  <div key={i} className="grid grid-cols-5 gap-2 p-3 bg-secondary/30 border border-border rounded-md relative group">
                    <Select value={leg.side} onValueChange={v => updateLeg(i, "side", v)}>
                      <SelectTrigger className="bg-card border-border h-9 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="BUY">BUY</SelectItem>
                        <SelectItem value="SELL">SELL</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={leg.type} onValueChange={v => updateLeg(i, "type", v)}>
                      <SelectTrigger className="bg-card border-border h-9 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CALL">CALL</SelectItem>
                        <SelectItem value="PUT">PUT</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input placeholder="Strike" type="number" step="0.5" value={leg.strike || ""} onChange={e => updateLeg(i, "strike", e.target.value)} className="bg-card border-border h-9 text-xs" required />
                    <Input placeholder="YYYY-MM-DD" value={leg.expiration} onChange={e => updateLeg(i, "expiration", e.target.value)} className="bg-card border-border h-9 text-xs" required />
                    <Input placeholder="Qty" type="number" value={leg.contracts || ""} onChange={e => updateLeg(i, "contracts", e.target.value)} className="bg-card border-border h-9 text-xs" required />
                    {i > 0 && (
                      <button type="button" onClick={() => removeLeg(i)} className="absolute -right-2 -top-2 w-5 h-5 bg-rose-500 rounded-full text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity">×</button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Creator Notes / Rational</label>
            <Textarea 
              placeholder="Describe your reasoning, market conditions, and conviction levels..." 
              className="bg-secondary border-border min-h-[120px] focus:ring-primary"
              value={note}
              onChange={e => setNote(e.target.value)}
              required
            />
          </div>

          <div className="p-4 bg-primary/5 border border-primary/20 rounded-md">
            <div className="flex gap-3">
              <Sparkles className="w-5 h-5 text-primary shrink-0" />
              <div>
                <p className="text-xs font-bold text-white mb-1 uppercase tracking-tight">AI Enhancement Active</p>
                <p className="text-[10px] text-muted-foreground leading-relaxed">
                  Submitting this will trigger AlphaBot to generate a concise 3-bullet summary, risk analysis, and payoff hint for the community.
                </p>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button 
              type="submit" 
              className="w-full h-12 bg-primary font-bold uppercase tracking-widest gap-2"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating AI Research...
                </>
              ) : (
                <>
                  Issue Research Note
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}