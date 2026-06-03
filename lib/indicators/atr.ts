import type { Candle } from '@/types/candle'
import type { ATRResult } from '@/types/indicator'

export function calculateATR(candles: Candle[], period = 14): ATRResult {
  if (candles.length < 2) {
    return { value: 0, volatility: 'low' }
  }

  const trs: number[] = []
  for (let i = 1; i < candles.length; i++) {
    const high = candles[i].high
    const low = candles[i].low
    const prevClose = candles[i - 1].close
    trs.push(Math.max(high - low, Math.abs(high - prevClose), Math.abs(low - prevClose)))
  }

  const initialTRs = trs.slice(0, period)
  let atr = initialTRs.reduce((a, b) => a + b, 0) / Math.min(period, initialTRs.length)

  for (let i = period; i < trs.length; i++) {
    atr = (atr * (period - 1) + trs[i]) / period
  }

  const value = Math.round(atr * 10000) / 10000

  let volatility: ATRResult['volatility']
  if (value < 3) volatility = 'low'
  else if (value < 8) volatility = 'normal'
  else if (value < 15) volatility = 'high'
  else volatility = 'extreme'

  return { value, volatility }
}
