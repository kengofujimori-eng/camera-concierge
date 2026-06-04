# Scene Playbook format

Lens Navi の Scene Playbook は、Deep Review の次のレイヤーとして、レンズ単体ではなく撮影シーンから判断を組み立てるためのフォーマット。

## Positioning

Scene Playbook は、Deep Review の第4層として扱う。

Deep Review が「このレンズをどう使えば失敗しにくいか」を整理するレンズ攻略本だとすると、Scene Playbook は「この撮影シーンでは、どの条件を先に見れば失敗しにくいか」を整理する撮影シーン攻略本である。

主語を「レンズ」から「撮影シーン」に移す。

例:

- 50mmはどんなレンズか
- 85mmはどんな描写か
- 135mmはどんな圧縮を作るか

ではなく、

- 家族写真で室内が多いなら何mmが失敗しにくいか
- 子供が動くならF値をどこまで絞るか
- 複数人を撮るならボケより何を優先するか
- 屋外で背景を整理したい時に85mmと135mmをどう分けるか

を中心に扱う。

## Relationship to existing Deep Review layers

既存の Deep Review は以下の3層で整理する。

### Layer 1: 研究ノート

役割:

- レンズ単体の根拠
- 公式仕様、測定値、レビュー傾向の整理
- 解像、ボケ、収差、AF、近接、重量などの材料化
- Lens Navi解釈の下書き

研究ノートは、Scene Playbook にとって「そのレンズがどの条件で使いやすいか」を判断する根拠になる。

### Layer 2: 比較ノート

役割:

- 同カテゴリ比較
- 世代違い、純正 / サードパーティー、価格帯違いの整理
- 同じ用途に見えるレンズの選び分け

比較ノートは、Scene Playbook にとって「同じ撮影シーンで候補になるレンズの役割差」を整理する材料になる。

### Layer 3: 購入判断比較

役割:

- 実際の購入迷いに近い比較
- 焦点距離が違うレンズ同士の比較
- 撮影スタイル別に、どちらが自然に使えるかを整理

購入判断比較は、Scene Playbook にとって「買う前の迷い」を「撮影現場での失敗しにくさ」へつなぐ材料になる。

### Layer 4: Scene Playbook

役割:

- 実際の撮影シーンでの判断
- 焦点距離、F値、撮影距離、被写体の動き、場所の制約をまとめて扱う
- レンズの優劣ではなく、条件ごとの使いやすさと失敗しやすさを整理する

Scene Playbook は、研究ノート、比較ノート、購入判断比較を素材として使うが、単なる要約ではない。

最終的な問いは「どのレンズが上か」ではなく、「この撮影条件なら、どの選び方が失敗しにくいか」である。

## Basic philosophy

Scene Playbook はスペック比較ではない。

最初に整理するのは、失敗しやすい条件である。

例:

- 室内で距離が足りない
- 子供が近づいてくる
- 複数人で被写界深度が浅すぎる
- 望遠単焦点で構図変更が追いつかない
- 暗い場所でシャッター速度が落ちる
- 背景をぼかしすぎて、その日の状況が残らない

扱う軸:

- 焦点距離
- F値
- 撮影距離
- 被写体の動き
- 場所の広さ
- 撮影者が動けるか
- 距離が読めるか
- 会場や場所の明るさ
- レンズ交換できるか
- 複数人か1人か
- 背景を消したいのか、状況も残したいのか
- レンズ交換やズームの必要性

家族写真と発表会では、同じ「人物撮影」でも制約が大きく違う。

家族写真では、被写体との距離が近く、子供が近づいてきて、撮影者が動けることが多い。ここでは「狭い場所で撮れるか」「近距離で構図が崩れないか」「複数人を失敗しにくく撮れるか」が重要になる。

発表会では、座席から動けず、被写体まで距離があり、会場が暗く、撮影距離を調整できないことが多い。ここでは「焦点距離が足りるか」「構図変更できるか」「被写体ブレを避けられるか」が重要になる。

Scene Playbook は、最初にこの制約差を整理してから、焦点距離やF値へ進む。

測定値やスペックは使ってよい。

ただし、表示や本文では撮影判断へ翻訳する。

例:

- `F1.4開放から高解像` → 「1人の目元は開放から狙えるが、子供や複数人ではF1.8〜F2.8の方が歩留まりを取りやすい」
- `85mmは背景整理が強い` → 「屋外で1人を切り出しやすいが、室内や近距離では長く感じやすい」
- `135mmは圧縮効果が強い` → 「公園やイベントで遠くの自然な表情を拾いやすいが、日常の会話距離では使いにくい」
- `軽量化されたGM II` → 「持ち出しやすくなったが、家族写真の主力になるかは焦点距離と距離感で判断する」
- `F1.4で明るい` → 「シャッター速度を稼ぎやすいが、動きや複数人ではピント面が浅くなる」
- `70-200mmでズームできる` → 「明るさや重さの負担はあるが、席や距離が読めない場面で構図変更しやすい」

## Recommended structure

Scene Playbook は以下の構成を基本にする。

全テーマで同じ項目を使ってよいが、全テーマで同じ比重にしない。

### Status

- manual scene-playbook draft
- not yet reflected in `lens_data.json`
- not yet reflected in API / Dify
- not yet reflected in the warehouse UI

### Scene goal

このシーンで何を判断したいのかを書く。

例:

- 家族写真で失敗しにくいレンズ選びとF値判断を整理する
- 運動会で、単焦点と望遠ズームの使い分けを整理する
- 発表会で、暗さ、距離、座席制約を前提に候補を分ける

### Sources used

使った Deep Review docs を列挙する。

外部レビュー本文は転載しない。Scene Playbook では、既存 docs の解釈と根拠を使う。

### 一言でいうと

撮影シーン全体の判断を短く書く。

レンズの優劣ではなく、使いやすい条件を先に示す。

### Scene constraints / 撮影制約

そのシーンの制約を、レンズ名より先に整理する。

家族写真と発表会の差分から、最低限以下を見る。

- 撮影者が動ける / 動けない
- 被写体が近い / 遠い
- 距離が読める / 読めない
- 室内 / 屋外
- 明るい / 暗い
- レンズ交換できる / できない
- 被写体が近づく / 離れる / 固定位置にいる
- 背景を整理したい / 状況を残したい

書き方:

- 家族写真: 撮影者が動けることが多い。被写体は近く、子供は近づいてくる。室内外が混在する。
- 発表会: 座席から動けない。被写体まで距離があり、会場は暗いことが多い。距離が読めないこともある。

この制約整理によって、同じ85mmでも「屋外で子供を切り出す追加レンズ」なのか、「前方席・小会場で発表会を撮るレンズ」なのかが変わる。

### このシーンで失敗しやすいこと

シーンの失敗要因を先に整理する。

例:

- 距離が足りない
- 被写体が近づいてくる
- F値が浅すぎる
- 背景を消しすぎる
- シャッター速度が足りない
- 単焦点で構図変更が追いつかない

### まず考えるべき判断

レンズ名に入る前に、撮影条件の分岐を置く。

例:

- 室内中心か屋外中心か
- 1人をきれいに撮るのか、記録を残すのか
- 動く被写体か、止まってくれる被写体か
- 複数人を撮るか
- 背景を消したいのか、状況も残したいのか

### 焦点距離の考え方

焦点距離をスペックとしてではなく、撮影距離と構図の自由度として扱う。

例:

- 35mm: 室内、複数人、生活感
- 50mm: 日常、旅行、家族写真の中心
- 85mm: 屋外人物、背景整理、少し離れた子供
- 135mm: 公園、イベント、遠くの表情、圧縮
- 望遠ズーム: 距離が読めないイベント、運動会、発表会

### F値の攻略

F値を「明るい / ボケる」だけで終わらせない。

歩留まり、被写界深度、シャッター速度、背景情報の残し方として整理する。

例:

- F1.2〜F1.4: 1人を印象的に撮る
- F1.8〜F2.8: 子供、家族、少し動く人物で歩留まりを上げる
- F2.8〜F4: 複数人、動き、失敗回避
- F5.6〜F8: 旅行記録、風景込み、背景も残す

### Motion and shutter / 動きとシャッター速度

動きがあるシーンでは、F値だけでなくシャッター速度とISOも扱う。

基本方針:

- 手ブレと被写体ブレを分けて考える。
- 明るいレンズはシャッター速度を稼ぎやすい。
- ただし開放にするほどピント面は浅くなる。
- 動く子供、踊り、演奏、スポーツでは被写体ブレ対策が重要。
- F値、シャッター速度、ISOのトレードオフを撮影判断として扱う。
- 数値は断定しすぎず、目安として扱う。

例:

- 家族写真: 子供が近づいてくる時は、F1.4固定よりF1.8〜F2.8で歩留まりを上げる。
- 発表会: 手ブレ補正だけでは出演者の動きは止まらない。踊りや手振りではシャッター速度を上げたい。
- 運動会: 焦点距離だけでなく、動きの速さとシャッター速度を先に考える。

### 撮影距離の攻略

焦点距離と場所の広さをセットで扱う。

例:

- 近距離・室内: 35mm〜50mm
- 会話しながら: 50mm〜85mm
- 少し離れた自然な表情: 85mm〜135mm
- 遠くのイベント: 135mm以上、または望遠ズーム

### Prime vs zoom / 単焦点とズームの役割

単焦点とズームは優劣ではなく、撮影条件で役割を分ける。

単焦点が強い条件:

- 明るさが必要
- 描写や背景整理を重視する
- 距離が読める
- 撮影意図が明確
- 1人を印象的に撮りたい

ズームが強い条件:

- 構図変更が必要
- 被写体との距離が変わる
- 席や撮影位置が読めない
- 全体を安全に記録したい
- レンズ交換しにくい

例:

- 家族写真: 50mmや85mmの単焦点は距離感と描写を作りやすいが、室内や複数人では35mmや標準ズームも比較対象になる。
- 発表会: 85mmや135mmの単焦点は距離が読める時に強い。席が読めない場合や全身も表情も撮りたい場合は70-200mm系が安全。
- 旅行: 単焦点は意図が明確な時に強いが、旅程や場所が読めない場合はズームの安心感が大きい。

### レンズ候補の役割

全候補を同じ比重で扱わない。

そのシーンで役割があるレンズだけを扱う。

書き方:

- 主力候補
- 追加候補
- 条件つき候補
- 比較に入れるべき候補
- このシーンでは優先度が下がる候補

### おすすめ構成パターン

ユーザーの撮影条件別に構成を分ける。

例:

- 1本で始める
- 室内中心
- 屋外中心
- イベント中心
- 旅行も兼ねる
- 動画も撮る

### Video considerations / 動画時の追加判断

写真で強いレンズが、動画でもそのまま扱いやすいとは限らない。

動画も対象にする Scene Playbook では、以下を追加で見る。

- AF追従
- フォーカスブリージング
- 手持ち負荷
- ジンバル適性
- 画角固定のリスク
- 操作音
- 被写体との距離

例:

- 85mm: 写真では屋外人物に強い。動画ではAF、ブリージング補正、被写体との距離、手持ち負荷を見る。
- 135mm: 写真では圧縮と切り出しが強い。動画では手ブレ、画角固定、フォーカス移動時の画角変化が問題になりやすい。
- 70-200mm: 構図変更には強いが、手持ち負荷、ズーム操作、ジンバル適性、会場での取り回しを確認する。

### Lens Navi結論

最後はランキングではなく、判断のまとめにする。

例:

- このシーンの主役はボケ量ではなく距離感と歩留まり
- 最初の本命は50mm
- 85mmは屋外の追加レンズ
- 135mmは広い場所やイベントで効く専門寄りレンズ
- 複数人や室内中心なら35mmも比較対象にする

## TypeScript type candidate

まだ実装しないが、docs 用の型候補として以下を置く。

```ts
type ScenePlaybook = {
  slug: string
  title: string
  sceneName: string
  positioning: string
  status: 'manual-scene-playbook-draft' | 'verified' | 'ai-assisted' | 'not-ready'

  sceneGoal: string

  sourcesUsed: {
    label: string
    path?: string
    type:
      | 'research-note'
      | 'comparison-note'
      | 'buying-comparison'
      | 'editorial-workflow'
      | 'playbook-format'
      | 'manual'
  }[]

  oneLineSummary: string[]

  sceneConstraints: {
    photographerMobility?: string
    subjectDistance?: string
    distancePredictability?: string
    locationType?: string
    lightLevel?: string
    lensChange?: string
    subjectMovement?: string
    backgroundControl?: string
  }

  failureRisks: {
    label: string
    reason?: string
    avoidBy?: string
    note: string
  }[]

  firstDecisions: {
    question: string
    whyItMatters: string
    options?: {
      label: string
      chooseIf: string
    }[]
  }[]

  focalLengthGuide: {
    focalLength: string
    focalRange?: string
    role?: string
    usefulFor: string[]
    goodFor?: string[]
    caution?: string[]
    failureRisk?: string
    note: string
  }[]

  apertureGuide: {
    aperture: string
    usefulFor: string[]
    bestFor?: string
    caution?: string
    failureRisk?: string
    note: string
  }[]

  motionAndShutter?: {
    subjectMotion: string
    shutterGuidance: string
    stabilizationNote?: string
    isoTradeoff?: string
  }

  workingDistanceGuide: {
    distance: string
    lensRange: string
    suitableLens?: string[]
    note: string
  }[]

  primeVsZoom?: {
    primeStrengths: string[]
    zoomStrengths: string[]
    choosePrimeIf: string[]
    chooseZoomIf: string[]
  }

  lensRoles: {
    lensName?: string
    lensNameOrType?: string
    role: string
    roleKind?: 'main' | 'secondary' | 'conditional' | 'compare' | 'lower-priority'
    usefulConditions: string[]
    failureConditions: string[]
    bestUse?: string[]
    notBestFor?: string[]
    sweetSpot?: string
    fieldUse: string
  }[]

  recommendedSetups: {
    label: string
    patternName?: string
    primaryChoice: string
    lensSet?: string[]
    supportChoice?: string
    chooseIf?: string
    note: string
  }[]

  videoConsiderations?: {
    autofocus?: string
    focusBreathing?: string
    handheldLoad?: string
    gimbalUse?: string
    framingRisk?: string
    operationNoise?: string
    subjectDistance?: string
  }

  lensNaviConclusion: string[]

  doNotDo: string[]
}
```

## Do not do

- スコアリングしない。
- ランキング化しない。
- 全レンズを同じ比重で扱わない。
- 外部レビュー本文を転載しない。
- AI生成文をそのまま完成版として扱わない。
- 測定値をそのまま優劣語にしない。
- 「どちらが上か」で結論を作らない。
- スペック表だけで撮影判断を終わらせない。
- 実装済みデータ、API、Dify、warehouse UI に反映済みであるかのように書かない。

## Future candidate themes

- 家族写真
- 運動会
- 発表会
- 屋外ポートレート
- 旅行
- 動画

## Not in scope for this document

- UI 実装
- API 実装
- Dify prompt 変更
- `lens_data.json` の編集
- warehouse UI の編集
- localStorage 形式変更
- 推薦ロジック変更
