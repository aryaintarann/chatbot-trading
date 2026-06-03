'use client'

import { useState, useCallback } from 'react'
import dynamic from 'next/dynamic'
import { ChatArea } from '@/components/chat/ChatArea'
import { SignalBanner } from '@/components/signal/SignalBanner'
import { Sidebar } from '@/components/sidebar/Sidebar'
import type { ParsedSignal } from '@/types/signal'

const TradingViewWidget = dynamic(
  () => import('@/components/chart/TradingViewWidget').then(m => m.TradingViewWidget),
  {
    ssr: false,
    loading: () => (
      <div className="h-full flex items-center justify-center bg-[#0d1220] text-gray-600 text-sm">
        Memuat chart...
      </div>
    ),
  }
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
    <div className="flex flex-col h-full overflow-hidden">
      {/* Signal Banner — fixed height */}
      <div className="flex-shrink-0">
        <SignalBanner signal={currentSignal} confidenceScore={confidenceScore} session={session} />
      </div>

      {/* ── DESKTOP (≥1024px) ─────────────────────────────────── */}
      <div className="hidden lg:flex flex-1 min-h-0 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-56 flex-shrink-0 border-r border-[rgba(255,255,255,0.06)] bg-[#0d1220] overflow-y-auto">
          <Sidebar userId={userId} />
        </aside>

        {/* Main column: chart atas, chat bawah */}
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          {/* Chart — clipped agar tidak meluber */}
          <div className="h-[45%] min-h-[260px] max-h-[420px] flex-shrink-0 overflow-hidden border-b border-[rgba(255,255,255,0.06)]">
            <TradingViewWidget />
          </div>

          {/* Chat — mengisi sisa ruang, scroll di dalam */}
          <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
            <ChatArea userId={userId} onSignal={handleSignal} />
          </div>
        </div>
      </div>

      {/* ── MOBILE (<1024px) ─────────────────────────────────── */}
      {/* Tab bar */}
      <div className="flex flex-shrink-0 border-b border-[rgba(255,255,255,0.06)] lg:hidden">
        {(['chart', 'chat', 'sidebar'] as Tab[]).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 text-xs font-medium transition-colors ${
              activeTab === tab
                ? 'text-[#F5C842] border-b-2 border-[#F5C842]'
                : 'text-gray-500'
            }`}
          >
            {tab === 'chart' ? '📈 Chart' : tab === 'chat' ? '💬 Chat' : '📊 Panel'}
          </button>
        ))}
      </div>

      <div className="flex lg:hidden flex-1 min-h-0 overflow-hidden">
        {activeTab === 'chart' && (
          <div className="flex-1 overflow-hidden">
            <TradingViewWidget />
          </div>
        )}
        {activeTab === 'chat' && (
          <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
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
