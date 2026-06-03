'use client'

import { useState, useEffect } from 'react'
import type { Timeframe } from '@/types/candle'
import type { TimeframeIndicators } from '@/types/indicator'

interface SidebarProps {
  userId: string
}

const TIMEFRAMES: Timeframe[] = ['M1', 'M5', 'M15', 'H1', 'H4', 'D1']

export function Sidebar({ userId }: SidebarProps) {
  const [tfData, setTfData] = useState<Record<string, TimeframeIndicators>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      try {
        const results = await Promise.all(
          TIMEFRAMES.map(async (tf) => {
            const res = await fetch(`/api/candles?tf=${tf}&limit=100`, {
              headers: { 'x-user-id': userId },
            })
            if (!res.ok) return null
            const data = await res.json()
            return { tf, candles: data.candles }
          })
        )

        const map: Record<string, TimeframeIndicators> = {}
        for (const result of results) {
          if (result && result.candles && result.candles.length >= 14) {
            const { calculateTimeframeIndicators } = await import('@/lib/indicators')
            map[result.tf] = calculateTimeframeIndicators(result.tf as Timeframe, result.candles)
          }
        }
        setTfData(map)
      } catch {
        // silent fail — sidebar is informational
      } finally {
        setLoading(false)
      }
    }

    fetchData()
    const interval = setInterval(fetchData, 60000)
    return () => clearInterval(interval)
  }, [userId])

  const biasEmoji = (bias: string) => bias === 'bull' ? '▲' : bias === 'bear' ? '▼' : '◆'
  const biasColor = (bias: string) => bias === 'bull' ? 'text-[#22d3a0]' : bias === 'bear' ? 'text-[#f05470]' : 'text-gray-400'

  return (
    <div className="flex flex-col gap-4 p-4 h-full overflow-y-auto">
      {/* TF Grid */}
      <div>
        <h3 className="text-xs text-gray-500 font-mono uppercase tracking-wider mb-2">Multi-Timeframe</h3>
        <div className="grid grid-cols-2 gap-1.5">
          {TIMEFRAMES.map(tf => {
            const data = tfData[tf]
            return (
              <div key={tf} className="bg-[#111827] rounded-lg p-2 border border-[rgba(255,255,255,0.05)]">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-mono text-gray-400">{tf}</span>
                  {loading ? (
                    <div className="w-4 h-3 bg-[rgba(255,255,255,0.05)] rounded animate-pulse"></div>
                  ) : data ? (
                    <span className={`text-xs font-mono ${biasColor(data.bias)}`}>
                      {biasEmoji(data.bias)}
                    </span>
                  ) : (
                    <span className="text-xs text-gray-600">--</span>
                  )}
                </div>
                {data && (
                  <div className="text-xs text-gray-500 font-mono">
                    RSI: <span className={data.rsi.value > 70 ? 'text-[#f05470]' : data.rsi.value < 30 ? 'text-[#22d3a0]' : 'text-gray-300'}>
                      {data.rsi.value.toFixed(0)}
                    </span>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* M15 Indicators Detail */}
      {tfData['M15'] && (
        <div>
          <h3 className="text-xs text-gray-500 font-mono uppercase tracking-wider mb-2">Indikator M15</h3>
          <div className="space-y-2 text-xs font-mono">
            {[
              { label: 'RSI (14)', value: `${tfData['M15'].rsi.value.toFixed(2)}`, color: tfData['M15'].rsi.value > 70 ? 'text-[#f05470]' : tfData['M15'].rsi.value < 30 ? 'text-[#22d3a0]' : 'text-white' },
              { label: 'MACD', value: `${tfData['M15'].macd.histogram.toFixed(4)}`, color: tfData['M15'].macd.histogram > 0 ? 'text-[#22d3a0]' : 'text-[#f05470]' },
              { label: 'EMA 20', value: tfData['M15'].ema.ema20.toFixed(2), color: 'text-white' },
              { label: 'EMA 50', value: tfData['M15'].ema.ema50.toFixed(2), color: 'text-white' },
              { label: 'ATR (14)', value: tfData['M15'].atr.value.toFixed(4), color: 'text-[#F5C842]' },
              { label: 'Stoch %K', value: `${tfData['M15'].stochastic.k.toFixed(1)}`, color: tfData['M15'].stochastic.k > 80 ? 'text-[#f05470]' : tfData['M15'].stochastic.k < 20 ? 'text-[#22d3a0]' : 'text-white' },
            ].map(item => (
              <div key={item.label} className="flex items-center justify-between">
                <span className="text-gray-500">{item.label}</span>
                <span className={item.color}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Volatility / ATR label */}
      {tfData['M15'] && (
        <div>
          <h3 className="text-xs text-gray-500 font-mono uppercase tracking-wider mb-2">Volatilitas</h3>
          <div className="bg-[#111827] rounded-lg p-3 border border-[rgba(255,255,255,0.05)]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-400 font-mono">ATR M15</span>
              <span className={`text-xs font-mono font-bold ${
                tfData['M15'].atr.volatility === 'extreme' ? 'text-[#f05470]' :
                tfData['M15'].atr.volatility === 'high' ? 'text-[#F5C842]' :
                tfData['M15'].atr.volatility === 'normal' ? 'text-[#22d3a0]' : 'text-gray-400'
              }`}>
                {tfData['M15'].atr.volatility.toUpperCase()}
              </span>
            </div>
            <div className="w-full h-1.5 bg-[rgba(255,255,255,0.05)] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${Math.min(100, (tfData['M15'].atr.value / 20) * 100)}%`,
                  background: tfData['M15'].atr.volatility === 'extreme' ? '#f05470' :
                              tfData['M15'].atr.volatility === 'high' ? '#F5C842' : '#22d3a0',
                }}
              ></div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
