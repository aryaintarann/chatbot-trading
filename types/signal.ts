export type SignalType = 'buy' | 'sell' | 'wait'
export type SignalOutcome = 'win' | 'loss' | 'breakeven'

export interface Signal {
  id: string
  user_id: string
  created_at: string
  type: SignalType
  confidence: number
  timeframe: string
  session?: string
  entry?: number
  stop_loss?: number
  tp1?: number
  tp2?: number
  risk_reward?: string
  price_at?: number
  bias_m1?: string
  bias_m5?: string
  bias_m15?: string
  bias_h1?: string
  bias_h4?: string
  bias_d1?: string
  rsi_m15?: number
  atr_m15?: number
  outcome?: SignalOutcome
  pips_result?: number
  notes?: string
  ai_analysis?: string
}

export interface ParsedSignal {
  type: SignalType
  confidence: number
  entry?: number
  stop_loss?: number
  tp1?: number
  tp2?: number
  risk_reward?: string
  timeframe?: string
}

export interface ChatMessage {
  id: string
  user_id: string
  created_at: string
  role: 'user' | 'assistant'
  content: string
  signal_id?: string
}
