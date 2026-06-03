export function TypingIndicator() {
  return (
    <div className="flex gap-3 mb-4">
      <div className="w-8 h-8 bg-[#F5C842] rounded-full flex items-center justify-center text-black text-sm flex-shrink-0">
        ⚡
      </div>
      <div className="bg-[#111827] border border-[rgba(255,255,255,0.06)] rounded-2xl rounded-tl-sm px-4 py-3">
        <div className="flex items-center gap-1">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="w-1.5 h-1.5 bg-[#F5C842] rounded-full animate-bounce-dot"
              style={{ animationDelay: `${i * 0.16}s` }}
            ></span>
          ))}
        </div>
      </div>
    </div>
  )
}
