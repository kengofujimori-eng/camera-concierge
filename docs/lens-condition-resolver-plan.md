# Lens condition resolver plan

## Purpose

Scene Guide と AI深掘りの間に必要な中間レイヤーを定義する。

Scene Guide は撮影条件から「必要なレンズ条件」を導く。  
しかしメーカー / マウントによって最適な具体レンズは異なる。

そのため、Lens Navi には以下の中間処理が必要になる。

撮影条件
↓
必要なレンズ条件
↓
マウント別の候補レンズ
↓
AI深掘り比較

この中間レイヤーを仮に Lens Condition Resolver と呼ぶ。

## Problem

Scene Guide が直接レンズ名を出すと、メーカーごとの違いに対応しにくい。

例:

発表会 / 中央席 / 小ホール / 表情を切り出す

Sony E では:

- FE 135mm F1.8 GM
- FE 85mm F1.4 GM II
- FE 70-200mm F2.8 GM OSS II

Canon RF では:

- RF 135mm F1.8
- RF 85mm F1.2
- RF 70-200mm F2.8

Nikon Z ではまた違う。

同じ条件でも、メーカーごとに「本命」「安全策」「条件付き」が変わる。

## Resolver role

Lens Condition Resolver は以下を行う。

Scene Guide の条件プロファイル
↓
必要な焦点距離 / 明るさ / レンズタイプ
↓
マウント別候補
↓
候補の役割付け

Resolver はランキングではなく、役割別に候補を出す。

例:

- 本命
- 安全策
- 条件付き
- 予算重視
- 軽量重視

## Input model

候補型:

type LensConditionInput = {
  sceneId: string
  mount?: string
  cameraSystem?: string
  focalMin?: number
  focalMax?: number
  lensType?: 'bright-prime' | 'telephoto-zoom' | 'standard-zoom' | 'macro' | 'flexible'
  priorities: string[]
  constraints: string[]
  budgetRange?: {
    min?: number
    max?: number
  }
}

Example:

{
  sceneId: 'recital-stage',
  mount: 'sony-fe',
  focalMin: 100,
  focalMax: 150,
  lensType: 'bright-prime',
  priorities: ['reach', 'subject-isolation', 'low-light'],
  constraints: ['center-seat', 'small-hall', 'photo-main']
}

## Output model

候補型:

type LensConditionResult = {
  summary: string
  roles: {
    role: 'main' | 'safe' | 'conditional' | 'budget' | 'lightweight'
    label: string
    lensStableIds?: string[]
    reason: string
    cautions: string[]
  }[]
  comparisonHooks: {
    label: string
    candidateIds?: string[]
    reason: string
  }[]
}

## Example output

Input:

発表会 / Sony FE / 中央席 / 小ホール / 表情 / 100〜150mm / 明るい単焦点

Output:

summary:
中央席の小ホールで表情を切り出すなら、Sony FEでは135mm単焦点が本命。席が読めない場合は70-200mmが安全策。

roles:
- main: Sony FE 135mm F1.8 GM
- conditional: Sony FE 85mm F1.4 GM II
- safe: Sony FE 70-200mm F2.8 GM OSS II

comparisonHooks:
- 85mm vs 135mm
- 135mm vs 70-200mm

## Lens data requirements

Resolver を正確に動かすには、`public/lens_data.json` に以下の安定情報が必要になる。

type LensResolverFields = {
  stable_id: string
  mount: string
  brand: string
  focal_min: number
  focal_max: number
  aperture_min: number
  lens_type: string
  weight?: number
  price_band?: string
  roles?: LensRoleTag[]
}

既存の `lens-data-stable-id-plan.md` と接続する。

## Role tags

レンズごとに「輝く条件」を持たせる。

type LensRoleTag = {
  sceneId: string
  shinesWhen: string[]
  notBestWhen: string[]
  roleLabels: string[]
}

Example:

{
  sceneId: 'recital-stage',
  shinesWhen: [
    'center-seat',
    'small-hall',
    'expression-closeup',
    'photo-main'
  ],
  notBestWhen: [
    'rear-seat',
    'large-hall',
    'video-main'
  ],
  roleLabels: ['main', 'bright-prime', 'expression']
}

## Matching logic draft

Resolver should not be a black-box score at first.  
Start with deterministic rule matching.

### Step 1: Filter

- mount matches
- focal range overlaps
- lens type matches
- budget if provided

### Step 2: Assign roles

main:
- strongest scene match
- focal length aligns
- priority tags align

safe:
- zoom flexibility
- covers uncertainty
- useful when seat is unknown

conditional:
- good only under narrower conditions

### Step 3: Generate explanation

Keep it short.

Example:

135mm is the main candidate because the selected conditions require more reach than 85mm, but not necessarily 200mm+.

## Relationship with AI

Resolver should create structured candidates.  
AI should explain the final comparison.

Bad:

AI guesses all candidates from scratch.

Good:

Resolver provides:
- main
- safe
- conditional

AI explains:
- why main is natural
- why safe may be better
- why conditional may or may not fit

## Public beta scope

Do not implement resolver before stable IDs are ready.

Before implementation:

- finish stable_id plan
- confirm key Sony FE lenses
- add resolver fields to a small subset
- implement for one scene and one mount first

Recommended first resolver scope:

scene: recital-stage  
mount: sony-fe

candidates:
- sony-fe-85mm-f14-gmii
- sony-fe-135mm-f18-gm
- sony-fe-70-200mm-f28-gm-ii
- sony-fe-70-200mm-f4-macro-g-ii

## Guardrails

- Do not introduce universal lens ranking
- Do not claim absolute best
- Use condition-specific language
- Keep fallback if stable_id is missing
- Do not break existing warehouse localStorage
- Do not modify Dify/API until resolver output is stable

## Suggested implementation phases

### Phase 1: docs only

Define resolver role and data shape.

### Phase 2: stable_id pilot

Add stable IDs to a small Sony FE subset.

### Phase 3: static resolver prototype

Implement one scene / one mount.

### Phase 4: consultation handoff

Use resolver output in generated consultation prompt.

### Phase 5: Deep Review connection

Use resolver candidates to show comparison links.
