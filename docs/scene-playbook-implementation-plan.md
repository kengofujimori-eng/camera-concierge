# Scene Playbook implementation plan

Scene Playbook を、Markdown の攻略メモだけで終わらせず、将来的に Lens Navi の UI / データ構造 / Deep Review / チャット推薦へ接続するための実装計画メモ。

この docs では実装しない。まず、どのデータをどこに置き、どの導線から見せると Lens Navi の「撮影判断ナビ」らしさが強まるかを整理する。

## 1. Positioning

Scene Playbook は、Lens Navi を「レンズレビューサイト」ではなく「撮影判断ナビ」にするための第4層である。

既存の Deep Review は、レンズ単体の使いこなしを扱う。Scene Playbook は、シーンを主語にして、複数レンズ、焦点距離、F値、撮影距離、撮影制約、動画適性を横断して整理する。

主語の違い:

| Layer | 主語 | 問い |
| ----- | ---- | ---- |
| Deep Review | 1レンズ | そのレンズをどう使うか |
| Buying Comparison | 2〜3本 | どちらを選ぶか |
| Scene Playbook | 1シーン | どのレンズ / F値 / 距離 / 構成が失敗しにくいか |

Scene Playbook はランキングではない。撮影条件ごとの判断マップである。

例:

- 家族写真なら、ボケ量より距離感、複数人、室内の広さ、子供の動きを先に見る。
- 発表会なら、明るさだけでなく、座席距離、構図変更、被写体ブレを先に見る。
- 運動会なら、描写の良さだけでなく、届くこと、追えること、ブレないこと、一日持てることを先に見る。

## 2. Current assets

| Asset | Role | Current coverage |
| ----- | ---- | ---------------- |
| `docs/scene-playbook-format.md` | Scene Playbook の汎用フォーマット | 位置づけ、既存Deep Review層との関係、撮影制約、動きとシャッター、単焦点とズーム、動画判断、TypeScript型候補 |
| `docs/scene-playbook-family-photography.md` | 家族写真攻略 | 近距離 / 室内外 / 子供 / 複数人 / 50mm中心 / 85mmと135mmの追加レンズ性 |
| `docs/scene-playbook-recital-stage.md` | 発表会・ステージ撮影攻略 | 距離制約 / 暗所 / 座席固定 / 85mm・135mm・70-200mm / 200mm以上 |
| `docs/scene-playbook-sports-day.md` | 運動会撮影攻略 | 屋外 / 動体 / 距離変化 / 70-200mm・100-400mm・クロップ / 一日持ち歩き |

Deep Review 系 docs との関係:

- 研究ノートは、各レンズの根拠と実写運用の材料になる。
- 比較ノートは、同カテゴリ内の選び分けを整理する材料になる。
- 購入判断比較は、複数レンズの迷いを撮影スタイル別に分解する材料になる。
- Scene Playbook は、それらをシーン主語に再編集し、実際の撮影条件で失敗しにくい選び方へ翻訳する。

## 3. Why not put this directly into lens_data.json yet

現時点では、Scene Playbook を `lens_data.json` に直接混ぜない方がよい。

理由:

- `lens_data.json` はレンズ単体が主語である。
- Scene Playbook は撮影シーンが主語である。
- 1つの Scene Playbook は複数レンズを横断する。
- 1つのレンズは複数 Scene Playbook に登場する。
- `lens_data.json` に直接入れると、1レンズ1レコード構造が肥大化する。
- UIでも「レンズ詳細」と「シーン攻略」は導線が違う。
- 将来的には `relatedLensIds` / `relatedSceneIds` のような参照関係にした方が自然。

暫定方針:

- まずは別データ構造として `scenePlaybooks` を考える。
- 既存 `lens_data.json` はすぐ変更しない。
- UIモック段階では静的データで検証する。
- Deep Review と同じ場所に本文を押し込むのではなく、関連リンクとして接続する。

## 4. Proposed data relationship

Scene Playbook 側は、シーンを主語にしたレコードとして持つ候補が自然。

```ts
type ScenePlaybookRecord = {
  id: string
  title: string
  sceneType: 'family' | 'recital' | 'sports-day' | 'travel' | 'portrait' | 'video'
  summary: string
  primaryQuestions: string[]
  relatedLensIds: string[]
  relatedFocalRanges: string[]
  content: ScenePlaybook
}
```

Lens 側には、将来的に Scene Playbook への参照だけを薄く持つ候補がある。

```ts
type LensSceneReference = {
  sceneId: string
  role: string
  bestFor: string[]
  caution: string[]
}
```

関係の例:

```txt
Scene Playbook: 家族写真攻略
relatedLensIds:
- sony-fe-50mm-f14-gm
- sony-fe-85mm-f14-gmii
- sony-fe-135mm-f18-gm

Lens: Sony FE 85mm F1.4 GM II
relatedSceneIds:
- family-photography
- recital-stage
- sports-day
- outdoor-portrait
```

この docs では、上記の型や参照関係は実装しない。あくまで、将来 UI / API 化しやすい形を考えるための設計候補として扱う。

## 5. UI entry points

### A. Chat recommendation flow

チャット相談中に、ユーザーが「運動会」「発表会」「家族写真」などのシーンを入力したとき、レンズ候補だけでなく Scene Playbook への導線を出す。

導線例:

- 「運動会撮影の考え方を見る」
- 「発表会で85mm / 135mm / 70-200mmをどう選ぶか」
- 「家族写真のF値と距離感ガイド」

この導線は、レンズ候補を増やすためではなく、ユーザーが撮影条件を理解し直すために使う。チャット推薦の主役は候補提示だが、Scene Playbook は「なぜその条件ならこの候補が失敗しにくいか」を補助できる。

### B. Lens warehouse

レンズ倉庫では、保存済みレンズの関連 Scene Playbook を表示する候補がある。

例: Sony FE 85mm F1.4 GM II のカードに「関連する撮影攻略」として表示する。

- 家族写真
- 発表会
- 運動会
- 屋外ポートレート

ただし、Deep Review と混ぜすぎない。

| Content | 主語 | 役割 |
| ------- | ---- | ---- |
| Deep Review | このレンズ | このレンズをどう使うか |
| Scene Playbook | このシーン | このシーンでどう選ぶか |

倉庫では、Deep Review をレンズ詳細の主導線にし、Scene Playbook は関連する撮影攻略として別セクションに置くのが自然。

### C. Lens detail / Deep Review panel

Deep Review 詳細の下部に、「このレンズが登場する撮影攻略」として関連リンクを出す候補がある。

例:

- Sony FE 50mm F1.4 GM: 家族写真、旅行、日常、動画
- Sony FE 85mm F1.4 GM II: 家族写真、発表会、運動会、屋外ポートレート
- Sony FE 135mm F1.8 GM: 発表会、運動会、屋外ポートレート

Deep Review 本文内に Scene Playbook 全文を混ぜるのではなく、下部の関連導線として分ける。

### D. Dedicated Scene Playbook page

将来的には `/playbooks` または `/scene-playbooks` のような一覧ページも候補になる。

初期は実装しない。まずは倉庫やチャット内の小さな導線で検証し、ニーズが見えた段階で専用ページを考える。

候補テーマ:

- 家族写真
- 発表会
- 運動会
- 旅行
- 屋外ポートレート
- 動画

## 6. UI structure proposal

Scene Playbook を表示する場合も、既存 `deep-review-ui-structure.md` の3層表示思想と接続できる。

ただし主語が違う。

- Deep Review: レンズカードから「このレンズの使いこなし」を深掘りする。
- Scene Playbook: シーンカードから「この撮影条件での選び方」を深掘りする。

### Layer 1: card summary

最初に見せる項目:

- シーン名
- 一言でいうと
- 主な判断軸
- 代表レンズ / 焦点距離
- 注意点1〜2個

例:

- 運動会: ボケ量より、届く・追える・ブレない・一日持てる。
- 発表会: 明るさだけでなく、届くことと構図変更できること。
- 家族写真: 最初の本命は50mm。屋外の追加に85mm、広い場所に135mm。

### Layer 2: detail panel

詳細で見せる項目:

- このシーンで失敗しやすいこと
- まず考えるべき判断
- 撮影制約
- 焦点距離の攻略
- F値 / シャッター速度の攻略
- 撮影距離の攻略
- 単焦点とズームの役割
- 動画時の追加判断

すべての Scene Playbook で同じ項目を表示してよいが、同じ比重にしない。家族写真では近距離と複数人を厚くし、発表会では距離制約と暗所を厚くし、運動会では動きと望遠ズームを厚くする。

### Layer 3: related lenses / comparisons

詳細下部または折りたたみで見せる項目:

- 関連レンズ
- 関連 Deep Review
- 関連 Buying Comparison
- Future checks / sources

この層は、本文の主役ではなく根拠と次の判断への導線として扱う。外部レビュー本文は転載しない。

## 7. MVP implementation approach

### Phase 0: Docs only

現在ここまで完了。

- `docs/scene-playbook-format.md`
- `docs/scene-playbook-family-photography.md`
- `docs/scene-playbook-recital-stage.md`
- `docs/scene-playbook-sports-day.md`
- `docs/scene-playbook-implementation-plan.md`

この段階では、UI、API、Dify、`lens_data.json`、warehouse UI、localStorage、推薦ロジックは変更しない。

### Phase 1: Static mock data

候補:

- `src/data/scenePlaybooks.ts` のような静的データ。
- まずは1〜3本だけ。
- `lens_data.json` は変更しない。
- UIモックで表示確認する。

この段階の目的は、型や本文量がUIに乗るかを見ること。DB化やAPI化はまだ考えすぎない。

### Phase 2: Warehouse connection

保存済みレンズに関連 Scene Playbook を表示する。

候補:

- レンズカードに小さな導線を追加する。
- Deep Review とは別セクションにする。
- `relatedLensIds` から該当 Playbook を引く。
- Playbook がないレンズでも UI が破綻しないようにする。

この段階でも、既存 `lens_data.json` の本体には混ぜない方針を維持する。

### Phase 3: Chat flow connection

ユーザー入力のシーンに応じて Scene Playbook を提示する。

候補:

- 「運動会」「発表会」「家族写真」などのシーンを検出する。
- レンズ候補だけでなく、撮影判断への導線を出す。
- レンズを買う前に、焦点距離、F値、距離、制約を確認できるようにする。

Dify / API変更は別フェーズで検討する。まずはフロント側の静的導線や表示テストで十分かを見る。

### Phase 4: Dedicated scene page

将来的には `/scene-playbooks` のような一覧を検討する。

候補:

- 家族写真
- 発表会
- 運動会
- 旅行
- 屋外ポートレート
- 動画

SEO / OGP は将来検討。初期から記事サイト的に広げるより、まずはチャットと倉庫の判断補助として使う。

### Phase 5: Data / API integration

静的データで検証後に、API化するか判断する。

検討項目:

- `scenePlaybooks` を別JSONで持つか。
- DBで持つか。
- コード内データとして持つか。
- `lens_data.json` とは参照関係だけにするか。
- `relatedLensIds` / `relatedSceneIds` の整合性をどう保つか。
- Deep Review / Buying Comparison との関連リンクをどう管理するか。

## 8. Suggested TypeScript shape

実装前の候補。既存 `scene-playbook-format.md` の `ScenePlaybook` 型候補を、UI表示と関連リンクに寄せた形として考える。

```ts
type ScenePlaybookSummary = {
  id: string
  title: string
  shortTitle: string
  sceneType: 'family' | 'recital' | 'sports-day' | 'travel' | 'portrait' | 'video'
  headline: string
  primaryUse: string[]
  keyDecisions: string[]
  relatedLensIds: string[]
  relatedFocalRanges: string[]
  status: 'manual-draft' | 'verified' | 'ai-assisted' | 'not-ready'
}

type ScenePlaybookDetail = ScenePlaybookSummary & {
  sceneConstraints: {
    photographerMobility?: string
    subjectDistance?: string
    distancePredictability?: string
    lightLevel?: string
    lensChange?: string
    subjectMovement?: string
    backgroundControl?: string
  }

  commonFailures: {
    label: string
    reason: string
    avoidBy: string
  }[]

  focalLengthGuide: {
    focalRange: string
    role: string
    goodFor: string[]
    caution: string[]
  }[]

  apertureGuide: {
    aperture: string
    bestFor: string
    caution: string
  }[]

  motionAndShutter?: {
    subjectMotion: string
    shutterGuidance: string
    stabilizationNote?: string
    isoTradeoff?: string
  }

  distanceGuide: {
    distance: string
    suitableLens: string[]
    note: string
  }[]

  primeVsZoom?: {
    primeStrengths: string[]
    zoomStrengths: string[]
    choosePrimeIf: string[]
    chooseZoomIf: string[]
  }

  lensRoles: {
    lensId?: string
    lensNameOrType: string
    role: string
    bestUse: string[]
    notBestFor: string[]
    sweetSpot: string
  }[]

  recommendedPatterns: {
    patternName: string
    lensSet: string[]
    chooseIf: string
  }[]

  videoConsiderations?: {
    autofocus?: string
    focusBreathing?: string
    handheldLoad?: string
    gimbalUse?: string
    framingRisk?: string
    operationNoise?: string
  }

  relatedComparisons?: string[]
  relatedDeepReviews?: string[]
  futureChecks?: string[]
  lensNaviConclusion: string
}
```

この型は確定ではない。まずは静的モックで表示に必要な最小項目を確認し、UIで過不足が見えた段階で調整する。

## 9. Do not implement yet

今回まだ実装しないこと:

- `src/data/scenePlaybooks.ts` はまだ作らない。
- UIはまだ触らない。
- warehouse page はまだ触らない。
- Dify / API はまだ触らない。
- `lens_data.json` はまだ触らない。
- localStorage形式はまだ触らない。
- scene page routing はまだ作らない。
- 既存推薦ロジックはまだ触らない。
- 既存 docs のリンク追記や大幅編集はまだしない。

## 10. Next recommended steps

推奨順:

1. `scene-playbook-implementation-plan.md` を作成する。
2. 3本の Scene Playbook を比較して、表示に必要な最小項目を抽出する。
3. `src/data/scenePlaybooks.ts` の静的データ案を docs で検討する。
4. 既存 warehouse deepReview UI モックとの接続点を調査する。
5. 最初は UI実装ではなく、1つの静的モック導線から始める。
6. その後、旅行・屋外ポートレート・動画攻略を追加するか判断する。

## Editorial guardrails

- スコアリングしない。
- ランキング化しない。
- 「どのレンズが上か」ではなく、「この撮影条件ならどれが失敗しにくいか」を扱う。
- 測定値やスペックは、撮影判断へ翻訳する。
- 外部レビュー本文を転載しない。
- AI生成文をそのまま完成版として扱わない。
- Scene Playbook をすぐ `lens_data.json` に混ぜる前提にしない。
- Lens Navi の主語を、必要な場面では「レンズ」から「撮影シーン」へ移す。
