'use client'

import { useState, useCallback } from 'react'
import type { ChatMessage } from '@/types/signal'
import type { ParsedSignal } from '@/types/signal'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  signal?: ParsedSignal | null
  isStreaming?: boolean
  confidenceScore?: number
  session?: string
}

export function useChat(userId: string) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: 'Halo! Saya GoldAI Scalper. Saya siap membantu analisa XAUUSD dengan multi-timeframe analysis. Klik **⚡ Analisa Sekarang** untuk memulai, atau tanyakan apa saja seputar trading XAUUSD.',
    },
  ])
  const [isLoading, setIsLoading] = useState(false)

  const sendMessage = useCallback(async (userMessage: string) => {
    if (isLoading) return

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: userMessage,
    }

    const assistantId = (Date.now() + 1).toString()
    const assistantMsg: Message = {
      id: assistantId,
      role: 'assistant',
      content: '',
      isStreaming: true,
    }

    setMessages(prev => [...prev, userMsg, assistantMsg])
    setIsLoading(true)

    const history = messages.slice(-10).map(m => ({ role: m.role, content: m.content }))

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId,
        },
        body: JSON.stringify({ message: userMessage, history }),
      })

      if (!res.ok) {
        const err = await res.json()
        setMessages(prev => prev.map(m =>
          m.id === assistantId
            ? { ...m, content: `❌ ${err.message ?? 'Terjadi kesalahan. Coba lagi.'}`, isStreaming: false }
            : m
        ))
        return
      }

      const reader = res.body!.getReader()
      const decoder = new TextDecoder()
      let fullContent = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const text = decoder.decode(value, { stream: true })
        const lines = text.split('\n').filter(l => l.startsWith('data: '))

        for (const line of lines) {
          const jsonStr = line.slice(6)
          try {
            const parsed = JSON.parse(jsonStr)

            if (parsed.type === 'delta') {
              fullContent += parsed.content
              setMessages(prev => prev.map(m =>
                m.id === assistantId ? { ...m, content: fullContent } : m
              ))
            } else if (parsed.type === 'done') {
              setMessages(prev => prev.map(m =>
                m.id === assistantId
                  ? {
                      ...m,
                      content: fullContent,
                      isStreaming: false,
                      signal: parsed.signal,
                      confidenceScore: parsed.analysis?.confidenceScore,
                      session: parsed.analysis?.session,
                    }
                  : m
              ))
            } else if (parsed.type === 'error') {
              setMessages(prev => prev.map(m =>
                m.id === assistantId
                  ? { ...m, content: '❌ Terjadi kesalahan saat streaming.', isStreaming: false }
                  : m
              ))
            }
          } catch {
            // skip malformed lines
          }
        }
      }
    } catch (err) {
      setMessages(prev => prev.map(m =>
        m.id === assistantId
          ? { ...m, content: '❌ Koneksi terputus. Coba lagi.', isStreaming: false }
          : m
      ))
    } finally {
      setIsLoading(false)
    }
  }, [messages, isLoading, userId])

  return { messages, isLoading, sendMessage }
}
