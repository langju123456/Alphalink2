"use client"

import { useEffect, useState } from "react"
import { storage } from "@/lib/storage"
import { TradeIdea } from "@/lib/types"
import { TradeIdeaCard } from "@/components/trade-idea-card"
import { PostTradeIdea } from "@/components/post-trade-idea"
import { Search, Filter, TrendingUp } from "lucide-react"
import { Input } from "@/components/ui/input"

export default function FeedPage() {
  const [ideas, setIdeas] = useState<TradeIdea[]>([])
  const [session, setSession] = useState<any>(null)

  useEffect(() => {
    setIdeas(storage.getIdeas())
    setSession(storage.getSession())
  }, [])

  const refresh = () => setIdeas(storage.getIdeas())

  return (
    <div className="space-y-8 pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-headline font-bold text-white mb-2">Market Intelligence</h1>
          <p className="text-muted-foreground text-sm">Real-time research notes from the AlphaLink institutional desk.</p>
        </div>
        {session?.role === "admin" && <PostTradeIdea onSuccess={refresh} />}
      </header>

      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search tickers, strategies, or notes..." className="pl-10 bg-card border-border h-11" />
        </div>
        <div className="flex items-center gap-2">
          <button className="px-4 py-2 text-xs font-bold uppercase bg-primary text-white rounded border border-primary/50">All Assets</button>
          <button className="px-4 py-2 text-xs font-bold uppercase text-muted-foreground hover:text-white transition-colors">Stocks</button>
          <button className="px-4 py-2 text-xs font-bold uppercase text-muted-foreground hover:text-white transition-colors">Options</button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {ideas.length === 0 ? (
          <div className="py-20 text-center terminal-card bg-secondary/10 flex flex-col items-center justify-center space-y-4">
            <TrendingUp className="w-12 h-12 text-muted-foreground opacity-20" />
            <div>
              <p className="text-muted-foreground font-semibold">No active trade ideas found.</p>
              <p className="text-xs text-muted-foreground/60 uppercase tracking-widest mt-1">Stand by for desk updates</p>
            </div>
          </div>
        ) : (
          ideas.map(idea => (
            <TradeIdeaCard key={idea.id} idea={idea} />
          ))
        )}
      </div>

      <footer className="pt-10 border-t border-border text-center">
        <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-bold">
          Market Data Delayed by 15 Minutes • AlphaLink Research Desk
        </p>
      </footer>
    </div>
  )
}