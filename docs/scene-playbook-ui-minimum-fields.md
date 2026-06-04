# Scene Playbook UI minimum fields

Scene Playbook を UI に落とす前に、最初の表示に必要な最小項目を整理する情報設計メモ。

この docs では実装しない。目的は、いきなり長文攻略本や静的データ実装へ進むのではなく、カード、詳細パネル、関連レンズ導線に必要な情報だけを切り出すこと。

## 1. Purpose

Scene Playbook は、シーンを主語にして、レンズ、焦点距離、F値、撮影距離、撮影制約、動画適性を横断して整理する機能である。

この docs は、Scene Playbook を UI に落とす前に、最小表示項目を定義する。

目的は、最初から長文の攻略本を UI に載せることではない。ユーザーが撮影判断に必要な要点だけを最初に見られるようにする。

UI 初期モックでは、以下を優先する。

- 自分の撮影シーンに関係あるか分かる。
- 何を先に判断すべきか分かる。
- 代表的な焦点距離とレンズの役割が分かる。
- 失敗しやすい条件が短く分かる。
- 詳細を開く理由が分かる。

## 2. Source docs

| Source | Provides for UI minimum fields |
| ------ | ------------------------------ |
| `docs/scene-playbook-format.md` | Scene Playbook の基本構造、撮影制約、動きとシャッター、単焦点とズーム、動画判断、TypeScript型候補 |
| `docs/scene-playbook-family-photography.md` | 家族写真のカード文言候補、50mm中心の判断、35mm / 85mm / 135mm の役割、近距離と複数人の失敗要因 |
| `docs/scene-playbook-recital-stage.md` | 発表会のカード文言候補、座席距離、暗所、85mm / 135mm / 70-200mm / 200mm以上の役割 |
| `docs/scene-playbook-sports-day.md` | 運動会のカード文言候補、動体、距離変化、70-200mm / 100-400mm / クロップ、一日持ち歩きの判断 |
| `docs/scene-playbook-implementation-plan.md` | UI entry points、3層表示、`scenePlaybooks` を別データ構造にする方針、段階的実装案 |
| `docs/deep-review-ui-structure.md` | カード要約、詳細パネル、関連情報の3層表示思想。最初から全情報を出さない方針 |

Deep Review 系 docs は、Scene Playbook の根拠や関連リンクとして使う。ただし UI の主語はレンズではなく、撮影シーンに置く。

## 3. UI layers

Scene Playbook も Deep Review UI と同じく、3層表示にする。

ただし、Deep Review は「このレンズをどう使うか」、Scene Playbook は「この撮影でどう選ぶか」を扱う。表示構造は似ていても、主語を混ぜない。

### Layer 1: Scene card

最初に見せる要約カード。

目的:

- シーンの要点を3〜5行で把握する。
- 「自分の撮影に関係あるか」を判断する。
- 詳細を開く導線にする。

カードでは、長い攻略本文を読ませない。シーン名、一言、判断軸、代表焦点距離、注意点に絞る。

### Layer 2: Scene detail panel

詳細パネル。

目的:

- 実際の撮影判断に使う。
- 焦点距離、F値、距離、制約、単焦点 / ズーム、動画注意を読む。
- レンズ比較ではなく、失敗しにくい選び方を見る。

詳細パネルでも、最初からすべてを展開しない。まず「失敗しやすいこと」「まず考えるべき判断」「焦点距離」「レンズ別の役割」「Lens Navi結論」を見せ、F値や動画などは折りたたみで扱う。

### Layer 3: Related lenses and references

関連情報。

目的:

- 関連レンズを見る。
- 関連 Deep Review へ移動する。
- 関連 Buying Comparison へ移動する。
- Future checks を確認する。

ただし初期 UI では出しすぎない。関連情報は、本文を補強する導線であり、Scene Playbook の主役ではない。

## 4. Layer 1 minimum fields: Scene card

カードに必要な最小項目。

必須候補:

- `id`
- `title`
- `shortTitle`
- `headline`
- `sceneType`
- `primaryUse`
- `keyDecisions`
- `representativeFocalRanges`
- `mainLensRoles`
- `primaryCaution`
- `status`

フィールドの役割:

| Field | UI role |
| ----- | ------- |
| `id` | 詳細表示、関連リンク、将来のルーティング用 |
| `title` | カード見出し |
| `shortTitle` | タブ、チップ、狭い表示用 |
| `headline` | 一言でいうと |
| `sceneType` | アイコン、分類、フィルター用 |
| `primaryUse` | どんな撮影に関係するか |
| `keyDecisions` | 判断軸の短縮表示 |
| `representativeFocalRanges` | 代表焦点距離 |
| `mainLensRoles` | レンズ / 焦点距離のざっくり役割 |
| `primaryCaution` | 最初に見せる注意点 |
| `status` | manual draft / verified などの状態 |

表示例:

```txt
家族写真攻略
家族写真の本命は50mm。屋外で子供を切り出すなら85mm、広い場所やイベントなら135mmも候補。
判断軸: 室内 / 屋外、子供の動き、複数人、背景を残すか
代表焦点距離: 35mm / 50mm / 85mm / 135mm
注意: ボケ量より距離感と歩留まりを優先
```

```txt
発表会攻略
発表会は明るさだけでなく、届くことと構図変更できることが重要。
判断軸: 座席距離、会場サイズ、暗さ、全身か表情か
代表焦点距離: 85mm / 135mm / 70-200mm / 200mm+
注意: 席が読めない場合はズームが安全
```

```txt
運動会攻略
運動会はボケ量より、届く・追える・ブレない・一日持てることが重要。
判断軸: 校庭の広さ、競技距離、子供の動き、重量
代表焦点距離: 70-200mm / 100-400mm / 85mm / 135mm
注意: 単焦点は追加表現レンズ、主力はズームが安全
```

カードで避けること:

- 全レンズの長い説明。
- F値やシャッター速度の詳細。
- sources の一覧。
- ランキングやスコア。
- Deep Review と同じ「このレンズの強み」中心の見せ方。

## 5. Layer 2 minimum fields: Scene detail panel

詳細パネルに必要な最小項目。

必須候補:

- `oneLineVerdict`
- `commonFailures`
- `firstQuestions`
- `sceneConstraints`
- `focalLengthGuide`
- `apertureGuide`
- `motionAndShutter`
- `distanceGuide`
- `primeVsZoom`
- `lensRoles`
- `recommendedPatterns`
- `videoConsiderations`
- `lensNaviConclusion`

初期 UI では、全部を一度に出さない。優先順を分ける。

最初に出す:

1. 一言でいうと
2. このシーンで失敗しやすいこと
3. まず考えるべき判断
4. 焦点距離の攻略
5. レンズ別の役割
6. Lens Navi結論

詳細折りたたみで出す:

- F値 / シャッター速度
- 撮影制約
- 撮影距離
- 単焦点とズーム
- 動画時の追加判断
- Future checks

最初に出す項目の考え方:

| Field | First UI role |
| ----- | ------------- |
| `oneLineVerdict` | 詳細パネル冒頭の要約 |
| `commonFailures` | 何で失敗しやすいかを先に見せる |
| `firstQuestions` | レンズ名に入る前の判断軸 |
| `focalLengthGuide` | 35mm / 50mm / 85mm / 135mm / 70-200mm などの役割 |
| `lensRoles` | 具体レンズやレンズタイプの使いやすい条件 / 失敗しやすい条件 |
| `lensNaviConclusion` | Lens Navi としての撮影判断 |

折りたたみ項目の考え方:

| Field | Collapsed UI role |
| ----- | ----------------- |
| `apertureGuide` | F値、シャッター速度、歩留まりの詳細 |
| `motionAndShutter` | 動体、被写体ブレ、ISO判断 |
| `sceneConstraints` | 撮影者が動けるか、距離が読めるか、明るさなど |
| `distanceGuide` | 近距離 / 中距離 / 遠距離の整理 |
| `primeVsZoom` | 単焦点とズームの使い分け |
| `videoConsiderations` | AF、ブリージング、手持ち負荷、画角固定 |
| `futureChecks` | 将来検証したい項目 |

詳細パネルで避けること:

- 研究ノートのような根拠の羅列。
- Deep Review のような収差・解像・ボケの詳細評価。
- すべての焦点距離を同じ比重で扱うこと。
- 「どれが上か」を決める書き方。

## 6. Layer 3 minimum fields: Related lenses and references

関連情報として必要な最小項目。

必須候補:

- `relatedLensIds`
- `relatedDeepReviews`
- `relatedComparisons`
- `relatedScenePlaybooks`
- `futureChecks`

初期 UI 方針:

- 関連レンズは最大3〜5件程度。
- Deep Review への導線は「このレンズの使いこなしを見る」。
- Buying Comparison への導線は「この2本で迷う場合」。
- Future checks / sources は初期 UI では下部または非表示でもよい。

関連情報の表示例:

| UI label | Link target type | Example |
| -------- | ---------------- | ------- |
| 関連レンズ | lens id | Sony FE 50mm F1.4 GM, Sony FE 85mm F1.4 GM II |
| このレンズの使いこなしを見る | Deep Review | 85GM II Deep Review |
| この2本で迷う場合 | Buying Comparison | 50GM vs 85GM II, 85GM II vs 135GM |
| 関連する撮影攻略 | Scene Playbook | 家族写真, 発表会, 運動会 |

Layer 3 は、ユーザーが深掘りしたい時のための導線である。カードや詳細冒頭に出しすぎると、撮影判断よりリンク集に見えてしまう。

## 7. What not to show in the first UI

初期 UI では省いてよい項目。

- 長い本文すべて。
- sources の詳細一覧。
- Future checks の全項目。
- TypeScript 型全体。
- ranking / score。
- レンズごとの細かすぎる測定値。
- 外部レビュー本文。
- すべての関連レンズ。
- すべての比較ノート。
- 研究ノートの測定根拠。
- 収差、周辺減光、MTFなどの詳細項目。

理由:

- Scene Playbook は攻略本だが、UIではまず撮影判断を素早く見せる。
- 長文は後から展開する。
- 情報量が多すぎると Deep Review と同じく読まれにくい。
- 初期モックでは、情報の網羅性より「入口として使えるか」を確認したい。
- sources や Future checks は重要だが、最初の判断ではなく信頼補強や編集メモに近い。

## 8. Difference from Deep Review UI

Deep Review UI との差分。

| UI | 主語 | 目的 | 主な項目 | Entry point |
| -- | ---- | ---- | -------- | ----------- |
| Deep Review | レンズ | このレンズをどう使うか | 美味しいF値、解像、ボケ、収差、AF、比較候補 | レンズ倉庫カードから詳細へ |
| Scene Playbook | シーン | この撮影でどう選ぶか | 焦点距離、距離、制約、動き、構図変更、複数レンズの役割 | チャット相談、レンズ倉庫、将来の専用ページ |

Deep Review:

- 主語はレンズ。
- 「このレンズをどう使うか」。
- 美味しいF値。
- 解像、ボケ、収差、AF、比較候補。
- レンズ倉庫カードから詳細へ。

Scene Playbook:

- 主語はシーン。
- 「この撮影でどう選ぶか」。
- 焦点距離、距離、制約、動き、構図変更。
- 複数レンズを横断。
- チャット相談、レンズ倉庫、将来の専用ページから導線。

混ぜすぎない方針:

- Deep Review の中に Scene Playbook 全文を入れない。
- Scene Playbook の中で、各レンズの解像や収差を詳細評価しない。
- Lens card では Deep Review を主導線にし、Scene Playbook は関連撮影攻略として扱う。
- Scene Playbook card では、レンズ名より先に撮影条件を見せる。

## 9. Minimum TypeScript shape

UI 初期モックに必要な最小型候補。

`docs/scene-playbook-implementation-plan.md` の型よりも、UI初期モック向けに絞った型として位置づける。

```ts
type ScenePlaybookCard = {
  id: string
  title: string
  shortTitle: string
  sceneType: 'family' | 'recital' | 'sports-day' | 'travel' | 'portrait' | 'video'
  headline: string
  primaryUse: string[]
  keyDecisions: string[]
  representativeFocalRanges: string[]
  mainLensRoles: {
    label: string
    role: string
  }[]
  primaryCaution: string
  status: 'manual-draft' | 'verified' | 'ai-assisted' | 'not-ready'
}

type ScenePlaybookDetailMinimum = ScenePlaybookCard & {
  oneLineVerdict: string

  commonFailures: {
    label: string
    avoidBy: string
  }[]

  firstQuestions: string[]

  focalLengthGuide: {
    focalRange: string
    role: string
    caution?: string
  }[]

  lensRoles: {
    lensId?: string
    lensNameOrType: string
    role: string
    bestUse: string[]
    notBestFor: string[]
  }[]

  recommendedPatterns: {
    patternName: string
    lensSet: string[]
    chooseIf: string
  }[]

  lensNaviConclusion: string

  relatedLensIds?: string[]
  relatedDeepReviews?: string[]
  relatedComparisons?: string[]
}
```

この minimum 型では、F値、シャッター速度、撮影制約、動画判断を必須から外している。初期 UI で扱いきれない場合でも、カードと詳細冒頭を成立させるためである。

必要になったら、`ScenePlaybookDetailMinimum` に次の optional field を足す。

- `sceneConstraints`
- `apertureGuide`
- `motionAndShutter`
- `distanceGuide`
- `primeVsZoom`
- `videoConsiderations`
- `futureChecks`

## 10. Initial static mock candidates

UI 初期モックに使う候補。

最初の候補:

1. 家族写真攻略
2. 発表会攻略
3. 運動会攻略

### family-photography

- `id`: `family-photography`
- `title`: 家族写真攻略
- `shortTitle`: 家族写真
- `sceneType`: `family`
- `headline`: 家族写真の本命は50mm。屋外で子供を切り出すなら85mm、広い場所なら135mm。
- `primaryUse`:
  - 家族写真
  - 子供
  - 日常
  - 旅行
- `keyDecisions`:
  - 室内か屋外か
  - 子供が動くか
  - 複数人を撮るか
  - 背景を残すか
- `representativeFocalRanges`:
  - 35mm
  - 50mm
  - 85mm
  - 135mm
- `mainLensRoles`:
  - 50mm: 家族写真の中心
  - 85mm: 屋外で子供を切り出す追加レンズ
  - 135mm: 公園やイベントの遠距離表情
- `primaryCaution`: ボケ量より、距離感と歩留まりを優先する。

### recital-stage

- `id`: `recital-stage`
- `title`: 発表会攻略
- `shortTitle`: 発表会
- `sceneType`: `recital`
- `headline`: 発表会は明るさだけでなく、届くことと構図変更できることが重要。
- `primaryUse`:
  - 発表会
  - ステージ
  - 小ホール
  - 体育館
- `keyDecisions`:
  - 座席距離
  - 会場サイズ
  - 暗さ
  - 全身か表情か
- `representativeFocalRanges`:
  - 85mm
  - 135mm
  - 70-200mm
  - 200mm+
- `mainLensRoles`:
  - 85mm: 前方席や小会場
  - 135mm: 中距離の切り出し
  - 70-200mm: 席が読めない時の安全策
- `primaryCaution`: 席が読めない場合はズームが安全。

### sports-day

- `id`: `sports-day`
- `title`: 運動会攻略
- `shortTitle`: 運動会
- `sceneType`: `sports-day`
- `headline`: 運動会はボケ量より、届く・追える・ブレない・一日持てることが重要。
- `primaryUse`:
  - 運動会
  - 屋外イベント
  - 子供の動体
  - 望遠撮影
- `keyDecisions`:
  - 校庭の広さ
  - 競技距離
  - 子供の動き
  - 重量
- `representativeFocalRanges`:
  - 70-200mm
  - 100-400mm
  - 85mm
  - 135mm
- `mainLensRoles`:
  - 70-200mm: 運動会の基準
  - 100-400mm: 広い校庭や遠距離
  - 85mm / 135mm: 待機中や表情切り出し
- `primaryCaution`: 単焦点は追加表現レンズ、主力はズームが安全。

## 11. First UI mock recommendation

最初の UI モックとしては、warehouse へすぐ組み込むより、静的な Scene Playbook card list の検証が安全。

推奨:

- まずは warehouse ではなく、静的な Scene Playbook card list の検証が安全。
- ただし専用ページを作る前に、既存 warehouse deepReview UI モックを読んで共通コンポーネント化できるか確認する。
- 初期実装候補:
  - `src/data/scenePlaybooks.ts`
  - `ScenePlaybookCard` component
  - 3枚のカード表示

この docs では実装しない。

初期モックの狙い:

- カード文言が3〜5行で収まるか確認する。
- 家族写真 / 発表会 / 運動会で同じ型が使えるか確認する。
- レンズ名より先に撮影判断が伝わるか確認する。
- Deep Review と視覚的に似すぎて混乱しないか確認する。
- 将来、チャット相談や倉庫へ接続できそうか見る。

## 12. Do not implement yet

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

## 13. Next recommended steps

推奨順:

1. `scene-playbook-ui-minimum-fields.md` を作成する。
2. 既存 warehouse deepReview UI モックを読む。
3. `src/data/scenePlaybooks.ts` の静的データ案を docs で検討、または小さく実装するか判断する。
4. 最初の UI は3枚カードの静的モックから検証する。
5. その後、レンズ倉庫・チャット推薦・Deep Review panel との接続を検討する。

## Editorial guardrails

- スコアリングしない。
- ランキング化しない。
- 「どのレンズが上か」ではなく、「この撮影条件ならどれが失敗しにくいか」を扱う。
- Scene Playbook をすぐ `lens_data.json` に混ぜる前提にしない。
- 外部レビュー本文を転載しない。
- レンズの詳細評価より、撮影判断を先に見せる。
- 初期 UI では、長文より判断に必要な最小項目を優先する。
