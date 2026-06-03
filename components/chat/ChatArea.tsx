'use client'

import { useEffect, useRef, useState } from 'react'
import { MessageBubble } from './MessageBubble'
import { TypingIndicator } from './TypingIndicator'
import { QuickButtons } from './QuickButtons'
import { useChat } from '@/hooks/useChat'
import type { ParsedSignal } from '@/types/signal'

interface ChatAreaProps {
  userId: string
  onSignal: (signal: ParsedSignal, confidenceScore?: number, session?: string) => void
}

export function ChatArea({ userId, onSignal }: ChatAreaProps) {
  const { messages, isLoading, sendMessage } = useChat(userId)
  const [input, setInput] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    const lastMsg = messages[messages.length - 1]
    if (lastMsg?.role === 'assistant' && !lastMsg.isStreaming && lastMsg.signal) {
      onSignal(lastMsg.signal, lastMsg.confidenceScore, lastMsg.session)
    }
  }, [messages, onSignal])

  async function handleSend() {
    if (!input.trim() || isLoading) return
    const msg = input.trim()
    setInput('')
    await sendMessage(msg)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    // Kontainer utama — flex column, tinggi diisi parent, tidak meluber
    <div className="flex flex-col h-full min-h-0 overflow-hidden">

      {/* Area pesan — satu-satunya yang scrollable */}
      <div className="flex-1 min-h-0 overflow-y-auto px-4 py-3 space-y-1">
        {messages.map(msg => (
          <MessageBubble
            key={msg.id}
            role={msg.role}
            content={msg.content}
            signal={msg.signal}
            isStreaming={msg.isStreaming}
            confidenceScore={msg.confidenceScore}
            session={msg.session}
          />
        ))}
        {isLoading && messages[messages.length - 1]?.role === 'user' && (
          <TypingIndicator />
        )}
        <div ref={bottomRef} />
      </div>

      {/* Quick buttons — tinggi tetap, tidak ikut scroll */}
      <div className="flex-shrink-0 border-t border-[rgba(255,255,255,0.04)]">
        <QuickButtons
          onSend={sendMessage}
          onRefresh={() => sendMessage('Refresh data dan analisa ulang kondisi XAUUSD terkini')}
          isLoading={isLoading}
        />
      </div>

      {/* Input — tinggi tetap di bawah */}
      <div className="flex-shrink-0 flex items-end gap-2 px-3 py-2 border-t border-[rgba(255,255,255,0.06)] bg-[#080c14]">
        <div className="flex-1 bg-[#111827] border border-[rgba(255,255,255,0.1)] rounded-xl overflow-hidden focus-within:border-[rgba(245,200,66,0.4)] transition-colors">
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Tanya XAUUSD... (Enter kirim)"
            maxLength={1000}
            rows={1}
            className="w-full bg-transparent px-3 py-2.5 text-white placeholder-gray-600 text-sm resize-none focus:outline-none leading-snug"
            style={{ maxHeight: '96px' }}
          />
        </div>
        <button
          onClick={handleSend}
          disabled={!input.trim() || isLoading}
          className="flex-shrink-0 bg-[#F5C842] text-black w-9 h-9 rounded-xl flex items-center justify-center hover:bg-[#f0be2e] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
          ) : (
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          )}
        </button>
      </div>
    </div>
  )
}
