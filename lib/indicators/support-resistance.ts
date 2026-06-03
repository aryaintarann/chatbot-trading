import type { Candle } from '@/types/candle'
import type { SupportResistance } from '@/types/indicator'

export function calculateSupportResistance(candles: Candle[], currentPrice: number): SupportResistance {
  const swingHighs: number[] = []
  const swingLows: number[] = []

  for (let i = 2; i < candles.length - 2; i++) {
    const c = candles[i]
    const isSwingHigh =
      c.high > candles[i - 1].high &&
      c.high > candles[i - 2].high &&
      c.high > candles[i + 1].high &&
      c.high > candles[i + 2].high
    const isSwingLow =
      c.low < candles[i - 1].low &&
      c.low < candles[i - 2].low &&
      c.low < candles[i + 1].low &&
      c.low < candles[i + 2].low

    if (isSwingHigh) swingHighs.push(c.high)
    if (isSwingLow) swingLows.push(c.low)
  }

  const resistance = swingHighs
    .filter(h => h > currentPrice)
    .sort((a, b) => a - b)
    .slice(0, 3)
    .map(v => Math.round(v * 100) / 100)

  const support = swingLows
    .filter(l => l < currentPrice)
    .sort((a, b) => b - a)
    .slice(0, 3)
    .map(v => Math.round(v * 100) / 100)

  while (resistance.length < 3) resistance.push(Math.round((currentPrice + (resistance.length + 1) * 5) * 100) / 100)
  while (support.length < 3) support.push(Math.round((currentPrice - (support.length + 1) * 5) * 100) / 100)

  return { resistance, support }
}
