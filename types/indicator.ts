import type { Timeframe } from './candle'

export type Bias = 'bull' | 'bear' | 'neutral'

export interface RSIResult {
  value: number
  signal: 'overbought' | 'oversold' | 'bullish' | 'bearish' | 'neutral'
}

export interface EMAResult {
  ema20: number
  ema50: number
  ema200: number
  bias: Bias
  goldenCross: boolean
  deathCross: boolean
}

export interface MACDResult {
  macd: number
  signal: number
  histogram: number
  bias: Bias
}

export interface BollingerResult {
  upper: number
  middle: number
  lower: number
  percentB: number
  squeeze: boolean
  bias: Bias
}

export interface ATRResult {
  value: number
  volatility: 'low' | 'normal' | 'high' | 'extreme'
}

export interface StochasticResult {
  k: number
  d: number
  signal: 'overbought' | 'oversold' | 'bullish' | 'bearish' | 'neutral'
}

export interface SupportResistance {
  resistance: number[]
  support: number[]
}

export interface TimeframeIndicators {
  timeframe: Timeframe
  open: number
  high: number
  low: number
  close: number
  rsi: RSIResult
  ema: EMAResult
  macd: MACDResult
  bollinger: BollingerResult
  atr: ATRResult
  stochastic: StochasticResult
  bias: Bias
}

export interface MarketAnalysis {
  price: number
  bid: number
  ask: number
  change: number
  changePct: number
  timeframes: TimeframeIndicators[]
  supportResistance: SupportResistance
  confidenceScore: number
  session: string
}
