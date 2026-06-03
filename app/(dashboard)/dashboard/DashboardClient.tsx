'use client'

import { useState, useCallback } from 'react'
import dynamic from 'next/dynamic'
import { ChatArea } from '@/components/chat/ChatArea'
import { SignalBanner } from '@/components/signal/SignalBanner'
import { Sidebar } from '@/components/sidebar/Sidebar'
import type { ParsedSignal } from '@/types/signal'

const TradingViewWidget = dynamic(
  () => import('@/components/chart/TradingViewWidget').then(m => m.TradingViewWidget),
  { ssr: false, loading: () => <div className="h-full bg-[#0d1220] flex items-center justify-center text-gray-600 text-sm">Memuat chart...</div> }
)

type Tab = 'chart' | 'chat' | 'sidebar'

export function DashboardClient({ userId }: { userId: string }) {
  const [currentSignal, setCurrentSignal] = useState<ParsedSignal | null>(null)
  const [confidenceScore, setConfidenceScore] = useState<number | undefined>()
  const [session, setSession] = useState<string | undefined>()
  const [activeTab, setActiveTab] = useState<Tab>('chat')

  const handleSignal = useCallback((signal: ParsedSignal, confidence?: number, ses?: string) => {
    setCurrentSignal(signal)
    setConfidenceScore(confidence)
    setSession(ses)
  }, [])

  return (
    <div className="flex flex-col h-full">
      {/* Signal Banner */}
      <SignalBanner signal={currentSignal} confidenceScore={confidenceScore} session={session} />

      {/* Mobile Tabs */}
      <div className="flex border-b border-[rgba(255,255,255,0.06)] lg:hidden">
        {(['chart', 'chat', 'sidebar'] as Tab[]).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2.5 text-sm transition-colors ${
              activeTab === tab
                ? 'text-[#F5C842] border-b-2 border-[#F5C842]'
                : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            {tab === 'chart' ? '📈 Chart' : tab === 'chat' ? '💬 AI Chat' : '📊 Panel'}
          </button>
        ))}
      </div>

      {/* Desktop Layout */}
      <div className="hidden lg:flex flex-1 min-h-0">
        {/* Sidebar */}
        <div className="w-64 border-r border-[rgba(255,255,255,0.06)] bg-[#0d1220] overflow-y-auto flex-shrink-0">
          <Sidebar userId={userId} />
        </div>

        {/* Main area */}
        <div className="flex-1 flex flex-col min-h-0 min-w-0">
          {/* Chart */}
          <div className="h-[380px] border-b border-[rgba(255,255,255,0.06)] flex-shrink-0">
            <TradingViewWidget />
          </div>

          {/* Chat */}
          <div className="flex-1 min-h-0 flex flex-col">
            <ChatArea userId={userId} onSignal={handleSignal} />
          </div>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="flex lg:hidden flex-1 min-h-0">
        {activeTab === 'chart' && (
          <div className="flex-1">
            <TradingViewWidget />
          </div>
        )}
        {activeTab === 'chat' && (
          <div className="flex-1 flex flex-col min-h-0">
            <ChatArea userId={userId} onSignal={handleSignal} />
          </div>
        )}
        {activeTab === 'sidebar' && (
          <div className="flex-1 overflow-y-auto bg-[#0d1220]">
            <Sidebar userId={userId} />
          </div>
        )}
      </div>
    </div>
  )
}
