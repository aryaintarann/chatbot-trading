import type { Candle } from '@/types/candle'
import type { MACDResult } from '@/types/indicator'
import { calculateEMA } from './ema'

export function calculateMACD(candles: Candle[]): MACDResult {
  const closes = candles.map(c => c.close)

  const emas12 = calculateEMA(closes, 12)
  const emas26 = calculateEMA(closes, 26)

  const offset = emas26.length - emas12.length
  const macdLine: number[] = []

  for (let i = 0; i < emas26.length; i++) {
    macdLine.push(emas12[i + offset] - emas26[i])
  }

  const signalLine = calculateEMA(macdLine, 9)
  const lastMACD = macdLine[macdLine.length - 1] ?? 0
  const lastSignal = signalLine[signalLine.length - 1] ?? 0
  const histogram = lastMACD - lastSignal

  const prevHistogram = macdLine.length > 1
    ? (macdLine[macdLine.length - 2] ?? 0) - (signalLine[signalLine.length - 2] ?? 0)
    : histogram

  let bias: MACDResult['bias']
  if (histogram > 0 && histogram > prevHistogram) bias = 'bull'
  else if (histogram < 0 && histogram < prevHistogram) bias = 'bear'
  else bias = 'neutral'

  return {
    macd: Math.round(lastMACD * 10000) / 10000,
    signal: Math.round(lastSignal * 10000) / 10000,
    histogram: Math.round(histogram * 10000) / 10000,
    bias,
  }
}
