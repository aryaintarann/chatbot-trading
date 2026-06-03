import type { Metadata, Viewport } from 'next'
import { Space_Mono, DM_Sans } from 'next/font/google'
import { ServiceWorkerRegister } from '@/components/layout/ServiceWorkerRegister'
import './globals.css'

const spaceMono = Space_Mono({
  variable: '--font-space-mono',
  subsets: ['latin'],
  weight: ['400', '700'],
})

const dmSans = DM_Sans({
  variable: '--font-dm-sans',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'GoldAI Scalper — XAUUSD Signal Trading',
  description: 'Signal trading XAUUSD real-time berbasis AI. Analisa multi-timeframe, confidence score, dan riwayat signal.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'GoldAI',
  },
}

export const viewport: Viewport = {
  themeColor: '#F5C842',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={`${spaceMono.variable} ${dmSans.variable} h-full`}>
      <body className="min-h-full bg-[#080c14] text-white antialiased font-sans">
        <ServiceWorkerRegister />
        {children}
      </body>
    </html>
  )
}
