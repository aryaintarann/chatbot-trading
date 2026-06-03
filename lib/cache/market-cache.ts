import { createClient } from '@supabase/supabase-js'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getServiceClient(): any {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function getCached<T>(key: string): Promise<T | null> {
  const supabase = getServiceClient()
  const { data, error } = await supabase
    .from('market_cache')
    .select('data, expires_at')
    .eq('cache_key', key)
    .single()

  if (error || !data) return null
  if (new Date(data.expires_at) < new Date()) return null

  return data.data as T
}

export async function setCache<T>(key: string, value: T, ttlSeconds: number): Promise<void> {
  const supabase = getServiceClient()
  const now = new Date()
  const expiresAt = new Date(now.getTime() + ttlSeconds * 1000)

  await supabase
    .from('market_cache')
    .upsert({
      cache_key: key,
      data: value,
      fetched_at: now.toISOString(),
      expires_at: expiresAt.toISOString(),
    }, { onConflict: 'cache_key' })
}
