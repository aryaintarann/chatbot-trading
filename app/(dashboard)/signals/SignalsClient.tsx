'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useSignals } from '@/hooks/useSignals'
import { timeAgo } from '@/lib/utils'
import type { Signal, SignalOutcome } from '@/types/signal'

interface OutcomeModalProps {
  signal: Signal
  onClose: () => void
  onSave: (id: string, outcome: SignalOutcome, pips?: number, notes?: string) => void
}

function OutcomeModal({ signal, onClose, onSave }: OutcomeModalProps) {
  const [outcome, setOutcome] = useState<SignalOutcome>('win')
  const [pips, setPips] = useState('')
  const [notes, setNotes] = useState('')

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-[#0d1220] border border-[rgba(245,200,66,0.2)] rounded-2xl p-6 w-full max-w-sm">
        <h3 className="text-white font-semibold mb-4">Input Hasil Signal</h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Hasil</label>
            <div className="flex gap-2">
              {(['win', 'loss', 'breakeven'] as SignalOutcome[]).map(o => (
                <button
                  key={o}
                  onClick={() => setOutcome(o)}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                    outcome === o
                      ? o === 'win' ? 'bg-[#22d3a0] text-black' : o === 'loss' ? 'bg-[#f05470] text-white' : 'bg-[#F5C842] text-black'
                      : 'bg-[#111827] text-gray-400 hover:bg-[rgba(255,255,255,0.05)]'
                  }`}
                >
                  {o === 'win' ? '✅ Win' : o === 'loss' ? '❌ Loss' : '🔶 BE'}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">Pips (opsional)</label>
            <input
              type="number"
              value={pips}
              onChange={e => setPips(e.target.value)}
              placeholder="18.5"
              className="w-full bg-[#111827] border border-[rgba(255,255,255,0.1)] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#F5C842]"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">Catatan (opsional)</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="TP1 tercapai di 2355..."
              rows={2}
              className="w-full bg-[#111827] border border-[rgba(255,255,255,0.1)] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#F5C842] resize-none"
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-lg text-gray-400 border border-[rgba(255,255,255,0.1)] hover:bg-[rgba(255,255,255,0.05)] text-sm transition-colors">
            Batal
          </button>
          <button
            onClick={() => {
              onSave(signal.id, outcome, pips ? parseFloat(pips) : undefined, notes || undefined)
              onClose()
            }}
            className="flex-1 py-2.5 rounded-lg bg-[#F5C842] text-black font-semibold text-sm hover:bg-[#f0be2e] transition-colors"
          >
            Simpan
          </button>
        </div>
      </div>
    </div>
  )
}

export function SignalsClient({ userId }: { userId: string }) {
  const [page, setPage] = useState(1)
  const [filterType, setFilterType] = useState('')
  const [filterOutcome, setFilterOutcome] = useState('')
  const [selectedSignal, setSelectedSignal] = useState<Signal | null>(null)

  const { signals, total, isLoading, updateOutcome } = useSignals(
    userId,
    page,
    20,
    filterType || undefined,
    filterOutcome || undefined
  )

  const wins = signals.filter(s => s.outcome === 'win').length
  const losses = signals.filter(s => s.outcome === 'loss').length
  const withOutcome = wins + losses
  const winRate = withOutcome > 0 ? Math.round((wins / withOutcome) * 100) : 0

  const signalColor = (type: string) =>
    type === 'buy' ? 'text-[#22d3a0] bg-[rgba(34,211,160,0.1)]' :
    type === 'sell' ? 'text-[#f05470] bg-[rgba(240,84,112,0.1)]' : 'text-[#F5C842] bg-[rgba(245,200,66,0.1)]'

  const outcomeColor = (outcome?: string | null) =>
    outcome === 'win' ? 'text-[#22d3a0]' : outcome === 'loss' ? 'text-[#f05470]' : outcome === 'breakeven' ? 'text-[#F5C842]' : 'text-gray-500'

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 overflow-y-auto h-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-white">Riwayat Signal</h1>
          <p className="text-gray-500 text-sm">Total: {total} signal</p>
        </div>
        <Link href="/dashboard" className="text-[#F5C842] text-sm hover:underline">← Dashboard</Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Total Signal', value: total, color: 'text-white' },
          { label: 'Win Rate', value: `${winRate}%`, color: 'text-[#22d3a0]' },
          { label: 'Win', value: wins, color: 'text-[#22d3a0]' },
          { label: 'Loss', value: losses, color: 'text-[#f05470]' },
        ].map(stat => (
          <div key={stat.label} className="bg-[#0d1220] border border-[rgba(255,255,255,0.06)] rounded-xl p-4">
            <div className="text-gray-400 text-xs mb-1">{stat.label}</div>
            <div className={`text-2xl font-bold font-mono ${stat.color}`}>{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-4 flex-wrap">
        <select
          value={filterType}
          onChange={e => { setFilterType(e.target.value); setPage(1) }}
          className="bg-[#111827] border border-[rgba(255,255,255,0.1)] text-gray-300 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-[#F5C842]"
        >
          <option value="">Semua Tipe</option>
          <option value="buy">BUY</option>
          <option value="sell">SELL</option>
          <option value="wait">WAIT</option>
        </select>
        <select
          value={filterOutcome}
          onChange={e => { setFilterOutcome(e.target.value); setPage(1) }}
          className="bg-[#111827] border border-[rgba(255,255,255,0.1)] text-gray-300 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-[#F5C842]"
        >
          <option value="">Semua Hasil</option>
          <option value="win">Win</option>
          <option value="loss">Loss</option>
          <option value="breakeven">Breakeven</option>
        </select>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="space-y-2">
          {Array(5).fill(0).map((_, i) => (
            <div key={i} className="h-16 bg-[#0d1220] rounded-xl animate-pulse" />
          ))}
        </div>
      ) : signals.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <div className="text-4xl mb-4">📭</div>
          <p>Belum ada signal. Mulai analisa dari dashboard!</p>
          <Link href="/dashboard" className="text-[#F5C842] hover:underline mt-2 inline-block">Ke Dashboard →</Link>
        </div>
      ) : (
        <div className="space-y-2">
          {signals.map(signal => (
            <div
              key={signal.id}
              className="bg-[#0d1220] border border-[rgba(255,255,255,0.06)] rounded-xl p-4 hover:border-[rgba(245,200,66,0.15)] transition-colors"
            >
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${signalColor(signal.type)}`}>
                    {signal.type.toUpperCase()}
                  </span>
                  <span className="text-gray-500 text-xs">{timeAgo(signal.created_at)}</span>
                  <span className="text-gray-500 text-xs">{signal.timeframe}</span>
                </div>
                <div className="flex items-center gap-3">
                  {signal.confidence && (
                    <span className="text-xs font-mono text-gray-400">{signal.confidence}%</span>
                  )}
                  {signal.outcome ? (
                    <span className={`text-sm font-semibold ${outcomeColor(signal.outcome)}`}>
                      {signal.outcome === 'win' ? '✅ Win' : signal.outcome === 'loss' ? '❌ Loss' : '🔶 BE'}
                      {signal.pips_result ? ` (${signal.pips_result > 0 ? '+' : ''}${signal.pips_result} pips)` : ''}
                    </span>
                  ) : (
                    <button
                      onClick={() => setSelectedSignal(signal)}
                      className="text-xs text-[#F5C842] border border-[rgba(245,200,66,0.3)] px-2 py-1 rounded-lg hover:bg-[rgba(245,200,66,0.08)] transition-colors"
                    >
                      Input Hasil
                    </button>
                  )}
                </div>
              </div>
              <div className="flex gap-4 mt-2 text-xs font-mono text-gray-500 flex-wrap">
                {signal.entry && <span>Entry: <span className="text-gray-300">{signal.entry}</span></span>}
                {signal.stop_loss && <span>SL: <span className="text-[#f05470]">{signal.stop_loss}</span></span>}
                {signal.tp1 && <span>TP1: <span className="text-[#22d3a0]">{signal.tp1}</span></span>}
                {signal.risk_reward && <span>R:R {signal.risk_reward}</span>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {total > 20 && (
        <div className="flex items-center justify-center gap-4 mt-6">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 text-sm rounded-lg bg-[#111827] text-gray-400 disabled:opacity-50 hover:bg-[rgba(255,255,255,0.08)] transition-colors"
          >
            ← Sebelumnya
          </button>
          <span className="text-gray-500 text-sm">Hal {page} dari {Math.ceil(total / 20)}</span>
          <button
            onClick={() => setPage(p => p + 1)}
            disabled={page * 20 >= total}
            className="px-4 py-2 text-sm rounded-lg bg-[#111827] text-gray-400 disabled:opacity-50 hover:bg-[rgba(255,255,255,0.08)] transition-colors"
          >
            Berikutnya →
          </button>
        </div>
      )}

      {selectedSignal && (
        <OutcomeModal
          signal={selectedSignal}
          onClose={() => setSelectedSignal(null)}
          onSave={updateOutcome}
        />
      )}
    </div>
  )
}
