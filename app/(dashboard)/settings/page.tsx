import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 overflow-y-auto h-full">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-xl font-bold text-white">Pengaturan</h1>
        <Link href="/dashboard" className="text-[#F5C842] text-sm hover:underline">← Dashboard</Link>
      </div>

      <div className="space-y-4">
        {/* Profile */}
        <div className="bg-[#0d1220] border border-[rgba(255,255,255,0.06)] rounded-2xl p-6">
          <h2 className="text-white font-semibold mb-4">Profil</h2>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#F5C842] rounded-full flex items-center justify-center text-black text-xl font-bold">
              {user.email?.[0]?.toUpperCase()}
            </div>
            <div>
              <p className="text-white font-medium">{user.email}</p>
              <p className="text-gray-500 text-sm">Free Plan · Bergabung {new Date(user.created_at).toLocaleDateString('id-ID')}</p>
            </div>
          </div>
        </div>

        {/* API Keys Info */}
        <div className="bg-[#0d1220] border border-[rgba(245,200,66,0.15)] rounded-2xl p-6">
          <h2 className="text-white font-semibold mb-2">Keamanan API</h2>
          <p className="text-gray-400 text-sm leading-relaxed">
            Semua API key (OpenRouter, API Ninjas) tersimpan aman di server environment Vercel dan tidak pernah dikirim ke browser.
            Kamu tidak perlu konfigurasi API key sendiri.
          </p>
          <div className="mt-3 flex items-center gap-2 text-[#22d3a0] text-sm">
            <span>✅</span>
            <span>API key aman — tidak terekspos ke client</span>
          </div>
        </div>

        {/* Rate Limits */}
        <div className="bg-[#0d1220] border border-[rgba(255,255,255,0.06)] rounded-2xl p-6">
          <h2 className="text-white font-semibold mb-4">Batas Penggunaan (Free Plan)</h2>
          <div className="space-y-3">
            {[
              { label: 'Analisa AI', limit: '20 per jam', icon: '⚡' },
              { label: 'Data OHLC', limit: '60 per jam', icon: '📊' },
              { label: 'Harga real-time', limit: 'Tidak terbatas', icon: '💰' },
            ].map(item => (
              <div key={item.label} className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm">
                  <span>{item.icon}</span>
                  <span className="text-gray-300">{item.label}</span>
                </div>
                <span className="text-gray-500 text-sm font-mono">{item.limit}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Danger zone */}
        <div className="bg-[rgba(240,84,112,0.05)] border border-[rgba(240,84,112,0.2)] rounded-2xl p-6">
          <h2 className="text-[#f05470] font-semibold mb-2">Zona Berbahaya</h2>
          <p className="text-gray-400 text-sm mb-4">Hapus semua data riwayat signal dan chat. Tindakan ini tidak dapat dibalik.</p>
          <button className="text-[#f05470] border border-[rgba(240,84,112,0.3)] px-4 py-2 rounded-lg text-sm hover:bg-[rgba(240,84,112,0.1)] transition-colors">
            Hapus Semua Data
          </button>
        </div>
      </div>
    </div>
  )
}
