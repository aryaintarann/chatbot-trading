'use client'

interface QuickButtonsProps {
  onSend: (message: string) => void
  onRefresh: () => void
  isLoading: boolean
}

const QUICK_ACTIONS = [
  { label: '⚡ Analisa Sekarang', message: 'Analisa pasar XAUUSD sekarang dan berikan signal trading terbaru' },
  { label: '📰 Cek Berita', message: 'Apakah ada berita penting yang dapat mempengaruhi XAUUSD hari ini?' },
  { label: '🎯 Setup Entry', message: 'Jelaskan setup entry terbaik untuk scalper berdasarkan kondisi saat ini' },
  { label: '📊 S/R Levels', message: 'Berikan level support dan resistance XAUUSD yang paling penting saat ini' },
  { label: '🛡️ Risk Mgmt', message: 'Bagaimana risk management yang tepat untuk signal yang diberikan?' },
]

export function QuickButtons({ onSend, onRefresh, isLoading }: QuickButtonsProps) {
  return (
    <div className="flex items-center gap-2 px-4 py-2 overflow-x-auto scrollbar-hide">
      {QUICK_ACTIONS.map((action) => (
        <button
          key={action.label}
          onClick={() => onSend(action.message)}
          disabled={isLoading}
          className="flex-shrink-0 bg-[rgba(245,200,66,0.08)] border border-[rgba(245,200,66,0.2)] text-[#F5C842] text-xs px-3 py-1.5 rounded-full hover:bg-[rgba(245,200,66,0.15)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
        >
          {action.label}
        </button>
      ))}
      <button
        onClick={onRefresh}
        disabled={isLoading}
        className="flex-shrink-0 bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] text-gray-400 text-xs px-3 py-1.5 rounded-full hover:bg-[rgba(255,255,255,0.08)] transition-colors disabled:opacity-50 whitespace-nowrap"
      >
        🔄 Refresh
      </button>
    </div>
  )
}
