import type { Candle } from '@/types/candle'
import type { EMAResult } from '@/types/indicator'

export function calculateEMA(values: number[], period: number): number[] {
  if (values.length < period) return []

  const multiplier = 2 / (period + 1)
  const emas: number[] = []

  let sum = 0
  for (let i = 0; i < period; i++) sum += values[i]
  emas.push(sum / period)

  for (let i = period; i < values.length; i++) {
    emas.push((values[i] - emas[emas.length - 1]) * multiplier + emas[emas.length - 1])
  }

  return emas
}

export function calculateEMAIndicator(candles: Candle[]): EMAResult {
  const closes = candles.map(c => c.close)
  const currentClose = closes[closes.length - 1]

  const emas20 = calculateEMA(closes, 20)
  const emas50 = calculateEMA(closes, 50)
  const emas200 = calculateEMA(closes, 200)

  const ema20 = emas20[emas20.length - 1] ?? currentClose
  const ema50 = emas50[emas50.length - 1] ?? currentClose
  const ema200 = emas200[emas200.length - 1] ?? currentClose

  const prevEma20 = emas20[emas20.length - 2] ?? ema20
  const prevEma50 = emas50[emas50.length - 2] ?? ema50

  const goldenCross = prevEma20 <= prevEma50 && ema20 > ema50
  const deathCross = prevEma20 >= prevEma50 && ema20 < ema50

  let bias: EMAResult['bias']
  if (currentClose > ema20 && ema20 > ema50 && ema50 > ema200) bias = 'bull'
  else if (currentClose < ema20 && ema20 < ema50 && ema50 < ema200) bias = 'bear'
  else bias = 'neutral'

  return {
    ema20: Math.round(ema20 * 100) / 100,
    ema50: Math.round(ema50 * 100) / 100,
    ema200: Math.round(ema200 * 100) / 100,
    bias,
    goldenCross,
    deathCross,
  }
}
