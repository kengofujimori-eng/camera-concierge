'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Camera, MessageCircle, Warehouse, Moon, Sun } from 'lucide-react'
import { useEffect, useState } from 'react'

export default function Navbar() {
  const pathname = usePathname()
  const [darkMode, setDarkMode] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('darkMode')
    if (saved === 'true' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setDarkMode(true)
      document.documentElement.classList.add('dark')
    }
  }, [])

  function toggleDarkMode() {
    const next = !darkMode
    setDarkMode(next)
    localStorage.setItem('darkMode', String(next))
    document.documentElement.classList.toggle('dark', next)
  }

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/85 shadow-sm shadow-slate-900/5 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/80 dark:shadow-black/20">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-2.5">
        {/* Mobile brand. Desktop brand lives in the sidebar. */}
        <Link href="/" className="flex items-center gap-2 font-semibold text-slate-950 md:hidden dark:text-white">
          <span className="rounded-xl bg-[linear-gradient(90deg,#2563EB_0%,#7C3AED_52%,#D946EF_100%)] p-[1px] shadow-[0_8px_22px_rgba(124,58,237,0.08)]">
            <span className="flex h-8 w-8 items-center justify-center rounded-[11px] bg-white dark:bg-slate-950">
              <Camera className="h-4 w-4 text-violet-700 dark:text-violet-300" />
            </span>
          </span>
          <span className="text-sm tracking-tight">Camera Concierge</span>
        </Link>
        <div className="hidden md:block" aria-hidden="true" />

        {/* Screen nav + Dark mode */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 rounded-2xl border border-slate-200/80 bg-white/80 p-1 shadow-sm shadow-slate-200/60 dark:border-white/10 dark:bg-white/[0.04] dark:shadow-none">
          <Link
            href="/"
            className={`flex items-center gap-1.5 rounded-xl p-[1px] text-sm font-medium transition-all ${
              pathname === '/'
                ? 'bg-[linear-gradient(90deg,#2563EB_0%,#7C3AED_52%,#D946EF_100%)] shadow-[0_8px_22px_rgba(124,58,237,0.08)]'
                : 'bg-transparent hover:bg-slate-200/80 dark:hover:bg-white/10'
            }`}
          >
            <span className={`flex items-center gap-1.5 rounded-[11px] px-3 py-1.5 transition-colors ${
              pathname === '/'
                ? 'bg-white text-slate-950 dark:bg-slate-950 dark:text-white'
                : 'text-slate-600 dark:text-slate-300'
            }`}>
              <MessageCircle className="h-4 w-4" />
              相談
            </span>
          </Link>
          <Link
            href="/warehouse"
            className={`rounded-xl p-[1px] text-sm font-medium transition-all ${
              pathname === '/warehouse'
                ? 'bg-[linear-gradient(90deg,#2563EB_0%,#7C3AED_52%,#D946EF_100%)] shadow-[0_8px_22px_rgba(124,58,237,0.08)]'
                : 'bg-transparent hover:bg-slate-200/80 dark:hover:bg-white/10'
            }`}
          >
            <span className={`flex items-center gap-1.5 rounded-[11px] px-3 py-1.5 transition-colors ${
              pathname === '/warehouse'
                ? 'bg-white text-slate-950 dark:bg-slate-950 dark:text-white'
                : 'text-slate-600 dark:text-slate-300'
            }`}>
              <Warehouse className="h-4 w-4" />
              倉庫
            </span>
          </Link>
          </div>
          <button
            onClick={toggleDarkMode}
            className="rounded-xl border border-transparent p-2 text-slate-500 transition-colors hover:border-violet-300/50 hover:bg-white dark:text-slate-400 dark:hover:border-violet-400/30 dark:hover:bg-white/10"
            aria-label="ダークモード切替"
          >
            {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
        </div>
      </div>
    </nav>
  )
}
