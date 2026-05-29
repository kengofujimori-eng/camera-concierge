# Lens warehouse deep review design

Lens Navi のレンズ倉庫を、単なる保存場所ではなく、購入前 / 購入後の比較・深掘り・運用メモの場所に育てるための設計メモ。

## Concept

- 入口は軽く、倉庫は深くする。
- チャット推薦は一次選抜。まずは 1〜3 本に絞る。
- レンズ倉庫は、保存・比較・深掘り・運用メモの場所にする。
- 深掘りレビューはランキングではなく、条件付きの使い方ナビにする。
- 「このレンズはどの条件で強いか / どの条件で注意すべきか / どう使うと失敗しにくいか」を中心にする。
- 購入前の比較だけでなく、手持ちレンズをどう使うかにも役立つ設計にする。

## Basic policy

- 全レンズ DB を一気に作り直さない。
- 既存の `lens_data.json` は維持する。
- `deepReview?: LensDeepReview` のような optional レイヤーで後から追加する。
- `deepReview` がないレンズでも UI が破綻しないようにする。
- まずは売れ筋・推薦頻度の高いレンズから順に埋める。
- 初期目標は 20 本程度。
- DB 構造の大改修ではなく、既存レコードに任意項目を足す形を優先する。

## Evaluation philosophy

- 単純な 10 段階ランキングにはしない。
- 相対評価は世代、価格、比較対象、レビュー環境で揺れるため中心にしない。
- 数値や仕様で安定して評価できる項目は `specs` として扱う。
- 解像などは、可能なら中心 / 中間 / 周辺 / 四隅、開放 / 絞り別に言語化する。
- 主役は score ではなく `operatingNotes` と `cautionPoints`。
- スコアを使う場合は、外部の絶対評価ではなく「Lens Navi 内の目安」と明記する。
- レビュー本文や外部記事のコピーはしない。参照元は sources に残し、内容は要約・構造化する。

## Deep review fields

### summary

- レンズの位置づけを短くまとめる。
- 例: 「軽量な旅行標準ズーム。画質最優先ではないが、1 本で済ませたい用途に強い。」

### specs

安定して取得できる仕様値を置く。

- `focalLength`
- `maxAperture`
- `mount`
- `format`
- `weightGram`
- `lengthMm`
- `diameterMm`
- `filterSizeMm`
- `minFocusDistanceM`
- `maxMagnification`
- `stabilization`
- `weatherSealing`
- `releaseYear`
- `newPrice`
- `usedPrice`

### verdict

ランキングではなく、良い点 / 普通な点 / 注意点を短く分ける。

- `like`
- `average`
- `dislike`

### operatingNotes

実際の使い方に近い観点で言語化する。

- `wideOpen`: 開放での使いやすさ。
- `stoppedDown`: 絞ったときの安定感。
- `closeFocus`: 近接時の描写や使い勝手。
- `infinity`: 遠景、風景、建築など。
- `backlight`: 逆光、ゴースト、フレア。
- `nightLights`: 夜景、点光源、イルミネーション。
- `movingSubjects`: 子供、運動会、動物など動体。
- `video`: AF 音、ブリージング、手ぶれ補正など。
- `bokeh`: 背景ボケ、前ボケ、玉ボケの傾向。

### cautionPoints

「悪い」ではなく、失敗しやすい条件を明示する。

表現したい例:

- 開放では弱い。
- 近接では甘い。
- 前ボケが硬い。
- 逆光でゴーストが出やすい。
- 周辺 / 四隅は絞った方がよい。
- 最短撮影距離が長い。
- 動画ではブリージングに注意。

### renderingTraits

描写傾向を言語化する。

- `sharpness`
- `bokeh`
- `foregroundBokeh`
- `backgroundBokeh`
- `color`
- `contrast`
- `flare`
- `distortion`
- `vignetting`
- `chromaticAberration`
- `coma`
- `sunstars`
- `focusBreathing`

### practicalRatings

数値スコアではなく、ラベル中心にする。

- `excellent`
- `good`
- `conditional`
- `weak`

対象例:

- `portability`
- `wideOpenUsability`
- `closeFocus`
- `backlight`
- `value`
- `video`

### recommendedUse

使う場面 / 使える場面 / 避けたい場面を分ける。

- `bestScenes`
- `okayScenes`
- `avoidScenes`

### alternatives

比較候補を理由つきで置く。

- `cheaper`
- `lighter`
- `higherQuality`
- `moreVersatile`
- `sameMount`

初期型では `reason` と `lensName` だけでもよい。必要になったら category を足す。

### buyingAdvice

購入判断の最後に効く条件を置く。

- `buyIf`: 買ってよい条件。
- `waitIf`: 待つ / 他候補を見る条件。

### sources

参照元を残す。本文コピーはしない。

- `manufacturer`
- `review`
- `spec`
- `shop`
- `manual`

## TypeScript type proposal

```ts
type LensDeepReview = {
  sourceLevel: 'manual' | 'ai-assisted' | 'spec-only' | 'not-ready'
  summary?: string

  specs?: {
    focalLength?: string
    maxAperture?: string
    mount?: string
    format?: string
    weightGram?: number
    lengthMm?: number
    diameterMm?: number
    filterSizeMm?: number | string
    minFocusDistanceM?: number
    maxMagnification?: string
    stabilization?: boolean
    weatherSealing?: boolean
    releaseYear?: number
    newPrice?: number
    usedPrice?: number
  }

  verdict?: {
    like?: string[]
    average?: string[]
    dislike?: string[]
  }

  operatingNotes?: {
    wideOpen?: string
    stoppedDown?: string
    closeFocus?: string
    infinity?: string
    backlight?: string
    nightLights?: string
    movingSubjects?: string
    video?: string
    bokeh?: string
  }

  cautionPoints?: {
    label: string
    detail: string
    severity: 'low' | 'medium' | 'high'
    relatedScenes?: string[]
  }[]

  renderingTraits?: {
    sharpness?: string
    bokeh?: string
    foregroundBokeh?: string
    backgroundBokeh?: string
    color?: string
    contrast?: string
    flare?: string
    distortion?: string
    vignetting?: string
    chromaticAberration?: string
    coma?: string
    sunstars?: string
    focusBreathing?: string
  }

  practicalRatings?: {
    portability?: 'excellent' | 'good' | 'conditional' | 'weak'
    wideOpenUsability?: 'excellent' | 'good' | 'conditional' | 'weak'
    closeFocus?: 'excellent' | 'good' | 'conditional' | 'weak'
    backlight?: 'excellent' | 'good' | 'conditional' | 'weak'
    value?: 'excellent' | 'good' | 'conditional' | 'weak'
    video?: 'excellent' | 'good' | 'conditional' | 'weak'
  }

  recommendedUse?: {
    bestScenes?: string[]
    okayScenes?: string[]
    avoidScenes?: string[]
  }

  alternatives?: {
    reason: string
    lensName: string
  }[]

  buyingAdvice?: {
    buyIf?: string[]
    waitIf?: string[]
  }

  sources?: {
    label: string
    url?: string
    type: 'manufacturer' | 'review' | 'spec' | 'shop' | 'manual'
  }[]
}
```

## UI direction

- 倉庫カードでは、最初から全部を出さない。
- まずは短い summary、注意点、向いている用途だけ見せる。
- 詳細は「深掘りレビュー」セクションで開く。
- `deepReview` がない場合は「深掘りレビューは未整備です」と控えめに出すか、セクション自体を非表示にする。
- `cautionPoints` は警告色を強くしすぎず、slate / amber 系で冷静に見せる。
- `operatingNotes` は撮影条件ごとの実用メモとして表示する。
- `sources` は小さく表示し、外部レビュー本文は転載しない。

## Rollout plan

1. 型だけ docs に置く。
2. 既存 UI / DB は触らない。
3. 売れ筋・推薦頻度の高い 20 本を候補にする。
4. 1〜3 本だけ `deepReview` を手作業で試作する。
5. 倉庫 UI に optional 表示を追加する。
6. `deepReview` なしのレンズで表示が崩れないことを確認する。
7. β後のフィードバックを見て項目を増減する。

## Not in scope yet

- 全レンズ DB の一括書き換え。
- 外部レビュー本文のコピー。
- 10 点満点ランキングの導入。
- AI による自動レビュー生成の本番投入。
- 購入導線や affiliate URL の変更。
- 推薦ロジックへの deepReview 反映。
