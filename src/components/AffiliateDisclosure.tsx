'use client'

import { useState } from 'react'

interface AffiliateDisclosureProps {
  className?: string
  compact?: boolean
}

export default function AffiliateDisclosure({ className = '', compact = false }: AffiliateDisclosureProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <div className={`text-[11px] leading-relaxed text-slate-500 dark:text-slate-400 ${className}`}>
        <span>PR / アフィリエイト広告を含みます</span>
        {!compact && <span className="mx-1.5 text-slate-300 dark:text-slate-600">/</span>}
        <button
          type="button"
          onClick={() => setOpen(true)}
          className={`${compact ? 'ml-1.5' : ''} font-medium text-violet-700 underline decoration-violet-300 underline-offset-2 transition-colors hover:text-violet-900 dark:text-violet-300 dark:decoration-violet-400/40 dark:hover:text-violet-100`}
        >
          免責・広告について
        </button>
      </div>

      {open && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/30 px-4 py-6 backdrop-blur-sm">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="affiliate-disclosure-title"
            className="max-h-[86vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl shadow-slate-950/20 dark:border-white/10 dark:bg-slate-950 dark:text-slate-100"
          >
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <p id="affiliate-disclosure-title" className="text-sm font-bold text-slate-900 dark:text-white">
                  免責・広告について
                </p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Lens Navi の購入リンクと提案内容に関する表示です。
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg px-2 py-1 text-xs font-medium text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-white"
              >
                閉じる
              </button>
            </div>

            <div className="space-y-3 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
              <p>
                Amazonのアソシエイトとして、Lens Navi は適格販売により収入を得ています。
              </p>
              <p>
                Lens Navi は、Amazonアソシエイト、楽天アフィリエイト、その他アフィリエイトプログラムを利用しています。リンク先の商品を購入すると、運営者が紹介料を受け取る場合があります。
              </p>
              <p>
                掲載している価格・在庫・仕様・レビュー傾向は、取得時点または表示時点の情報をもとにしています。実際の価格、在庫、仕様、販売条件は変更される場合があります。購入前に必ず販売サイトの最新情報をご確認ください。
              </p>
              <p>
                AIによるレンズ提案は、ユーザーの入力内容、公開されている仕様、既存データ、一般的なレビュー傾向などをもとにした参考情報です。特定の商品購入や撮影結果を保証するものではありません。
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
