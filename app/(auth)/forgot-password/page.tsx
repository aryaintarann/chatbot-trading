'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { error: authError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback`,
    })

    if (authError) setError(authError.message)
    else setSent(true)
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#080c14] px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <span className="text-2xl">⚡</span>
            <span className="font-mono text-[#F5C842] text-2xl font-bold">GoldAI Scalper</span>
          </Link>
          <h1 className="text-2xl font-bold text-white">Reset Password</h1>
        </div>

        <div className="bg-[#0d1220] border border-[rgba(245,200,66,0.15)] rounded-2xl p-8">
          {sent ? (
            <div className="text-center">
              <div className="text-4xl mb-4">📧</div>
              <p className="text-white font-semibold mb-2">Email terkirim!</p>
              <p className="text-gray-400 text-sm">Cek inbox kamu untuk link reset password.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
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
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#F5C842] text-black py-3 rounded-lg font-bold hover:bg-[#f0be2e] transition-colors disabled:opacity-60"
              >
                {loading ? 'Mengirim...' : 'Kirim Link Reset'}
              </button>
            </form>
          )}
        </div>

        <p className="text-center text-gray-500 mt-6 text-sm">
          <Link href="/login" className="text-[#F5C842] hover:underline">
            ← Kembali ke masuk
          </Link>
        </p>
      </div>
    </div>
  )
}
