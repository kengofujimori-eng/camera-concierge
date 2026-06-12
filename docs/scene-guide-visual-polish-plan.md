# Scene Guide visual polish plan

## Purpose

Scene Guide を「読むガイド」から「触ると理解できるガイド」へ進めるための UI 改善計画を定義する。

現在の Scene Guide は、主要4シーンで interactive decision flow、consultation handoff、Lens Condition Resolver pilot、Deep Review comparison hooks pilot まで成立している。

次の課題はロジック追加ではなく、既存の判断構造をより短時間で理解できるようにすること。この plan では UI 表現だけを対象にする。

## Current state

### Implemented

- 家族写真 / 発表会 / 運動会 / 旅行・おでかけ interactive
- 4シーン consultation handoff
- Lens Condition Resolver pilot
- Deep Review comparison hooks pilot
- `/scene-playbooks` page
- `ScenePlaybookCard`
- focal length rail
- main / secondary / safe role display
- lens condition card
- comparison hooks card

### Public beta status

公開βブロッカーはない。

ロジック、Resolver、handoff、comparison hooks は現時点で成立している。現在地の統合レビューは `docs/scene-guide-resolver-comparison-review.md` を参照する。

## Problem

現在の Scene Guide は機能価値が成立している一方、まだ「読み物感」が強い。

- 文字量が多い。
- 補足・注意が文章中心。
- 撮影距離が視覚化されていない。
- 焦点距離と距離感の関係が直感的に見えにくい。
- シーンごとのアイコンが不足している。
- 発表会の座席距離、運動会の距離感、旅行の軽さ / 重さ、家族写真の撮影距離が文字説明に寄っている。
- モバイルでは情報が縦に長くなりやすい。

## Goal

ユーザーが以下を読む前に、見て理解できる状態にする。

- どれくらい離れて撮るのか
- どの焦点距離が自然なのか
- どの条件で本命が変わるのか
- 安全策がなぜ必要なのか
- 軽さ / 望遠 / 明るさ / ズーム安全性のトレードオフ

目指す体験:

```txt
撮影条件を選ぶ
  ↓
距離・重さ・被写体サイズが視覚的に変わる
  ↓
本命 / 次点 / 安全策の意味が一目で分かる
  ↓
必要なら相談や Deep Review 比較へ進む
```

## Non-goals

この phase では以下を行わない。

- Resolver logic / comparison hook logic の変更
- consultation handoff schema の変更
- API / Dify / `public/lens_data.json` の変更
- `stable_id` 接続
- Deep Review route への実遷移
- 具体レンズ名の表示追加
- スコア / ランキング / 点数表現の追加
- 推薦ロジックの変更
- localStorage / sessionStorage key の変更
- 既存 data-testid の削除・変更

## Design principles

### 1. Visual first, text second

説明文を増やすのではなく、既存の意味を小さな UI パーツへ置き換える。

避ける方向:

- 注意文をさらに詳しくする。
- 文章で条件分岐を説明する。
- 1カード内に説明を詰め込む。

採る方向:

- note chip
- small icon
- distance marker
- role badge
- compact meter
- 1-line reason

### 2. No new logic

UI polish は既存 result を表示するだけにする。

既存の `primary` / `secondary` / `safe` / `caution` / selected conditions / resolved lens condition を使う。

### 3. Scene-specific but reusable

家族写真、発表会、運動会、旅行で見せ方は変える。ただし実装は、可能な限り小さな reusable UI component に分ける。

候補:

- `SceneInfoChip`
- `SceneIconBadge`
- `VisualNote`
- `DistanceVisualization`
- `FocalLengthRail`
- `RoleBadge`
- `WeightFlexMeter`

### 4. Thin, calm, product UI

既存の Lens Navi UI tone を維持する。

- white / slate base
- thin border
- restrained shadow
- local blue-violet-magenta accent
- no large gradient fill
- no noisy neon
- no heavy illustration
- no childish icon style

### 5. Mobile first

- 横スクロール前提にしない。
- チップは wrap 可能にする。
- レールは狭い画面でも意味が残る。
- 1ブロックの高さを増やしすぎない。
- 補足文は1〜2行に抑える。
- 図解は CSS だけで軽く作る。

## Priority

### P1. Visual notes / info chips

最初に黄色い補足・注意枠を整理する。

Current issue:

- amber note がやや野暮ったい。
- 注意文が文章として読まれる。
- note と caution の優先度が見えにくい。

Direction:

- `VisualNote` に置き換える。
- amber を常用しない。
- slate base + small icon + muted label にする。
- 危険度の高い注意だけ amber を残す。
- 基本は `補足` / `注意` / `迷ったら` / `距離不足` / `重さ注意` / `単焦点注意` / `ズーム安全` の chip 化。

Implementation target:

- card-level `primaryCaution`
- decision result `result.caution`
- `LensConditionCard` caution line

Expected effect:

- 黄色い警告感を減らす。
- 読み物感を下げる。
- 注意点を短く認識できる。

### P2. Scene-specific icons

各シーンと各条件に極小アイコンを追加する。

Purpose:

- 条件を文字だけで読ませない。
- シーンの違いを直感化する。
- モバイルで視線の支点を作る。

Icon policy:

- 既存依存の `lucide-react` を使用する。
- 新規 icon library は追加しない。
- SVG を大量追加しない。
- emoji は使わない。
- アイコンは意味補助であり、主役にしない。

Scene icon candidates:

- 家族写真: `Home` / `Trees` / `Users` / `Camera`
- 発表会: `Music` / `Armchair` / `Building2` / `Eye`
- 運動会: `PersonStanding` / `Flag` / `Map` / `Activity`
- 旅行・おでかけ: `Luggage` / `Map` / `Footprints` / `Feather` / `Repeat2`

Condition icon candidates:

- location: home / trees
- seat: armchair / arrow
- venue: building
- goal: eye / frame
- distance: ruler / arrows
- motion: activity
- baggage: luggage / feather
- subject: users / mountain / map
- lens exchange: repeat

Implementation target:

- scene chooser buttons
- condition fieldsets
- selected condition summary, if added
- visual notes

### P3. Distance visualization

焦点距離の前に、撮影距離を見える化する。

Recommended component:

```ts
type DistanceVisualizationProps = {
  sceneId: string
  selectedConditions: {
    key: string
    label: string
    value: string
  }[]
  primary: string
  secondary?: string
  safe?: string
}
```

#### 家族写真

```txt
撮影者  —— 子ども / 家族
近い      自然      離れる
35mm      50mm      85mm / 135mm
```

- Indoor: close marker active、35mm / 50mm highlighted
- Outdoor: middle / far marker active、85mm / 135mm highlighted

#### 発表会

```txt
舞台 | 前方席 | 中央席 | 後方席
      85mm     135mm    200mm+
              70-200mm = 安全
```

- selected seat を active にする。
- 70-200mm は safety capsule として扱う。

#### 運動会

```txt
子ども —— 近い競技 —— 校庭中央 —— 遠い競技
        85-135mm      70-200mm    100-400mm
```

- distance / field size / motion を compact marker で示す。

#### 旅行・おでかけ

距離だけでは足りないため、`CarryWeightVisualization` または `TravelTradeoffVisualization` を使う。

```txt
軽い    標準      便利
単焦点  標準ズーム  便利ズーム
```

または:

```txt
広く残す —— 人物自然 —— 遠くを切る
20-70mm    35/50mm     85mm
```

### P4. Focal length rail redesign

既存 `FocalLengthRail` は有効なので、全面置換ではなく拡張する。

Current issues:

- 距離・被写体サイズとの関係が弱い。
- safe の意味が dots だけでは伝わりにくい。
- 旅行の6項目 rail はモバイルで詰まりやすい。

Direction:

- rail title を短くする。
- primary / secondary / safe badge を追加する。
- active range に淡い背景 band を追加する。
- safe zoom は dot ではなく capsule 表現にする。
- mobile では dots より cards に近い表示も検討する。
- travel-outing は mobile grid を `grid-cols-2 sm:grid-cols-3 lg:grid-cols-6` にする。

維持するもの:

- `FOCAL_LENGTH_RAILS`
- `primary` / `secondary` / `safe` props
- 親コンポーネントの既存 data-testid

### P5. Mobile readability

モバイルでの「読む量」を削る。

Targets:

- condition controls
- result card
- caution note
- lens condition card
- comparison hooks card
- consultation handoff card

Rules:

- 1セクションの見出しは短くする。
- 重要語を chip 化する。
- `line-clamp-2` は維持または強化する。
- section gap を広げすぎない。
- cards の角丸と余白を統一する。
- CTA は full-width 維持でよい。

## Scene-specific polish plan

### 1. 家族写真

Current understanding issue:

- 室内 / 屋外で必要焦点距離が変わる理由と、撮影距離の違いが文字中心。

Visual polish:

- 室内: home icon + short distance marker
- 屋外: trees icon + medium distance marker
- 35mm / 50mm: close family framing
- 85mm / 135mm: outdoor background separation

Info chips:

- 室内
- 近距離
- 複数人
- 背景整理
- 開放注意

Text reduction:

- caution は `開放では複数人のピントに注意` 程度に短縮する。
- reason は1行を維持する。

### 2. 発表会

Current understanding issue:

- 座席距離と焦点距離の関係が最も重要だが、85mm / 135mm / 70-200mm / 200mm+ の役割が文章中心。

Visual polish:

- stage-to-seat diagram
- selected seat marker
- 70-200mm safety capsule
- 200mm+ rear-seat marker

Info chips:

- 前方席 / 中央席 / 後方席
- 小ホール / 大ホール
- 表情 / 全身
- 席不明ならズーム

Text reduction:

- `席が読めないならズームも比較`
- `暗所ではシャッター速度に注意`

### 3. 運動会

Current understanding issue:

- 子どもまでの距離、動き、会場サイズが文字中心。
- 100-400mm / 200mm+ の必要性が見えにくい。

Visual polish:

- field distance diagram
- motion chip
- reach warning chip
- 100-400mm as long reach band

Info chips:

- 近い競技 / 校庭中央 / 遠い競技
- 動き速い
- AF追従
- 重さ注意
- 距離不足注意

### 4. 旅行・おでかけ

Current understanding issue:

- 焦点距離より、軽さ / 便利さ / 交換頻度の理解が重要。
- 20-70mm / 24-70mm / 単焦点 / 便利ズームの違いが文字中心。

Visual polish:

- carry weight / flexibility meter
- lightweight vs versatile tradeoff
- lens exchange frequency chip
- wide-to-portrait mini rail

Info chips:

- 軽い
- 交換少なめ
- 風景 / 人物 / 街歩き
- 便利ズーム
- 単焦点注意

## Component plan

### VisualNote

Purpose:

amber-heavy caution box を calmer note chip へ置き換える。

```ts
type VisualNoteVariant = "info" | "caution" | "distance" | "weight" | "zoom"

function VisualNote({
  label,
  children,
  variant = "info",
}: {
  label: string
  children: string
  variant?: VisualNoteVariant
})
```

Usage:

- card primary caution
- result caution
- lens condition caution

Style:

- rounded-2xl
- slate border
- white / slate background
- small lucide icon
- label chip
- body text line-clamped

### SceneIconBadge / ConditionIcon

Purpose:

シーン / 条件ラベルの横に小さな semantic icon を置く。

```ts
function SceneIconBadge({
  sceneId,
  tone = "default",
}: {
  sceneId: string
  tone?: "default" | "selected"
})

function ConditionIcon({
  conditionKey,
  value,
}: {
  conditionKey: string
  value?: string
})
```

### DistanceVisualization

Purpose:

distance / seat / field / travel tradeoff を focal rail の前後に compact visual として示す。

```ts
function DistanceVisualization({
  sceneId,
  selectedConditions,
  primary,
  secondary,
  safe,
}: DistanceVisualizationProps)
```

新しい判断ロジックは持たず、既存条件と候補を active marker へ変換する。

### FocalLengthRail update

関数名と既存 rail data を維持しながら、role badge、safe capsule、mobile grid を改善する。

### RoleBadge

本命 / 次点 / 安全策の表現を揃える。

```ts
function RoleBadge({
  role,
}: {
  role: "primary" | "secondary" | "safe"
})
```

## Implementation phases

### Phase 1: docs only

Create this plan.

Allowed files:

- `docs/scene-guide-visual-polish-plan.md`
- `docs/active-mission.md`
- `docs/current-task.md`

No code changes.

### Phase 2: Visual notes / info chips

Scope:

- Add `VisualNote`
- Replace card-level amber caution
- Replace result-level amber caution
- Keep text content mostly unchanged
- Replace `LensConditionCard` caution line if simple
- No resolver / handoff / comparison change

Allowed files:

- `src/components/ScenePlaybookCard.tsx`
- possibly `docs/current-task.md`
- possibly `docs/active-mission.md`

Check:

- `npm run build`

No e2e. No commit / push.

### Phase 3: Scene icons

Scope:

- Add icon mapping using existing `lucide-react`
- Add icons to scene chooser and condition fieldsets
- Do not add a new package

Allowed files:

- `src/app/scene-playbooks/page.tsx`
- `src/components/ScenePlaybookCard.tsx`

Check:

- `npm run build`

No e2e. No commit / push.

### Phase 4: Distance visualization pilot

Scope:

- Add `DistanceVisualization`
- Start with 発表会 and 運動会
- Keep family / travel fallback simple or hidden
- No result logic changes

Allowed files:

- `src/components/ScenePlaybookCard.tsx`

Check:

- `npm run build`

No e2e. No commit / push.

### Phase 5: Focal length rail redesign

Scope:

- Improve `FocalLengthRail`
- Add role badge and safe capsule
- Improve mobile grid for travel
- Keep existing rail data shape

Allowed files:

- `src/components/ScenePlaybookCard.tsx`

Check:

- `npm run build`

No e2e. No commit / push.

### Phase 6: Mobile readability pass

Scope:

- Reduce vertical density
- Tune spacing / line clamp / chip wrapping
- Confirm `/scene-playbooks` on mobile width
- Do not change logic

Allowed files:

- `src/app/scene-playbooks/page.tsx`
- `src/components/ScenePlaybookCard.tsx`

Check:

- `npm run build`

No e2e. No commit / push.

## Acceptance criteria

### Functional

- Existing 4シーン interactive flow remains working.
- Consultation handoff remains working.
- Resolver pilot output remains unchanged in meaning.
- Comparison hooks remain placeholder.
- No API / Dify / lens data changes.
- No localStorage / sessionStorage key changes.
- No new scoring / ranking language.

### Visual

- Yellow caution blocks are reduced or replaced by calmer notes.
- Scene / condition icons are visible but not noisy.
- 発表会の座席距離が一目で分かる。
- 運動会の距離感が一目で分かる。
- 旅行の軽さ / 便利さのトレードオフが一目で分かる。
- 家族写真の室内 / 屋外距離が一目で分かる。
- Focal length rail shows role, not just dots.
- Mobile readability improves.

### Technical

- `npm run build` passes.
- No e2e required.
- No commit / push.
- Existing data-testid values are not removed.
- Existing public route remains `/scene-playbooks`.

## Suggested next current-task

After this docs-only plan, start with the smallest implementation:

```txt
Polish Scene Guide visual notes and info chips
```

Why first:

- Lowest risk
- No logic change
- Directly addresses known amber note issue
- Improves readability before adding diagrams
- Creates reusable `VisualNote` for later distance / weight warnings

Suggested first implementation scope:

- Add `VisualNote` inside `ScenePlaybookCard.tsx`
- Replace card-level `primaryCaution` amber block
- Replace result-level `result.caution` amber block
- Replace `LensConditionCard` caution line with compact note treatment if simple
- Keep all text and logic mostly unchanged
- Run `npm run build`
- Do not commit / push

## Guardrails

- Do not redesign the whole Scene Guide at once.
- Do not introduce illustration-heavy UI.
- Do not add a new design language.
- Do not change recommendation / Resolver / comparison hook logic.
- Do not connect Deep Review route.
- Do not add specific lens names.
- Do not add scores, rankings, or numeric ratings.
- Do not touch API / Dify / warehouse / lens data.
- Do not remove existing data-testid attributes.
- Keep changes small and reversible.
