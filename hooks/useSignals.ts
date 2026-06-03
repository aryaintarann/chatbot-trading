'use client'

import useSWR from 'swr'
import type { Signal } from '@/types/signal'

interface SignalsResponse {
  signals: Signal[]
  total: number
  page: number
  limit: number
}

function fetcher(url: string, userId: string) {
  return fetch(url, { headers: { 'x-user-id': userId } }).then(r => r.json())
}

export function useSignals(userId: string, page = 1, limit = 20, type?: string, outcome?: string) {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) })
  if (type) params.set('type', type)
  if (outcome) params.set('outcome', outcome)

  const { data, error, isLoading, mutate } = useSWR<SignalsResponse>(
    userId ? [`/api/signals?${params}`, userId] : null,
    ([url, uid]: [string, string]) => fetcher(url, uid)
  )

  async function updateOutcome(id: string, outcome: string, pips_result?: number, notes?: string) {
    await fetch(`/api/signals/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'x-user-id': userId },
      body: JSON.stringify({ outcome, pips_result, notes }),
    })
    mutate()
  }

  return {
    signals: data?.signals ?? [],
    total: data?.total ?? 0,
    isLoading,
    isError: !!error,
    updateOutcome,
    mutate,
  }
}
