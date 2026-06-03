export interface Candle {
  timestamp: number
  open: number
  high: number
  low: number
  close: number
  volume?: number
}

export type Timeframe = 'M1' | 'M5' | 'M15' | 'H1' | 'H4' | 'D1'

export interface CandlesResponse {
  timeframe: Timeframe
  candles: Candle[]
  count: number
  cached: boolean
  cache_age_seconds?: number
}

export interface PriceResponse {
  price: number
  bid: number
  ask: number
  high: number
  low: number
  change: number
  change_pct: number
  cached: boolean
  fetched_at: string
}
