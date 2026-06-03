import { NextResponse } from 'next/server'

const CACHE_SECONDS = Number(process.env.PRICE_REVALIDATE ?? 5)

interface PriceCache {
  data: Record<string, number | boolean | string>
  expiresAt: number
}

let priceCache: PriceCache | null = null

export async function GET() {
  const now = Date.now()

  if (priceCache && priceCache.expiresAt > now) {
    return NextResponse.json({ ...priceCache.data, cached: true })
  }

  try {
    const res = await fetch('https://api.gold-api.com/price/XAU', {
      next: { revalidate: CACHE_SECONDS },
    })

    if (!res.ok) throw new Error(`gold-api.com responded ${res.status}`)

    const raw = await res.json()

    const data = {
      price: raw.price ?? 0,
      bid: raw.bid ?? raw.price ?? 0,
      ask: raw.ask ?? raw.price ?? 0,
      high: raw.high ?? 0,
      low: raw.low ?? 0,
      change: raw.ch ?? 0,
      change_pct: raw.chp ?? 0,
      cached: false,
      fetched_at: new Date().toISOString(),
    }

    priceCache = { data, expiresAt: now + CACHE_SECONDS * 1000 }

    return NextResponse.json(data)
  } catch (err) {
    if (priceCache) {
      return NextResponse.json({ ...priceCache.data, cached: true, stale: true })
    }
    console.error('[/api/price]', err)
    return NextResponse.json({ error: 'Harga tidak tersedia' }, { status: 503 })
  }
}
