import type { ParsedSignal, SignalType } from '@/types/signal'

export function parseSignalFromResponse(text: string): ParsedSignal | null {
  const signalMatch = text.match(/SIGNAL:\s*(BUY|SELL|WAIT)/i)
  if (!signalMatch) return null

  const type = signalMatch[1].toLowerCase() as SignalType

  const confidence = parseFloat(text.match(/CONFIDENCE:\s*(\d+)/i)?.[1] ?? '0')
  const entry = parseFloat(text.match(/ENTRY:\s*([\d.]+)/i)?.[1] ?? '0') || undefined
  const stopLoss = parseFloat(text.match(/STOP_LOSS:\s*([\d.]+)/i)?.[1] ?? '0') || undefined
  const tp1 = parseFloat(text.match(/TP1:\s*([\d.]+)/i)?.[1] ?? '0') || undefined
  const tp2 = parseFloat(text.match(/TP2:\s*([\d.]+)/i)?.[1] ?? '0') || undefined
  const riskReward = text.match(/RISK_REWARD:\s*([^\n]+)/i)?.[1]?.trim()
  const timeframe = text.match(/TIMEFRAME:\s*([^\n]+)/i)?.[1]?.trim()

  return {
    type,
    confidence: isNaN(confidence) ? 0 : confidence,
    entry,
    stop_loss: stopLoss,
    tp1,
    tp2,
    risk_reward: riskReward,
    timeframe,
  }
}
