# Deep review playbook format

Lens Navi の Deep Review を、単なる「AI 深掘り」ではなく、購入前 / 購入後に役立つ「使いこなしレビュー」または「レンズ攻略本」として整理するためのフォーマット。

## Positioning

- チャット推薦は、候補を 1〜3 本に絞る入口。
- レンズ倉庫は、候補を保存し、比較し、冷静に判断する場所。
- Deep Review は、ランキングではなく「このレンズをどう使えば失敗しにくいか」を読む場所。
- 目的はスコア付けではなく、撮影条件ごとの得意 / 苦手 / 運用方法を整理すること。
- 購入前の比較だけでなく、購入後の使いこなしにも役立つ内容にする。

## What this is not

- AI が長文を自動生成するだけの機能ではない。
- 10 点満点の総合スコア表ではない。
- 外部レビューの要約コピーではない。
- MTF や lpmm をそのまま並べるスペック表ではない。
- 「良い / 悪い」を断定するだけのレビューではない。

## Editorial policy

- スコアリングは使わない。
- 測定値は使ってよいが、撮影判断に翻訳する。
- Lenstip の lpmm、MTF、周辺光量、歪曲、コマ収差などは、次のように読む。
  - 「中央は開放から十分」
  - 「四隅は F2.8 以降で安定」
  - 「風景なら F5.6〜F8 が扱いやすい」
  - 「星景では周辺の点像に注意」
  - 「近接では解像よりボケとピント面を優先」
- 外部レビュー本文はコピーしない。参照元、測定条件、読み替えた判断だけを残す。
- 不確かな情報は断定しない。
- 作例の印象は、レビュー傾向として扱い、保証表現にしない。

## Review structure

### 1. One-line verdict

- このレンズを一言で表す。
- 例: 「50mm GM の本命。開放から使いやすく、軽さと描写のバランスが強い。」

### 2. Best use

- 一番向いている用途を短く書く。
- 例:
  - 家族 / 子供
  - ポートレート
  - 日常スナップ
  - 旅行
  - 夜景
  - 物撮り
  - 動画

### 3. Not best for

- 買う前に注意すべき用途を書く。
- 「使えない」ではなく「優先度が下がる条件」として書く。
- 例:
  - 軽さ最優先
  - 最短撮影距離重視
  - 星景で四隅まで点像重視
  - 動画でブリージングを嫌う
  - 価格重視

### 4. Resolution playbook

解像をスコアではなく、撮影判断に翻訳する。

- `wideOpen`
  - 開放で主役にできるか。
  - 中央 / 中間 / 周辺 / 四隅の傾向。
- `stoppedDown`
  - F2 / F2.8 / F4 / F5.6 / F8 でどう変わるか。
- `edgeAndCorner`
  - 風景、建築、星景で気になるか。
- `diffraction`
  - F11 以降での注意。
- `fieldUse`
  - 実際のおすすめ F 値。

例:

- ポートレート: F1.4〜F2
- 家族 / 子供: F1.8〜F2.8
- 風景: F5.6〜F8
- 物撮り: F4〜F8
- 夜景: F2〜F5.6

### 5. Bokeh and rendering

- 背景ボケの柔らかさ。
- 前ボケの癖。
- 玉ボケの形、口径食、輪郭。
- 色収差によるボケ縁の色づき。
- コントラスト、色乗り、透明感。
- 「きれい」だけではなく、どの条件で良く見えるかを書く。

### 6. Aberrations and corrections

- 軸上色収差。
- 倍率色収差。
- 歪曲。
- 周辺減光。
- コマ収差。
- ゴースト / フレア。
- 補正前提か、撮影時に気にすべきかを分ける。

例:

- RAW 現像でほぼ処理できる。
- 逆光では構図を少しずらすと安全。
- 夜景の点光源では四隅を確認したい。
- 開放の高輝度境界では色づきに注意。

### 7. Scene-by-scene aperture guide

シーンごとにおすすめ F 値と理由を書く。

| Scene | Recommended aperture | Notes |
| --- | --- | --- |
| 子供 / 家族 | F1.8〜F2.8 | AF と被写界深度のバランスを取りやすい |
| ポートレート | F1.2〜F2 | 背景を整理しやすい。まつ毛だけにピントが来る条件に注意 |
| 日常スナップ | F2〜F4 | 失敗しにくく、立体感も残る |
| 風景 | F5.6〜F8 | 周辺まで安定させやすい |
| 夜景 | F2〜F5.6 | 光量と点光源のバランスを見る |
| 物撮り | F4〜F8 | ピント面と解像の両立 |

### 8. Handling and operation

- 重さ。
- 長さ。
- AF の速さ / 静かさ。
- 動画時のブリージング。
- 絞りリング、クリック切り替え、ボタン類。
- 防塵防滴。
- フィルター径。
- ボディとのバランス。

### 9. Comparison candidates

比較は「どちらが上か」ではなく、選ぶ理由で分ける。

- cheaper: 安く済ませたいなら。
- lighter: 持ち歩き重視なら。
- higherQuality: 描写優先なら。
- fasterAperture: 明るさ / ボケ優先なら。
- morePractical: AF、重さ、価格のバランス重視なら。

必ず「なぜ比較対象になるのか」を 1 行で書く。

### 10. Buy / do not buy

#### Buy if

- この条件なら買ってよい。
- 例:
  - 50mm を主力にしたい。
  - 開放から安心して使いたい。
  - 子供、ポートレート、日常を 1 本で撮りたい。

#### Do not buy if

- この条件なら別候補を見た方がよい。
- 例:
  - とにかく軽さ優先。
  - 価格重視。
  - 50mm より 35mm の画角が合う。
  - 動画でブリージングを強く嫌う。

## Data translation rules

### lpmm / MTF

- 数値をそのまま評価語にしない。
- 中央 / 周辺 / 四隅、開放 / 絞りで分ける。
- 実用判断に翻訳する。

例:

- `center high wide open` → 「開放から主役の目元を安心して狙える」
- `corner improves stopped down` → 「風景では F4〜F8 まで絞ると安定」
- `edge weak wide open` → 「開放で画面端に主役を置く構図は注意」

### Bokeh samples

- 「大きい / 小さい」だけではなく、質を言語化する。
- 前ボケと背景ボケを分ける。
- 玉ボケ、口径食、縁取り、二線ボケ傾向を見る。

### Aberration charts

- 補正可能な収差と、撮影時に影響する収差を分ける。
- 現像で済むものは過度に重く扱わない。
- 点光源、逆光、高輝度境界に出るものはシーン別注意に入れる。

## Suggested content schema

```ts
type DeepReviewPlaybook = {
  lensName: string
  sourceLevel: 'manual' | 'measured-assisted' | 'spec-only' | 'draft'

  oneLineVerdict: string
  bestUse: string[]
  notBestFor: string[]

  resolutionPlaybook: {
    wideOpen?: string
    stoppedDown?: string
    edgeAndCorner?: string
    diffraction?: string
    fieldUse?: string
  }

  apertureGuide: {
    scene: string
    recommendedAperture: string
    note: string
  }[]

  rendering: {
    bokeh?: string
    foregroundBokeh?: string
    backgroundBokeh?: string
    color?: string
    contrast?: string
    flare?: string
  }

  aberrations: {
    chromaticAberration?: string
    distortion?: string
    vignetting?: string
    coma?: string
    focusBreathing?: string
  }

  handling: {
    portability?: string
    autofocus?: string
    video?: string
    controls?: string
    bodyBalance?: string
  }

  comparisonCandidates: {
    lensName: string
    reason: string
    chooseIf: string
  }[]

  buyingAdvice: {
    buyIf: string[]
    doNotBuyIf: string[]
  }

  sourceNotes: {
    label: string
    url?: string
    type: 'manufacturer' | 'measurement' | 'review' | 'manual' | 'shop'
    note?: string
  }[]
}
```

## First validation lenses

最初は 50mm 前後の比較で、フォーマットの実用性を検証する。

### Sony FE 50mm F1.4 GM

- Lens Navi の基準候補。
- F1.4 の明るさ、軽さ、GM らしい解像のバランスを見る。
- 子供、ポートレート、日常で「現実的に持ち出せる本命」として評価する。
- 比較軸:
  - FE 50mm F1.2 GM より軽いか。
  - Sigma 50mm F1.4 DG DN Art より純正 AF / サイズ感で優位があるか。
  - FE 50mm F1.8 との差額を説明できるか。

### Sigma 50mm F1.4 DG DN Art

- 高画質 / 価格バランス候補。
- Art らしい解像とサイズ、重量、価格のバランスを見る。
- 「コスパ重視」として成立する条件を明確にする。
- 比較軸:
  - FE 50mm F1.4 GM より価格面で魅力があるか。
  - 純正 AF / サイズ / 所有満足感との差をどう説明するか。
  - 動画や家族撮影で重さが負担にならないか。

### Sony FE 50mm F1.2 GM

- 明るさ / ボケ優先の上位候補。
- F1.2 の表現力と、重量、価格、被写界深度の浅さを整理する。
- 「最高」ではなく「必要な人が限られる強い選択肢」として扱う。
- 比較軸:
  - F1.4 GM で十分な人は誰か。
  - F1.2 が本当に効くシーンは何か。
  - 子供撮影でピント歩留まりと重さが許容できるか。

## Initial output checklist

1. 1 行結論がある。
2. 買うべき人 / 買わなくていい人がある。
3. シーン別おすすめ F 値がある。
4. 開放、F2、F2.8、F4、F5.6〜F8 の運用メモがある。
5. 中央 / 周辺 / 四隅の扱いがある。
6. ボケ、前ボケ、背景ボケの違いがある。
7. 色収差、歪曲、周辺減光、コマ、逆光耐性の注意がある。
8. 比較候補が理由つきである。
9. 測定値を使う場合、撮影判断に翻訳されている。
10. 外部レビュー本文をコピーしていない。

## Not in scope for this document

- UI 実装。
- API 実装。
- Dify prompt 変更。
- `lens_data.json` の構造変更。
- localStorage 形式変更。
- 自動採点。
- 全レンズ DB の一括作成。
