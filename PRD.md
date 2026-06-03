# Product Requirements Document
# GoldAI Scalper — XAUUSD Signal Trading Chatbot

**Versi:** 2.1.0  
**Tanggal:** 25 Mei 2026  
**Status:** Draft Final  
**Stack:** Next.js 16 · Supabase · Vercel  
**Pemilik Produk:** Internal  

---

## Daftar Isi

1. [Ringkasan Eksekutif](#1-ringkasan-eksekutif)
2. [Tujuan & Sasaran](#2-tujuan--sasaran)
3. [Ruang Lingkup](#3-ruang-lingkup)
4. [Persona Pengguna](#4-persona-pengguna)
5. [Arsitektur Sistem](#5-arsitektur-sistem)
6. [Struktur Database (Supabase)](#6-struktur-database-supabase)
7. [API Routes (Next.js)](#7-api-routes-nextjs)
8. [Integrasi API Eksternal](#8-integrasi-api-eksternal)
9. [Kalkulasi Indikator Teknikal](#9-kalkulasi-indikator-teknikal)
10. [Sistem Signal & AI](#10-sistem-signal--ai)
11. [Autentikasi & Otorisasi](#11-autentikasi--otorisasi)
12. [Spesifikasi UI/UX](#12-spesifikasi-uiux)
13. [PWA Specification](#13-pwa-specification)
14. [Struktur Proyek Next.js](#14-struktur-proyek-nextjs)
15. [Environment Variables](#15-environment-variables)
16. [Alur Kerja Utama](#16-alur-kerja-utama)
17. [Penanganan Error](#17-penanganan-error)
18. [Keamanan & Privasi](#18-keamanan--privasi)
19. [Performa & Batasan](#19-performa--batasan)
20. [Kriteria Penerimaan](#20-kriteria-penerimaan)
21. [Roadmap Pengembangan](#21-roadmap-pengembangan)
22. [Referensi & Dokumentasi](#22-referensi--dokumentasi)

---

## 1. Ringkasan Eksekutif

GoldAI Scalper adalah aplikasi web full-stack berbasis chatbot yang memberikan signal trading XAUUSD (Gold/USD) secara akurat menggunakan kecerdasan buatan. Dibangun di atas **Next.js 16**, **Supabase**, dan di-deploy ke **Vercel**, aplikasi ini menggabungkan:

| Komponen | Teknologi | Keterangan |
|---|---|---|
| Frontend | Next.js 16 (App Router) | React 19.2, Server Components, Tailwind CSS, Turbopack default |
| Backend | Next.js API Routes | Proxy aman untuk semua API eksternal |
| Database | Supabase (PostgreSQL) | User, signal history, chat history |
| Autentikasi | Supabase Auth | Email/password + Google OAuth |
| Cache | Next.js + Supabase | Cache OHLC di server, hemat kuota API |
| Harga Real-time | gold-api.com | Spot XAU, gratis, no auth |
| Data OHLC | API Ninjas | Candle M1–D1, gratis dengan API key |
| Chart | TradingView Widget | Embed iframe, candlestick profesional |
| AI Engine | OpenRouter | deepseek/deepseek-v4-flash:free |
| Deployment | Vercel | Edge Network, auto-scaling, free tier |

**Mengapa Next.js + Supabase + Vercel:**
- **API key aman** — tersimpan di server environment, tidak pernah expose ke browser
- **Cache terpusat** — satu cache untuk semua user, hemat kuota API Ninjas secara drastis
- **Supabase** — menyediakan database, auth, dan realtime subscription dalam satu platform gratis
- **Vercel** — deployment zero-config untuk Next.js, CDN global, free tier generous

---

## 2. Tujuan & Sasaran

### 2.1 Tujuan Bisnis

- Menyediakan alat bantu analisa XAUUSD yang akurat dan aman untuk trader scalper
- Mengurangi waktu analisa manual dari 15–30 menit menjadi kurang dari 60 detik
- Membangun platform yang dapat dimonetisasi di masa depan (premium plan, signal service)

### 2.2 Sasaran Produk

- Signal BUY/SELL/WAIT dengan confidence score berbasis confluence multi-indikator
- Analisa 6 timeframe sekaligus: M1, M5, M15, H1, H4, D1
- Riwayat signal tersimpan permanen di database per user
- Dapat diakses sebagai PWA di desktop maupun mobile
- API key eksternal **tidak pernah exposed ke browser**

---

## 3. Ruang Lingkup

### 3.1 Dalam Lingkup (In Scope)

**Frontend:**
- Next.js 16 App Router dengan React 19.2 Server Components
- Chat interface dengan AI response (streaming)
- Multi-timeframe analysis panel (6 TF)
- TradingView Advanced Chart Widget (iframe embed)
- Signal card: Entry, Stop Loss, TP1, TP2, Risk:Reward, Confidence
- Sidebar: TF grid, indicator values, strength meter, news panel
- PWA: manifest.json + service worker
- Responsive design: mobile & desktop
- Dark mode UI — tema gold/dark terminal trading

**Backend (API Routes):**
- `/api/price` — proxy gold-api.com (harga spot real-time)
- `/api/candles` — proxy API Ninjas + server-side cache 60 detik
- `/api/analyze` — proxy OpenRouter dengan system prompt dinamis
- `/api/signals` — CRUD riwayat signal dari Supabase
- `/api/chat` — simpan & ambil riwayat percakapan dari Supabase
- Middleware autentikasi di semua route protected

**Database (Supabase):**
- Tabel users (profil, preferensi)
- Tabel signals (riwayat signal per user)
- Tabel chat_messages (riwayat percakapan per user)
- Tabel market_cache (cache data OHLC terpusat)
- Row Level Security (RLS) aktif di semua tabel

**Autentikasi:**
- Supabase Auth: email/password dan Google OAuth
- Session management otomatis via Supabase SSR helper
- Protected routes dengan Next.js `proxy.ts`

### 3.2 Luar Lingkup (Out of Scope)

| Fitur | Alasan |
|---|---|
| Eksekusi order ke broker | Regulasi, kompleksitas, di luar scope MVP |
| Integrasi MetaTrader/cTrader | Butuh bridge khusus |
| Backtesting engine | Fitur Phase 2 |
| Payment/subscription system | Fitur Phase 3 |
| Mobile native app (iOS/Android) | PWA sudah mencukupi |
| Multi-pair selain XAUUSD | Fokus satu instrumen untuk MVP |
| Admin dashboard | Fitur Phase 2 |

---

## 4. Persona Pengguna

### 4.1 Primary User — "Scalper Aktif"

- **Profil:** Trader retail, 25–45 tahun, pengalaman 1–5 tahun
- **Kebutuhan:** Signal cepat, akurat, dilengkapi level entry/SL/TP yang jelas
- **Pain point:** Indikator kontradiktif, tidak ada waktu analisa manual
- **Device:** Desktop 70%, Mobile 30%
- **Sesi trading:** London (14:00–17:00 WIB), NY (20:00–23:00 WIB)
- **Ekspektasi teknis:** Tidak perlu setup API key sendiri — langsung pakai setelah daftar

### 4.2 Secondary User — "Swing Trader Pemula"

- **Profil:** Pengalaman < 1 tahun, ingin belajar analisa teknikal
- **Kebutuhan:** Penjelasan reasoning di balik signal, bisa review riwayat signal lama
- **Device:** Mobile-first
- **Ekspektasi teknis:** Interface sederhana, tidak perlu konfigurasi teknis

---

## 5. Arsitektur Sistem

### 5.1 Diagram Arsitektur

```
┌─────────────────────────────────────────────────────────────────────┐
│                         VERCEL (Edge Network)                        │
│                                                                      │
│   ┌──────────────────────────────────────────────────────────────┐  │
│   │                    NEXT.JS 15 APP                            │  │
│   │                                                              │  │
│   │   ┌─────────────────┐       ┌──────────────────────────┐   │  │
│   │   │   APP ROUTER    │       │      API ROUTES           │   │  │
│   │   │   (Frontend)    │       │      (Backend)            │   │  │
│   │   │                 │       │                           │   │  │
│   │   │ /               │       │ /api/price                │   │  │
│   │   │ /dashboard      │──────▶│ /api/candles  [+cache]   │   │  │
│   │   │ /chat           │       │ /api/analyze              │   │  │
│   │   │ /signals        │       │ /api/signals              │   │  │
│   │   │ /settings       │       │ /api/chat                 │   │  │
│   │   │ /auth/login     │       │ /api/auth/[...]           │   │  │
│   │   └─────────────────┘       └──────────┬───────────────┘   │  │
│   │                                        │                    │  │
│   └────────────────────────────────────────┼────────────────────┘  │
│                                            │                        │
└────────────────────────────────────────────┼────────────────────────┘
                                             │
              ┌──────────────────────────────┼──────────────────────┐
              │                              │                       │
              ▼                              ▼                       ▼
    ┌──────────────────┐        ┌────────────────────┐   ┌─────────────────┐
    │   SUPABASE       │        │   API EKSTERNAL     │   │  TRADINGVIEW    │
    │                  │        │                     │   │  WIDGET         │
    │ • PostgreSQL DB  │        │ gold-api.com        │   │                 │
    │ • Auth (JWT)     │        │ → /price/XAU        │   │ Embed iframe    │
    │ • Row Level Sec  │        │                     │   │ XAUUSD chart    │
    │ • Realtime       │        │ API Ninjas          │   │ (client-side)   │
    │                  │        │ → /goldpricehistor  │   │                 │
    │ Tables:          │        │                     │   └─────────────────┘
    │ • users          │        │ OpenRouter          │
    │ • signals        │        │ → deepseek-v4-flash │
    │ • chat_messages  │        │   :free             │
    │ • market_cache   │        │                     │
    └──────────────────┘        └─────────────────────┘
```

### 5.2 Alur Request — Analisa Signal

```
1. User klik "Analisa" di browser
      ↓
2. Frontend → POST /api/analyze
      ↓
3. API Route (server-side):
   ├── Cek cache market_cache di Supabase (< 60 detik? gunakan cache)
   ├── Jika cache expired:
   │   ├── Fetch gold-api.com/price/XAU
   │   └── Fetch API Ninjas × 6 TF (paralel)
   │   └── Simpan ke market_cache Supabase
   ├── Kalkulasi 6 indikator (RSI, EMA, MACD, BB, ATR, Stoch)
   ├── Susun system prompt dinamis
   └── POST ke OpenRouter → streaming response
      ↓
4. Stream response ke frontend (Server-Sent Events)
      ↓
5. Frontend render bubble chat secara progressive
      ↓
6. Parse signal dari response lengkap
      ↓
7. POST /api/signals → simpan ke Supabase
      ↓
8. Update UI: banner, sidebar, strength meter
```

### 5.3 Keuntungan Arsitektur Backend

| Masalah (tanpa backend) | Solusi (dengan Next.js backend) |
|---|---|
| API key exposed di browser | Semua key di `.env.local` / Vercel env vars |
| Setiap user boros kuota API Ninjas | Cache terpusat di Supabase — 1 fetch untuk semua user |
| Tidak bisa simpan signal history | Supabase PostgreSQL dengan RLS per user |
| Tidak ada rate limiting | Middleware Next.js bisa limit request per IP |
| CORS bisa berubah sewaktu-waktu | Server proxy tidak kena CORS restriction |

### 5.4 Perubahan Penting Next.js 16 vs 15

| Aspek | Next.js 15 (lama) | Next.js 16 (digunakan) |
|---|---|---|
| **File routing auth** | `middleware.ts` | `proxy.ts` — nama fungsi harus `proxy` |
| **Bundler default** | Webpack | Turbopack (stable) — 2–5× faster build |
| **Caching model** | Implicit (opt-out) | Explicit opt-in via `"use cache"` directive |
| **Cache config** | `experimental.ppr` | `cacheComponents: true` di `next.config.ts` |
| **React versi** | React 19 | React 19.2 (View Transitions, `useEffectEvent`) |
| **Dev startup** | Baseline | ~400% lebih cepat (Next.js 16.2) |
| **SSR rendering** | Baseline | ~50% lebih cepat (Next.js 16.2) |
| **DevTools** | Manual debugging | Next.js DevTools MCP — AI-assisted debugging |

> **Catatan untuk Claude Code:** Saat generate boilerplate, gunakan `proxy.ts` bukan `middleware.ts`. Untuk caching API route `/api/candles`, gunakan `"use cache"` directive bukan `export const revalidate`. Turbopack sudah aktif secara default, tidak perlu konfigurasi tambahan.

#### Contoh `proxy.ts` untuk GoldAI Scalper

```typescript
// proxy.ts  ← bukan middleware.ts (Next.js 16)
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // Redirect ke login jika belum autentikasi
  const protectedPaths = ['/dashboard', '/signals', '/settings']
  const isProtected = protectedPaths.some(p => request.nextUrl.pathname.startsWith(p))

  if (!user && isProtected) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  // Redirect ke dashboard jika sudah login dan akses halaman auth
  if (user && request.nextUrl.pathname.startsWith('/auth')) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api/price).*)',
  ],
}
```

#### Contoh `"use cache"` untuk `/api/candles`

```typescript
// app/api/candles/route.ts — Next.js 16 caching model
import { unstable_cacheTag as cacheTag, unstable_cacheLife as cacheLife } from 'next/cache'

export async function GET(request: Request) {
  'use cache'
  cacheLife({ revalidate: 60 })           // cache 60 detik
  cacheTag('candles-data')                // tag untuk revalidasi manual

  const { searchParams } = new URL(request.url)
  const tf = searchParams.get('tf') || 'M5'

  // fetch dari API Ninjas...
}
```

#### next.config.ts untuk GoldAI Scalper

```typescript
// next.config.ts — Next.js 16
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  cacheComponents: true,                  // aktifkan Cache Components (PPR Next.js 16)
  experimental: {
    turbopackFileSystemCacheForDev: true, // cache Turbopack ke disk (lebih cepat restart)
  },
}

export default nextConfig
```



---

## 6. Struktur Database (Supabase)

### 6.1 Tabel `users`

Dikelola otomatis oleh Supabase Auth. Tabel `profiles` sebagai ekstensi:

```sql
create table profiles (
  id          uuid references auth.users(id) primary key,
  username    text unique,
  full_name   text,
  avatar_url  text,
  plan        text default 'free',        -- 'free' | 'pro'
  lang        text default 'id',          -- 'id' | 'en'
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- RLS: user hanya bisa akses profil sendiri
alter table profiles enable row level security;
create policy "Users can view own profile"
  on profiles for select using (auth.uid() = id);
create policy "Users can update own profile"
  on profiles for update using (auth.uid() = id);
```

### 6.2 Tabel `signals`

```sql
create table signals (
  id            uuid default gen_random_uuid() primary key,
  user_id       uuid references auth.users(id) on delete cascade,
  created_at    timestamptz default now(),

  -- Signal utama
  type          text not null,            -- 'buy' | 'sell' | 'wait'
  confidence    integer not null,         -- 0–100
  timeframe     text not null,            -- 'M5' | 'M15'
  session       text,                     -- 'London' | 'NY' | 'Asia'

  -- Level harga
  entry         numeric(10,2),
  stop_loss     numeric(10,2),
  tp1           numeric(10,2),
  tp2           numeric(10,2),
  risk_reward   text,                     -- '1:2.5'

  -- Snapshot pasar saat signal
  price_at      numeric(10,2),
  bias_m1       text,                     -- 'bull' | 'bear' | 'neutral'
  bias_m5       text,
  bias_m15      text,
  bias_h1       text,
  bias_h4       text,
  bias_d1       text,
  rsi_m15       numeric(5,2),
  atr_m15       numeric(8,4),

  -- Hasil (diisi manual oleh user)
  outcome       text,                     -- 'win' | 'loss' | 'breakeven' | null
  pips_result   numeric(6,1),
  notes         text,

  -- Full AI response
  ai_analysis   text
);

-- Index untuk query cepat
create index signals_user_id_idx on signals(user_id);
create index signals_created_at_idx on signals(created_at desc);

-- RLS
alter table signals enable row level security;
create policy "Users can manage own signals"
  on signals for all using (auth.uid() = user_id);
```

### 6.3 Tabel `chat_messages`

```sql
create table chat_messages (
  id          uuid default gen_random_uuid() primary key,
  user_id     uuid references auth.users(id) on delete cascade,
  created_at  timestamptz default now(),

  role        text not null,              -- 'user' | 'assistant'
  content     text not null,
  signal_id   uuid references signals(id) -- opsional: link ke signal terkait
);

-- Index
create index chat_messages_user_id_idx on chat_messages(user_id);
create index chat_messages_created_at_idx on chat_messages(created_at desc);

-- RLS
alter table chat_messages enable row level security;
create policy "Users can manage own messages"
  on chat_messages for all using (auth.uid() = user_id);
```

### 6.4 Tabel `market_cache`

```sql
create table market_cache (
  id           uuid default gen_random_uuid() primary key,
  cache_key    text unique not null,      -- contoh: 'candles_M5' | 'price_spot'
  data         jsonb not null,            -- data OHLC atau harga spot
  fetched_at   timestamptz default now(),
  expires_at   timestamptz not null       -- fetched_at + interval
);

-- Index
create index market_cache_key_idx on market_cache(cache_key);
create index market_cache_expires_idx on market_cache(expires_at);

-- Tidak pakai RLS — data publik, hanya dapat diakses via server
```

### 6.5 Row Level Security Summary

| Tabel | Akses User | Akses Server |
|---|---|---|
| profiles | Hanya profil sendiri | Full access via service_role key |
| signals | Hanya signal sendiri | Full access via service_role key |
| chat_messages | Hanya pesan sendiri | Full access via service_role key |
| market_cache | Tidak ada akses langsung | Full access via service_role key |

---

## 7. API Routes (Next.js)

### 7.1 `GET /api/price`

Proxy harga spot real-time dari gold-api.com.

**Auth:** Tidak diperlukan (data publik)

**Response:**
```json
{
  "price": 2338.40,
  "bid": 2337.90,
  "ask": 2338.90,
  "high": 2345.60,
  "low": 2328.40,
  "change": 6.30,
  "change_pct": 0.27,
  "cached": false,
  "fetched_at": "2026-05-25T10:30:00Z"
}
```

**Cache:** In-memory Next.js cache, revalidate setiap 5 detik (`next: { revalidate: 5 }`)

---

### 7.2 `GET /api/candles?tf=M5&limit=100`

Proxy data OHLC dari API Ninjas dengan cache terpusat di Supabase.

**Auth:** Wajib (Supabase session)

**Query params:**

| Param | Tipe | Default | Keterangan |
|---|---|---|---|
| tf | string | M5 | M1, M5, M15, H1, H4, D1 |
| limit | integer | 100 | Jumlah candle yang diambil (max 200) |

**Logika cache:**
```
1. Cek tabel market_cache untuk key "candles_{TF}"
2. Jika ada dan expires_at > now() → return data cache
3. Jika tidak ada atau expired → fetch API Ninjas
4. Simpan hasil ke market_cache dengan expires_at = now() + 60 detik
5. Return data baru
```

**Response:**
```json
{
  "timeframe": "M5",
  "candles": [
    {
      "timestamp": 1716883200,
      "open": 2338.40,
      "high": 2341.20,
      "low": 2335.10,
      "close": 2339.80,
      "volume": 12453
    }
  ],
  "count": 100,
  "cached": true,
  "cache_age_seconds": 23
}
```

---

### 7.3 `POST /api/analyze`

Endpoint utama — kalkulasi indikator + proxy ke OpenRouter dengan streaming.

**Auth:** Wajib (Supabase session)

**Request body:**
```json
{
  "message": "Analisa pasar XAUUSD sekarang",
  "history": [
    { "role": "user", "content": "..." },
    { "role": "assistant", "content": "..." }
  ]
}
```

**Proses server-side:**
```
1. Validasi session user
2. Fetch data paralel:
   └── GET /api/price (internal call)
   └── GET /api/candles?tf=M1  ┐
   └── GET /api/candles?tf=M5  │
   └── GET /api/candles?tf=M15 │ → paralel via Promise.all
   └── GET /api/candles?tf=H1  │
   └── GET /api/candles?tf=H4  │
   └── GET /api/candles?tf=D1  ┘
3. Kalkulasi indikator per timeframe
4. Hitung confidence score
5. Susun system prompt dinamis
6. POST ke OpenRouter dengan streaming
7. Return ReadableStream ke client
```

**Response:** `text/event-stream` (Server-Sent Events / streaming)

```
data: {"type":"delta","content":"Berdasarkan analisa..."}
data: {"type":"delta","content":" multi-timeframe..."}
data: {"type":"done","signal":{"type":"buy","confidence":78,...}}
```

---

### 7.4 `GET /api/signals`

Ambil riwayat signal user dari Supabase.

**Auth:** Wajib

**Query params:**

| Param | Default | Keterangan |
|---|---|---|
| page | 1 | Halaman (pagination) |
| limit | 20 | Signal per halaman (max 50) |
| type | null | Filter: buy/sell/wait |
| outcome | null | Filter: win/loss/breakeven |

**Response:**
```json
{
  "signals": [...],
  "total": 142,
  "page": 1,
  "limit": 20
}
```

---

### 7.5 `POST /api/signals`

Simpan signal baru ke Supabase (dipanggil otomatis setelah analisa selesai).

**Auth:** Wajib

**Request body:** Field dari tabel `signals` (tanpa id dan user_id)

---

### 7.6 `PATCH /api/signals/[id]`

Update outcome signal (win/loss/breakeven) setelah user menutup posisi.

**Auth:** Wajib + ownership check via RLS

**Request body:**
```json
{
  "outcome": "win",
  "pips_result": 18.5,
  "notes": "TP1 tercapai di 2355"
}
```

---

### 7.7 `GET /api/chat`

Ambil riwayat chat user (max 50 pesan terakhir).

**Auth:** Wajib

---

### 7.8 `POST /api/chat`

Simpan pesan baru ke Supabase (user dan assistant).

**Auth:** Wajib

---

### 7.9 Rate Limiting (Middleware)

Implementasi di `proxy.ts` menggunakan header + Supabase counter:

```
/api/analyze  → max 20 request/jam per user
/api/candles  → max 60 request/jam per user
/api/price    → tidak ada limit (data publik, di-cache)
```

Error response (429):
```json
{
  "error": "Rate limit exceeded",
  "retry_after": 3600,
  "message": "Kamu telah mencapai batas 20 analisa per jam. Coba lagi dalam 60 menit."
}
```

---

## 8. Integrasi API Eksternal

### 8.1 gold-api.com — Harga Spot XAU

| Properti | Detail |
|---|---|
| Endpoint | `GET https://api.gold-api.com/price/XAU` |
| Auth | Tidak diperlukan |
| Rate limit | Tidak ada |
| CORS | Enabled (dipanggil dari server Next.js) |
| Update interval | ~1–5 menit di sumber |
| Polling app | Setiap 5 detik via SWR di frontend → `/api/price` |

**Response fields yang digunakan:**

```
price          → harga saat ini
bid            → harga jual broker
ask            → harga beli broker
high           → high hari ini
low            → low hari ini
ch             → perubahan absolut
chp            → perubahan persen
prev_close_price → penutupan kemarin
```

---

### 8.2 API Ninjas — Gold Price Historical (OHLC)

| Properti | Detail |
|---|---|
| Endpoint | `GET https://api.api-ninjas.com/v1/goldpricehistorical` |
| Auth | Header: `X-Api-Key: {API_NINJAS_KEY}` |
| Key | Disimpan di Vercel environment variable (tidak expose ke client) |
| Rate limit | ~100 request/hari (plan gratis) |
| Cache | Supabase `market_cache`, TTL 60 detik per TF |

**Pemetaan timeframe ke interval:**

| TF App | Param `interval` | Detik | Candle yg diambil | Jangkauan data |
|---|---|---|---|---|
| M1 | `1m` | 60 | 100 candle | ~1.7 jam |
| M5 | `5m` | 300 | 100 candle | ~8.3 jam |
| M15 | `15m` | 900 | 100 candle | ~25 jam |
| H1 | `1h` | 3600 | 100 candle | ~4 hari |
| H4 | `4h` | 14400 | 100 candle | ~17 hari |
| D1 | `1d` | 86400 | 100 candle | ~3.3 bulan |

**Strategi hemat kuota dengan cache terpusat:**
```
Tanpa cache: 10 user × 6 TF × 5 analisa = 300 request/hari → langsung habis
Dengan cache: 6 TF × (300/60 detik) per hari = ~720 max → tapi karena TTL 60 detik,
              dalam 1 jam hanya 6 × 60 = 360 request. Prakteknya jauh lebih sedikit.
```

---

### 8.3 OpenRouter — AI Analysis

| Properti | Detail |
|---|---|
| Endpoint | `POST https://openrouter.ai/api/v1/chat/completions` |
| Auth | Header: `Authorization: Bearer {OPENROUTER_KEY}` |
| Key | Disimpan di Vercel environment variable |
| Model utama | `deepseek/deepseek-v4-flash:free` (Quality Score #1, 1M context) |
| Model fallback | `google/gemma-4-31b-it:free` (jika 429 error) |
| Rate limit | 20 req/menit, 200 req/hari per model (gratis) |
| Temperature | 0.3 (deterministik untuk analisa teknikal) |
| Max tokens | 1500 per response |
| Streaming | Ya — menggunakan `stream: true` |

**Request body:**
```json
{
  "model": "deepseek/deepseek-v4-flash:free",
  "max_tokens": 1500,
  "temperature": 0.3,
  "stream": true,
  "messages": [
    { "role": "system", "content": "{{SYSTEM_PROMPT_DINAMIS}}" },
    { "role": "user",   "content": "{{PESAN_USER}}" }
  ]
}
```

**Header tambahan yang direkomendasikan OpenRouter:**
```
HTTP-Referer: https://goldai-scalper.vercel.app
X-Title: GoldAI Scalper
```

---

## 9. Kalkulasi Indikator Teknikal

Kalkulasi dilakukan **di server** (Next.js API Route `/api/analyze`), bukan di browser. Ini memastikan konsistensi dan menghindari beban di client.

### 9.1 RSI — Relative Strength Index (Periode 14)

```
RS  = Rata-rata gain 14 periode / Rata-rata loss 14 periode
RSI = 100 - (100 / (1 + RS))

Interpretasi:
> 70   → Overbought — Bearish bias, waspadai reversal turun
50–70  → Bullish momentum — trend naik aktif
30–50  → Bearish momentum — trend turun aktif
< 30   → Oversold — Bullish bias, waspadai reversal naik
```

### 9.2 EMA — Exponential Moving Average (20, 50, 200)

```
Multiplier = 2 / (periode + 1)
EMA[i] = (Close[i] - EMA[i-1]) × Multiplier + EMA[i-1]

Kondisi bias:
Close > EMA20 > EMA50 > EMA200  → Strong Bullish
Close < EMA20 < EMA50 < EMA200  → Strong Bearish
EMA20 cross EMA50 ke atas       → Golden Cross (Bullish signal)
EMA20 cross EMA50 ke bawah      → Death Cross (Bearish signal)
Close antara EMA20 dan EMA50    → Ranging/Sideways
```

### 9.3 MACD (12, 26, 9)

```
MACD Line   = EMA(12) - EMA(26)
Signal Line = EMA(9) dari MACD Line
Histogram   = MACD Line - Signal Line

Kondisi bias:
Histogram > 0 dan naik  → Bullish momentum kuat
Histogram > 0 dan turun → Bullish melemah
MACD cross Signal ke atas   → BUY signal
MACD cross Signal ke bawah  → SELL signal
```

### 9.4 Bollinger Bands (Periode 20, StdDev 2)

```
Middle  = SMA(20)
Upper   = SMA(20) + 2 × StdDev(20)
Lower   = SMA(20) - 2 × StdDev(20)
%B      = (Close - Lower) / (Upper - Lower)

Kondisi:
Close > Upper → Overbought — potensi reversal
Close < Lower → Oversold — potensi reversal
Band squeeze  → Volatilitas rendah, waspadai breakout besar
%B > 0.8      → Zona overbought
%B < 0.2      → Zona oversold
```

### 9.5 ATR — Average True Range (Periode 14)

```
TR    = max(High-Low, |High-PrevClose|, |Low-PrevClose|)
ATR   = Wilder Smoothing(TR, 14)

Penggunaan untuk level:
Stop Loss minimum  = Entry ± (ATR × 1.5)
Take Profit 1      = Entry ± (ATR × 1.5)   → R:R 1:1
Take Profit 2      = Entry ± (ATR × 3.0)   → R:R 1:2

Interpretasi volatilitas XAUUSD M15:
ATR < 3   → Terlalu sepi, hindari entry
ATR 3–8   → Normal, ideal untuk scalping
ATR 8–15  → Tinggi, kurangi ukuran posisi
ATR > 15  → Ekstrem, kemungkinan news besar
```

### 9.6 Stochastic (14, 3, 3)

```
%K = (Close - LowestLow[14]) / (HighestHigh[14] - LowestLow[14]) × 100
%D = SMA(3) dari %K

Kondisi:
%K > 80                           → Overbought
%K < 20                           → Oversold
%K cross %D ke atas di zona < 20  → Bullish signal kuat
%K cross %D ke bawah di zona > 80 → Bearish signal kuat
```

### 9.7 Support & Resistance Otomatis

```
Sumber data: candle H4 dan D1

Swing High = candle dengan high > 2 candle kiri dan 2 candle kanan
Swing Low  = candle dengan low < 2 candle kiri dan 2 candle kanan

Output: 3 level resistance dan 3 level support terdekat dari harga saat ini
Format: { resistance: [r1, r2, r3], support: [s1, s2, s3] }
```

---

## 10. Sistem Signal & AI

### 10.1 Format Output Signal (Terstruktur)

AI harus menghasilkan output dalam format berikut agar dapat di-parse:

```
SIGNAL: [BUY / SELL / WAIT]
CONFIDENCE: [0-100]%
ENTRY: [harga]
STOP_LOSS: [harga]
TP1: [harga]
TP2: [harga]
RISK_REWARD: [rasio, contoh: 1:2.5]
TIMEFRAME: [M5 / M15]
```

### 10.2 Logika Confidence Score

| Kondisi | Poin |
|---|---|
| RSI align dengan bias utama | +10 |
| MACD align dengan bias utama | +15 |
| EMA stack penuh (20>50>200 atau sebaliknya) | +20 |
| Bollinger Bands posisi mendukung bias | +10 |
| Stochastic align dengan bias utama | +10 |
| Confluence M5 + M15 sama arah | +15 |
| H1 align dengan bias utama | +10 |
| H4 align dengan bias utama | +10 |
| **Total maksimal** | **100** |

| Range | Rekomendasi |
|---|---|
| < 50% | WAIT — jangan entry |
| 50–70% | Signal lemah — ukuran posisi kecil (0.5x) |
| 70–85% | Signal sedang — ukuran posisi normal (1x) |
| > 85% | Signal kuat — ukuran posisi penuh (1.5–2x) |

### 10.3 Aturan Risk Management Default

- Stop Loss: 15–25 pip (minimal ATR × 1.5, sesuaikan dengan S/R terdekat)
- TP1: sama dengan SL → R:R 1:1 (ambil 50–70% posisi)
- TP2: dua kali SL → R:R 1:2 (biarkan sisa posisi berjalan)
- **Jangan entry** jika ada berita HIGH impact dalam 30 menit ke depan
- **Jangan entry** jika spread XAUUSD > 30 pip
- **Jangan entry** jika ATR M15 < 3 poin (pasar terlalu sepi)
- Maksimal 2 posisi terbuka secara bersamaan

### 10.4 System Prompt AI (Template Dinamis)

```
Kamu adalah GoldAI Scalper, analis trading XAUUSD profesional berbasis AI.
Spesialisasi: scalping timeframe M1–M15 dengan konfirmasi multi-timeframe.

=== DATA PASAR REAL-TIME ({{TIMESTAMP}}) ===
Spot Price : {{PRICE}}
Bid / Ask  : {{BID}} / {{ASK}}
High / Low : {{HIGH}} / {{LOW}}
Perubahan  : {{CHANGE}} ({{CHANGE_PCT}}%)

=== ANALISA MULTI-TIMEFRAME ===
[M1]  O:{{O}} H:{{H}} L:{{L}} C:{{C}}
      RSI:{{RSI}} | MACD:{{MACD}}/{{SIG}}({{HIST}}) | EMA20:{{E20}} EMA50:{{E50}}
      BB%B:{{BB}} | ATR:{{ATR}} | Stoch:{{K}}/{{D}} | Bias: {{BIAS}}

[M5]  ... (format sama)
[M15] ... (format sama)
[H1]  ... (format sama)
[H4]  ... (format sama)
[D1]  ... (format sama)

=== SUPPORT & RESISTANCE ===
Resistance: {{R1}} | {{R2}} | {{R3}}
Support   : {{S1}} | {{S2}} | {{S3}}

=== SESI & VOLATILITAS ===
Sesi aktif  : {{SESSION}} ({{START}}–{{END}} WIB)
Volatilitas : {{LOW/NORMAL/HIGH}} (ATR M15: {{ATR_M15}})
Confidence  : {{CONF_SCORE}}% ({{CONF_LABEL}})

=== INSTRUKSI OUTPUT ===
1. Analisa semua 6 timeframe → tentukan bias dominan
2. Cari confluence minimal 3 indikator sebelum memberikan signal
3. Berikan signal HANYA jika confidence > 50%
4. Sertakan format terstruktur: SIGNAL:, CONFIDENCE:, ENTRY:, STOP_LOSS:, TP1:, TP2:, RISK_REWARD:, TIMEFRAME:
5. Jelaskan reasoning dalam Bahasa Indonesia yang jelas dan ringkas
6. Sebutkan kondisi invalidasi (kapan setup ini dianggap gagal)
7. Peringatkan jika ada kondisi berisiko (berita, spread tinggi, ATR ekstrem)
8. Jika WAIT, jelaskan alasan dan kondisi yang harus terpenuhi untuk entry
```

---

## 11. Autentikasi & Otorisasi

### 11.1 Supabase Auth

| Metode | Keterangan |
|---|---|
| Email + Password | Sign up dengan verifikasi email |
| Google OAuth | One-click login via Google |
| Session | JWT, dikelola otomatis Supabase SSR |
| Proxy | Next.js `proxy.ts` cek session di semua route protected |

### 11.2 Halaman Auth

| Route | Keterangan |
|---|---|
| `/auth/login` | Form login email/password + tombol Google OAuth |
| `/auth/register` | Form registrasi + terms agreement |
| `/auth/forgot-password` | Form reset password via email |
| `/auth/callback` | Callback URL untuk OAuth (diperlukan Supabase) |

### 11.3 Protected Routes

Semua route selain `/`, `/auth/*`, dan `/api/price` memerlukan autentikasi.

```typescript
// proxy.ts
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'

export async function proxy(req) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })
  const { data: { session } } = await supabase.auth.getSession()

  if (!session && req.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/auth/login', req.url))
  }
  return res
}

export const config = {
  matcher: ['/dashboard/:path*', '/chat/:path*', '/signals/:path*', '/api/analyze', '/api/signals', '/api/chat']
}
```

### 11.4 Server-Side Auth di API Routes

```typescript
// Contoh di /api/analyze/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function POST(req: Request) {
  const supabase = createRouteHandlerClient({ cookies })
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Lanjut proses analisa...
}
```

---

## 12. Spesifikasi UI/UX

### 12.1 Halaman & Route

| Route | Komponen | Keterangan |
|---|---|---|
| `/` | LandingPage | Landing page publik, CTA ke register/login |
| `/auth/login` | LoginPage | Form login |
| `/auth/register` | RegisterPage | Form registrasi |
| `/dashboard` | DashboardPage | Halaman utama setelah login |
| `/chat` | ChatPage | Chatbot AI (bisa jadi bagian dashboard) |
| `/signals` | SignalsPage | Riwayat signal + outcome tracking |
| `/settings` | SettingsPage | Preferensi user (bukan API key — sudah di server) |

### 12.2 Layout Dashboard Desktop (≥ 1024px)

```
┌─────────────────────────────────────────────────────────┐
│ HEADER: Logo | XAUUSD Live Price | Session | User Avatar │
├──────────────┬──────────────────────────────────────────┤
│              │  SIGNAL BANNER (BUY/SELL/WAIT + levels)  │
│  SIDEBAR     ├──────────────────────────────────────────┤
│  (260px)     │                                          │
│              │    TRADINGVIEW CHART (iframe, ~380px)    │
│ • TF Grid    │                                          │
│ • Indicators ├──────────────────────────────────────────┤
│ • Strength   │                                          │
│ • S/R Levels │         CHAT MESSAGES AREA               │
│ • News       │         (scrollable, flex-grow)          │
│              │                                          │
│              ├──────────────────────────────────────────┤
│              │  QUICK BUTTONS | INPUT | SEND BUTTON     │
└──────────────┴──────────────────────────────────────────┘
```

### 12.3 Layout Mobile (< 768px)

```
┌─────────────────────────┐
│ HEADER (compact)        │
├─────────────────────────┤
│ SIGNAL BANNER (compact) │
├─────────────────────────┤
│ TAB: Chart | Panel | AI │
├─────────────────────────┤
│                         │
│   CONTENT AREA          │
│   (sesuai tab aktif)    │
│                         │
├─────────────────────────┤
│ QUICK BUTTONS (scroll)  │
├─────────────────────────┤
│  INPUT TEXT | SEND ➤   │
└─────────────────────────┘
```

### 12.4 Komponen Utama

**Signal Banner**
- Ditampilkan permanen di bawah header
- Warna dinamis: hijau (BUY), merah (SELL), kuning (WAIT), abu (belum ada)
- Field: Tipe | Pair & TF | Entry | SL | TP1 | TP2 | Confidence %
- Animasi slide-in setiap signal baru

**Sidebar Panel**
- TF Grid 2×3: masing-masing tampilkan TF, bias emoji (▲/▼/◆), nilai RSI
- Indicator Card: tabel nilai indikator M5/M15 real-time
- Strength Meter: progress bar 0–100% dengan warna gradient
- S/R Levels: 3 resistance dan 3 support dari H4/D1
- News Panel: 3–5 event ekonomi terdekat (diisi dari context AI)

**Chat Area**
- Bubble user (kanan, warna gold dim)
- Bubble bot (kiri, warna dark card)
- Signal card di dalam bubble bot setelah analisa
- Typing indicator (3 titik animasi bounce)
- Streaming text — karakter muncul satu per satu saat AI menjawab
- Auto-scroll ke pesan terbaru

**Signal Card (dalam bubble chat)**
- Badge BUY/SELL/WAIT dengan warna sesuai
- Grid level: Entry | SL | TP1 | TP2
- Risk:Reward ratio
- TF chips: M1▲ M5▲ M15▲ H1▼ H4◆ D1▲
- Confidence score dengan progress bar mini

**Quick Action Buttons**
| Label | Pesan Dikirim |
|---|---|
| ⚡ Analisa Sekarang | "Analisa pasar XAUUSD sekarang dan berikan signal trading terbaru" |
| 📰 Cek Berita | "Apakah ada berita penting yang dapat mempengaruhi XAUUSD hari ini?" |
| 🎯 Setup Entry | "Jelaskan setup entry terbaik untuk scalper berdasarkan kondisi saat ini" |
| 📊 S/R Levels | "Berikan level support dan resistance XAUUSD yang paling penting saat ini" |
| 🛡️ Risk Mgmt | "Bagaimana risk management yang tepat untuk signal yang diberikan?" |
| 🔄 Update Data | (Trigger refresh data — tidak dikirim ke AI) |

### 12.5 Halaman Signal History (`/signals`)

- Tabel/card list semua signal historis user
- Filter: tipe (BUY/SELL/WAIT), outcome (win/loss/belum), tanggal
- Setiap row: timestamp, tipe, entry, SL, TP, confidence, outcome, pips
- Tombol "Input Hasil" untuk mengisi outcome setelah posisi ditutup
- Summary card: total signal, win rate, average R:R, total pips

### 12.6 Design System

| Token | Nilai |
|---|---|
| Primary color | `#F5C842` (gold) |
| Background | `#080c14` (dark navy) |
| Surface | `#0d1220` |
| Surface 2 | `#111827` |
| Green (BUY) | `#22d3a0` |
| Red (SELL) | `#f05470` |
| Font heading | Space Mono (monospace, terminal feel) |
| Font body | DM Sans atau Inter |
| Border radius | 8px (komponen), 12px (card) |
| Border | `rgba(245, 200, 66, 0.15)` |

---

## 13. PWA Specification

### 13.1 manifest.json

```json
{
  "name": "GoldAI Scalper",
  "short_name": "GoldAI",
  "description": "XAUUSD Signal Trading Chatbot powered by AI",
  "start_url": "/dashboard",
  "display": "standalone",
  "orientation": "any",
  "background_color": "#080c14",
  "theme_color": "#F5C842",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
  ],
  "categories": ["finance", "utilities"],
  "screenshots": [
    { "src": "/screenshots/desktop.png", "sizes": "1280x720", "type": "image/png", "form_factor": "wide" },
    { "src": "/screenshots/mobile.png",  "sizes": "390x844",  "type": "image/png", "form_factor": "narrow" }
  ]
}
```

### 13.2 Service Worker — Cache Strategy

| Resource | Strategi | TTL |
|---|---|---|
| App Shell (HTML, JS, CSS) | Cache First | Build time |
| Gambar & font | Cache First | 30 hari |
| `/api/price` | Network First | 5 detik |
| `/api/candles` | Network First | 60 detik |
| TradingView widget script | Cache First | 7 hari |
| `/api/analyze` | Network Only | Tidak di-cache |
| `/api/signals` | Network First | 30 detik |

**Behavior offline:**
- Tampilkan banner: `"Mode Offline — Data mungkin tidak terkini"`
- Harga spot menampilkan nilai terakhir dengan badge `CACHED`
- Chat UI tetap bisa dibuka untuk review riwayat
- Analisa baru tidak tersedia sampai koneksi pulih

---

## 14. Struktur Proyek Next.js

```
goldai-scalper/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── register/
│   │   │   └── page.tsx
│   │   ├── forgot-password/
│   │   │   └── page.tsx
│   │   └── callback/
│   │       └── route.ts              ← Supabase OAuth callback
│   ├── (dashboard)/
│   │   ├── layout.tsx                ← Layout dengan sidebar
│   │   ├── dashboard/
│   │   │   └── page.tsx              ← Halaman utama (chart + chat)
│   │   ├── signals/
│   │   │   └── page.tsx              ← Riwayat signal
│   │   └── settings/
│   │       └── page.tsx              ← Preferensi user
│   ├── api/
│   │   ├── price/
│   │   │   └── route.ts              ← GET: proxy gold-api.com
│   │   ├── candles/
│   │   │   └── route.ts              ← GET: proxy API Ninjas + cache
│   │   ├── analyze/
│   │   │   └── route.ts              ← POST: kalkulasi + proxy OpenRouter
│   │   ├── signals/
│   │   │   ├── route.ts              ← GET list, POST create
│   │   │   └── [id]/
│   │   │       └── route.ts          ← PATCH update outcome
│   │   └── chat/
│   │       └── route.ts              ← GET history, POST save message
│   ├── layout.tsx                    ← Root layout (font, metadata, PWA)
│   ├── page.tsx                      ← Landing page publik
│   └── globals.css
│
├── components/
│   ├── ui/                           ← Shadcn/ui base components
│   ├── chat/
│   │   ├── ChatArea.tsx
│   │   ├── MessageBubble.tsx
│   │   ├── SignalCard.tsx
│   │   ├── TypingIndicator.tsx
│   │   └── QuickButtons.tsx
│   ├── sidebar/
│   │   ├── Sidebar.tsx
│   │   ├── TFGrid.tsx
│   │   ├── IndicatorCard.tsx
│   │   ├── StrengthMeter.tsx
│   │   ├── SRLevels.tsx
│   │   └── NewsPanel.tsx
│   ├── chart/
│   │   └── TradingViewWidget.tsx     ← Wrapper TradingView iframe
│   ├── signal/
│   │   └── SignalBanner.tsx
│   └── layout/
│       ├── Header.tsx
│       └── MobileNav.tsx
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts                 ← Supabase browser client
│   │   ├── server.ts                 ← Supabase server client
│   │   └── utils.ts                  ← Supabase SSR helper (session, cookies)
│   ├── indicators/
│   │   ├── rsi.ts                    ← Kalkulasi RSI
│   │   ├── ema.ts                    ← Kalkulasi EMA
│   │   ├── macd.ts                   ← Kalkulasi MACD
│   │   ├── bollinger.ts              ← Kalkulasi Bollinger Bands
│   │   ├── atr.ts                    ← Kalkulasi ATR
│   │   ├── stochastic.ts             ← Kalkulasi Stochastic
│   │   ├── support-resistance.ts     ← Deteksi S/R otomatis
│   │   └── index.ts                  ← Export semua, fungsi calculateAll()
│   ├── signal/
│   │   ├── confidence.ts             ← Hitung confidence score
│   │   ├── parser.ts                 ← Parse signal dari AI response
│   │   └── prompt.ts                 ← Builder system prompt dinamis
│   ├── cache/
│   │   └── market-cache.ts           ← Logika cache via Supabase
│   └── utils.ts                      ← Helper umum
│
├── hooks/
│   ├── usePrice.ts                   ← SWR polling harga real-time
│   ├── useCandles.ts                 ← Fetch OHLC data
│   ├── useChat.ts                    ← State management chat
│   └── useSignals.ts                 ← Signal history management
│
├── types/
│   ├── signal.ts                     ← Type definisi Signal
│   ├── candle.ts                     ← Type definisi Candle/OHLC
│   ├── indicator.ts                  ← Type definisi hasil indikator
│   └── database.ts                   ← Generated dari Supabase types
│
├── proxy.ts                          ← Auth protection semua route (Next.js 16)
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── package.json
├── public/
│   ├── manifest.json
│   ├── sw.js                         ← Service worker
│   ├── icons/
│   │   ├── icon-192.png
│   │   └── icon-512.png
│   └── screenshots/
│       ├── desktop.png
│       └── mobile.png
└── supabase/
    ├── migrations/
    │   ├── 001_create_profiles.sql
    │   ├── 002_create_signals.sql
    │   ├── 003_create_chat_messages.sql
    │   └── 004_create_market_cache.sql
    └── seed.sql                      ← Data awal (opsional)
```

---

## 15. Environment Variables

### 15.1 Variabel yang Diperlukan

```bash
# ─── Supabase ────────────────────────────────────────────
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...              # Aman untuk expose ke client
SUPABASE_SERVICE_ROLE_KEY=eyJ...                  # RAHASIA — hanya di server

# ─── API Eksternal (server-side only, tidak pernah ke client) ──
OPENROUTER_API_KEY=sk-or-v1-...
API_NINJAS_KEY=xxxxx...

# ─── Aplikasi ────────────────────────────────────────────
NEXT_PUBLIC_APP_URL=https://goldai-scalper.vercel.app
NEXT_PUBLIC_APP_NAME=GoldAI Scalper

# ─── Opsional ────────────────────────────────────────────
OPENROUTER_FALLBACK_MODEL=google/gemma-4-31b-it:free
CANDLES_CACHE_TTL=60                              # Detik
PRICE_REVALIDATE=5                                # Detik
ANALYZE_RATE_LIMIT=20                             # Request per jam per user
```

### 15.2 Aturan Keamanan Environment

| Prefix | Visibility | Contoh |
|---|---|---|
| `NEXT_PUBLIC_` | Expose ke browser (client) | Supabase URL, Anon Key |
| Tanpa prefix | Server-only, tidak pernah ke browser | OpenRouter key, Service Role key, API Ninjas key |

> **PENTING:** `OPENROUTER_API_KEY`, `API_NINJAS_KEY`, dan `SUPABASE_SERVICE_ROLE_KEY` **tidak boleh** memiliki prefix `NEXT_PUBLIC_`. Jika salah, key akan terexpose ke semua user.

### 15.3 Setup di Vercel

1. Buka Vercel Dashboard → Project → Settings → Environment Variables
2. Tambahkan semua variabel di atas
3. Set environment: Production, Preview, Development (sesuai kebutuhan)
4. Untuk local development: buat file `.env.local` (jangan di-commit ke Git)
5. Tambahkan `.env.local` ke `.gitignore`

---

## 16. Alur Kerja Utama (User Flow)

### 16.1 Registrasi & Onboarding Pertama

```
1. User buka goldai-scalper.vercel.app
2. Landing page → klik "Mulai Gratis"
3. Halaman Register: isi email + password atau klik "Lanjut dengan Google"
4. Email konfirmasi dikirim (jika email/password)
5. User klik link konfirmasi → redirect ke /dashboard
6. Onboarding tour singkat: highlight fitur utama (3–5 langkah)
7. AI bot menyapa dan menjelaskan cara penggunaan
8. Auto-fetch data pasar pertama kali
```

### 16.2 Sesi Trading Normal

```
1. User buka /dashboard (session sudah ada, langsung masuk)
2. Harga XAUUSD langsung tampil di header (polling 5 detik)
3. TradingView chart auto-load
4. Sidebar menampilkan nilai indikator terakhir
5. Klik "⚡ Analisa Sekarang"
6. Server fetch paralel: price + 6 TF candles (dengan cache)
7. Kalkulasi 6 indikator di server
8. Streaming response dari OpenRouter → teks muncul bertahap di chat
9. Signal card muncul setelah response selesai
10. Signal banner update dengan level terbaru
11. Signal otomatis tersimpan ke Supabase
```

### 16.3 Review Signal History

```
1. User buka /signals
2. Tabel signal historis tampil (dari Supabase, ter-paginate)
3. Filter berdasarkan tipe, outcome, atau tanggal
4. Klik "Input Hasil" pada signal tertentu
5. Modal/form: pilih outcome (win/loss/breakeven), isi pips, tambah notes
6. Klik "Simpan" → PATCH /api/signals/[id]
7. Tabel update otomatis, summary statistik recalculate
```

### 16.4 Logout

```
1. Klik avatar user di header → dropdown menu
2. Klik "Keluar"
3. Supabase auth.signOut() dipanggil
4. Session dihapus, redirect ke /auth/login
```

---

## 17. Penanganan Error

### 17.1 Error API Eksternal

| Error | Kondisi | Penanganan |
|---|---|---|
| `503` gold-api.com down | Server tidak bisa reach gold-api.com | Return cached price + flag `cached: true` |
| `429` API Ninjas | Rate limit harian tercapai | Return cached OHLC + warning ke user |
| `429` OpenRouter DeepSeek | Model rate limit | Otomatis retry dengan fallback model Gemma |
| `401` OpenRouter | API key invalid | Log server error, return pesan "AI tidak tersedia" |
| Timeout > 30 detik | OpenRouter lambat | Abort + retry 1x, atau minta user coba lagi |

### 17.2 Error Autentikasi

| Error | Kondisi | Penanganan |
|---|---|---|
| Session expired | JWT kedaluwarsa | Supabase auto-refresh, jika gagal redirect ke login |
| Unauthorized | Akses route tanpa login | Redirect ke `/auth/login` via `proxy.ts` |
| Invalid credentials | Login dengan data salah | Tampilkan pesan error spesifik |
| Email belum konfirmasi | Login sebelum verifikasi | Tampilkan instruksi cek email |

### 17.3 Error UI

| Kondisi | Pesan ke User | Tindakan |
|---|---|---|
| Data OHLC kurang (< 14 candle) | "Data historis TF {{X}} tidak cukup, dilewati dari analisa" | Skip TF tersebut |
| Tidak ada koneksi internet | "Mode offline — menggunakan data terakhir" | Service worker cache |
| Rate limit user (20 req/jam) | "Batas analisa tercapai. Coba lagi dalam {{N}} menit." | Tampilkan countdown |
| AI response parsing gagal | "Format respons tidak dikenal, coba analisa ulang" | Tampilkan response mentah |

---

## 18. Keamanan & Privasi

### 18.1 Keamanan API Key

- Semua API key eksternal (OpenRouter, API Ninjas) disimpan di **Vercel environment variables** — tidak pernah dikirim ke browser
- Supabase `service_role` key hanya digunakan di server-side API routes
- Supabase `anon` key aman untuk client karena RLS aktif di semua tabel
- Tidak ada API key yang ditampilkan di UI settings

### 18.2 Row Level Security (RLS)

- Setiap user hanya bisa membaca dan menulis data miliknya sendiri
- Tabel `market_cache` tidak bisa diakses langsung dari client — hanya via API Route server
- `service_role` key bypass RLS — digunakan hanya di API Routes, tidak pernah di client

### 18.3 Input Validation

- Semua input dari user divalidasi di server sebelum diproses
- Panjang pesan chat dibatasi: maksimal 1000 karakter per pesan
- Conversation history yang dikirim ke AI: maksimal 10 pesan terakhir
- Query params API Routes divalidasi dengan Zod schema

### 18.4 Privasi Data

- Riwayat chat dan signal tersimpan di Supabase dengan RLS — tidak bisa diakses user lain
- Tidak ada tracking atau analytics pihak ketiga (Google Analytics, dll)
- Hanya data yang diperlukan yang disimpan ke database
- User bisa hapus semua data dari halaman Settings (hard delete)

---

## 19. Performa & Batasan

### 19.1 Target Performa (Vercel Edge)

| Metrik | Target |
|---|---|
| First Contentful Paint | < 1.5 detik |
| Time to Interactive | < 2.5 detik |
| Total API response (cached) | < 500ms |
| Total API response (fresh) | < 5 detik |
| AI streaming first token | < 3 detik |
| AI response complete | < 15 detik |
| Lighthouse Score | > 90 (PWA, Performance, Accessibility) |

### 19.2 Batasan yang Diketahui

| Batasan | Detail | Mitigasi |
|---|---|---|
| API Ninjas: ~100 req/hari | Dengan cache 60 detik + shared antar user, 100 req cukup untuk ~800+ analisa | Cache terpusat Supabase |
| OpenRouter free: 200 req/hari | Per model. Dengan fallback 2 model = 400 req/hari | Rate limit 20 req/jam per user |
| gold-api.com: harga bisa terlambat 1–5 menit | Bukan harga broker real-time | Label "harga referensi" di UI |
| Vercel free tier: 100GB bandwidth/bulan | Cukup untuk ribuan user aktif per bulan | Monitor di Vercel dashboard |
| Supabase free: 500MB database, 2GB bandwidth | Cukup untuk awal, upgrade jika perlu | Implementasi data retention policy |

### 19.3 Optimasi

- **Server-side cache** di Supabase `market_cache` untuk OHLC — drastis kurangi API Ninjas request
- **Next.js `fetch` cache** dengan `revalidate` untuk harga spot
- **React Server Components** untuk halaman yang tidak butuh interaktivitas
- **SWR** untuk data polling di client dengan deduplication
- **Streaming response** OpenRouter — user tidak perlu tunggu response selesai
- **Lazy load** TradingView widget dengan dynamic import
- **Image optimization** via Next.js `<Image>` component

---

## 20. Kriteria Penerimaan

### 20.1 Fungsional

- [ ] User dapat registrasi, login (email dan Google), dan logout
- [ ] Protected routes redirect ke login jika belum autentikasi
- [ ] Harga XAUUSD spot diperbarui setiap 5 detik dari gold-api.com via `/api/price`
- [ ] Data OHLC 6 timeframe berhasil difetch dari API Ninjas via `/api/candles`
- [ ] Cache terpusat bekerja: request kedua dalam 60 detik pakai data cache Supabase
- [ ] Semua 6 indikator terhitung di server dan dikirim ke AI
- [ ] AI response di-stream ke browser (karakter muncul bertahap)
- [ ] Signal berhasil di-parse dari response AI (type, entry, SL, TP1, TP2, confidence)
- [ ] Signal otomatis tersimpan ke tabel `signals` Supabase setelah analisa
- [ ] TradingView chart berhasil diembed dan menampilkan XAUUSD candlestick
- [ ] Signal history tampil di `/signals` dengan pagination dan filter
- [ ] User bisa input outcome (win/loss) pada signal historis
- [ ] Aplikasi dapat diinstall sebagai PWA
- [ ] Aplikasi menampilkan konten (offline mode) saat tidak ada koneksi
- [ ] API key OpenRouter dan API Ninjas tidak pernah tampil di browser DevTools Network

### 20.2 Non-Fungsional

- [ ] UI responsif di layar 375px hingga 1920px
- [ ] Dark mode konsisten di semua halaman
- [ ] Semua teks UI dalam Bahasa Indonesia
- [ ] Tidak ada data user yang bisa diakses user lain (RLS berfungsi)
- [ ] Lighthouse PWA score > 90
- [ ] Zero console errors di production

---

## 21. Roadmap Pengembangan

### Phase 1 — MVP

| Tugas | Status |
|---|---|
| PRD finalisasi | ✅ Selesai |
| Setup Next.js 16 (Turbopack default) + Supabase + Vercel | ⬜ |
| Migrasi database Supabase (4 tabel) | ⬜ |
| Implementasi autentikasi Supabase Auth | ⬜ |
| API Routes: price, candles, analyze, signals, chat | ⬜ |
| Kalkulasi 6 indikator di server | ⬜ |
| System prompt builder dinamis | ⬜ |
| Streaming response dari OpenRouter | ⬜ |
| Frontend: Dashboard layout (desktop + mobile) | ⬜ |
| Komponen: Chat, SignalCard, SignalBanner, Sidebar | ⬜ |
| TradingView Widget embed | ⬜ |
| Halaman Signal History | ⬜ |
| PWA manifest + service worker | ⬜ |
| Deploy ke Vercel | ⬜ |

### Phase 2 — Enhanced

| Tugas | Keterangan |
|---|---|
| Browser Push Notification | Alert saat signal kuat > 85% confidence |
| Mini candlestick chart sidebar | Lightweight Charts per timeframe |
| Export signal history ke CSV | Download untuk analisa eksternal |
| Win rate dashboard | Statistik akurasi signal per periode |
| Onboarding tour | Panduan in-app untuk user baru |
| Dark/light mode toggle | Opsional light mode |

### Phase 3 — Advanced

| Tugas | Keterangan |
|---|---|
| TradingView Pine Script Webhook | Terima data indikator langsung dari TradingView (butuh TV Plus) |
| Telegram bot integration | Forward signal ke channel/grup Telegram |
| Multi-pair support | EURUSD, GBPUSD, BTCUSD |
| Premium plan & payment | Stripe integration, fitur premium |
| Trade journal | Input & track semua posisi |
| Backtesting sederhana | Replay candle historis |

---

## 22. Referensi & Dokumentasi

| Resource | URL |
|---|---|
| Next.js 16 Docs | https://nextjs.org/docs |
| Next.js 16 Release Notes | https://nextjs.org/blog/next-16 |
| Next.js 16 Upgrade Guide | https://nextjs.org/docs/app/guides/upgrading/version-16 |
| Next.js App Router | https://nextjs.org/docs/app |
| Supabase Docs | https://supabase.com/docs |
| Supabase Auth (Next.js) | https://supabase.com/docs/guides/auth/auth-helpers/nextjs |
| Supabase Row Level Security | https://supabase.com/docs/guides/auth/row-level-security |
| Vercel Deployment Docs | https://vercel.com/docs |
| Vercel Environment Variables | https://vercel.com/docs/projects/environment-variables |
| OpenRouter API Docs | https://openrouter.ai/docs |
| OpenRouter Free Models | https://openrouter.ai/models?q=free |
| DeepSeek V4 Flash | https://openrouter.ai/deepseek/deepseek-v4-flash |
| API Ninjas Gold Price | https://api-ninjas.com/api/goldprice |
| gold-api.com Docs | https://gold-api.com/docs |
| TradingView Widget Docs | https://www.tradingview.com/widget-docs/ |
| TradingView Advanced Chart Widget | https://www.tradingview.com/widget-docs/widgets/charts/advanced-chart/ |
| PWA Documentation | https://web.dev/progressive-web-apps/ |
| Tailwind CSS | https://tailwindcss.com/docs |
| Shadcn/ui | https://ui.shadcn.com/docs |
| SWR (data fetching) | https://swr.vercel.app |
| Zod (validation) | https://zod.dev |

---

*GoldAI Scalper PRD v2.1.0 · Dibuat: 25 Mei 2026 · Stack: Next.js 16 + Supabase + Vercel · Status: Siap untuk Development*