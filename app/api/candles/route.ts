import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import type { Timeframe, CandlesResponse, Candle } from '@/types/candle'

const TF_MAP: Record<Timeframe, string> = {
  M1: '1m', M5: '5m', M15: '15m', H1: '1h', H4: '4h', D1: '1d',
}

const CACHE_TTL = Number(process.env.CANDLES_CACHE_TTL ?? 60)

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getServiceClient(): any {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const tf = (searchParams.get('tf') ?? 'M5') as Timeframe
  const limit = Math.min(Number(searchParams.get('limit') ?? 100), 200)

  if (!TF_MAP[tf]) {
    return NextResponse.json({ error: 'Timeframe tidak valid' }, { status: 400 })
  }

  const cacheKey = `candles_${tf}`
  const supabase = getServiceClient()

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

  try {
    const apiRes = await fetch(
      `https://api.api-ninjas.com/v1/goldpricehistorical?interval=${TF_MAP[tf]}&limit=${limit}`,
      { headers: { 'X-Api-Key': process.env.API_NINJAS_KEY! } }
    )

    if (!apiRes.ok) throw new Error(`API Ninjas responded ${apiRes.status}`)

    const raw = await apiRes.json()
    const candles: Candle[] = Array.isArray(raw)
      ? raw.map((c: Record<string, number>) => ({
          timestamp: c.timestamp,
          open: c.open,
          high: c.high,
          low: c.low,
          close: c.close,
          volume: c.volume ?? 0,
        }))
      : []

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
