import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(price: number): string {
  return price.toFixed(2)
}

export function formatPct(pct: number): string {
  return `${pct >= 0 ? '+' : ''}${pct.toFixed(2)}%`
}

export function getSessionLabel(): string {
  const now = new Date()
  const utcHour = now.getUTCHours()
  const wibHour = (utcHour + 7) % 24

  if (wibHour >= 14 && wibHour < 22) return 'London'
  if (wibHour >= 20 || wibHour < 5) return 'New York'
  if (wibHour >= 8 && wibHour < 16) return 'Asia'
  return 'Off-session'
}

export function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  const hours = Math.floor(mins / 60)
  const days = Math.floor(hours / 24)

  if (days > 0) return `${days}h lalu`
  if (hours > 0) return `${hours}j lalu`
  if (mins > 0) return `${mins}m lalu`
  return 'Baru saja'
}
