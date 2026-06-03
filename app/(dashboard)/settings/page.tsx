import Link from 'next/link'

export const dynamic = 'force-dynamic'

const PERSONAL_USER_ID = process.env.PERSONAL_USER_ID ?? '00000000-0000-0000-0000-000000000001'

export default function SettingsPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8 overflow-y-auto h-full">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-xl font-bold text-white">Pengaturan</h1>
        <Link href="/dashboard" className="text-[#F5C842] text-sm hover:underline">← Dashboard</Link>
      </div>

      <div className="space-y-4">
        {/* Personal Mode */}
        <div className="bg-[#0d1220] border border-[rgba(245,200,66,0.15)] rounded-2xl p-6">
          <h2 className="text-white font-semibold mb-3">Mode Personal</h2>
          <div className="flex items-center gap-2 text-[#22d3a0] text-sm mb-3">
            <span>✅</span>
            <span>Login tidak diperlukan — akses langsung</span>
          </div>
          <p className="text-gray-500 text-xs font-mono">User ID: {PERSONAL_USER_ID}</p>
        </div>

        {/* API Keys Info */}
        <div className="bg-[#0d1220] border border-[rgba(255,255,255,0.06)] rounded-2xl p-6">
          <h2 className="text-white font-semibold mb-2">Keamanan API</h2>
          <p className="text-gray-400 text-sm leading-relaxed">
            Semua API key (OpenRouter, API Ninjas) tersimpan aman di server environment dan tidak pernah dikirim ke browser.
          </p>
          <div className="mt-3 flex items-center gap-2 text-[#22d3a0] text-sm">
            <span>✅</span>
            <span>API key aman — tidak terekspos ke client</span>
          </div>
        </div>

        {/* Rate Limits */}
        <div className="bg-[#0d1220] border border-[rgba(255,255,255,0.06)] rounded-2xl p-6">
          <h2 className="text-white font-semibold mb-4">Batas Penggunaan</h2>
          <div className="space-y-3">
            {[
              { label: 'Analisa AI', limit: 'Tidak terbatas', icon: '⚡' },
              { label: 'Data OHLC', limit: '60 per jam (cache 60 detik)', icon: '📊' },
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
      </div>
    </div>
  )
}
