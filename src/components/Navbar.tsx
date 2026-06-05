'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { BookOpenText, MessageCircle, Warehouse, Moon, Sun } from 'lucide-react'
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
    <nav className="sticky top-0 z-50 overflow-hidden border-b border-slate-200/80 bg-white/85 shadow-sm shadow-slate-900/5 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/80 dark:shadow-black/20">
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-[radial-gradient(60%_120%_at_50%_100%,rgba(124,58,237,0.08)_0%,rgba(217,70,239,0.04)_38%,transparent_72%)]" />
      <div className="relative mx-auto flex max-w-5xl items-center justify-between px-4 py-2.5">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5 font-semibold text-slate-950 dark:text-white">
          <span className="rounded-xl bg-[linear-gradient(90deg,#2563EB_0%,#7C3AED_52%,#D946EF_100%)] p-[1px] shadow-[0_8px_22px_rgba(124,58,237,0.08)]">
            <span className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-[11px] bg-white dark:bg-slate-950">
              <Image
                src="/brand/lens-navi-icon.png"
                alt="Lens Navi"
                width={30}
                height={30}
                className="h-[30px] w-[30px] rounded-[9px] object-cover"
                priority
              />
            </span>
          </span>
          <span className="flex flex-col leading-tight">
            <span className="text-sm tracking-tight md:text-[15px]">Lens Navi</span>
            <span className="hidden text-[11px] font-medium text-slate-500 md:block dark:text-slate-400">レンズ選びのAIナビ</span>
          </span>
        </Link>

        {/* Screen nav + Dark mode */}
        <div className="flex items-center gap-1 rounded-2xl border border-slate-200/80 bg-white/75 p-1 shadow-sm shadow-slate-200/60 backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.04] dark:shadow-none">
          <div className="flex items-center gap-1">
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
            href="/scene-playbooks"
            className={`rounded-xl p-[1px] text-sm font-medium transition-all ${
              pathname === '/scene-playbooks'
                ? 'bg-[linear-gradient(90deg,#2563EB_0%,#7C3AED_52%,#D946EF_100%)] shadow-[0_8px_22px_rgba(124,58,237,0.08)]'
                : 'bg-transparent hover:bg-slate-200/80 dark:hover:bg-white/10'
            }`}
          >
            <span className={`flex items-center gap-1.5 whitespace-nowrap rounded-[11px] px-3 py-1.5 transition-colors ${
              pathname === '/scene-playbooks'
                ? 'bg-white text-slate-950 dark:bg-slate-950 dark:text-white'
                : 'text-slate-600 dark:text-slate-300'
            }`}>
              <BookOpenText className="h-4 w-4" />
              <span className="hidden sm:inline">シーンガイド</span>
              <span className="sm:hidden">シーン</span>
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
