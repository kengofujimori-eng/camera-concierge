# Deep review UI structure

Lens Navi の Deep Review / 使いこなしレビューを、レンズ倉庫 UI に落とすための表示構造メモ。

前提:

- `docs/deep-review-playbook-format.md` と `docs/deep-review-sample-sony-fe-50mm-f14-gm.md` をもとにする。
- Deep Review は単なる「AI 深掘り」ではなく、「使いこなしレビュー / レンズ攻略本」として扱う。
- スコアリングはしない。
- Lenstip の lpmm や MTF などの測定値は、そのまま表示するのではなく、撮影判断へ翻訳して使う。
- 既存の deepReview UI モックと将来的に連携する前提で考える。

## 1. UIの基本方針

- Deep Review / 使いこなしレビューは長文レビューではなく、購入判断と撮影時の設定判断に使う情報として表示する。
- レンズ倉庫では最初から全情報を出さない。
- 表示は以下の 3 層に分ける。

1. 倉庫カード初期表示
2. 詳細パネル
3. 比較・根拠・ソース

目的:

- 最初は判断に必要な要点だけ見せる。
- 詳細を開いたら、撮影時に使える F 値や注意点を読める。
- 比較や根拠は、必要な人だけ下部で確認できる。

## 2. Layer 1: 倉庫カード初期表示

最初に見せる項目:

- 一言でいうと
- 得意用途
- 美味しい F 値の短縮表示
- 注意点 1〜2 個
- 「使いこなしレビューを見る」導線

表示例:

- F1.4 開放から使いやすい、日常・家族・ポートレート向けの 50mm 本命候補
- 得意: 家族 / ポートレート / 夜の街歩き
- 美味しい F 値:
  - F1.4: 背景整理
  - F1.8〜F2.8: 家族・子供
  - F5.6〜F8: 風景・旅行記録
- 注意:
  - 50mm が狭く感じる人は 35mm も比較
  - 動画のブリージングは実機確認

表示粒度:

- 倉庫カード内では 3〜5 行程度に抑える。
- 長い解説は詳細パネルに送る。
- 注意点は警告ではなく、購入前 / 撮影前の確認メモとして表示する。

## 3. Layer 2: 詳細パネル

詳細パネルの表示順:

1. 美味しい使い方
2. シーン別おすすめ設定
3. 解像の使いどころ
4. ボケの使いどころ
5. 収差・癖の扱い方
6. 苦手な条件と回避策

### 美味しい使い方

- F 値チップまたは縦カードで表示する。
- 例:
  - F1.4: 背景を整理したい時
  - F1.8〜F2.8: 子供 / 家族で歩留まりを上げたい時
  - F5.6〜F8: 風景 / 旅行記録で全体を安定させたい時

### シーン別おすすめ設定

- 表形式で表示する。
- `scene` / `aperture` / `note` の 3 列を想定する。
- モバイルではカード型に折り返してもよい。

### 解像の使いどころ

- F 値ごとの縦カードまたはアコーディオンで表示する。
- 中央 / 周辺 / 四隅の違いは、測定値ではなく撮影判断として表現する。
- 例:
  - 開放: 主役を中央付近に置くと使いやすい
  - F2.8: 子供や家族で歩留まりを取りやすい
  - F5.6〜F8: 風景で周辺まで安定しやすい

### ボケの使いどころ

- 背景ボケ / 前ボケ / ボケと解像のバランスに分ける。
- 「ボケがきれい」だけで終わらせず、どの距離や F 値で活きるかを書く。

### 収差・癖の扱い方

- 警告色を強くしすぎず、扱い方として表示する。
- 例:
  - 高輝度境界では F2 に絞ると安定しやすい
  - 夜景の点光源は四隅を確認
  - 周辺減光はポートレートでは雰囲気として使える

### 苦手な条件と回避策

- 欠点ではなく、失敗しやすい条件と対処法として表示する。
- 例:
  - 50mm が狭い場合: 35mm も比較
  - 複数人撮影: F2.8〜F4 へ絞る
  - 動画: ブリージングと AF 挙動を実機確認

## 4. Layer 3: 比較・根拠・ソース

詳細パネル下部または折りたたみで表示する項目:

- 比較候補
- 買うべき人 / 待つべき人
- Sources to verify

### 比較候補

- 単純な優劣ではなく、「選ぶ理由の違い」として表示する。
- 例:
  - Sigma 50mm F1.4 DG DN Art: 価格と描写のバランス候補
  - Sony FE 50mm F1.2 GM: F1.2 のボケ量と表現力を買う上位候補

表示方針:

- 比較カードは 1 候補 2〜3 行程度。
- 「こちらが上」ではなく、「こういう人はこちら」を中心にする。
- 価格差や重量差は、固定値ではなく確認項目として扱う。

### 買うべき人 / 待つべき人

- 2 カラム表示を想定する。
- モバイルでは縦積みにする。
- Buy if / Wait if を短い箇条書きで表示する。

### Sources

- 最初から目立たせず、詳細下部に小さく表示する。
- 外部レビュー本文はコピーしない。
- 測定値やレビュー傾向の参照元として残す。
- source は「信頼の根拠」であり、本文の主役にはしない。

## 5. 表示名

ユーザー向け表示名の第一候補:

- 使いこなしレビュー

補助文:

- 測定値やレビュー傾向を、撮影時の設定・注意点に翻訳したメモです。

他の候補:

- レンズ攻略メモ
- 使いどころガイド

現時点では、表示名は「使いこなしレビュー」を第一候補とする。

## 6. TypeScript型候補

まだ実装はしないが、将来的な型候補として以下を記載する。

```ts
type LensUseReview = {
  status: 'manual-draft' | 'verified' | 'ai-assisted' | 'not-ready'

  headline: string
  shortVerdict: string

  bestUse: string[]
  notBestFor: string[]

  sweetSpot: {
    label: string
    aperture: string
    note: string
  }[]

  sceneSettings: {
    scene: string
    aperture: string
    note: string
  }[]

  resolutionPlaybook: {
    aperture: string
    note: string
  }[]

  bokehPlaybook: {
    label: string
    note: string
  }[]

  renderingNotes: {
    label: string
    note: string
    severity?: 'low' | 'medium' | 'high'
  }[]

  comparisons: {
    lensName: string
    position: string
    chooseThisIf: string[]
  }[]

  buyingAdvice: {
    buyIf: string[]
    waitIf: string[]
  }

  sources: {
    label: string
    type: 'manufacturer' | 'measurement' | 'practical-review' | 'shop' | 'forum'
    url?: string
  }[]
}
```

## 7. 今回やらないこと

- Deep Review UI 実装
- `src/app/warehouse/page.tsx` の編集
- Dify / API 変更
- `lens_data.json` への追加
- localStorage 形式変更
- 推薦ロジック変更
- スコア表示追加
- 外部レビュー本文の転載

## 8. 次のステップ

この docs 追加後に行うこと:

1. `src/app/warehouse/page.tsx` の既存 deepReview UI モックを読む。
2. 現在のモックと `LensUseReview` 型候補の差分を見る。
3. まずは既存モック内で表示名を「使いこなしレビュー」に寄せられるか検討する。
4. 実装に入る前に、1〜2 本サンプルを追加するか判断する。
