import Link from 'next/link'

export default function LandingPage() {
  return (
    <main className="min-h-screen flex flex-col bg-[#080c14]">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-[rgba(245,200,66,0.15)]">
        <div className="flex items-center gap-2">
          <span className="text-2xl">⚡</span>
          <span className="font-mono text-[#F5C842] text-xl font-bold">GoldAI</span>
          <span className="text-gray-400 text-sm">Scalper</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-gray-300 hover:text-white text-sm transition-colors">
            Masuk
          </Link>
          <Link
            href="/register"
            className="bg-[#F5C842] text-black px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#f0be2e] transition-colors"
          >
            Mulai Gratis
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-6 py-24">
        <div className="inline-flex items-center gap-2 bg-[rgba(245,200,66,0.1)] border border-[rgba(245,200,66,0.3)] rounded-full px-4 py-1.5 mb-8">
          <span className="w-2 h-2 bg-[#22d3a0] rounded-full animate-pulse"></span>
          <span className="text-[#F5C842] text-sm font-mono">Live Signal Engine Active</span>
        </div>

        <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
          <span className="text-white">Signal Trading</span>
          <br />
          <span className="text-[#F5C842] font-mono">XAUUSD</span>
          <br />
          <span className="text-white">Berbasis AI</span>
        </h1>

        <p className="text-gray-400 text-lg md:text-xl max-w-2xl mb-10 leading-relaxed">
          Analisa multi-timeframe M1–D1 secara otomatis. Entry, Stop Loss, dan Take Profit
          presisi dalam kurang dari 60 detik. Didukung DeepSeek AI.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mb-16">
          <Link
            href="/register"
            className="bg-[#F5C842] text-black px-8 py-4 rounded-xl text-lg font-bold hover:bg-[#f0be2e] transition-all hover:scale-105"
          >
            ⚡ Mulai Analisa Gratis
          </Link>
          <Link
            href="/login"
            className="border border-[rgba(245,200,66,0.3)] text-[#F5C842] px-8 py-4 rounded-xl text-lg font-semibold hover:bg-[rgba(245,200,66,0.05)] transition-colors"
          >
            Sudah punya akun
          </Link>
        </div>

        {/* Feature cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl w-full">
          {[
            {
              icon: '📊',
              title: '6 Timeframe Sekaligus',
              desc: 'Analisa M1, M5, M15, H1, H4, D1 secara paralel untuk konfirmasi terbaik',
            },
            {
              icon: '🎯',
              title: 'Entry Presisi',
              desc: 'Signal BUY/SELL/WAIT dengan level Entry, SL, TP1, TP2 berbasis ATR',
            },
            {
              icon: '🛡️',
              title: 'Risk Management',
              desc: 'Confidence score 0-100% dari confluence indikator RSI, EMA, MACD, BB, Stoch',
            },
          ].map((f) => (
            <div
              key={f.title}
              className="bg-[#0d1220] border border-[rgba(245,200,66,0.1)] rounded-xl p-6 text-left hover:border-[rgba(245,200,66,0.3)] transition-colors"
            >
              <div className="text-3xl mb-3">{f.icon}</div>
              <h3 className="text-white font-semibold mb-2">{f.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center py-6 text-gray-600 text-sm border-t border-[rgba(245,200,66,0.1)]">
        GoldAI Scalper · XAUUSD Signal Trading · Bukan saran investasi
      </footer>
    </main>
  )
}
