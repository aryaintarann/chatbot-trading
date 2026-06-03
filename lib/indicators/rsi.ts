import type { Candle } from '@/types/candle'
import type { RSIResult } from '@/types/indicator'

export function calculateRSI(candles: Candle[], period = 14): RSIResult {
  if (candles.length < period + 1) {
    return { value: 50, signal: 'neutral' }
  }

  const closes = candles.map(c => c.close)
  let gains = 0
  let losses = 0

  for (let i = 1; i <= period; i++) {
    const diff = closes[i] - closes[i - 1]
    if (diff > 0) gains += diff
    else losses += Math.abs(diff)
  }

  let avgGain = gains / period
  let avgLoss = losses / period

  for (let i = period + 1; i < closes.length; i++) {
    const diff = closes[i] - closes[i - 1]
    const gain = diff > 0 ? diff : 0
    const loss = diff < 0 ? Math.abs(diff) : 0
    avgGain = (avgGain * (period - 1) + gain) / period
    avgLoss = (avgLoss * (period - 1) + loss) / period
  }

  if (avgLoss === 0) return { value: 100, signal: 'overbought' }

  const rs = avgGain / avgLoss
  const value = 100 - 100 / (1 + rs)

  let signal: RSIResult['signal']
  if (value > 70) signal = 'overbought'
  else if (value < 30) signal = 'oversold'
  else if (value >= 50) signal = 'bullish'
  else signal = 'bearish'

  return { value: Math.round(value * 100) / 100, signal }
}
