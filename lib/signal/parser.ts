import type { ParsedSignal, SignalType } from '@/types/signal'

export function parseSignalFromResponse(text: string): ParsedSignal | null {
  const entry     = parseFloat(text.match(/ENTRY:\s*([\d.]+)/i)?.[1] ?? '0') || undefined
  const stopLoss  = parseFloat(text.match(/STOP_LOSS:\s*([\d.]+)/i)?.[1] ?? '0') || undefined
  const tp1       = parseFloat(text.match(/TP1:\s*([\d.]+)/i)?.[1] ?? '0') || undefined
  const tp2       = parseFloat(text.match(/TP2:\s*([\d.]+)/i)?.[1] ?? '0') || undefined
  const riskReward = text.match(/RISK_REWARD:\s*([^\n]+)/i)?.[1]?.trim()
  const timeframe  = text.match(/TIMEFRAME:\s*([^\n\(]+)/i)?.[1]?.trim()
  const confidence = parseFloat(text.match(/CONFIDENCE:\s*(\d+)/i)?.[1] ?? '0')

  // Deteksi tipe signal — 3 lapisan fallback
  let type: SignalType | null = null

  // 1. Explicit SIGNAL: tag
  const signalTag = text.match(/SIGNAL:\s*(BUY|SELL|WAIT)/i)?.[1]?.toLowerCase()
  if (signalTag) {
    type = signalTag as SignalType
  }

  // 2. Emoji/kata BUY atau SELL di baris pertama
  if (!type) {
    const firstLines = text.split('\n').slice(0, 3).join(' ')
    if (/\bSELL\b/i.test(firstLines) || /🔴/.test(firstLines)) type = 'sell'
    else if (/\bBUY\b/i.test(firstLines) || /🟢/.test(firstLines)) type = 'buy'
    else if (/\bWAIT\b/i.test(firstLines) || /⏳/.test(firstLines)) type = 'wait'
  }

  // 3. Inferensi dari posisi SL vs Entry (paling robust — tidak bisa salah)
  if (!type && entry && stopLoss) {
    type = stopLoss > entry ? 'sell' : 'buy'
  }

  // Tidak ada level entry sama sekali → kembalikan null
  if (!type || !entry) return null

  // Kalkulasi R:R otomatis jika tidak ada di teks
  let computedRR = riskReward
  if (!computedRR && entry && stopLoss && tp2) {
    const sl   = Math.abs(entry - stopLoss)
    const tp   = Math.abs(tp2 - entry)
    if (sl > 0) computedRR = `1:${(tp / sl).toFixed(1)}`
  }

  return {
    type,
    confidence: isNaN(confidence) ? 0 : confidence,
    entry,
    stop_loss: stopLoss,
    tp1,
    tp2,
    risk_reward: computedRR,
    timeframe: timeframe?.replace(/[()]/g, '').trim(),
  }
}
