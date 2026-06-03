import type { ParsedSignal } from '@/types/signal'
import { SignalCard } from './SignalCard'

interface MessageBubbleProps {
  role: 'user' | 'assistant'
  content: string
  signal?: ParsedSignal | null
  isStreaming?: boolean
  confidenceScore?: number
  session?: string
}

function renderMarkdown(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`([^`]+)`/g, '<code class="bg-[rgba(245,200,66,0.1)] text-[#F5C842] px-1 py-0.5 rounded text-xs font-mono">$1</code>')
    .replace(/\n/g, '<br/>')
}

// Cek apakah teks sudah eksplisit menyebut BUY/SELL di baris pertama
function hasExplicitDirection(text: string): boolean {
  const firstLine = text.split('\n')[0] ?? ''
  return /🟢|🔴|⏳|\bBUY\b|\bSELL\b|\bWAIT\b/i.test(firstLine)
}

export function MessageBubble({ role, content, signal, isStreaming, confidenceScore, session }: MessageBubbleProps) {
  if (role === 'user') {
    return (
      <div className="flex justify-end gap-3 mb-4">
        <div className="max-w-[80%] bg-[rgba(245,200,66,0.1)] border border-[rgba(245,200,66,0.2)] rounded-2xl rounded-tr-sm px-4 py-3">
          <p className="text-gray-200 text-sm leading-relaxed">{content}</p>
        </div>
        <div className="w-8 h-8 bg-[rgba(245,200,66,0.2)] rounded-full flex items-center justify-center text-[#F5C842] text-sm flex-shrink-0">
          👤
        </div>
      </div>
    )
  }

  // Jika signal sudah di-parse tapi AI tidak menyebut arah di teks → inject label
  const showDirectionBadge =
    !isStreaming &&
    signal &&
    signal.type !== 'wait' &&
    !hasExplicitDirection(content)

  const directionConfig = {
    buy:  { label: '🟢 BUY',  bg: 'bg-[rgba(34,211,160,0.12)]',  text: 'text-[#22d3a0]', border: 'border-[rgba(34,211,160,0.3)]' },
    sell: { label: '🔴 SELL', bg: 'bg-[rgba(240,84,112,0.12)]',  text: 'text-[#f05470]', border: 'border-[rgba(240,84,112,0.3)]' },
    wait: { label: '⏳ WAIT', bg: 'bg-[rgba(245,200,66,0.08)]',  text: 'text-[#F5C842]', border: 'border-[rgba(245,200,66,0.2)]'  },
  }

  return (
    <div className="flex gap-3 mb-4">
      <div className="w-8 h-8 bg-[#F5C842] rounded-full flex items-center justify-center text-black text-sm flex-shrink-0 mt-0.5">
        ⚡
      </div>
      <div className="max-w-[85%] flex-1">
        {/* Badge arah — muncul jika AI lupa sebutkan di teks */}
        {showDirectionBadge && signal && (
          <div className={`inline-flex items-center gap-2 mb-2 px-3 py-1.5 rounded-lg border text-sm font-bold font-mono
            ${directionConfig[signal.type].bg}
            ${directionConfig[signal.type].text}
            ${directionConfig[signal.type].border}`}
          >
            {directionConfig[signal.type].label}
          </div>
        )}

        <div className="bg-[#111827] border border-[rgba(255,255,255,0.06)] rounded-2xl rounded-tl-sm px-4 py-3">
          <div
            className="text-gray-200 text-sm leading-relaxed"
            dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
          />
          {isStreaming && (
            <span className="inline-block w-0.5 h-4 bg-[#F5C842] ml-0.5 animate-pulse align-middle"></span>
          )}
        </div>

        {signal && !isStreaming && (
          <SignalCard signal={signal} confidenceScore={confidenceScore} session={session} />
        )}
      </div>
    </div>
  )
}
