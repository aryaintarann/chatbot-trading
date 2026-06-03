'use client'

import useSWR from 'swr'
import type { PriceResponse } from '@/types/candle'

const fetcher = (url: string) => fetch(url).then(r => r.json())

export function usePrice() {
  const { data, error, isLoading } = useSWR<PriceResponse>('/api/price', fetcher, {
    refreshInterval: 5000,
    revalidateOnFocus: true,
  })

  return {
    price: data,
    isLoading,
    isError: !!error,
  }
}
