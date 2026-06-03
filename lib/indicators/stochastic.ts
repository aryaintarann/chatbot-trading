import type { Candle } from '@/types/candle'
import type { StochasticResult } from '@/types/indicator'

export function calculateStochastic(candles: Candle[], kPeriod = 14, dPeriod = 3): StochasticResult {
  if (candles.length < kPeriod) {
    return { k: 50, d: 50, signal: 'neutral' }
  }

  const kValues: number[] = []
  for (let i = kPeriod - 1; i < candles.length; i++) {
    const slice = candles.slice(i - kPeriod + 1, i + 1)
    const highestHigh = Math.max(...slice.map(c => c.high))
    const lowestLow = Math.min(...slice.map(c => c.low))
    const range = highestHigh - lowestLow
    kValues.push(range === 0 ? 50 : ((slice[slice.length - 1].close - lowestLow) / range) * 100)
  }

  const dValues: number[] = []
  for (let i = dPeriod - 1; i < kValues.length; i++) {
    const slice = kValues.slice(i - dPeriod + 1, i + 1)
    dValues.push(slice.reduce((a, b) => a + b, 0) / dPeriod)
  }

  const k = Math.round((kValues[kValues.length - 1] ?? 50) * 100) / 100
  const d = Math.round((dValues[dValues.length - 1] ?? 50) * 100) / 100

  const prevK = kValues[kValues.length - 2] ?? k
  const prevD = dValues[dValues.length - 2] ?? d

  let signal: StochasticResult['signal']
  if (k > 80) signal = 'overbought'
  else if (k < 20) signal = 'oversold'
  else if (prevK <= prevD && k > d) signal = 'bullish'
  else if (prevK >= prevD && k < d) signal = 'bearish'
  else signal = 'neutral'

  return { k, d, signal }
}
