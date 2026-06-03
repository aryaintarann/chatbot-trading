import type { ParsedSignal } from '@/types/signal'

interface SignalCardProps {
  signal: ParsedSignal
  confidenceScore?: number
  session?: string
}

export function SignalCard({ signal, confidenceScore }: SignalCardProps) {
  const colorMap = {
    buy:  { badge: 'bg-[#22d3a0] text-black', border: 'border-[rgba(34,211,160,0.25)]', headerBg: 'bg-[rgba(34,211,160,0.06)]' },
    sell: { badge: 'bg-[#f05470] text-white',  border: 'border-[rgba(240,84,112,0.25)]', headerBg: 'bg-[rgba(240,84,112,0.06)]' },
    wait: { badge: 'bg-[#F5C842] text-black',  border: 'border-[rgba(245,200,66,0.25)]',  headerBg: 'bg-[rgba(245,200,66,0.06)]'  },
  }
  const c = colorMap[signal.type]

  return (
    <div className={`mt-2 rounded-xl border ${c.border} overflow-hidden`}>
      {/* Header */}
      <div className={`flex items-center justify-between px-3 py-2 ${c.headerBg}`}>
        <span className={`${c.badge} text-xs font-mono font-bold px-2.5 py-0.5 rounded-md`}>
          {signal.type.toUpperCase()}
        </span>
        <div className="flex items-center gap-2">
          {signal.timeframe && (
            <span className="text-gray-500 text-xs font-mono">{signal.timeframe}</span>
          )}
          {confidenceScore !== undefined && (
            <div className="flex items-center gap-1.5">
              <div className="w-16 h-1 bg-[rgba(255,255,255,0.08)] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${confidenceScore}%`,
                    background: confidenceScore >= 70 ? '#22d3a0' : confidenceScore >= 50 ? '#F5C842' : '#f05470',
                  }}
                />
              </div>
              <span className="text-xs text-gray-400 font-mono">{confidenceScore}%</span>
            </div>
          )}
        </div>
      </div>

      {/* Level grid */}
      {signal.type !== 'wait' && (signal.entry || signal.stop_loss || signal.tp1 || signal.tp2) && (
        <div className="grid grid-cols-2 gap-px bg-[rgba(255,255,255,0.04)]">
          {([
            { label: 'ENTRY',     value: signal.entry,     color: 'text-white' },
            { label: 'STOP LOSS', value: signal.stop_loss, color: 'text-[#f05470]' },
            { label: 'TP1',       value: signal.tp1,       color: 'text-[#22d3a0]' },
            { label: 'TP2',       value: signal.tp2,       color: 'text-[#22d3a0]' },
          ] as const).map(({ label, value, color }) => value ? (
            <div key={label} className="bg-[#0d1220] px-3 py-2">
              <div className="text-gray-600 text-[10px] font-mono mb-0.5">{label}</div>
              <div className={`${color} font-mono font-semibold text-sm`}>{value.toFixed(2)}</div>
            </div>
          ) : null)}
        </div>
      )}

      {/* Footer R:R */}
      {signal.risk_reward && (
        <div className="px-3 py-1.5 bg-[#0d1220] border-t border-[rgba(255,255,255,0.04)]">
          <span className="text-gray-500 text-xs font-mono">R:R {signal.risk_reward}</span>
        </div>
      )}
    </div>
  )
}
