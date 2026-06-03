'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { usePrice } from '@/hooks/usePrice'
import { createClient } from '@/lib/supabase/client'
import { formatPrice, formatPct } from '@/lib/utils'

interface HeaderProps {
  userEmail?: string
}

export function Header({ userEmail }: HeaderProps) {
  const router = useRouter()
  const { price, isLoading } = usePrice()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const changePositive = (price?.change ?? 0) >= 0

  return (
    <header className="flex items-center justify-between px-4 py-3 bg-[#0d1220] border-b border-[rgba(245,200,66,0.15)] z-10">
      <Link href="/dashboard" className="flex items-center gap-2">
        <span className="text-xl">⚡</span>
        <span className="font-mono text-[#F5C842] font-bold hidden sm:block">GoldAI</span>
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

      {/* User menu */}
      <div className="flex items-center gap-3">
        <Link
          href="/signals"
          className="text-gray-400 hover:text-white text-sm transition-colors hidden md:block"
        >
          Riwayat
        </Link>
        <div className="relative group">
          <button className="w-8 h-8 bg-[#F5C842] rounded-full flex items-center justify-center text-black font-bold text-sm">
            {userEmail?.[0]?.toUpperCase() ?? 'U'}
          </button>
          <div className="absolute right-0 top-full mt-2 w-48 bg-[#0d1220] border border-[rgba(245,200,66,0.15)] rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
            <div className="px-4 py-3 border-b border-[rgba(255,255,255,0.05)]">
              <p className="text-white text-sm font-medium truncate">{userEmail}</p>
              <p className="text-gray-500 text-xs">Free plan</p>
            </div>
            <Link href="/settings" className="flex items-center gap-2 px-4 py-2.5 text-gray-300 hover:text-white hover:bg-[rgba(255,255,255,0.05)] text-sm transition-colors">
              ⚙️ Pengaturan
            </Link>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-4 py-2.5 text-[#f05470] hover:bg-[rgba(240,84,112,0.1)] text-sm transition-colors text-left rounded-b-xl"
            >
              🚪 Keluar
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
