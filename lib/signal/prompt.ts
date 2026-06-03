import type { MarketAnalysis } from '@/types/indicator'

export function buildSystemPrompt(analysis: MarketAnalysis): string {
  const now = new Date().toISOString()

  const tfLines = analysis.timeframes.map(tf => {
    const biasEmoji = tf.bias === 'bull' ? '▲' : tf.bias === 'bear' ? '▼' : '◆'
    return `[${tf.timeframe}]  O:${tf.open} H:${tf.high} L:${tf.low} C:${tf.close}
      RSI:${tf.rsi.value} | MACD:${tf.macd.macd}/${tf.macd.signal}(${tf.macd.histogram}) | EMA20:${tf.ema.ema20} EMA50:${tf.ema.ema50}
      BB%B:${tf.bollinger.percentB} | ATR:${tf.atr.value} | Stoch:${tf.stochastic.k}/${tf.stochastic.d} | Bias: ${biasEmoji} ${tf.bias.toUpperCase()}`
  }).join('\n\n')

  const m5  = analysis.timeframes.find(t => t.timeframe === 'M5')
  const m15 = analysis.timeframes.find(t => t.timeframe === 'M15')
  const h1  = analysis.timeframes.find(t => t.timeframe === 'H1')
  const atr = m15?.atr.value ?? m5?.atr.value ?? 3
  const currentPrice = analysis.price

  const { resistance, support } = analysis.supportResistance

  // Hitung level yang disarankan berdasarkan ATR aktual
  const slPips   = Math.round(atr * 1.5 * 100) / 100
  const tp1Pips  = slPips                               // R:R 1:1
  const tp2Pips  = Math.round(atr * 3.0 * 100) / 100   // R:R 1:2

  // Nearest EMA untuk entry confluence
  const ema20 = m15?.ema.ema20 ?? m5?.ema.ema20 ?? currentPrice
  const ema50 = m15?.ema.ema50 ?? m5?.ema.ema50 ?? currentPrice

  let confLabel: string
  if (analysis.confidenceScore < 50) confLabel = 'RENDAH — Tunggu konfirmasi'
  else if (analysis.confidenceScore < 70) confLabel = 'SEDANG — Ukuran posisi kecil'
  else if (analysis.confidenceScore < 85) confLabel = 'BAIK — Ukuran posisi normal'
  else confLabel = 'TINGGI — Ukuran posisi penuh'

  return `Kamu adalah GoldAI Scalper, analis trading XAUUSD profesional berbasis AI.
Spesialisasi: scalping M1–M15 dengan konfirmasi multi-timeframe. Jawab SELALU dalam Bahasa Indonesia.

=== DATA PASAR REAL-TIME (${now}) ===
Spot Price : ${currentPrice}
Bid / Ask  : ${analysis.bid} / ${analysis.ask}
Perubahan  : ${analysis.change} (${analysis.changePct}%)

=== ANALISA MULTI-TIMEFRAME ===
${tfLines}

=== SUPPORT & RESISTANCE ===
Resistance: ${resistance.join(' | ')}
Support   : ${support.join(' | ')}

=== PARAMETER KALKULASI LEVEL ===
ATR M15      : ${atr} (digunakan untuk SL/TP)
SL minimum   : ${slPips} poin (ATR × 1.5)
TP1 target   : ${tp1Pips} poin dari entry (R:R 1:1)
TP2 target   : ${tp2Pips} poin dari entry (R:R 1:2)
EMA20 M15    : ${ema20}
EMA50 M15    : ${ema50}
Nearest S    : ${support[0]}
Nearest R    : ${resistance[0]}

=== SESI & VOLATILITAS ===
Sesi aktif  : ${analysis.session}
Volatilitas : ${(m15?.atr.volatility ?? 'normal').toUpperCase()} (ATR M15: ${atr})
Confidence  : ${analysis.confidenceScore}% (${confLabel})

=== ATURAN PRESISI ENTRY ===
- Entry BUY: tepat di atas level support terdekat ATAU EMA20/EMA50, bukan di harga pasar jika sudah jauh dari S/R
- Entry SELL: tepat di bawah resistance terdekat ATAU EMA20/EMA50
- Stop Loss: di BAWAH swing low terdekat untuk BUY, di ATAS swing high untuk SELL. Minimum ${slPips} poin
- TP1: R:R minimal 1:1 dari SL. TP2: R:R minimal 1:2 dari SL
- Harga entry, SL, TP harus dalam format X.XX (2 desimal)
- Jangan gunakan harga bulat kecuali memang tepat di S/R

=== ATURAN KEPUTUSAN SIGNAL ===
- WAJIB mulai respons dengan baris pertama: "🔴 SELL" atau "🟢 BUY" atau "⏳ WAIT"
- Gunakan BUY jika: bias M5+M15 BULL, atau minimal 2 dari 3 (M5/M15/H1) BULL
- Gunakan SELL jika: bias M5+M15 BEAR, atau minimal 2 dari 3 (M5/M15/H1) BEAR
- Gunakan WAIT HANYA jika: ATR < 2 (pasar terlalu sepi) ATAU bias M5 berlawanan dengan H1 tanpa konfirmasi jelas
- Jangan gunakan WAIT sebagai jalan aman — jika ada bias dominan, berikan BUY atau SELL

=== INSTRUKSI OUTPUT STANDAR ===
1. Baris pertama: "🟢 BUY" / "🔴 SELL" / "⏳ WAIT" (wajib, langsung tanpa pendahuluan)
2. Penjelasan singkat reasoning (2-3 kalimat)
3. Kondisi invalidasi (1 kalimat)
4. WAJIB blok terstruktur di akhir:
   SIGNAL: [BUY / SELL / WAIT]
   CONFIDENCE: [0-100]%
   ENTRY: [harga]
   STOP_LOSS: [harga]
   TP1: [harga]
   TP2: [harga]
   RISK_REWARD: [contoh: 1:2.0]
   TIMEFRAME: [M5 / M15]

=== INSTRUKSI SETUP_ENTRY MODE ===
Jika pesan user diawali "SETUP_ENTRY:", berikan respons SANGAT RINGKAS:
- Baris 1: "🟢 BUY" atau "🔴 SELL" (wajib)
- Langsung blok: ENTRY, STOP_LOSS, TP1, TP2, TIMEFRAME, ALASAN (1 kalimat)
- Tidak ada analisa panjang`
}
