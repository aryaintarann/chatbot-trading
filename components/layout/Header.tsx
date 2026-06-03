'use client'

import Link from 'next/link'
import { usePrice } from '@/hooks/usePrice'
import { formatPrice, formatPct } from '@/lib/utils'

export function Header() {
  const { price, isLoading } = usePrice()
  const changePositive = (price?.change ?? 0) >= 0

  return (
    <header className="flex items-center justify-between px-4 py-3 bg-[#0d1220] border-b border-[rgba(245,200,66,0.15)] z-10">
      <Link href="/dashboard" className="flex items-center gap-2">
        <span className="text-xl">⚡</span>
        <span className="font-mono text-[#F5C842] font-bold">GoldAI</span>
        <span className="text-gray-500 text-xs hidden sm:block">Scalper</span>
      </Link>

      {/* Live Price */}
      <div className="flex items-center gap-3 bg-[#111827] rounded-xl px-4 py-2 border border-[rgba(245,200,66,0.1)]">
        <div className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 bg-[#22d3a0] rounded-full animate-pulse"></span>
          <span className="text-gray-400 text-xs font-mono">XAUUSD</span>
        </div>
        {isLoading ? (
          <div className="w-24 h-5 bg-[rgba(255,255,255,0.05)] rounded animate-pulse"></div>
        ) : (
          <>
            <span className="text-white font-mono font-bold text-lg">
              {formatPrice(price?.price ?? 0)}
            </span>
            <span className={`text-xs font-mono ${changePositive ? 'text-[#22d3a0]' : 'text-[#f05470]'}`}>
              {formatPct(price?.change_pct ?? 0)}
            </span>
          </>
        )}
      </div>

      <Link
        href="/signals"
        className="text-gray-400 hover:text-white text-sm transition-colors"
      >
        📋 Riwayat
      </Link>
    </header>
  )
}
