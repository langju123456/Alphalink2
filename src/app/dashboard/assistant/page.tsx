"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  MessageSquare, 
  Send, 
  Sparkles, 
  Loader2, 
  Cpu, 
  AlertCircle
} from "lucide-react"
import { chatWithAlphaBot } from "@/ai/flows/chat-with-alpha-bot"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
}

export default function AssistantPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "Hello, I am AlphaBot. How can I assist with your market research or technical analysis today? I specialize in Stock and Options scenario analysis."
    }
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input
    }

    setMessages(prev => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      const response = await chatWithAlphaBot({ message: input })
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response.response
      }
      setMessages(prev => [...prev, assistantMessage])
    } catch (err) {
      console.error(err)
      setMessages(prev => [...prev, {
        id: "error",
        role: "assistant",
        content: "I'm having trouble connecting to the research terminal. Please try again shortly."
      }])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-160px)]">
      <header className="flex items-center gap-4 mb-8">
        <div className="p-3 bg-primary/10 rounded-full">
          <Cpu className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-headline font-bold text-white">AlphaBot AI</h1>
          <p className="text-muted-foreground text-sm">Research Assistant & Market Intelligence Engine</p>
        </div>
      </header>

      <div className="flex-1 terminal-card bg-card flex flex-col min-h-0">
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-border"
        >
          {messages.map((msg) => (
            <div 
              key={msg.id} 
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div className={`max-w-[80%] p-4 rounded-lg ${
                msg.role === "user" 
                  ? "bg-primary text-white ml-12" 
                  : "bg-secondary/50 border border-border text-foreground mr-12"
              }`}>
                <div className="flex items-center gap-2 mb-2">
                  {msg.role === "assistant" ? (
                    <Sparkles className="w-3 h-3 text-primary" />
                  ) : null}
                  <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">
                    {msg.role === "assistant" ? "AlphaBot v2.5" : "Member Terminal"}
                  </span>
                </div>
                <div className="text-sm leading-relaxed whitespace-pre-line prose prose-invert max-w-none">
                  {msg.content}
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-secondary/50 border border-border p-4 rounded-lg flex items-center gap-3">
                <Loader2 className="w-4 h-4 text-primary animate-spin" />
                <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Analyzing Market Data...</span>
              </div>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-border bg-secondary/10">
          <form onSubmit={handleSend} className="relative">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about SPY analysis, vertical spreads, or risk management..."
              className="bg-card border-border h-14 pl-6 pr-16 focus:ring-primary text-white"
              disabled={isLoading}
            />
            <Button 
              type="submit" 
              size="icon" 
              disabled={isLoading || !input.trim()}
              className="absolute right-2 top-2 h-10 w-10 bg-primary hover:bg-primary/90"
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>
          <div className="flex items-center gap-2 mt-4 text-[10px] text-muted-foreground uppercase font-bold tracking-tight">
            <AlertCircle className="w-3 h-3" />
            For educational purposes only • Never financial advice • Gemini AI Core
          </div>
        </div>
      </div>
    </div>
  )
}