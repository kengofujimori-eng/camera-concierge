# Deep Review comparison connection plan

## Purpose

Deep Review を、Scene Guide で絞られた候補同士の最後の比較に接続するための設計メモ。

Lens Navi の理想構造:

Scene Guide
↓
撮影条件から必要条件を出す

Lens Condition Resolver
↓
マウント別の候補レンズを出す

AI Deep Review
↓
候補同士の違いを腑に落とす

Deep Review は単なるレンズレビューではなく、最後に迷う候補比較をほどく場所にする。

## Current state

- Deep Review UI モックは倉庫に存在
- Deep Review はレンズ単体の使いこなしを扱う方向
- Scene Guide は撮影シーンを主語にする方向
- まだ Deep Review と Scene Guide は未接続
- stable_id 未導入のため、関連リンクは未実装

## Problem

ユーザーは最後の最後で以下に迷う。

- 85mm がいいのか、135mm がいいのか
- 135mm がいいのか、70-200mm が安全なのか
- F2.8 ズームか、F1.8 単焦点か
- 軽量F4ズームか、明るいF2.8ズームか
- 純正か、サードパーティか

Scene Guide だけでは条件から候補を出せるが、最後の比較納得までは届きにくい。  
Deep Review だけでは文脈が不足し、どの条件でそのレンズが輝くのかが曖昧になる。

両者を接続する必要がある。

## Roles

### Scene Guide

Answers:

この撮影条件では、どんな焦点距離・レンズタイプが必要か

Example:

発表会 / 中央席 / 表情
↓
135mm が本命
70-200mm が安全策
85mm は前方席なら候補

### Deep Review

Answers:

この候補同士では、どちらを選ぶと腑に落ちるか

Example:

135mm vs 70-200mm
↓
単焦点の描写と明るさ
ズームの安全性
席が読めるかどうか

## Comparison types

Deep Review should support several comparison types.

### 1. Focal length comparison

Example:

85mm vs 135mm

Use when:

- both are primes
- user is choosing portrait / recital / family use
- difference is mostly distance and framing

Key questions:

- Is the subject close or far?
- Do you need full body or expression close-up?
- Is the venue indoor or outdoor?
- Can you move?

### 2. Prime vs zoom comparison

Example:

135mm vs 70-200mm

Use when:

- one option is more expressive
- the other is safer
- shooting position is uncertain

Key questions:

- Is the seat fixed?
- Can framing be predicted?
- Is video also needed?
- Is weight acceptable?

### 3. Aperture / brightness comparison

Example:

70-200mm F2.8 vs F4

Use when:

- both are zooms
- trade-off is brightness, weight, price, and background separation

Key questions:

- Is the venue dark?
- Is subject motion fast?
- Is weight more important?
- Is budget constrained?

### 4. Same focal length / different brand comparison

Example:

Sony 85mm vs Sigma 85mm

Use when:

- user already knows focal length
- trade-off is AF, weight, price, rendering, reliability

Key questions:

- Is AF critical?
- Is weight critical?
- Is budget constrained?
- Is native compatibility important?

## Deep Review comparison output format

Comparison should be short, structured, and condition-specific.

Recommended format:

- 一言でいうと
- Aが向く条件
- Bが向く条件
- このシーンではどちらが自然か
- 注意点
- Scene Guideとの接続

Example:

一言でいうと:  
中央席の発表会で表情を切り出したいなら135mmが自然。ただし席が読めないなら70-200mmが安全です。

135mmが向く条件:
- 写真メイン
- 席がある程度読める
- 表情や上半身を切り出したい

70-200mmが向く条件:
- 席が読めない
- 全身も表情も撮りたい
- 動画も撮る

このシーンでは:
中央席・小ホール・写真メインなら135mm。体育館や動画ありなら70-200mm。

## Connection points

### From Scene Guide result

When Scene Guide outputs candidates:

- main: 135mm
- safe: 70-200mm
- conditional: 85mm

Show future comparison hooks:

- 85mm と 135mm を比較する
- 135mm と 70-200mm を比較する

### From Warehouse

When a saved lens has known scene roles:

このレンズが登場するガイド:
- 発表会
- 家族写真
- 運動会

比較候補:
- 85mm vs 135mm
- 135mm vs 70-200mm

### From Deep Review panel

At bottom of Deep Review:

このレンズと迷いやすい候補
- 85mmとの違い
- 70-200mmとの違い

このレンズが輝くシーン
- 発表会 / 中央席 / 表情
- 屋外ポートレート

## Data requirements

Need stable lens IDs first.

Existing plan:

- `docs/lens-data-stable-id-plan.md`

Deep Review comparison needs:

type LensComparisonReference = {
  id: string
  title: string
  lensStableIds: string[]
  comparisonType: 'focal-length' | 'prime-vs-zoom' | 'aperture' | 'brand'
  relatedSceneIds: string[]
  summary: string
}

Example:

{
  id: 'sony-85gmii-vs-135gm-recital',
  title: '85mm GM II vs 135mm GM for recital',
  lensStableIds: [
    'sony-fe-85mm-f14-gmii',
    'sony-fe-135mm-f18-gm'
  ],
  comparisonType: 'focal-length',
  relatedSceneIds: ['recital-stage', 'family-photography'],
  summary: '前方席なら85mm、中央席で表情を切り出すなら135mmが自然。'
}

## AI role

AI should not invent all facts from scratch.  
It should receive structured context.

Suggested prompt context:

Scene:
発表会

User condition:
中央席 / 小ホール / 表情を切り出したい

Resolver result:
main: 135mm  
safe: 70-200mm  
conditional: 85mm

Question:
135mm と 70-200mm のどちらがこの条件で自然か比較してください。

AI output should:

- explain trade-offs
- avoid absolute ranking
- mention uncertainty
- connect back to shooting condition
- avoid excessive speculation

## Implementation phases

### Phase 1: docs only

Define comparison role and connection points.

### Phase 2: static comparison notes

Create initial comparison docs for:

- 85mm vs 135mm
- 135mm vs 70-200mm
- 70-200mm F2.8 vs F4

### Phase 3: Deep Review UI hooks

Add non-clickable or placeholder comparison hooks in Deep Review / Scene Guide.

### Phase 4: stable_id connection

Connect comparison references to lens data.

### Phase 5: AI comparison generation

Generate or summarize comparison using structured context.

## Guardrails

- Do not turn Deep Review into general review aggregation
- Keep Scene Guide and Deep Review roles separate
- Do not claim universal best lens
- Use condition-specific language
- Do not connect to Dify/API until prompt contract is clear
- Do not require all lens data to be complete before testing a small Sony FE subset

## Suggested next docs

- `docs/deep-review-comparison-format.md`
- `docs/deep-review-comparison-85mm-vs-135mm-recital.md`
- `docs/deep-review-comparison-135mm-vs-70-200mm-recital.md`
