'use client'

import type { ParsedSignal } from '@/types/signal'

interface SignalBannerProps {
  signal: ParsedSignal | null
  confidenceScore?: number
  session?: string
}

export function SignalBanner({ signal, confidenceScore, session }: SignalBannerProps) {
  if (!signal) {
    return (
      <div className="flex items-center gap-3 px-4 py-2.5 bg-[#0d1220] border-b border-[rgba(245,200,66,0.1)]">
        <div className="w-2 h-2 bg-gray-600 rounded-full"></div>
        <span className="text-gray-500 text-sm">Belum ada signal — klik ⚡ Analisa Sekarang</span>
      </div>
    )
  }

  const colorMap = {
    buy: { bg: 'rgba(34,211,160,0.08)', border: '#22d3a0', text: '#22d3a0', badge: 'bg-[#22d3a0]' },
    sell: { bg: 'rgba(240,84,112,0.08)', border: '#f05470', text: '#f05470', badge: 'bg-[#f05470]' },
    wait: { bg: 'rgba(245,200,66,0.08)', border: '#F5C842', text: '#F5C842', badge: 'bg-[#F5C842]' },
  }

  const colors = colorMap[signal.type]

  return (
    <div
      className="flex items-center gap-3 px-4 py-2.5 border-b animate-slide-in flex-wrap"
      style={{ background: colors.bg, borderColor: `${colors.border}40` }}
    >
      <span className={`${colors.badge} text-black text-xs font-mono font-bold px-2 py-0.5 rounded`}>
        {signal.type.toUpperCase()}
      </span>

      <div className="flex items-center gap-4 flex-wrap text-sm font-mono">
        {signal.entry && (
          <span className="text-gray-300">
            Entry: <span className="text-white font-bold">{signal.entry.toFixed(2)}</span>
          </span>
        )}
        {signal.stop_loss && (
          <span className="text-gray-300">
            SL: <span className="text-[#f05470]">{signal.stop_loss.toFixed(2)}</span>
          </span>
        )}
        {signal.tp1 && (
          <span className="text-gray-300">
            TP1: <span className="text-[#22d3a0]">{signal.tp1.toFixed(2)}</span>
          </span>
        )}
        {signal.tp2 && (
          <span className="text-gray-300">
            TP2: <span className="text-[#22d3a0]">{signal.tp2.toFixed(2)}</span>
          </span>
        )}
        {signal.risk_reward && (
          <span className="text-gray-400">R:R {signal.risk_reward}</span>
        )}
      </div>

      <div className="ml-auto flex items-center gap-3">
        {confidenceScore !== undefined && (
          <div className="flex items-center gap-1.5">
            <div className="w-24 h-1.5 bg-[rgba(255,255,255,0.1)] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${confidenceScore}%`,
                  background: confidenceScore >= 70 ? '#22d3a0' : confidenceScore >= 50 ? '#F5C842' : '#f05470',
                }}
              ></div>
            </div>
            <span className="text-xs text-gray-400 font-mono">{confidenceScore}%</span>
          </div>
        )}
        {session && <span className="text-xs text-gray-500 hidden sm:block">{session}</span>}
      </div>
    </div>
  )
}
