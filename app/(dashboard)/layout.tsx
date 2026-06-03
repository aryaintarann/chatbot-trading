import { Header } from '@/components/layout/Header'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col h-screen bg-[#080c14] overflow-hidden">
      <Header />
      <main className="flex-1 min-h-0 overflow-hidden">
        {children}
      </main>
    </div>
  )
}
