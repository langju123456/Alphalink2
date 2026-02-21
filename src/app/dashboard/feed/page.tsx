"use client"

import { useFirebase, useCollection, useMemoFirebase, useUser, useDoc } from "@/firebase"
import { collection, query, orderBy, doc } from "firebase/firestore"
import { TradeIdeaCard } from "@/components/trade-idea-card"
import { PostTradeIdea } from "@/components/post-trade-idea"
import { Search, TrendingUp, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { useLanguage } from "@/components/language-provider"

export default function FeedPage() {
  const { firestore } = useFirebase()
  const { user } = useUser()
  const { t } = useLanguage()

  const userDocRef = useMemoFirebase(() => {
    if (!user || !firestore) return null
    return doc(firestore, "users", user.uid)
  }, [user, firestore])
  
  const { data: userProfile } = useDoc(userDocRef)
  const isAdmin = userProfile?.role === "admin"

  const tradeIdeasQuery = useMemoFirebase(() => {
    if (!firestore) return null
    return query(collection(firestore, "tradeIdeas"), orderBy("createdAt", "desc"))
  }, [firestore])

  const { data: ideas, isLoading } = useCollection(tradeIdeasQuery)

  return (
    <div className="space-y-8 pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-headline font-bold text-white mb-2">{t.feed.title}</h1>
          <p className="text-muted-foreground text-sm">{t.feed.description}</p>
        </div>
        {isAdmin && <PostTradeIdea />}
      </header>

      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
          <Input placeholder={t.feed.searchPlaceholder} className="pl-10 bg-card border-border h-11" />
        </div>
        <div className="flex items-center gap-2">
          <button className="px-4 py-2 text-xs font-bold uppercase bg-primary text-white rounded border border-primary/50">{t.feed.allAssets}</button>
          <button className="px-4 py-2 text-xs font-bold uppercase text-muted-foreground hover:text-white transition-colors">{t.feed.stocks}</button>
          <button className="px-4 py-2 text-xs font-bold uppercase text-muted-foreground hover:text-white transition-colors">{t.feed.options}</button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {isLoading ? (
          <div className="py-20 flex justify-center">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : !ideas || ideas.length === 0 ? (
          <div className="py-20 text-center terminal-card bg-secondary/10 flex flex-col items-center justify-center space-y-4">
            <TrendingUp className="w-12 h-12 text-muted-foreground opacity-20" />
            <div>
              <p className="text-muted-foreground font-semibold">{t.feed.noIdeas}</p>
              <p className="text-xs text-muted-foreground/60 uppercase tracking-widest mt-1">{t.feed.standBy}</p>
            </div>
          </div>
        ) : (
          ideas.map(idea => (
            <TradeIdeaCard key={idea.id} idea={idea as any} />
          ))
        )}
      </div>

      <footer className="pt-10 border-t border-border text-center">
        <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-bold">
          {t.feed.footer}
        </p>
      </footer>
    </div>
  )
}
