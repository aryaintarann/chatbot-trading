import type { Candle } from '@/types/candle'
import type { BollingerResult } from '@/types/indicator'

export function calculateBollinger(candles: Candle[], period = 20, stdDev = 2): BollingerResult {
  if (candles.length < period) {
    const close = candles[candles.length - 1]?.close ?? 0
    return { upper: close, middle: close, lower: close, percentB: 0.5, squeeze: false, bias: 'neutral' }
  }

  const closes = candles.map(c => c.close)
  const recent = closes.slice(-period)

  const sma = recent.reduce((a, b) => a + b, 0) / period
  const variance = recent.reduce((sum, v) => sum + Math.pow(v - sma, 2), 0) / period
  const std = Math.sqrt(variance)

  const upper = sma + stdDev * std
  const lower = sma - stdDev * std
  const currentClose = closes[closes.length - 1]
  const percentB = (upper - lower) === 0 ? 0.5 : (currentClose - lower) / (upper - lower)

  const bandWidth = (upper - lower) / sma
  const squeeze = bandWidth < 0.02

  let bias: BollingerResult['bias']
  if (currentClose > upper) bias = 'bear'
  else if (currentClose < lower) bias = 'bull'
  else if (percentB > 0.5) bias = 'bull'
  else bias = 'bear'

  return {
    upper: Math.round(upper * 100) / 100,
    middle: Math.round(sma * 100) / 100,
    lower: Math.round(lower * 100) / 100,
    percentB: Math.round(percentB * 1000) / 1000,
    squeeze,
    bias,
  }
}
