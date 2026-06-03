import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import type { Timeframe, Candle } from '@/types/candle'
import { calculateAll } from '@/lib/indicators'
import { buildSystemPrompt } from '@/lib/signal/prompt'
import { parseSignalFromResponse } from '@/lib/signal/parser'

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions'
const PRIMARY_MODEL = process.env.OPENROUTER_PRIMARY_MODEL ?? 'google/gemma-4-31b-it:free'
const FALLBACK_MODEL = process.env.OPENROUTER_FALLBACK_MODEL ?? 'moonshotai/kimi-k2.6:free'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getServiceClient(): any {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

async function fetchJson(url: string): Promise<unknown> {
  const res = await fetch(url)
  if (!res.ok) return null
  return res.json()
}

export async function POST(request: NextRequest) {
  const userId = request.headers.get('x-user-id')
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = getServiceClient()

  const oneHourAgo = new Date(Date.now() - 3600000).toISOString()
  const { count } = await supabase
    .from('signals')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('created_at', oneHourAgo)

  const rateLimit = Number(process.env.ANALYZE_RATE_LIMIT ?? 20)
  if ((count ?? 0) >= rateLimit) {
    return NextResponse.json({
      error: 'Rate limit exceeded',
      retry_after: 3600,
      message: `Kamu telah mencapai batas ${rateLimit} analisa per jam. Coba lagi dalam 60 menit.`,
    }, { status: 429 })
  }

  const body = await request.json()
  const userMessage: string = body.message ?? 'Analisa pasar XAUUSD sekarang'
  const history: Array<{ role: string; content: string }> = body.history ?? []

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

  const [priceData, ...candleResponses] = await Promise.all([
    fetchJson(`${baseUrl}/api/price`),
    ...(['M1', 'M5', 'M15', 'H1', 'H4', 'D1'] as Timeframe[]).map(tf =>
      fetchJson(`${baseUrl}/api/candles?tf=${tf}&limit=100`)
    ),
  ])

  if (!priceData) {
    return NextResponse.json({ error: 'Data harga tidak tersedia' }, { status: 503 })
  }

  const pd = priceData as Record<string, number>
  const candlesMap: Record<Timeframe, Candle[]> = {
    M1: ((candleResponses[0] as { candles?: Candle[] })?.candles ?? []),
    M5: ((candleResponses[1] as { candles?: Candle[] })?.candles ?? []),
    M15: ((candleResponses[2] as { candles?: Candle[] })?.candles ?? []),
    H1: ((candleResponses[3] as { candles?: Candle[] })?.candles ?? []),
    H4: ((candleResponses[4] as { candles?: Candle[] })?.candles ?? []),
    D1: ((candleResponses[5] as { candles?: Candle[] })?.candles ?? []),
  }

  const analysis = calculateAll(candlesMap, {
    price: pd.price,
    bid: pd.bid,
    ask: pd.ask,
    change: pd.change,
    changePct: pd.change_pct,
  })

  const systemPrompt = buildSystemPrompt(analysis)
  const recentHistory = history.slice(-10)

  async function callOpenRouter(model: string): Promise<Response> {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 15000) // 15 detik timeout per model
    try {
      const res = await fetch(OPENROUTER_URL, {
        method: 'POST',
        signal: controller.signal,
        headers: {
          'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL ?? 'https://goldai-scalper.vercel.app',
          'X-Title': 'GoldAI Scalper',
        },
        body: JSON.stringify({
          model,
          max_tokens: 1500,
          temperature: 0.3,
          stream: true,
          messages: [
            { role: 'system', content: systemPrompt },
            ...recentHistory,
            { role: 'user', content: userMessage },
          ],
        }),
      })
      clearTimeout(timeout)
      return res
    } catch (err) {
      clearTimeout(timeout)
      throw err
    }
  }

  const MODEL_CHAIN = [
    PRIMARY_MODEL,
    FALLBACK_MODEL,
    'nvidia/nemotron-3-super-120b-a12b:free',
  ].filter((m, i, arr) => arr.indexOf(m) === i) // deduplicate

  let aiResponse: Response | null = null
  for (const model of MODEL_CHAIN) {
    try {
      const res = await callOpenRouter(model)
      if (res.ok) { aiResponse = res; break }
      const errBody = await res.text().catch(() => '')
      console.warn(`[analyze] ${model} → ${res.status}: ${errBody.slice(0, 120)}`)
    } catch (err) {
      console.warn(`[analyze] ${model} → timeout/network error:`, (err as Error).message)
    }
  }

  if (!aiResponse || !aiResponse.body) {
    return NextResponse.json(
      { error: 'Semua model AI tidak tersedia saat ini. Coba lagi dalam beberapa menit.' },
      { status: 503 }
    )
  }

  const m15 = analysis.timeframes.find(t => t.timeframe === 'M15')
  const reader = aiResponse.body.getReader()

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder()
      const decoder = new TextDecoder()
      let fullText = ''

      try {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const text = decoder.decode(value, { stream: true })
          const lines = text.split('\n').filter(l => l.startsWith('data: '))

          for (const line of lines) {
            const jsonStr = line.slice(6)
            if (jsonStr.trim() === '[DONE]') continue

            try {
              const parsed = JSON.parse(jsonStr)
              const content = parsed.choices?.[0]?.delta?.content ?? ''
              if (content) {
                fullText += content
                controller.enqueue(
                  encoder.encode(`data: ${JSON.stringify({ type: 'delta', content })}\n\n`)
                )
              }
            } catch {
              // skip malformed SSE chunks
            }
          }
        }

        const parsedSignal = parseSignalFromResponse(fullText)

        if (parsedSignal) {
          await supabase.from('signals').insert({
            type: parsedSignal.type,
            confidence: parsedSignal.confidence,
            timeframe: parsedSignal.timeframe ?? 'M15',
            entry: parsedSignal.entry ?? null,
            stop_loss: parsedSignal.stop_loss ?? null,
            tp1: parsedSignal.tp1 ?? null,
            tp2: parsedSignal.tp2 ?? null,
            risk_reward: parsedSignal.risk_reward ?? null,
            session: analysis.session,
            price_at: analysis.price,
            bias_m1: analysis.timeframes.find(t => t.timeframe === 'M1')?.bias ?? null,
            bias_m5: analysis.timeframes.find(t => t.timeframe === 'M5')?.bias ?? null,
            bias_m15: m15?.bias ?? null,
            bias_h1: analysis.timeframes.find(t => t.timeframe === 'H1')?.bias ?? null,
            bias_h4: analysis.timeframes.find(t => t.timeframe === 'H4')?.bias ?? null,
            bias_d1: analysis.timeframes.find(t => t.timeframe === 'D1')?.bias ?? null,
            rsi_m15: m15?.rsi.value ?? null,
            atr_m15: m15?.atr.value ?? null,
            ai_analysis: fullText,
            user_id: userId,
          })
        }

        await supabase.from('chat_messages').insert([
          { user_id: userId, role: 'user', content: userMessage },
          { user_id: userId, role: 'assistant', content: fullText },
        ])

        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({
            type: 'done',
            signal: parsedSignal,
            analysis: { confidenceScore: analysis.confidenceScore, session: analysis.session },
          })}\n\n`)
        )
      } catch (err) {
        console.error('[/api/analyze stream]', err)
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ type: 'error', message: 'Stream error' })}\n\n`)
        )
      } finally {
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  })
}
