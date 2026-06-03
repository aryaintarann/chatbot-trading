import type { Candle, Timeframe } from '@/types/candle'
import type { TimeframeIndicators, MarketAnalysis, Bias } from '@/types/indicator'
import { calculateRSI } from './rsi'
import { calculateEMAIndicator } from './ema'
import { calculateMACD } from './macd'
import { calculateBollinger } from './bollinger'
import { calculateATR } from './atr'
import { calculateStochastic } from './stochastic'
import { calculateSupportResistance } from './support-resistance'

export function calculateTimeframeIndicators(
  timeframe: Timeframe,
  candles: Candle[]
): TimeframeIndicators {
  const last = candles[candles.length - 1]

  const rsi = calculateRSI(candles)
  const ema = calculateEMAIndicator(candles)
  const macd = calculateMACD(candles)
  const bollinger = calculateBollinger(candles)
  const atr = calculateATR(candles)
  const stochastic = calculateStochastic(candles)

  const bullSignals = [rsi, ema, macd, bollinger, stochastic].filter(
    (ind) => 'bias' in ind ? ind.bias === 'bull' : ind.signal === 'bullish' || ind.signal === 'oversold'
  ).length

  const bearSignals = [rsi, ema, macd, bollinger, stochastic].filter(
    (ind) => 'bias' in ind ? ind.bias === 'bear' : ind.signal === 'bearish' || ind.signal === 'overbought'
  ).length

  let bias: Bias
  if (bullSignals > bearSignals + 1) bias = 'bull'
  else if (bearSignals > bullSignals + 1) bias = 'bear'
  else bias = 'neutral'

  return {
    timeframe,
    open: last.open,
    high: last.high,
    low: last.low,
    close: last.close,
    rsi,
    ema,
    macd,
    bollinger,
    atr,
    stochastic,
    bias,
  }
}

export function calculateAll(
  candlesMap: Record<Timeframe, Candle[]>,
  priceData: { price: number; bid: number; ask: number; change: number; changePct: number }
): MarketAnalysis {
  const timeframes: Timeframe[] = ['M1', 'M5', 'M15', 'H1', 'H4', 'D1']
  const timeframeIndicators: TimeframeIndicators[] = []

  for (const tf of timeframes) {
    const candles = candlesMap[tf]
    if (candles && candles.length >= 14) {
      timeframeIndicators.push(calculateTimeframeIndicators(tf, candles))
    }
  }

  const h4Candles = candlesMap['H4'] ?? []
  const d1Candles = candlesMap['D1'] ?? []
  const combinedCandles = [...h4Candles, ...d1Candles]
  const supportResistance = calculateSupportResistance(
    combinedCandles.length > 0 ? combinedCandles : Object.values(candlesMap).flat(),
    priceData.price
  )

  const confidenceScore = calculateConfidence(timeframeIndicators)
  const session = getCurrentSession()

  return {
    price: priceData.price,
    bid: priceData.bid,
    ask: priceData.ask,
    change: priceData.change,
    changePct: priceData.changePct,
    timeframes: timeframeIndicators,
    supportResistance,
    confidenceScore,
    session,
  }
}

function calculateConfidence(timeframes: TimeframeIndicators[]): number {
  if (timeframes.length === 0) return 0

  const m5 = timeframes.find(t => t.timeframe === 'M5')
  const m15 = timeframes.find(t => t.timeframe === 'M15')
  const h1 = timeframes.find(t => t.timeframe === 'H1')
  const h4 = timeframes.find(t => t.timeframe === 'H4')

  if (!m15) return 0

  const dominantBias = m15.bias
  if (dominantBias === 'neutral') return 30

  let score = 0

  if (m15.rsi.signal === 'bullish' || m15.rsi.signal === 'oversold') {
    if (dominantBias === 'bull') score += 10
  } else if (m15.rsi.signal === 'bearish' || m15.rsi.signal === 'overbought') {
    if (dominantBias === 'bear') score += 10
  }

  if (m15.macd.bias === dominantBias) score += 15

  if (
    (dominantBias === 'bull' && m15.ema.bias === 'bull') ||
    (dominantBias === 'bear' && m15.ema.bias === 'bear')
  ) score += 20

  if (m15.bollinger.bias === dominantBias) score += 10

  if (m15.stochastic.signal === 'bullish' && dominantBias === 'bull') score += 10
  else if (m15.stochastic.signal === 'bearish' && dominantBias === 'bear') score += 10

  if (m5 && m15 && m5.bias === m15.bias && m15.bias !== 'neutral') score += 15

  if (h1 && h1.bias === dominantBias) score += 10

  if (h4 && h4.bias === dominantBias) score += 10

  return Math.min(100, score)
}

function getCurrentSession(): string {
  const now = new Date()
  const utcHour = now.getUTCHours()
  const wibHour = (utcHour + 7) % 24

  if (wibHour >= 8 && wibHour < 16) return 'Asia (08:00–16:00 WIB)'
  if (wibHour >= 14 && wibHour < 22) return 'London (14:00–22:00 WIB)'
  if (wibHour >= 20 || wibHour < 5) return 'New York (20:00–05:00 WIB)'
  return 'Transisi'
}

export { calculateRSI, calculateEMAIndicator, calculateMACD, calculateBollinger, calculateATR, calculateStochastic, calculateSupportResistance }
