'use client'

import { useState, useRef, useEffect } from 'react'
import {
  Activity,
  Baby,
  Bird,
  Bot,
  Camera as CameraIcon,
  Check,
  ChevronDown,
  ChevronRight,
  CircleDollarSign,
  Map,
  Mountain,
  Package,
  Send,
  Settings,
  User,
  UserRound,
  Warehouse,
  X,
  RotateCcw,
  type LucideIcon,
} from 'lucide-react'
import { motion, AnimatePresence, type Variants } from 'framer-motion'
import Link from 'next/link'
import { ChatMessage } from '@/types'
import { marked } from 'marked'
import DOMPurify from 'dompurify'
import LensRecommendationCards from './LensRecommendationCards'
import { generateAmazonSearchUrl } from '@/lib/affiliateLinks'

marked.setOptions({ breaks: true })

// ── マウント定義 ───────────────────────────────────────────
interface MountOption {
  id: string
  label: string       // 表示名
  sub: string         // センサーサイズ等
  prompt: string      // Difyに送るテキスト
}

const MOUNTS: MountOption[] = [
  { id: 'sony-e-ff',   label: 'Sony E',        sub: 'フルサイズ',          prompt: 'Sony Eマウント（フルサイズ）' },
  { id: 'sony-e-apsc', label: 'Sony E',        sub: 'APS-C',              prompt: 'Sony Eマウント（APS-C）' },
  { id: 'canon-rf',    label: 'Canon RF',      sub: 'フルサイズ',          prompt: 'Canon RFマウント（フルサイズ）' },
  { id: 'canon-rf-s',  label: 'Canon RF-S',   sub: 'APS-C',              prompt: 'Canon RF-Sマウント（APS-C）' },
  { id: 'nikon-z-ff',  label: 'Nikon Z',       sub: 'フルサイズ',          prompt: 'Nikon Zマウント（フルサイズ）' },
  { id: 'nikon-z-apsc',label: 'Nikon Z',       sub: 'APS-C (DX)',         prompt: 'Nikon Zマウント（APS-C / DX）' },
  { id: 'fuji-x',      label: 'Fujifilm X',    sub: 'APS-C',              prompt: 'Fujifilm Xマウント（APS-C）' },
  { id: 'fuji-gfx',    label: 'Fujifilm GFX',  sub: '中判',               prompt: 'Fujifilm GFXマウント（中判）' },
  { id: 'm43',         label: 'Micro 4/3',     sub: 'マイクロフォーサーズ', prompt: 'マイクロフォーサーズマウント（MFT）' },
  { id: 'leica-m',     label: 'Leica M',       sub: 'フルサイズ',          prompt: 'Leica Mマウント（フルサイズ）' },
]

const MOUNT_EXAMPLES: Record<string, string> = {
  'sony-e-ff': 'α7 / α9 / α1 系',
  'sony-e-apsc': 'α6000 / α6400 / ZV-E10 系',
  'canon-rf': 'EOS R / R6 / R5 系',
  'canon-rf-s': 'R50 / R10 / R7 系',
  'nikon-z-ff': 'Z5 / Z6 / Z7 / Z8 系',
  'nikon-z-apsc': 'Z30 / Z50 / Z fc 系',
  'fuji-x': 'X-T / X-S / X-E 系',
  'fuji-gfx': 'GFX 系',
  m43: 'OM / Lumix G 系',
  'leica-m': 'M型ライカ',
}

// ── マウント別ボディ一覧 ──────────────────────────────────
const BODIES_BY_MOUNT: Record<string, string[]> = {
  'sony-e-ff': [
    // α1 / α9シリーズ
    'α1 II','α1',
    'α9 III','α9 II','α9',
    // α7シリーズ（現行〜旧世代）
    'α7 V','α7 IV','α7 III','α7 II','α7',
    // α7Rシリーズ
    'α7R V','α7R IV','α7R III','α7R II','α7R',
    // α7Sシリーズ
    'α7S III','α7S II','α7S',
    // α7Cシリーズ
    'α7C II','α7C R','α7C',
    // 動画・シネマ寄りの代表機
    'ZV-E1','FX3',
  ],
  'sony-e-apsc': [
    'α6700','α6600','α6500','α6400','α6300','α6100','α6000',
    'ZV-E10 II','ZV-E10',
    // 動画・シネマ寄りの代表機
    'FX30',
    'α5100','α5000',
    'NEX-7','NEX-6','NEX-5T','NEX-5R','NEX-3N',
  ],
  'canon-rf': [
    // プロ・ハイエンド
    'EOS R1','EOS R3','EOS R5 Mark II','EOS R5','EOS R5 C',
    // ミドル
    'EOS R6 Mark III','EOS R6 Mark II','EOS R6',
    // エントリー
    'EOS R8','EOS RP','EOS R',
    // 特殊
    'EOS Ra',
  ],
  'canon-rf-s': [
    'EOS R7','EOS R10','EOS R50 V','EOS R50','EOS R100',
  ],
  'nikon-z-ff': [
    // プロ・ハイエンド
    'Z9','Z8',
    // ミドル
    'Z7 II','Z7',
    'Z6 III','Z6 II','Z6',
    'Z5 II','Z5',
    // クリエイティブ
    'Zf',
  ],
  'nikon-z-apsc': [
    'Z50 II','Z50','Z30','Zfc',
  ],
  'fuji-x': [
    // X-Tシリーズ
    'X-T5','X-T4','X-T3','X-T2','X-T1',
    'X-T50','X-T30 III','X-T30 II','X-T30','X-T20','X-T10',
    // X-Hシリーズ
    'X-H2S','X-H2','X-H1',
    // X-Sシリーズ
    'X-S20','X-S10',
    // X-Proシリーズ
    'X-Pro3','X-Pro2','X-Pro1',
    // X-Eシリーズ
    'X-E5','X-E4','X-E3','X-E2S','X-E2',
    // コンパクト（レンズ交換式）
    'X-M5',
  ],
  'fuji-gfx': [
    'GFX100S II','GFX100 II','GFX100S','GFX100',
    'GFX50S II','GFX50S','GFX50R',
  ],
  'm43': [
    // OM SYSTEM / Olympus
    'OM-1 Mark II','OM-1','OM-3','OM-5 Mark II','OM-5',
    'OM-D E-M1X','OM-D E-M1 Mark III','OM-D E-M1 Mark II','OM-D E-M1',
    'OM-D E-M5 Mark III','OM-D E-M5 Mark II','OM-D E-M5',
    'OM-D E-M10 Mark IV','OM-D E-M10 Mark III','OM-D E-M10 Mark II','OM-D E-M10',
    'PEN-F','E-P7','E-PL10','E-PL9',
    // Panasonic LUMIX G
    'Lumix GH7','Lumix GH6','Lumix GH5 II','Lumix GH5S','Lumix GH5','Lumix GH4',
    'Lumix G9 II','Lumix G9',
    'Lumix G100D','Lumix G100',
    'Lumix G99D','Lumix G99','Lumix G95','Lumix G85','Lumix G7',
    'Lumix GX9','Lumix GX8','Lumix GX7 Mark III',
  ],
  'leica-m': [
    'M11-P','M11 Monochrom','M11',
    'M10-R','M10-P','M10 Monochrom','M10',
    'M Typ 240','M-E Typ 240',
    'M9','M8',
  ],
}

// ── 予算定義 ─────────────────────────────────────────────
interface BudgetOption { id: string; label: string; prompt: string }
const BUDGETS: BudgetOption[] = [
  { id: 'b50k',  label: '〜5万',   prompt: '予算5万円以下' },
  { id: 'b100k', label: '〜10万',  prompt: '予算10万円以下' },
  { id: 'b200k', label: '〜20万',  prompt: '予算20万円以下' },
  { id: 'b300k', label: '〜30万',  prompt: '予算30万円以下' },
  { id: 'bany',  label: '無制限',  prompt: '予算は特に問わない' },
]

type LensType = 'auto' | 'prime' | 'zoom' | 'macro'

interface LensTypeOption {
  id: LensType
  label: string
  description: string
  prompt?: string
  hint?: string
}

const LENS_TYPES: LensTypeOption[] = [
  { id: 'auto', label: 'おまかせ', description: '用途に合わせて最適化' },
  {
    id: 'prime',
    label: '単焦点',
    description: '明るさ・描写・ボケ重視',
    prompt: 'レンズタイプ希望: 単焦点',
    hint: 'ズームではなく、明るさ・描写・ボケを重視した単焦点レンズを優先してください。',
  },
  {
    id: 'zoom',
    label: 'ズーム',
    description: '焦点距離の柔軟性重視',
    prompt: 'レンズタイプ希望: ズーム',
    hint: '焦点距離の柔軟性と使いやすさを重視したズームレンズを優先してください。',
  },
  {
    id: 'macro',
    label: 'マクロ',
    description: '近接・等倍撮影を重視',
    prompt: 'レンズタイプ希望: マクロ',
    hint: '近接撮影や等倍近接に対応するマクロレンズを優先してください。',
  },
]

function getLensTypeOption(id: LensType): LensTypeOption {
  return LENS_TYPES.find((type) => type.id === id) ?? LENS_TYPES[0]
}


// ── 焦点距離レンジ ────────────────────────────────────────
interface FocalRange { minMm: number; maxMm: number }

const FOCAL_LOG_MIN = Math.log10(12)
const FOCAL_LOG_MAX = Math.log10(600)
const FOCAL_SNAP_MMS = [12, 14, 16, 18, 20, 24, 28, 35, 50, 55, 85, 100, 105, 135, 150, 200, 300, 400, 600]

function mmToLogPct(mm: number): number {
  return (Math.log10(Math.max(12, Math.min(600, mm))) - FOCAL_LOG_MIN) / (FOCAL_LOG_MAX - FOCAL_LOG_MIN)
}
function logPctToMm(pct: number): number {
  return 10 ** (pct * (FOCAL_LOG_MAX - FOCAL_LOG_MIN) + FOCAL_LOG_MIN)
}
function snapMm(mm: number): number {
  return FOCAL_SNAP_MMS.reduce((best, v) => (Math.abs(v - mm) < Math.abs(best - mm) ? v : best))
}
function getFocalRangePrompt(r: FocalRange): string {
  const { minMm, maxMm } = r
  const zones: string[] = []
  if (minMm < 24) zones.push('超広角')
  if (minMm < 35 && maxMm > 24) zones.push('広角')
  if (minMm < 85 && maxMm > 35) zones.push('標準')
  if (minMm < 135 && maxMm > 85) zones.push('ポートレート')
  if (maxMm >= 135) zones.push('望遠')
  const zoneText =
    zones.length >= 2
      ? `（${zones[0]}〜${zones[zones.length - 1]}域）`
      : zones.length === 1
      ? `（${zones[0]}域）`
      : ''
  return `焦点距離は${minMm}mm〜${maxMm}mmの範囲${zoneText}を希望`
}

function getFocalPriorityHint(text: string, range: FocalRange | null): string {
  const mentionsAround50 = /50\s*mm\s*(前後|周辺|付近|あたり|くらい|近辺)/i.test(text)
  const selectedAround50 =
    Boolean(range) &&
    range!.minMm <= 50 &&
    range!.maxMm >= 50 &&
    range!.minMm >= 35 &&
    range!.maxMm <= 85

  if (!mentionsAround50 && !selectedAround50) return ''

  return '50mm前後の単焦点希望では、主候補は原則45〜58mm程度を優先してください。85mmは画角が離れるため、通常候補ではなくポートレート向けの番外候補として扱ってください。'
}

// ── AI選択肢の自動検出 ───────────────────────────────────
interface Choice { number: string; label: string; sendText: string }

function parseChoices(text: string): Choice[] {
  const choices: Choice[] = []
  const lines = text.split('\n')
  for (const line of lines) {
    const stripped = line.trim()
    // 「1. 「label」...」「1. **label**...」「1. label →...」パターン
    const m =
      stripped.match(/^(\d+)[.．]\s*[「『]([^」』\n]{2,30})[」』]/) ||
      stripped.match(/^(\d+)[.．]\s*\*\*([^*\n]{2,30})\*\*/) ||
      stripped.match(/^(\d+)[.．]\s*([^\s\n→➤][^\n→➤]{2,28}?)\s*[→➤]/)
    if (m) {
      const label = m[2].trim()
      choices.push({
        number: m[1],
        label,
        sendText: `「${label}」で提案してください`,
      })
    }
  }
  // 2件以上連続して検出できた場合のみ有効
  return choices.length >= 2 ? choices.slice(0, 6) : []
}

// ── 選択肢ボタン ──────────────────────────────────────────
function ChoiceButtons({ text, onSelect }: { text: string; onSelect: (t: string) => void }) {
  const choices = parseChoices(text)
  if (choices.length === 0) return null
  return (
    <div className="mt-3 flex flex-col gap-2">
      <p className="text-[11px] text-slate-500 dark:text-slate-400 px-0.5">👆 選択して続ける</p>
      <div className="flex flex-wrap gap-2">
        {choices.map((c) => (
          <motion.button
            key={c.number}
            onClick={() => onSelect(c.sendText)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            className="flex items-center gap-2 rounded-xl border border-indigo-200/70 bg-white/70 px-3 py-2 text-xs font-medium text-violet-700 shadow-sm shadow-fuchsia-500/5 backdrop-blur transition-colors hover:border-violet-400/70 hover:bg-indigo-50 dark:border-indigo-400/20 dark:bg-indigo-400/10 dark:text-indigo-200 dark:hover:bg-indigo-400/15"
          >
            <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-indigo-400/15 text-[10px] font-bold text-violet-700 dark:text-indigo-200">
              {c.number}
            </span>
            {c.label}
          </motion.button>
        ))}
      </div>
    </div>
  )
}

// ── 撮影シーン ────────────────────────────────────────────
interface SceneOption {
  icon: LucideIcon
  label: string
  desc: string
  q: string
}

const SCENES: SceneOption[] = [
  { icon: Baby, label: '子供・家族', desc: '室内・動き・AF', q: '子供を室内で撮りたい' },
  { icon: UserRound, label: 'ポートレート', desc: '背景ぼけ・肌写り', q: 'ポートレートを美しく撮りたい' },
  { icon: Mountain, label: '風景・星空', desc: '広角・解像感', q: '風景や星空を撮りたい' },
  { icon: Activity, label: 'スポーツ・動体', desc: '追従AF・望遠', q: '動き回る被写体をしっかり撮りたい' },
  { icon: Bird, label: '野鳥・望遠', desc: '超望遠・軽さ', q: '野鳥や飛行機を望遠で撮りたい' },
  { icon: Package, label: '料理・物撮り', desc: '近接・質感', q: '料理やテーブルフォトを撮りたい' },
  { icon: Map, label: '旅行・街歩き', desc: '携帯性・汎用性', q: '旅行に持ち出せる軽いレンズが欲しい' },
  { icon: CircleDollarSign, label: 'コスパ重視', desc: '価格・性能バランス', q: 'コスパ最強のレンズを教えてほしい' },
]

const QUICK_QUESTIONS = SCENES.map((s) => s.q)

// ── マウント選択パネル ────────────────────────────────────
function MountSelector({
  selected,
  onChange,
}: {
  selected: MountOption | null
  onChange: (m: MountOption) => void
}) {
  const [open, setOpen] = useState(false)

  return (
    <div className="relative">
      {/* 現在のマウント表示 */}
      <button
        data-testid="selected-mount-display"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-left shadow-sm shadow-slate-200/50 transition-all hover:border-slate-300 hover:bg-slate-50 group dark:border-white/10 dark:bg-slate-900/80 dark:shadow-black/20 dark:hover:border-violet-400/40 dark:hover:bg-slate-800"
      >
        <div className="flex items-center gap-2 min-w-0">
          <div className="h-6 w-6 rounded-md bg-slate-100 flex items-center justify-center flex-shrink-0 ring-1 ring-slate-200 dark:bg-slate-800 dark:ring-white/10">
            <CameraIcon className="h-3.5 w-3.5 text-violet-700 dark:text-violet-300" />
          </div>
          {selected ? (
            <div className="min-w-0">
              <p className="text-xs font-semibold text-slate-900 truncate dark:text-white">{selected.label}</p>
              <p className="text-[10px] text-slate-600 truncate dark:text-slate-400">{selected.sub}</p>
            </div>
          ) : (
            <p className="text-xs font-medium text-slate-600 dark:text-slate-400">マウントを選択...</p>
          )}
        </div>
        <ChevronDown className={`h-3.5 w-3.5 text-slate-500 flex-shrink-0 transition-transform dark:text-slate-400 ${open ? 'rotate-180' : ''}`} />
      </button>

      {/* ドロップダウン */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 right-0 mt-1 rounded-xl border border-slate-200 bg-white shadow-xl shadow-slate-900/10 overflow-hidden z-50 dark:border-white/10 dark:bg-slate-950 dark:shadow-black/40"
          >
            <p className="px-3 pt-2.5 pb-1 text-[10px] font-semibold text-slate-500 uppercase tracking-widest dark:text-slate-400">
              使用マウント
            </p>
            <div className="pb-1.5 max-h-60 overflow-y-auto">
              {MOUNTS.map((m) => (
                <button
                  key={m.id}
                  data-testid={`mount-option-${m.id}`}
                  onClick={() => { onChange(m); setOpen(false) }}
                  className="w-full flex items-center justify-between gap-2 px-3 py-2 text-left transition-colors hover:bg-slate-50 dark:hover:bg-slate-900"
                >
                  <div>
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">{m.label}</p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">{m.sub}</p>
                  </div>
                  {selected?.id === m.id && (
                    <Check className="h-3.5 w-3.5 text-indigo-300 flex-shrink-0" />
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ── 予算スライダー ────────────────────────────────────────
const BUDGET_DOT_COLORS = ['#2563EB', '#3B63EC', '#6366F1', '#818CF8', '#A78BFA']

function BudgetSlider({
  selected,
  onChange,
}: {
  selected: BudgetOption | null
  onChange: (b: BudgetOption | null) => void
}) {
  const idx = selected ? BUDGETS.findIndex((b) => b.id === selected.id) : -1

  return (
    <div className="px-1">
      <div className="flex items-center justify-between mb-2">
        <p className="text-[10px] font-medium text-slate-600 dark:text-slate-300">レンズ予算</p>
        {selected && (
          <button
            onClick={() => onChange(null)}
            className="text-[9px] text-slate-500 hover:text-slate-800 transition-colors dark:text-slate-400 dark:hover:text-slate-200"
          >
            ✕ 解除
          </button>
        )}
      </div>
      {/* ラベル行 */}
      <div className="flex justify-between mb-1.5 px-1">
        {BUDGETS.map((b, i) => (
          <span
            key={b.id}
            className={`text-[9px] font-medium transition-colors ${
              i === idx ? 'text-[#4F46E5] dark:text-violet-300' : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            {b.label}
          </span>
        ))}
      </div>
      {/* トラック + ステップドット */}
      <div className="relative h-5 flex items-center px-1">
        {/* ベーストラック */}
        <div className="absolute inset-x-1 h-0.5 rounded-full bg-slate-300 dark:bg-slate-800" />
        {/* アクティブ部分 */}
        {idx >= 0 && (
          <div
            className="absolute left-1 h-0.5 rounded-full bg-[linear-gradient(90deg,#2563EB_0%,#6366F1_55%,#A78BFA_100%)] transition-all duration-200"
            style={{ width: `${(idx / (BUDGETS.length - 1)) * (100)}%` }}
          />
        )}
        {/* ドット */}
        <div className="relative w-full flex justify-between">
          {BUDGETS.map((b, i) => (
            <button
              key={b.id}
              title={b.prompt}
              onClick={() => onChange(idx === i ? null : b)}
              style={i <= idx ? { backgroundColor: BUDGET_DOT_COLORS[i] ?? '#6366F1' } : undefined}
              className={`h-3.5 w-3.5 rounded-full border-2 transition-all duration-150 hover:scale-125 focus:outline-none ${
                i <= idx
                  ? 'border-white shadow-sm shadow-indigo-500/20'
                  : 'bg-white border-slate-300 hover:border-indigo-400/80 dark:bg-slate-800/80 dark:border-slate-600 dark:hover:border-indigo-400/60'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

// ── 焦点距離レンジスライダー ──────────────────────────────
interface ZoneBand { label: string; short: string; startMm: number; endMm: number; color: string }
const ZONE_BANDS: ZoneBand[] = [
  { label: '超広角', short: '超広角', startMm: 12,  endMm: 24,  color: '#64748b' },
  { label: '広角',   short: '広角',   startMm: 24,  endMm: 35,  color: '#64748b' },
  { label: '標準',   short: '標準',   startMm: 35,  endMm: 85,  color: '#64748b' },
  { label: 'ポート', short: 'ポート', startMm: 85,  endMm: 135, color: '#64748b' },
  { label: '望遠',   short: '望遠',   startMm: 135, endMm: 600, color: '#64748b' },
]
const ZONE_TICKS = [24, 35, 85, 135]

function FocalRangeSlider({
  range,
  onChange,
  lensType,
  onLensTypeChange,
}: {
  range: FocalRange | null
  onChange: (r: FocalRange | null) => void
  lensType: LensType
  onLensTypeChange: (v: LensType) => void
}) {
  const DEFAULT: FocalRange = { minMm: 24, maxMm: 85 }
  const trackRef = useRef<HTMLDivElement>(null)
  const liveRef  = useRef<FocalRange>(range ?? DEFAULT)
  const [display, setDisplay] = useState<FocalRange>(range ?? DEFAULT)
  const [active,  setActive]  = useState(range !== null)

  useEffect(() => {
    if (range) { liveRef.current = range; setDisplay(range); setActive(true) }
    else setActive(false)
  }, [range])

  function startDrag(handle: 'min' | 'max') {
    return (e: React.MouseEvent | React.TouchEvent) => {
      e.preventDefault()
      if (!active) {
        liveRef.current = DEFAULT
        setDisplay(DEFAULT)
        setActive(true)
      }

      function getX(ev: MouseEvent | TouchEvent): number {
        return 'touches' in ev ? (ev as TouchEvent).touches[0].clientX : (ev as MouseEvent).clientX
      }
      function onMove(ev: MouseEvent | TouchEvent) {
        if (!trackRef.current) return
        const rect = trackRef.current.getBoundingClientRect()
        const pct  = Math.max(0, Math.min(1, (getX(ev) - rect.left) / rect.width))
        const mm   = snapMm(logPctToMm(pct))
        const cur  = liveRef.current
        const next: FocalRange = handle === 'min'
          ? { minMm: Math.min(mm, cur.maxMm - 12), maxMm: cur.maxMm }
          : { minMm: cur.minMm, maxMm: Math.max(mm, cur.minMm + 12) }
        liveRef.current = next
        setDisplay({ ...next })
      }
      function onUp() {
        onChange(liveRef.current)
        document.removeEventListener('mousemove', onMove)
        document.removeEventListener('mouseup',   onUp)
        document.removeEventListener('touchmove', onMove as EventListener)
        document.removeEventListener('touchend',  onUp)
      }
      document.addEventListener('mousemove', onMove)
      document.addEventListener('mouseup',   onUp)
      document.addEventListener('touchmove', onMove as EventListener, { passive: false })
      document.addEventListener('touchend',  onUp)
    }
  }

  const minPct = mmToLogPct(display.minMm) * 100
  const maxPct = mmToLogPct(display.maxMm) * 100

  return (
    <div className="px-1">
      {/* ヘッダー */}
      <div className="flex items-center justify-between mb-1.5">
        <p className="text-[10px] font-medium text-slate-600 dark:text-slate-300">焦点距離</p>
        {active && (
          <button
            onClick={() => { setActive(false); setDisplay(DEFAULT); liveRef.current = DEFAULT; onChange(null) }}
            className="text-[9px] text-slate-500 hover:text-slate-800 transition-colors dark:text-slate-400 dark:hover:text-slate-200"
          >
            ✕ 解除
          </button>
        )}
      </div>

      {/* ゾーンラベル行（モバイルでは非表示） */}
      <div className="relative h-4 mb-0.5 hidden sm:block">
        {ZONE_BANDS.map((z) => {
          const left = mmToLogPct(z.startMm) * 100
          const w    = (mmToLogPct(z.endMm) - mmToLogPct(z.startMm)) * 100
          return (
            <div key={z.label} className="absolute inset-y-0 flex items-center justify-center overflow-hidden"
              style={{ left: `${left}%`, width: `${w}%` }}>
              <span className="text-[7.5px] font-semibold truncate text-slate-600 dark:text-slate-400" style={{ opacity: 0.85 }}>
                {z.short}
              </span>
            </div>
          )
        })}
      </div>

      {/* スライダートラック */}
      <div ref={trackRef} className="relative h-8 flex items-center select-none">
        {/* ゾーン色帯（背景） */}
        <div className="absolute inset-x-0 h-2 rounded-full overflow-hidden flex">
          {ZONE_BANDS.map((z) => (
            <div key={z.label}
              className="bg-slate-200 dark:bg-slate-800"
              style={{ flex: mmToLogPct(z.endMm) - mmToLogPct(z.startMm), opacity: 1 }}
            />
          ))}
        </div>
        {/* 選択範囲ハイライト */}
        <div className="absolute h-2 rounded-full"
          style={{ left: `${minPct}%`, width: `${maxPct - minPct}%`, background: active ? 'linear-gradient(90deg, #2563EB 0%, #6366F1 55%, #A78BFA 100%)' : 'transparent' }}
        />
        {/* Min ハンドル */}
        <div
          className={`absolute w-5 h-5 rounded-full border-2 cursor-grab active:cursor-grabbing shadow-md z-10 transition-colors ${
            active ? 'bg-[#2563EB] border-white shadow-[0_0_0_4px_rgba(99,102,241,0.20)] dark:bg-[#2563EB] dark:border-white/90 dark:shadow-[0_0_0_4px_rgba(99,102,241,0.26)]' : 'bg-white border-slate-300 hover:border-slate-400 dark:bg-slate-700 dark:border-slate-500 dark:hover:border-slate-400'
          }`}
          style={{ left: `${minPct}%`, top: '50%', transform: 'translate(-50%,-50%)' }}
          onMouseDown={startDrag('min')}
          onTouchStart={startDrag('min')}
        />
        {/* Max ハンドル */}
        <div
          className={`absolute w-5 h-5 rounded-full border-2 cursor-grab active:cursor-grabbing shadow-md z-10 transition-colors ${
            active ? 'bg-[#A78BFA] border-white shadow-[0_0_0_4px_rgba(167,139,250,0.20)] dark:bg-[#A78BFA] dark:border-white/90 dark:shadow-[0_0_0_4px_rgba(167,139,250,0.26)]' : 'bg-white border-slate-300 hover:border-slate-400 dark:bg-slate-700 dark:border-slate-500 dark:hover:border-slate-400'
          }`}
          style={{ left: `${maxPct}%`, top: '50%', transform: 'translate(-50%,-50%)' }}
          onMouseDown={startDrag('max')}
          onTouchStart={startDrag('max')}
        />
      </div>

      {/* mm 値ラベル */}
      <div className="relative h-4 mt-0.5">
        {maxPct - minPct > 14 ? (
          <>
            <span className={`absolute text-[10px] font-mono font-semibold -translate-x-1/2 ${active ? 'text-[#2563EB] dark:text-indigo-300' : 'text-slate-500 dark:text-slate-400'}`}
              style={{ left: `${minPct}%` }}>{display.minMm}</span>
            <span className={`absolute text-[10px] font-mono font-semibold -translate-x-1/2 ${active ? 'text-[#8B5CF6] dark:text-violet-300' : 'text-slate-500 dark:text-slate-400'}`}
              style={{ left: `${maxPct}%` }}>{display.maxMm}</span>
          </>
        ) : (
          <span className={`absolute text-[10px] font-mono font-semibold -translate-x-1/2 ${active ? 'text-indigo-700 dark:text-violet-300' : 'text-slate-500 dark:text-slate-400'}`}
            style={{ left: `${(minPct + maxPct) / 2}%` }}>{display.minMm}–{display.maxMm}</span>
        )}
      </div>

      {/* ゾーン境界ティック（モバイルでは両端のみ） */}
      <div className="relative h-2.5">
        <span className="absolute text-[8px] text-slate-500 dark:text-slate-400" style={{ left: '0%' }}>12mm</span>
        {ZONE_TICKS.map((mm) => (
          <span key={mm} className="absolute text-[8px] text-slate-500 dark:text-slate-400 -translate-x-1/2 hidden sm:inline"
            style={{ left: `${mmToLogPct(mm) * 100}%` }}>{mm}</span>
        ))}
        <span className="absolute text-[8px] text-slate-500 dark:text-slate-400 -translate-x-full" style={{ left: '100%' }}>600mm</span>
      </div>
      {/* レンズタイプ */}
      <div className="mt-4">
        <div className="flex items-center justify-between mb-1.5">
          <p className="text-[10px] font-medium text-slate-600 dark:text-slate-300">レンズタイプ</p>
          <p className="text-[8.5px] text-slate-400 dark:text-slate-500">迷ったらおまかせ</p>
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          {LENS_TYPES.map((type) => {
            const selected = lensType === type.id
            return (
              <button
                key={type.id}
                type="button"
                onClick={() => onLensTypeChange(type.id)}
                className={`group rounded-xl p-[1px] text-left transition-all duration-150 focus:outline-none ${
                  selected
                    ? 'bg-[linear-gradient(90deg,#2563EB_0%,#6366F1_55%,#A78BFA_100%)] shadow-sm shadow-indigo-500/15'
                    : 'bg-slate-200/80 hover:bg-indigo-300/70 dark:bg-white/10 dark:hover:bg-indigo-400/30'
                }`}
              >
                <span
                  className={`block h-full rounded-[11px] px-2.5 py-2 transition-colors ${
                    selected
                      ? 'bg-white text-slate-950 dark:bg-slate-950 dark:text-white'
                      : 'bg-white/90 text-slate-700 group-hover:bg-slate-50 dark:bg-slate-900/90 dark:text-slate-300 dark:group-hover:bg-slate-800/90'
                  }`}
                >
                  <span
                    className={`block text-[10px] font-semibold ${
                      selected
                        ? 'text-slate-950 dark:text-white'
                        : 'text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {type.label}
                  </span>
                  <span className="mt-0.5 block text-[8.5px] leading-snug text-slate-500 dark:text-slate-400">
                    {type.description}
                  </span>
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {(active || lensType !== 'auto') && (
        <p className="text-[10px] text-[#4F46E5] dark:text-violet-300/80 mt-1.5 leading-snug">
          {[active && getFocalRangePrompt(display), lensType !== 'auto' && getLensTypeOption(lensType).prompt].filter(Boolean).join('・')}
        </p>
      )}
    </div>
  )
}

const messageVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
}

function TypingDots() {
  return (
    <div className="flex items-center gap-1 px-1 py-0.5">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="h-2 w-2 rounded-full bg-slate-400"
          animate={{ opacity: [0.3, 1, 0.3], y: [0, -4, 0] }}
          transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.2, ease: 'easeInOut' }}
        />
      ))}
    </div>
  )
}

// summaryテキストから製品名を抽出（倉庫DOM注入ボタン用）
function extractNameFromSummary(text: string): string {
  const noEmoji = Array.from(text)
    .filter((char) => {
      const code = char.codePointAt(0) ?? 0
      return !(
        (code >= 0x1f000 && code <= 0x1ffff) ||
        (code >= 0x2600 && code <= 0x27bf) ||
        (code >= 0x2300 && code <= 0x23ff) ||
        code === 0x2b50 || code === 0x2b55 || code === 0xfe0f
      )
    })
    .join('')
  return noEmoji
    .replace(/【[^】]*】/g, '')
    .replace(/\[[^\]]*\]/g, '')
    .replace(/^\s*[0-9]+[.．、。:：]\s*/, '')
    .trim()
}

// localStorage から安全に読み込むヘルパー
function loadFromStorage<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch { return fallback }
}

export default function ChatInterface() {
  // 初期値をlocalStorageから直接読み込む（競合状態なし）
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const saved = loadFromStorage<ChatMessage[]>('chatMessages', [])
    return saved.map((m) => ({ ...m, timestamp: new Date(m.timestamp) }))
  })
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [conversationId, setConversationId] = useState<string | undefined>(() =>
    loadFromStorage<string | null>('chatConversationId', null) ?? undefined
  )
  const [warehouseCount, setWarehouseCount] = useState(0)

  // ── セットアップ完了フラグ（リセット後も再表示しないため）──
  const [setupDone, setSetupDone] = useState<boolean>(() =>
    loadFromStorage<string | null>('setupDone', null) === 'true'
  )
  const [showBodyHint, setShowBodyHint] = useState(false)

  // ── マウント設定（localStorage で永続化）────────────────
  const [selectedMount, setSelectedMount] = useState<MountOption | null>(() => {
    const savedId = loadFromStorage<string | null>('selectedMountId', null)
    return MOUNTS.find((m) => m.id === savedId) ?? null
  })
  function handleMountChange(mount: MountOption) {
    setSelectedMount(mount)
    try { localStorage.setItem('selectedMountId', mount.id) } catch { /* ignore */ }
    if (!bodyInput.trim()) setShowBodyHint(true)
  }

  // ── 予算設定（localStorage で永続化）─────────────────────
  const [selectedBudget, setSelectedBudget] = useState<BudgetOption | null>(() => {
    const savedId = loadFromStorage<string | null>('selectedBudgetId', null)
    return BUDGETS.find((b) => b.id === savedId) ?? null
  })
  function handleBudgetChange(budget: BudgetOption | null) {
    setShowBodyHint(false)
    setSelectedBudget(budget)
    try {
      if (budget) localStorage.setItem('selectedBudgetId', budget.id)
      else localStorage.removeItem('selectedBudgetId')
    } catch { /* ignore */ }
  }

  // ── 焦点距離レンジ設定（localStorage で永続化）──────────
  const [selectedFocal, setSelectedFocal] = useState<FocalRange | null>(() =>
    loadFromStorage<FocalRange | null>('selectedFocalRange', null)
  )
  function handleFocalChange(range: FocalRange | null) {
    setShowBodyHint(false)
    setSelectedFocal(range)
    try {
      if (range) localStorage.setItem('selectedFocalRange', JSON.stringify(range))
      else localStorage.removeItem('selectedFocalRange')
    } catch { /* ignore */ }
  }
  // ── レンズタイプ設定（localStorage で永続化）──────────────
  const [lensType, setLensType] = useState<LensType>(() => {
    const saved = loadFromStorage<string | null>('selectedLensType', null)
    if (saved === 'auto' || saved === 'prime' || saved === 'zoom' || saved === 'macro') return saved
    return loadFromStorage<string | null>('isMacro', null) === 'true' ? 'macro' : 'auto'
  })

  function handleLensTypeChange(val: LensType) {
    setShowBodyHint(false)
    setLensType(val)
    try {
      if (val === 'auto') localStorage.removeItem('selectedLensType')
      else localStorage.setItem('selectedLensType', val)

      if (val === 'macro') localStorage.setItem('isMacro', 'true')
      else localStorage.removeItem('isMacro')
    } catch { /* ignore */ }
  }

  // ── ボディ設定（localStorage で永続化）───────────────────
  const [bodyInput, setBodyInput] = useState<string>(() =>
    loadFromStorage<string>('cameraBody', '')
  )
  function handleBodySave(val: string) {
    if (val.trim()) setShowBodyHint(false)
    setBodyInput(val)
    try {
      if (val.trim()) localStorage.setItem('cameraBody', val.trim())
      else localStorage.removeItem('cameraBody')
    } catch { /* ignore */ }
  }

  function handleNewChat() {
    if (!confirm('新しい相談を始めますか？\n※マウント・カメラ・予算などのプロフィール設定は保持されます。')) return
    try {
      localStorage.removeItem('chatMessages')
      localStorage.removeItem('chatConversationId')
    } catch { /* ignore */ }
    setMessages([])
    setConversationId(undefined)
    setInput('')
    shouldAutoScrollRef.current = false
    scrollChatToTop()
    inputRef.current?.focus()
  }

  const [showMobileSettings, setShowMobileSettings] = useState(false)

  const isComposingRef = useRef(false)
  const chatAreaRef = useRef<HTMLDivElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const shouldAutoScrollRef = useRef(false)

  function scrollChatToTop() {
    window.requestAnimationFrame(() => {
      if (chatAreaRef.current) chatAreaRef.current.scrollTop = 0
    })
  }

  useEffect(() => {
    if (!showBodyHint) return
    const timer = window.setTimeout(() => setShowBodyHint(false), 9000)
    return () => window.clearTimeout(timer)
  }, [showBodyHint])

  useEffect(() => {
    scrollChatToTop()
  }, [])

  // メッセージが変わるたびに保存（最新30件）
  useEffect(() => {
    try {
      localStorage.setItem('chatMessages', JSON.stringify(messages.slice(-30)))
    } catch { /* ignore */ }
  }, [messages])

  // conversationIdが変わったら保存
  useEffect(() => {
    if (conversationId) localStorage.setItem('chatConversationId', conversationId)
  }, [conversationId])

  // 倉庫件数をlocalStorageから取得（リアルタイム更新）
  useEffect(() => {
    function updateCount() {
      try {
        const items = JSON.parse(localStorage.getItem('warehouse') ?? '[]')
        if (Array.isArray(items)) setWarehouseCount(items.length)
      } catch { /* ignore */ }
    }
    updateCount()
    // 他のコンポーネントが追加したときも検知
    window.addEventListener('storage', updateCount)
    window.addEventListener('warehouseUpdated', updateCount)
    return () => {
      window.removeEventListener('storage', updateCount)
      window.removeEventListener('warehouseUpdated', updateCount)
    }
  }, [])

  // <details>要素への倉庫ボタン注入（DOM操作）
  useEffect(() => {
    if (!chatAreaRef.current) return

    const details = chatAreaRef.current.querySelectorAll(
      '.prose-dify details:not([data-warehouse-injected])',
    )

    details.forEach((detail) => {
      detail.setAttribute('data-warehouse-injected', 'true')

      const summary = detail.querySelector('summary')
      const productName = extractNameFromSummary(summary?.textContent ?? '')
      if (!productName) return

      const btnWrapper = document.createElement('div')
      btnWrapper.className = 'warehouse-inject-btn'

      const btn = document.createElement('button')
      btn.textContent = '＋ 倉庫へ追加'
      btn.className = 'warehouse-add-btn'

      btn.addEventListener('click', async () => {
        btn.disabled = true
        btn.textContent = '保存中...'
        try {
          const res = await fetch('/api/warehouse', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: productName,
              maker: '',
              category: 'lens',
              priceRange: '要確認',
              weight: '要確認',
              features: [],
              amazonUrl: generateAmazonSearchUrl(productName),
            }),
          })
          if (res.ok) {
            btn.textContent = '✓ 追加済み'
            btn.classList.add('saved')
            setWarehouseCount((prev) => prev + 1)
          } else if (res.status === 409) {
            btn.textContent = '✓ 追加済み'
            btn.classList.add('saved')
          } else {
            btn.disabled = false
            btn.textContent = '＋ 倉庫へ追加'
          }
        } catch {
          btn.disabled = false
          btn.textContent = '＋ 倉庫へ追加'
        }
      })

      btnWrapper.appendChild(btn)
      detail.appendChild(btnWrapper)
    })
  }, [messages])

  useEffect(() => {
    if (messages.length === 0) {
      shouldAutoScrollRef.current = false
      scrollChatToTop()
      return
    }
    if (!shouldAutoScrollRef.current) return
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  async function sendMessage(text: string) {
    const trimmed = text.trim()
    if (!trimmed || loading) return

    // プロフィール情報をプレフィックスとして自動付与（ユーザー画面には表示しない）
    const profileLines: string[] = []
    if (selectedMount)          profileLines.push(`使用マウント: ${selectedMount.prompt}`)
    if (bodyInput.trim())       profileLines.push(`使用ボディ: ${bodyInput.trim()}`)
    if (selectedBudget)         profileLines.push(selectedBudget.prompt)
    if (selectedFocal)          profileLines.push(getFocalRangePrompt(selectedFocal))
    const lensTypeOption = getLensTypeOption(lensType)
    if (lensTypeOption.prompt)  profileLines.push(lensTypeOption.prompt)

    const lensTypeHint = lensTypeOption.hint ?? ''
    const focalPriorityHint = getFocalPriorityHint(trimmed, selectedFocal)
    const mountGuard = selectedMount
      ? [
          `レンズ候補は${selectedMount.prompt}にネイティブ対応する製品だけを通常推薦してください。`,
          'FE / Sony E は Sony Eマウント、Z-mount は Nikon Zマウント、X mount は Fujifilm Xマウント、L mount はLマウントとして扱ってください。FEはCanon RFではありません。',
          '選択肢1〜3を本文に出す直前に、各候補が指定マウントに対応しているか必ず自己確認してください。',
          '指定マウントに対応しないレンズ、別マウント用、アダプター前提、対応マウント不明のレンズは、本文の選択肢1〜3にも絶対入れないでください。',
          '指定マウントに対応する候補が2本しかない場合は、3本目を無理に出さず2本で止めてください。',
        ].join('\n')
      : ''
    const canonRfGuard = selectedMount?.id === 'canon-rf' || selectedMount?.id === 'canon-rf-s'
      ? [
          'Canon RF / RF-S相談では、Canon RFまたはCanon RF-Sにネイティブ対応するレンズだけを本文の通常候補にしてください。',
          selectedMount.id === 'canon-rf-s'
            ? 'Canon RF-SボディはAPS-C機ですが、RF-S専用レンズだけでなく、Canon RFフルサイズ用レンズもネイティブ対応として通常候補に含めてください。焦点距離の見え方は約1.6倍相当になるため、必要に応じて例を添えて説明してください。'
            : '',
          selectedMount.id === 'canon-rf-s'
            ? 'Canon RF-S / APS-Cでは、24mmは約38mm相当、35mmは約56mm相当、50mmは約80mm相当として用途を判断してください。室内の子供撮影では10-18mmのような超広角を主役にしすぎず、24mm〜35mm相当の自然な画角を優先してください。'
            : '',
          selectedMount.id === 'canon-rf-s'
            ? 'Canon RF-S / EOS R50 / R10 / R7の室内子供撮影では、85mm以上の単焦点を通常候補にしないでください。RF85mm F2 Macro IS STMは良いレンズですが、R50では約136mm相当で室内には長いため、望遠・屋外ポートレートなどが明示された場合だけ補足扱いにしてください。室内子供撮影ではRF24mm、RF35mm、RF50mm、RF-S 18-45mm、RF-S 18-150mmなどを優先してください。'
            : '',
          selectedMount.id === 'canon-rf-s'
            ? 'RF-S専用レンズは少なめですが、Canon RFフルサイズ用レンズもそのまま使えるため、RF-S専用だけに限定せず、用途に合うRFレンズも積極的に候補に含めてください。'
            : '',
          selectedMount.id === 'canon-rf-s'
            ? 'EF-MレンズはCanon RF-Sボディと互換性がないため候補に入れないでください。EF / EF-Sレンズはアダプター前提なので、通常候補では優先せず、必要な場合だけ補足扱いにしてください。'
            : '',
          'Tamron Di III、Sigma DG DN、FE、Sony E、Nikon Z、L mountなどは、Canon RF / RF-S用として明確に対応している製品でない限り、Canon RF / RF-Sの選択肢に入れないでください。',
          'XF / Fujifilm X / X-mount と書かれたレンズはCanon RF-Sに非対応です。特に Viltrox AF 75mm F1.2 XF / PRO はFujifilm Xマウント品なので、Canon EOS R50 / R10 / R7向けの通常候補に入れないでください。',
          'Canon RF / RF-Sネイティブ対応が確実な候補が1本または2本しかない場合は、3本に増やさず確実な候補だけ提示してください。',
        ].filter(Boolean).join('\n')
      : ''
    const nikonZDxGuard = selectedMount?.id === 'nikon-z-apsc'
      ? [
          'Nikon Z DX / Z fc / Z50 / Z30相談で「最初に買うレンズ」「最初の1本」を聞かれ、運動会・望遠・動物・遠くの被写体が明示されていない場合は、NIKKOR Z DX 50-250mm f/4.5-6.3 VRを主役候補にしないでください。',
          'Nikon Z DXの最初の1本では、NIKKOR Z DX 16-50mm、NIKKOR Z DX 24mm f/1.7、NIKKOR Z 40mm f/2、NIKKOR Z DX 18-140mmなど、日常・旅行・室内で使いやすい標準域や軽量候補を優先してください。',
          'NIKKOR Z DX 50-250mmは、運動会・望遠・動物などが明示された場合、または2本目候補として扱ってください。',
        ].join('\n')
      : ''
    const fujiXPersonalityHint = selectedMount?.id === 'fuji-x'
      ? [
          'Fujifilm X相談では、単純なスペック比較だけでなく、軽快性・スナップ性・日常携帯性・操作感・フィルムライクな描写・富士らしい色や空気感・撮る楽しさを重視してください。',
          '散歩カメラ、旅行、日常、家族撮影では、小型軽量で持ち出したくなる候補を優先してください。XF23mmF2、XF35mmF1.4、XF35mmF2、XF27mmF2.8、XF33mmF1.4、XF56mmF1.2、Voigtlander NOKTON X、小型単焦点は積極的に検討してください。',
          'ズーム希望や旅行用途では、XF16-50mmF2.8-4.8、XF16-55mmF2.8 R LM WR II、XF18-55mmF2.8-4、Sigma 18-50mm F2.8 などを用途・重量・価格のバランスで比較してください。',
          'XF50mmF1.0、XF8-16mmF2.8、XF50-140mmF2.8、超望遠など重量級・高価格・用途限定のレンズは、ユーザーが明るさ・望遠・仕事用途を明示した場合に主役候補にし、通常の散歩/日常/旅行では「性能は強いが携帯性で今回は控えめ」と説明してください。',
          '回答文では、解像力だけでなく「どんな気分で撮れるか」「毎日持ち出せるか」「フィルムシミュレーションと相性がよい画角か」も短く添えてください。',
        ].join('\n')
      : ''
    const omittedCandidateHint = selectedMount
      ? [
          '条件には合うが、重量・価格・用途限定性などで通常候補から外した重要レンズがある場合は、最後に「今回は外した候補」として1〜2本だけ短く理由を添えてください。',
          '指定マウントに非対応のレンズは「今回は外した候補」にも入れないでください。',
          selectedMount.id === 'canon-rf'
            ? 'Canon RFの旅行・子供撮影では、RF28-70mm F2 L USMのような超高性能だが重いレンズは、必要に応じて「描写は強力だが携帯性で今回は見送り」と説明してください。'
            : '',
        ].filter(Boolean).join('\n')
      : ''
    const followUpQuestionHint = selectedMount
      ? '推薦回答の最後に、さらに絞るための短い聞き込み質問を1文だけ添えてください。例:「この中からさらに絞るなら、軽さ・ボケ・AF・コスパ・写りの個性・動画向きのどれを重視しますか？」。ユーザー条件がすでにかなり具体的な場合は、重複を避けて控えめにしてください。'
      : ''
    const supplementalLines = [
      profileLines.length > 0 ? '2023〜2025年発売の最新レンズも積極的に含めて提案してください。' : '',
      mountGuard,
      canonRfGuard,
      nikonZDxGuard,
      fujiXPersonalityHint,
      omittedCandidateHint,
      followUpQuestionHint,
      focalPriorityHint,
      lensTypeHint,
    ].filter(Boolean)
    const profilePrefix = [
      profileLines.length > 0 ? `【プロフィール】${profileLines.join(' / ')}` : '',
      supplementalLines.length > 0 ? `【補足】${supplementalLines.join('\n')}` : '',
    ].filter(Boolean).join('\n')
    const messagePrefix = profilePrefix ? `${profilePrefix}\n\n` : ''

    const displayText = trimmed
    const sendText = messagePrefix + trimmed

    shouldAutoScrollRef.current = true
    setMessages((prev) => [
      ...prev,
      { id: crypto.randomUUID(), role: 'user', content: displayText, timestamp: new Date() },
    ])
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: sendText, conversationId }),
      })

      const data = (await res.json()) as {
        answer?: string
        conversationId?: string
        error?: string
      }

      if (!res.ok) throw new Error(data.error || 'エラーが発生しました')
      if (data.conversationId) setConversationId(data.conversationId)

      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: data.answer ?? '',
          timestamp: new Date(),
        },
      ])
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: `エラーが発生しました: ${err instanceof Error ? err.message : '不明なエラー'}`,
          timestamp: new Date(),
        },
      ])
    } finally {
      setLoading(false)
      inputRef.current?.focus()
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && e.shiftKey && !isComposingRef.current) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  function escapeHtmlForDisplay(value: string): string {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')
  }

  function formatAnswerForDisplay(text: string): string {
    const lines = text
      .split(/\r?\n/)
      // おすすめ理由・注意点はカード内AI分析に表示するため、本文側では隠す
      .filter((line) => !/^\s*(おすすめ理由|注意点)\s*[：:]/.test(line))

    const formatted: string[] = []

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      const next = lines[i + 1] ?? ''

      const optionMatch = line.match(/^\s*✨\s*【(選択肢\d+)】\s*(.+?)\s*$/)

      if (optionMatch) {
        const optionLabel = escapeHtmlForDisplay(optionMatch[1])
        const lensName = escapeHtmlForDisplay(optionMatch[2])
        let roleLabel = ''

        if (/^\s*表示用ラベル\s*[：:]/.test(next)) {
          roleLabel = next.replace(/^\s*表示用ラベル\s*[：:]\s*/, '').trim()
          i += 1
        } else if (next.trim() && !/^\s*✨\s*【選択肢\d+】/.test(next)) {
          roleLabel = next.trim()
          i += 1
        }

        const safeRoleLabel = escapeHtmlForDisplay(roleLabel)

        formatted.push(`
<div class="my-3 rounded-xl border border-slate-200/90 bg-white/95 px-4 py-3 shadow-sm shadow-slate-200/60 backdrop-blur dark:border-white/15 dark:bg-slate-900/80 dark:shadow-black/20">
  <div class="flex flex-wrap items-center gap-2">
    <span class="rounded-full bg-violet-600/10 px-2.5 py-1 text-xs font-bold text-indigo-800 dark:bg-indigo-400/20 dark:text-indigo-100">${optionLabel}</span>
    <strong class="text-slate-900 dark:text-slate-100">${lensName}</strong>
  </div>
  ${safeRoleLabel ? `<div class="mt-2 text-sm font-medium text-slate-600 dark:text-slate-300">${safeRoleLabel}</div>` : ''}
</div>
`.trim())

        formatted.push('')
        continue
      }

      // 表示用ラベルだけが単独で残った場合は本文には出さない
      if (/^\s*表示用ラベル\s*[：:]/.test(line)) continue

      formatted.push(line)
    }

    return formatted.join('\n')
  }

  function renderAnswer(text: string): string {
    const displayText = formatAnswerForDisplay(text)
    const rawHtml = marked.parse(displayText) as string
    return DOMPurify.sanitize(rawHtml, {
      ADD_TAGS: ['details', 'summary'],
      ADD_ATTR: ['target', 'rel'],
    })
  }

  return (
    <div className="flex h-[calc(100vh-64px)] bg-transparent">

      {/* ── サイドバー（デスクトップのみ） ── */}
      <aside className="hidden md:flex flex-col w-[280px] flex-shrink-0 overflow-visible border-r border-slate-200 bg-white shadow-xl shadow-slate-900/5 dark:border-white/10 dark:bg-slate-950 dark:text-slate-100 dark:shadow-black/30">
        <div className="p-5 border-b border-slate-200 dark:border-white/10">
          <div className="flex items-center gap-2.5 mb-0.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-white/10">
              <CameraIcon className="h-4 w-4 text-violet-700 dark:text-indigo-200" />
            </div>
            <span className="font-bold text-slate-950 text-sm tracking-wide dark:text-white">Camera Concierge</span>
          </div>
          <p className="text-[11px] text-slate-600 ml-[42px] dark:text-slate-400">AI カメラ・レンズ相談</p>
        </div>

        {/* プロフィール設定 */}
        <div className="px-3 py-3 border-b border-slate-200 relative z-10 space-y-3 dark:border-white/10">
          <p className="text-[10px] font-semibold text-slate-600 uppercase tracking-widest px-1 dark:text-slate-400">
            マイプロフィール
          </p>

          {/* マウント */}
          <MountSelector selected={selectedMount} onChange={handleMountChange} />

          {/* 使用ボディ */}
          <div className="px-1">
            <p className="text-[10px] font-medium text-slate-600 mb-1 dark:text-slate-400">使用ボディ</p>
            {selectedMount && BODIES_BY_MOUNT[selectedMount.id] ? (
              /* マウント選択済み → ドロップダウン + 自由入力 */
              <div className="space-y-1">
                <select
                  value={BODIES_BY_MOUNT[selectedMount.id].includes(bodyInput) ? bodyInput : '__custom__'}
                  onChange={(e) => {
                    if (e.target.value !== '__custom__') handleBodySave(e.target.value)
                  }}
                  className={`w-full rounded-lg bg-white border border-slate-200 px-2.5 py-1.5 text-xs text-slate-900 shadow-sm shadow-slate-200/40 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/15 dark:bg-slate-900/80 dark:border-white/10 dark:text-slate-100 dark:shadow-none dark:focus:border-violet-400/60 ${
                    showBodyHint && !bodyInput.trim() ? 'ring-2 ring-sky-400/20 shadow-sky-500/10 dark:ring-sky-300/20' : ''
                  }`}
                >
                  <option value="">-- 選択してください --</option>
                  {BODIES_BY_MOUNT[selectedMount.id].map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                  <option value="__custom__">その他（直接入力）</option>
                </select>
                {/* 「その他」選択時または一覧外のボディの場合は自由入力も表示 */}
                {(!BODIES_BY_MOUNT[selectedMount.id].includes(bodyInput) || bodyInput === '') && (
                  <input
                    type="text"
                    value={bodyInput}
                    onChange={(e) => {
                      setBodyInput(e.target.value)
                      if (e.target.value.trim()) setShowBodyHint(false)
                    }}
                    onBlur={(e) => handleBodySave(e.target.value)}
                    placeholder="機種名を直接入力..."
                    className={`w-full rounded-lg bg-white border border-slate-200 px-2.5 py-1.5 text-xs text-slate-900 placeholder-slate-500 shadow-sm shadow-slate-200/40 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/15 dark:bg-slate-900/80 dark:border-white/10 dark:text-slate-100 dark:placeholder-slate-400 dark:shadow-none dark:focus:border-violet-400/60 ${
                      showBodyHint && !bodyInput.trim() ? 'ring-2 ring-sky-400/20 shadow-sky-500/10 dark:ring-sky-300/20' : ''
                    }`}
                  />
                )}
              </div>
            ) : (
              /* マウント未選択 → 自由入力のみ */
              <input
                type="text"
                value={bodyInput}
                onChange={(e) => {
                  setBodyInput(e.target.value)
                  if (e.target.value.trim()) setShowBodyHint(false)
                }}
                onBlur={(e) => handleBodySave(e.target.value)}
                placeholder="マウントを先に選択すると候補が出ます"
                className="w-full rounded-lg bg-white border border-slate-200 px-2.5 py-1.5 text-xs text-slate-900 placeholder-slate-500 shadow-sm shadow-slate-200/40 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/15 dark:bg-slate-900/80 dark:border-white/10 dark:text-slate-100 dark:placeholder-slate-400 dark:shadow-none dark:focus:border-violet-400/60"
              />
            )}
            {showBodyHint && selectedMount && !bodyInput.trim() && (
              <motion.p
                initial={{ opacity: 0, y: -3 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-1.5 flex items-center gap-1.5 text-[10px] leading-snug text-sky-700 dark:text-sky-300/90"
              >
                <ChevronRight className="h-3 w-3 flex-shrink-0" />
                機種名を入れると、さらに精度が上がります
              </motion.p>
            )}
          </div>

          {/* 予算スライダー */}
          <BudgetSlider selected={selectedBudget} onChange={handleBudgetChange} />

          {/* 焦点距離レンジスライダー */}
          <FocalRangeSlider
            range={selectedFocal}
            onChange={handleFocalChange}
            lensType={lensType}
            onLensTypeChange={handleLensTypeChange}
          />

          {/* 設定済みバッジ */}
          {(selectedMount || bodyInput || selectedBudget || selectedFocal || lensType !== 'auto') && (
            <p className="px-1 text-[10px] text-[#4F46E5] dark:text-violet-300/80">
              ✓ 質問に自動付与されます
            </p>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <p className="text-[10px] font-semibold text-slate-600 uppercase tracking-widest mb-3 px-1 dark:text-slate-400">
            クイック質問
          </p>
          <div className="space-y-1">
            {QUICK_QUESTIONS.map((q, i) => (
              <motion.button
                key={q}
                onClick={() => sendMessage(q)}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: i * 0.06, ease: 'easeOut' }}
                whileHover={{ x: 5 }}
                whileTap={{ scale: 0.97 }}
                className="group w-full flex items-center gap-2 rounded-lg px-3 py-2.5 text-left text-[13px] text-slate-700 transition-all hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-slate-100"
              >
                <ChevronRight className="h-3.5 w-3.5 flex-shrink-0 text-slate-400 group-hover:text-violet-700 transition-colors dark:text-slate-400 dark:group-hover:text-indigo-300" />
                <span className="leading-snug">{q}</span>
              </motion.button>
            ))}
          </div>
        </div>

        <div className="p-4 border-t border-slate-200 flex flex-col gap-2 dark:border-white/10">
          {/* 新規会話ボタン */}
          {messages.length > 0 && (
            <button
              onClick={handleNewChat}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-slate-600 hover:bg-slate-100 hover:text-slate-950 transition-colors text-left dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-slate-100"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>新規会話を開始</span>
            </button>
          )}
          <Link
            href="/warehouse"
            className="flex items-center justify-between rounded-lg px-3 py-2.5 text-sm text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-950 group dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-slate-100"
          >
            <div className="flex items-center gap-2">
              <Warehouse className="h-4 w-4 text-slate-500 group-hover:text-violet-700 transition-colors dark:group-hover:text-indigo-300" />
              <span>デジタル倉庫</span>
            </div>
            {warehouseCount > 0 && (
              <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-xs text-violet-700 ring-1 ring-indigo-200 font-semibold tabular-nums dark:bg-violet-600/20 dark:text-indigo-200 dark:ring-indigo-300/20">
                {warehouseCount}
              </span>
            )}
          </Link>
        </div>
      </aside>

      {/* ── メインチャットエリア ── */}
      <div className="flex-1 flex flex-col min-w-0">
        <div ref={chatAreaRef} data-testid="chat-scroll-area" className="flex-1 overflow-y-auto px-4 py-6">
          <div className="mx-auto max-w-3xl space-y-6">

            {messages.length === 0 && (
              <motion.div
                className="py-8"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
              >
                {/* ── セットアップガイダンス（初回のみ・設定済みなら非表示） ── */}
                {!setupDone && (
                  <motion.div
                    className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 max-w-2xl mx-auto shadow-lg shadow-slate-200/70 dark:border-white/15 dark:bg-slate-950/70 dark:shadow-indigo-950/20"
                    initial={{ opacity: 0, scale: 0.97 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.35 }}
                  >
                    <div className="flex items-center gap-2.5 mb-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 ring-1 ring-slate-200 flex-shrink-0 dark:bg-gradient-to-br dark:from-indigo-500/15 dark:to-violet-500/15 dark:ring-indigo-300/30">
                        <CameraIcon className="h-5 w-5 text-violet-600 dark:text-violet-300" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800 dark:text-white">カメラを選ぶと、提案がもっと正確になります</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">カメラ名の例を見ながら選べます。わからなければ後で変更できます</p>
                      </div>
                    </div>

                    {/* マウント選択グリッド */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-3">
                      {MOUNTS.map((m) => {
                        const isSelected = selectedMount?.id === m.id
                        return (
                          <button
                            key={m.id}
                            data-testid={`mount-button-${m.id}`}
                            onClick={() => handleMountChange(m)}
                            className={`group rounded-xl p-[1.5px] text-left transition-all duration-150 focus:outline-none ${
                              isSelected
                                ? 'bg-[linear-gradient(90deg,#2563EB_0%,#6366F1_55%,#A78BFA_100%)] shadow-md shadow-indigo-500/20'
                                : 'bg-slate-200/80 hover:bg-[linear-gradient(90deg,#2563EB_0%,#6366F1_55%,#A78BFA_100%)] hover:shadow-md hover:shadow-indigo-500/10 dark:bg-white/10 dark:hover:bg-[linear-gradient(90deg,#2563EB_0%,#6366F1_55%,#A78BFA_100%)]'
                            }`}
                          >
                            <span
                              className={`block h-full rounded-[11px] px-3 py-3 transition-colors ${
                                isSelected
                                  ? 'bg-white text-slate-950 dark:bg-slate-950 dark:text-white'
                                  : 'bg-white/95 text-slate-700 group-hover:bg-slate-50 dark:bg-slate-900/90 dark:text-slate-300 dark:group-hover:bg-slate-800/90'
                              }`}
                            >
                              <span className="block text-xs font-bold text-slate-900 dark:text-white">
                                {m.label}
                              </span>
                              <span className="mt-1 block text-[10px] font-medium text-slate-500 dark:text-slate-400">
                                {m.sub}
                              </span>
                              <span className="mt-2 block text-[10px] leading-snug text-slate-500 dark:text-slate-400">
                                {MOUNT_EXAMPLES[m.id]}
                              </span>
                            </span>
                          </button>
                        )
                      })}
                    </div>

                    {selectedMount && (
                      <motion.div
                        className="mt-4 rounded-2xl border border-slate-200/80 bg-slate-50/70 p-3 dark:border-white/10 dark:bg-white/[0.03]"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="mb-2 flex items-center justify-between gap-3">
                          <div>
                            <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">使用カメラを選択</p>
                            <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                              {selectedMount.label} / {selectedMount.sub} に合わせて候補を表示しています
                            </p>
                          </div>
                          {bodyInput.trim() && (
                            <span className="rounded-full border border-violet-200 bg-white px-2 py-0.5 text-[10px] font-medium text-violet-700 dark:border-violet-400/20 dark:bg-slate-950 dark:text-violet-300">
                              設定済み
                            </span>
                          )}
                        </div>

                        {BODIES_BY_MOUNT[selectedMount.id] ? (
                          <div className="space-y-2">
                            <select
                              value={BODIES_BY_MOUNT[selectedMount.id].includes(bodyInput) ? bodyInput : '__custom__'}
                              onChange={(e) => { if (e.target.value !== '__custom__') handleBodySave(e.target.value) }}
                              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm shadow-slate-200/40 focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-400/15 dark:border-white/10 dark:bg-slate-950 dark:text-slate-100 dark:shadow-none dark:focus:border-violet-400/60"
                            >
                              <option value="">-- カメラを選択してください --</option>
                              {BODIES_BY_MOUNT[selectedMount.id].map((b) => (
                                <option key={b} value={b}>{b}</option>
                              ))}
                              <option value="__custom__">その他（直接入力）</option>
                            </select>

                            {(!BODIES_BY_MOUNT[selectedMount.id].includes(bodyInput) || bodyInput === '') && (
                              <input
                                type="text"
                                value={bodyInput}
                                onChange={(e) => setBodyInput(e.target.value)}
                                onBlur={(e) => handleBodySave(e.target.value)}
                                placeholder="候補にない機種名を入力..."
                                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm shadow-slate-200/40 focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-400/15 dark:border-white/10 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500 dark:shadow-none dark:focus:border-violet-400/60"
                              />
                            )}
                          </div>
                        ) : (
                          <input
                            type="text"
                            value={bodyInput}
                            onChange={(e) => setBodyInput(e.target.value)}
                            onBlur={(e) => handleBodySave(e.target.value)}
                            placeholder="使用カメラ名を入力..."
                            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm shadow-slate-200/40 focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-400/15 dark:border-white/10 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500 dark:shadow-none dark:focus:border-violet-400/60"
                          />
                        )}

                        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                          <button
                            onClick={() => {
                              if (bodyInput.trim()) handleBodySave(bodyInput)
                              setSetupDone(true)
                              try { localStorage.setItem('setupDone', 'true') } catch { /* ignore */ }
                            }}
                            className="flex-1 rounded-xl bg-slate-950 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
                          >
                            この設定で相談を始める
                          </button>
                          <button
                            onClick={() => {
                              setSetupDone(true)
                              try { localStorage.setItem('setupDone', 'true') } catch { /* ignore */ }
                            }}
                            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-800 dark:border-white/10 dark:bg-slate-950 dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-slate-200"
                          >
                            カメラは後で
                          </button>
                        </div>
                      </motion.div>
                    )}

                    {!selectedMount && (
                      <button
                        onClick={() => {
                          setSetupDone(true)
                          try { localStorage.setItem('setupDone', 'true') } catch { /* ignore */ }
                        }}
                        className="text-xs text-slate-400 transition-colors hover:text-slate-600 dark:hover:text-slate-300"
                      >
                        → あとで設定する
                      </button>
                    )}
                  </motion.div>
                )}

                {/* ── 通常の空状態 ── */}
                <div className="text-center">
                  <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-white ring-1 ring-slate-200 mb-3 shadow-lg shadow-slate-200/70 dark:bg-white/[0.08] dark:ring-white/15 dark:shadow-black/20">
                    <CameraIcon className="h-7 w-7 text-violet-600 dark:text-violet-300" />
                  </div>
                  {selectedMount && (
                    <div className="mx-auto mb-3 inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-medium text-violet-700 shadow-sm shadow-fuchsia-500/5 dark:border-violet-400/20 dark:bg-indigo-400/10 dark:text-indigo-200">
                      <Check className="h-3.5 w-3.5" />
                      現在の設定: {selectedMount.label} / {selectedMount.sub}
                    </div>
                  )}
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                    何を撮りたいですか？
                  </h2>
                  <p className="text-sm text-slate-600 dark:text-slate-300 mb-5">
                    シーンを選ぶか、自由に話しかけてください
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 max-w-2xl mx-auto">
                    {SCENES.map((s, i) => {
                      const Icon = s.icon
                      return (
                        <motion.button
                          key={s.q}
                          onClick={() => sendMessage(s.q)}
                          initial={{ opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: i * 0.05, ease: 'easeOut' }}
                          whileHover={{ y: -2 }}
                          whileTap={{ scale: 0.98 }}
                          className="group rounded-2xl bg-slate-200/80 p-[1px] text-left shadow-sm shadow-slate-200/60 transition-all hover:bg-[linear-gradient(90deg,#2563EB_0%,#6366F1_55%,#A78BFA_100%)] hover:shadow-lg hover:shadow-indigo-500/10 focus:outline-none dark:bg-white/10 dark:shadow-none dark:hover:bg-[linear-gradient(90deg,#2563EB_0%,#6366F1_55%,#A78BFA_100%)]"
                        >
                          <span className="flex min-h-[104px] flex-col items-start justify-between rounded-[15px] bg-white px-3 py-3.5 text-slate-800 transition-colors group-hover:bg-slate-50 dark:bg-slate-900/90 dark:text-slate-100 dark:group-hover:bg-slate-900">
                            <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-600 transition-colors group-hover:border-indigo-200 group-hover:bg-white group-hover:text-violet-700 dark:border-white/10 dark:bg-slate-950 dark:text-slate-300 dark:group-hover:border-violet-400/40 dark:group-hover:bg-slate-950 dark:group-hover:text-indigo-200">
                              <Icon className="h-4 w-4" />
                            </span>
                            <span>
                              <span className="block text-xs font-semibold leading-tight text-slate-900 dark:text-slate-100">{s.label}</span>
                              <span className="mt-1 block text-[10px] leading-snug text-slate-500 dark:text-slate-400">{s.desc}</span>
                            </span>
                          </span>
                        </motion.button>
                      )
                    })}
                  </div>
                </div>
              </motion.div>
            )}

            <AnimatePresence initial={false}>
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  variants={messageVariants}
                  initial="hidden"
                  animate="visible"
                  className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${
                    msg.role === 'user' ? 'bg-[linear-gradient(220.55deg,#FF8570_0%,#418CB7_100%)] shadow-sm shadow-blue-500/10' : 'bg-white/90 ring-1 ring-slate-200/90 backdrop-blur dark:bg-white/[0.08] dark:ring-white/15'
                  }`}>
                    {msg.role === 'user'
                      ? <User className="h-4 w-4 text-white" />
                      : <Bot className="h-4 w-4 text-slate-600 dark:text-slate-300" />
                    }
                  </div>

                  <div className="flex-1">
                    {msg.role === 'user' ? (
                      <div className="flex justify-end">
                        <div className="max-w-[85%] rounded-2xl rounded-tr-none border border-violet-400/20 bg-[linear-gradient(220.55deg,#FF8570_0%,#418CB7_100%)] px-4 py-3 text-sm leading-relaxed text-white shadow-lg shadow-blue-500/10 whitespace-pre-wrap">
                          {msg.content}
                        </div>
                      </div>
                    ) : (
                      <>
                        {/* HTMLレンダリング */}
                        <div
                          data-testid="assistant-answer"
                          className="chat-answer prose-dify rounded-2xl rounded-tl-none border border-slate-200/90 bg-white/95 px-4 py-3 text-sm leading-relaxed text-slate-950 shadow-lg shadow-slate-200/70 backdrop-blur-xl dark:border-white/15 dark:bg-slate-900/80 dark:text-slate-100 dark:shadow-black/20"
                          dangerouslySetInnerHTML={{ __html: renderAnswer(msg.content) }}
                        />
                        {/* レンズ推薦カード（Reactコンポーネント） */}
                        <LensRecommendationCards responseText={msg.content} selectedMountPrompt={selectedMount?.prompt} />
                        {/* AI選択肢ボタン */}
                        <ChoiceButtons text={msg.content} onSelect={sendMessage} />
                      </>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* タイピングインジケーター */}
            <AnimatePresence>
              {loading && (
                <motion.div
                  className="flex gap-3"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.25, ease: 'easeOut' }}
                >
                  <div className="h-8 w-8 rounded-full bg-white/90 ring-1 ring-slate-200/90 backdrop-blur dark:bg-white/[0.08] dark:ring-white/15 flex items-center justify-center flex-shrink-0">
                    <Bot className="h-4 w-4 text-slate-600 dark:text-slate-300" />
                  </div>
                  <div className="rounded-2xl rounded-tl-none border border-slate-200/90 bg-white/95 px-4 py-3 shadow-lg shadow-slate-200/70 backdrop-blur-xl dark:border-white/15 dark:bg-slate-900/80 dark:shadow-black/20">
                    <TypingDots />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div ref={bottomRef} />
          </div>
        </div>

        {/* モバイル設定ボトムシート */}
        <AnimatePresence>
          {showMobileSettings && (
            <>
              {/* オーバーレイ */}
              <motion.div
                className="md:hidden fixed inset-0 bg-slate-950/35 z-40"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowMobileSettings(false)}
              />
              {/* パネル */}
              <motion.div
                className="md:hidden fixed bottom-0 left-0 right-0 z-50 rounded-t-2xl border-t border-slate-200 bg-white shadow-2xl shadow-slate-900/20 max-h-[80vh] overflow-y-auto dark:border-white/10 dark:bg-slate-950 dark:text-slate-100 dark:shadow-black/30"
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              >
                {/* ハンドル */}
                <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-slate-200 dark:border-white/10">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">プロフィール設定</p>
                  <button onClick={() => setShowMobileSettings(false)} className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white">
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <div className="px-4 py-4 space-y-4">
                  <MountSelector selected={selectedMount} onChange={handleMountChange} />
                  <div className="px-1">
                    <p className="text-[10px] text-slate-600 mb-1 dark:text-slate-400">使用ボディ</p>
                    {selectedMount && BODIES_BY_MOUNT[selectedMount.id] ? (
                      <div className="space-y-1">
                        <select
                          value={BODIES_BY_MOUNT[selectedMount.id].includes(bodyInput) ? bodyInput : '__custom__'}
                          onChange={(e) => { if (e.target.value !== '__custom__') handleBodySave(e.target.value) }}
                          className={`w-full rounded-lg bg-white border border-slate-200 px-2.5 py-2 text-sm text-slate-900 shadow-sm shadow-slate-200/40 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/15 dark:bg-slate-900/80 dark:border-white/10 dark:text-slate-100 dark:shadow-none dark:focus:border-violet-400/60 ${
                            showBodyHint && !bodyInput.trim() ? 'ring-2 ring-sky-400/20 shadow-sky-500/10 dark:ring-sky-300/20' : ''
                          }`}
                        >
                          <option value="">-- 選択してください --</option>
                          {BODIES_BY_MOUNT[selectedMount.id].map((b) => (
                            <option key={b} value={b}>{b}</option>
                          ))}
                          <option value="__custom__">その他（直接入力）</option>
                        </select>
                        {(!BODIES_BY_MOUNT[selectedMount.id].includes(bodyInput) || bodyInput === '') && (
                          <input type="text" value={bodyInput}
                            onChange={(e) => {
                              setBodyInput(e.target.value)
                              if (e.target.value.trim()) setShowBodyHint(false)
                            }}
                            onBlur={(e) => handleBodySave(e.target.value)}
                            placeholder="機種名を直接入力..."
                            className={`w-full rounded-lg bg-white border border-slate-200 px-2.5 py-2 text-sm text-slate-900 placeholder-slate-500 shadow-sm shadow-slate-200/40 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/15 dark:bg-slate-900/80 dark:border-white/10 dark:text-slate-100 dark:placeholder-slate-400 dark:shadow-none dark:focus:border-violet-400/60 ${
                              showBodyHint && !bodyInput.trim() ? 'ring-2 ring-sky-400/20 shadow-sky-500/10 dark:ring-sky-300/20' : ''
                            }`}
                          />
                        )}
                      </div>
                    ) : (
                      <input type="text" value={bodyInput}
                        onChange={(e) => {
                          setBodyInput(e.target.value)
                          if (e.target.value.trim()) setShowBodyHint(false)
                        }}
                        onBlur={(e) => handleBodySave(e.target.value)}
                        placeholder="マウントを先に選択すると候補が出ます"
                        className="w-full rounded-lg bg-white border border-slate-200 px-2.5 py-2 text-sm text-slate-900 placeholder-slate-500 shadow-sm shadow-slate-200/40 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/15 dark:bg-slate-900/80 dark:border-white/10 dark:text-slate-100 dark:placeholder-slate-400 dark:shadow-none dark:focus:border-violet-400/60"
                      />
                    )}
                    {showBodyHint && selectedMount && !bodyInput.trim() && (
                      <motion.p
                        initial={{ opacity: 0, y: -3 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-1.5 flex items-center gap-1.5 text-[11px] leading-snug text-sky-700 dark:text-sky-300/90"
                      >
                        <ChevronRight className="h-3 w-3 flex-shrink-0" />
                        機種名を入れると、さらに精度が上がります
                      </motion.p>
                    )}
                  </div>
                  <BudgetSlider selected={selectedBudget} onChange={handleBudgetChange} />
                  <FocalRangeSlider range={selectedFocal} onChange={handleFocalChange} lensType={lensType} onLensTypeChange={handleLensTypeChange} />
                  {(selectedMount || bodyInput || selectedBudget || selectedFocal || lensType !== 'auto') && (
                    <p className="px-1 text-[11px] text-[#4F46E5] dark:text-violet-300/80">✓ 質問に自動付与されます</p>
                  )}
                  <button
                    onClick={() => setShowMobileSettings(false)}
                    className="w-full rounded-xl bg-[linear-gradient(220.55deg,#FF8570_0%,#418CB7_100%)] py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/10"
                  >
                    設定を保存して閉じる
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* 入力エリア */}
        <div className="border-t border-slate-200/80 bg-white/90 px-4 py-3 shadow-[0_-18px_50px_rgba(15,23,42,0.08)] backdrop-blur-2xl dark:border-white/15 dark:bg-slate-950/75 dark:shadow-black/25">
          <div className="mx-auto max-w-3xl">
            {/* モバイル用ツールバー */}
            <div className="md:hidden flex items-center justify-between mb-2">
              {/* 設定バッジ */}
              <div className="flex flex-wrap items-center gap-1.5 flex-1 min-w-0">
                {selectedMount && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-violet-600/10 border border-indigo-500/20 px-2 py-0.5 text-[11px] text-violet-700 dark:text-violet-300">
                    <CameraIcon className="h-2.5 w-2.5" />{selectedMount.label}
                  </span>
                )}
                {selectedBudget && (
                  <span className="rounded-full bg-slate-100 border border-slate-200 px-2 py-0.5 text-[11px] text-slate-600 dark:bg-slate-700/50 dark:border-white/10 dark:text-slate-400">
                    {selectedBudget.label}
                  </span>
                )}
                {selectedFocal && (
                  <span className="rounded-full bg-sky-50 border border-sky-200 px-2 py-0.5 text-[11px] text-sky-700 font-mono dark:bg-sky-500/20 dark:border-sky-500/30 dark:text-sky-400">
                    {selectedFocal.minMm}–{selectedFocal.maxMm}mm
                  </span>
                )}
                {!selectedMount && !selectedBudget && !selectedFocal && (
                  <span className="text-[11px] text-slate-600 dark:text-slate-300">設定未選択</span>
                )}
              </div>
              {/* アクションボタン */}
              <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
                {messages.length > 0 && (
                  <button
                    onClick={handleNewChat}
                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-red-400"
                    title="会話をリセット"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                  </button>
                )}
                <button
                  onClick={() => setShowMobileSettings(true)}
                  className={`relative flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${
                    !selectedMount
                      ? 'bg-violet-600/15 text-indigo-500 ring-1 ring-violet-500/30 dark:text-indigo-300'
                      : 'bg-white/70 dark:bg-white/[0.06] text-slate-500 hover:text-indigo-500 dark:hover:text-indigo-300'
                  }`}
                  title="設定"
                >
                  <Settings className="h-3.5 w-3.5" />
                  {/* 未設定バッジ */}
                  {!selectedMount && (
                    <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-violet-600 ring-2 ring-white dark:ring-slate-900" />
                  )}
                </button>
              </div>
            </div>

            <div className="mb-2 hidden items-center justify-between md:flex">
              <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                {selectedMount && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-violet-200 bg-violet-50 px-2 py-0.5 text-violet-700 dark:border-violet-400/20 dark:bg-violet-400/10 dark:text-violet-300">
                    <CameraIcon className="h-2.5 w-2.5" />{selectedMount.label}
                  </span>
                )}
                {bodyInput.trim() && (
                  <span className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
                    {bodyInput.trim()}
                  </span>
                )}
              </div>
              {messages.length > 0 && (
                <button
                  onClick={handleNewChat}
                  className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-medium text-slate-500 shadow-sm shadow-slate-200/50 transition-all hover:border-violet-300 hover:text-slate-800 hover:shadow-md hover:shadow-violet-500/10 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-400 dark:shadow-none dark:hover:border-violet-400/40 dark:hover:text-slate-200"
                >
                  <RotateCcw className="h-3 w-3" />
                  新規相談
                </button>
              )}
            </div>

            <div className="flex gap-3 items-end">
              <textarea
                data-testid="chat-input"
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                onCompositionStart={() => { isComposingRef.current = true }}
                onCompositionEnd={() => { isComposingRef.current = false }}
                placeholder="例：運動会で動く子供を撮りたい..."
                rows={1}
                className="flex-1 resize-none rounded-2xl border border-slate-200/90 bg-white/95 px-4 py-3 text-sm text-slate-950 shadow-sm shadow-slate-200/70 backdrop-blur-xl placeholder-slate-500 focus:border-violet-400/90 focus:outline-none focus:ring-4 focus:ring-indigo-400/20 max-h-32 overflow-y-auto dark:border-white/15 dark:bg-white/[0.08] dark:text-white dark:placeholder-slate-400 dark:shadow-none dark:focus:border-violet-400/60"
                style={{ height: 'auto' }}
                onInput={(e) => {
                  const el = e.currentTarget
                  el.style.height = 'auto'
                  el.style.height = Math.min(el.scrollHeight, 128) + 'px'
                }}
              />
              <motion.button
                data-testid="chat-send-button"
                onClick={() => sendMessage(input)}
                disabled={!input.trim() || loading}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-[linear-gradient(220.55deg,#FF8570_0%,#418CB7_100%)] text-white shadow-lg shadow-blue-500/10 transition-all hover:brightness-105 disabled:opacity-30 disabled:cursor-not-allowed disabled:shadow-none"
              >
                <Send className="h-4 w-4" />
              </motion.button>
            </div>
            <p className="mt-2 text-center text-xs text-slate-400 dark:text-slate-600 hidden md:block">
              Shift+Enter で送信 / Enter で改行
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
