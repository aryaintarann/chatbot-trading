'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function RegisterPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (authError) {
      setError(authError.message)
      setLoading(false)
    } else {
      setSuccess(true)
      setLoading(false)
    }
  }

  async function handleGoogle() {
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#080c14] px-4">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-6">📧</div>
          <h2 className="text-2xl font-bold text-white mb-4">Cek email kamu!</h2>
          <p className="text-gray-400 mb-6">
            Kami sudah mengirim link konfirmasi ke <strong className="text-white">{email}</strong>.
            Klik link tersebut untuk mengaktifkan akun.
          </p>
          <Link href="/login" className="text-[#F5C842] hover:underline text-sm">
            Kembali ke halaman masuk
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#080c14] px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <span className="text-2xl">⚡</span>
            <span className="font-mono text-[#F5C842] text-2xl font-bold">GoldAI Scalper</span>
          </Link>
          <h1 className="text-2xl font-bold text-white">Buat akun gratis</h1>
          <p className="text-gray-400 mt-2">Mulai analisa XAUUSD dalam 60 detik</p>
        </div>

        <div className="bg-[#0d1220] border border-[rgba(245,200,66,0.15)] rounded-2xl p-8">
          <form onSubmit={handleRegister} className="space-y-5">
            {error && (
              <div className="bg-[rgba(240,84,112,0.1)] border border-[#f05470] text-[#f05470] text-sm p-3 rounded-lg">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm text-gray-400 mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="trader@email.com"
                className="w-full bg-[#111827] border border-[rgba(255,255,255,0.1)] rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-[#F5C842] transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                minLength={6}
                placeholder="Minimal 6 karakter"
                className="w-full bg-[#111827] border border-[rgba(255,255,255,0.1)] rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-[#F5C842] transition-colors"
              />
            </div>

            <p className="text-xs text-gray-500">
              Dengan mendaftar, kamu setuju bahwa ini adalah alat bantu analisa, bukan saran investasi.
            </p>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#F5C842] text-black py-3 rounded-lg font-bold hover:bg-[#f0be2e] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? 'Membuat akun...' : 'Daftar Gratis'}
            </button>
          </form>

          <div className="my-6 flex items-center gap-4">
            <div className="flex-1 h-px bg-[rgba(255,255,255,0.1)]"></div>
            <span className="text-gray-500 text-sm">atau</span>
            <div className="flex-1 h-px bg-[rgba(255,255,255,0.1)]"></div>
          </div>

          <button
            onClick={handleGoogle}
            className="w-full border border-[rgba(255,255,255,0.15)] text-white py-3 rounded-lg font-medium hover:bg-[rgba(255,255,255,0.05)] transition-colors flex items-center justify-center gap-3"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Lanjut dengan Google
          </button>
        </div>

        <p className="text-center text-gray-500 mt-6 text-sm">
          Sudah punya akun?{' '}
          <Link href="/login" className="text-[#F5C842] hover:underline">
            Masuk
          </Link>
        </p>
      </div>
    </div>
  )
}
