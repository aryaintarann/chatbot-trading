'use client'

import { useEffect, useRef } from 'react'

export function TradingViewWidget() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const script = document.createElement('script')
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js'
    script.type = 'text/javascript'
    script.async = true
    script.innerHTML = JSON.stringify({
      autosize: true,
      symbol: 'OANDA:XAUUSD',
      interval: '5',
      timezone: 'Asia/Jakarta',
      theme: 'dark',
      style: '1',
      locale: 'id',
      backgroundColor: 'rgba(13, 18, 32, 1)',
      gridColor: 'rgba(245, 200, 66, 0.05)',
      hide_top_toolbar: false,
      hide_legend: false,
      allow_symbol_change: false,
      save_image: false,
      calendar: false,
      hide_volume: false,
      support_host: 'https://www.tradingview.com',
    })

    container.appendChild(script)

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = ''
      }
    }
  }, [])

  return (
    // overflow-hidden wajib — cegah iframe TradingView meluber keluar kontainer
    <div
      ref={containerRef}
      className="tradingview-widget-container w-full h-full overflow-hidden"
    >
      <div className="tradingview-widget-container__widget w-full h-full" />
    </div>
  )
}
