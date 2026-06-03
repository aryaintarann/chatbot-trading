import type { ParsedSignal } from '@/types/signal'

interface SignalCardProps {
  signal: ParsedSignal
  confidenceScore?: number
  session?: string
}

export function SignalCard({ signal, confidenceScore, session }: SignalCardProps) {
  const colorMap = {
    buy: { badge: 'bg-[#22d3a0] text-black', glow: 'border-[#22d3a0]/30' },
    sell: { badge: 'bg-[#f05470] text-white', glow: 'border-[#f05470]/30' },
    wait: { badge: 'bg-[#F5C842] text-black', glow: 'border-[#F5C842]/30' },
  }

  const colors = colorMap[signal.type]

  return (
    <div className={`mt-3 bg-[#111827] border ${colors.glow} rounded-xl p-4 space-y-3`}>
      <div className="flex items-center justify-between">
        <span className={`${colors.badge} text-xs font-mono font-bold px-3 py-1 rounded-lg`}>
          {signal.type.toUpperCase()}
        </span>
        {signal.timeframe && (
          <span className="text-gray-500 text-xs font-mono">{signal.timeframe}</span>
        )}
      </div>

      {signal.type !== 'wait' && (
        <div className="grid grid-cols-2 gap-2 text-sm font-mono">
          {signal.entry && (
            <div className="bg-[rgba(255,255,255,0.03)] rounded-lg p-2">
              <div className="text-gray-500 text-xs mb-0.5">ENTRY</div>
              <div className="text-white font-bold">{signal.entry.toFixed(2)}</div>
            </div>
          )}
          {signal.stop_loss && (
            <div className="bg-[rgba(240,84,112,0.05)] rounded-lg p-2 border border-[rgba(240,84,112,0.15)]">
              <div className="text-gray-500 text-xs mb-0.5">STOP LOSS</div>
              <div className="text-[#f05470] font-bold">{signal.stop_loss.toFixed(2)}</div>
            </div>
          )}
          {signal.tp1 && (
            <div className="bg-[rgba(34,211,160,0.05)] rounded-lg p-2 border border-[rgba(34,211,160,0.15)]">
              <div className="text-gray-500 text-xs mb-0.5">TP1</div>
              <div className="text-[#22d3a0] font-bold">{signal.tp1.toFixed(2)}</div>
            </div>
          )}
          {signal.tp2 && (
            <div className="bg-[rgba(34,211,160,0.05)] rounded-lg p-2 border border-[rgba(34,211,160,0.15)]">
              <div className="text-gray-500 text-xs mb-0.5">TP2</div>
              <div className="text-[#22d3a0] font-bold">{signal.tp2.toFixed(2)}</div>
            </div>
          )}
        </div>
      )}

      {(signal.risk_reward || confidenceScore !== undefined) && (
        <div className="flex items-center justify-between pt-2 border-t border-[rgba(255,255,255,0.05)]">
          {signal.risk_reward && (
            <span className="text-xs text-gray-400 font-mono">R:R {signal.risk_reward}</span>
          )}
          {confidenceScore !== undefined && (
            <div className="flex items-center gap-2">
              <div className="w-20 h-1.5 bg-[rgba(255,255,255,0.1)] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${confidenceScore}%`,
                    background: confidenceScore >= 70 ? '#22d3a0' : confidenceScore >= 50 ? '#F5C842' : '#f05470',
                  }}
                ></div>
              </div>
              <span className="text-xs text-gray-400 font-mono">{confidenceScore}%</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
