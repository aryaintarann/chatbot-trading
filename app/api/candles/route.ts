import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import type { Timeframe, CandlesResponse, Candle } from '@/types/candle'

// Yahoo Finance tidak butuh API key — gratis tanpa limit
const YAHOO_SYMBOL = 'GC=F' // Gold Futures

const TF_CONFIG: Record<Timeframe, { interval: string; range: string }> = {
  M1:  { interval: '1m',  range: '1d'  },
  M5:  { interval: '5m',  range: '5d'  },
  M15: { interval: '15m', range: '5d'  },
  H1:  { interval: '1h',  range: '1mo' },
  H4:  { interval: '1h',  range: '3mo' }, // Yahoo tidak punya 4h, gunakan 1h range lebih panjang
  D1:  { interval: '1d',  range: '6mo' },
}

const CACHE_TTL = Number(process.env.CANDLES_CACHE_TTL ?? 60)

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getServiceClient(): any {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

async function fetchFromYahoo(tf: Timeframe): Promise<Candle[]> {
  const { interval, range } = TF_CONFIG[tf]
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${YAHOO_SYMBOL}?interval=${interval}&range=${range}`

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 8000) // 8 detik timeout

  let res: Response
  try {
    res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      signal: controller.signal,
    })
  } finally {
    clearTimeout(timeout)
  }

  if (!res.ok) throw new Error(`Yahoo Finance responded ${res.status}`)

  const json = await res.json()
  const result = json?.chart?.result?.[0]
  if (!result) throw new Error('Yahoo Finance: no data in response')

  const timestamps: number[] = result.timestamp ?? []
  const quote = result.indicators?.quote?.[0] ?? {}
  const opens: (number | null)[]   = quote.open   ?? []
  const highs: (number | null)[]   = quote.high   ?? []
  const lows: (number | null)[]    = quote.low    ?? []
  const closes: (number | null)[]  = quote.close  ?? []
  const volumes: (number | null)[] = quote.volume ?? []

  const candles: Candle[] = []
  for (let i = 0; i < timestamps.length; i++) {
    // Skip candles dengan nilai null (jam pasar tutup)
    if (opens[i] == null || closes[i] == null || highs[i] == null || lows[i] == null) continue
    candles.push({
      timestamp: timestamps[i],
      open:   opens[i]!,
      high:   highs[i]!,
      low:    lows[i]!,
      close:  closes[i]!,
      volume: volumes[i] ?? 0,
    })
  }

  return candles
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const tf = (searchParams.get('tf') ?? 'M5') as Timeframe

  if (!TF_CONFIG[tf]) {
    return NextResponse.json({ error: 'Timeframe tidak valid' }, { status: 400 })
  }

  const cacheKey = `candles_${tf}`
  const supabase = getServiceClient()

  // Cek cache Supabase
  const { data: cached } = await supabase
    .from('market_cache')
    .select('data, fetched_at, expires_at')
    .eq('cache_key', cacheKey)
    .single()

  if (cached && new Date(cached.expires_at) > new Date()) {
    const ageSeconds = Math.floor((Date.now() - new Date(cached.fetched_at).getTime()) / 1000)
    const candles = (cached.data as { candles: Candle[] }).candles
    return NextResponse.json({
      timeframe: tf,
      candles,
      count: candles.length,
      cached: true,
      cache_age_seconds: ageSeconds,
    } satisfies CandlesResponse)
  }

  // Fetch dari Yahoo Finance
  try {
    const candles = await fetchFromYahoo(tf)

    const now = new Date()
    const expiresAt = new Date(now.getTime() + CACHE_TTL * 1000)

    await supabase.from('market_cache').upsert({
      cache_key: cacheKey,
      data: { candles },
      fetched_at: now.toISOString(),
      expires_at: expiresAt.toISOString(),
    }, { onConflict: 'cache_key' })

    return NextResponse.json({
      timeframe: tf,
      candles,
      count: candles.length,
      cached: false,
    } satisfies CandlesResponse)
  } catch (err) {
    console.error('[/api/candles]', err)

    // Fallback ke cache lama meskipun expired
    if (cached) {
      const candles = (cached.data as { candles: Candle[] }).candles
      return NextResponse.json({
        timeframe: tf,
        candles,
        count: candles.length,
        cached: true,
        cache_age_seconds: Math.floor((Date.now() - new Date(cached.fetched_at).getTime()) / 1000),
      } satisfies CandlesResponse)
    }

    return NextResponse.json(
      { error: `Data OHLC ${tf} tidak tersedia`, retry_after: 60 },
      { status: 503 }
    )
  }
}
