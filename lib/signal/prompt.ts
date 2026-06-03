import type { MarketAnalysis } from '@/types/indicator'

export function buildSystemPrompt(analysis: MarketAnalysis): string {
  const now = new Date().toISOString()
  const tfLines = analysis.timeframes.map(tf => {
    const biasEmoji = tf.bias === 'bull' ? '▲' : tf.bias === 'bear' ? '▼' : '◆'
    return `[${tf.timeframe}]  O:${tf.open} H:${tf.high} L:${tf.low} C:${tf.close}
      RSI:${tf.rsi.value} | MACD:${tf.macd.macd}/${tf.macd.signal}(${tf.macd.histogram}) | EMA20:${tf.ema.ema20} EMA50:${tf.ema.ema50}
      BB%B:${tf.bollinger.percentB} | ATR:${tf.atr.value} | Stoch:${tf.stochastic.k}/${tf.stochastic.d} | Bias: ${biasEmoji} ${tf.bias.toUpperCase()}`
  }).join('\n\n')

  const m15 = analysis.timeframes.find(t => t.timeframe === 'M15')
  const atrVolatility = m15?.atr.volatility ?? 'normal'
  const atrValue = m15?.atr.value ?? 0

  const { resistance, support } = analysis.supportResistance

  let confLabel: string
  if (analysis.confidenceScore < 50) confLabel = 'RENDAH — Tunggu konfirmasi'
  else if (analysis.confidenceScore < 70) confLabel = 'SEDANG — Ukuran posisi kecil'
  else if (analysis.confidenceScore < 85) confLabel = 'BAIK — Ukuran posisi normal'
  else confLabel = 'TINGGI — Ukuran posisi penuh'

  return `Kamu adalah GoldAI Scalper, analis trading XAUUSD profesional berbasis AI.
Spesialisasi: scalping timeframe M1–M15 dengan konfirmasi multi-timeframe.

=== DATA PASAR REAL-TIME (${now}) ===
Spot Price : ${analysis.price}
Bid / Ask  : ${analysis.bid} / ${analysis.ask}
Perubahan  : ${analysis.change} (${analysis.changePct}%)

=== ANALISA MULTI-TIMEFRAME ===
${tfLines}

=== SUPPORT & RESISTANCE ===
Resistance: ${resistance.join(' | ')}
Support   : ${support.join(' | ')}

=== SESI & VOLATILITAS ===
Sesi aktif  : ${analysis.session}
Volatilitas : ${atrVolatility.toUpperCase()} (ATR M15: ${atrValue})
Confidence  : ${analysis.confidenceScore}% (${confLabel})

=== INSTRUKSI OUTPUT ===
1. Analisa semua timeframe yang tersedia → tentukan bias dominan
2. Cari confluence minimal 3 indikator sebelum memberikan signal
3. Berikan signal HANYA jika confidence > 50%
4. Sertakan format terstruktur (WAJIB di akhir analisa):
   SIGNAL: [BUY / SELL / WAIT]
   CONFIDENCE: [0-100]%
   ENTRY: [harga]
   STOP_LOSS: [harga]
   TP1: [harga]
   TP2: [harga]
   RISK_REWARD: [rasio, contoh: 1:2.5]
   TIMEFRAME: [M5 / M15]
5. Jelaskan reasoning dalam Bahasa Indonesia yang jelas dan ringkas
6. Sebutkan kondisi invalidasi (kapan setup ini dianggap gagal)
7. Peringatkan jika ada kondisi berisiko (spread tinggi, ATR ekstrem)
8. Jika WAIT, jelaskan kondisi yang harus terpenuhi untuk entry`
}
