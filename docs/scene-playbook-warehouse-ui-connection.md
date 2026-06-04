# Scene Playbook warehouse UI connection

## 1. Purpose

Scene Playbook を Lens Warehouse / Deep Review UI と接続する前に、既存 UI のどこに導線を置けるか、Deep Review とどう分けるか、最初の実装単位をどう小さくするかを整理する。

この docs は UI 実装ではなく、接続方針のメモである。`lens_data.json`、localStorage、推薦ロジック、Dify / API を変えずに、Scene Playbook を Lens Navi の「撮影判断ナビ」として自然に見せるための前段整理とする。

## 2. Current content assets

| Asset | Provides for warehouse UI connection |
| --- | --- |
| `docs/scene-playbook-format.md` | Scene Playbook の位置づけ、Deep Review 第4層、撮影シーンを主語にする考え方、スコアリング禁止、撮影制約・動き・単焦点/ズーム・動画判断の基本軸。 |
| `docs/scene-playbook-family-photography.md` | 家族写真サンプル。近距離、室内外、子供の動き、複数人、50mm中心の判断を UI カード化する材料。 |
| `docs/scene-playbook-recital-stage.md` | 発表会サンプル。座席固定、暗所、距離制約、85mm / 135mm / 70-200mm の使い分けを UI 導線化する材料。 |
| `docs/scene-playbook-sports-day.md` | 運動会サンプル。屋外、動体、距離変化、70-200mm / 100-400mm / クロップの判断を UI 導線化する材料。 |
| `docs/scene-playbook-implementation-plan.md` | `scenePlaybooks` を別データとして扱う方針、`relatedLensIds` による接続、段階的な UI / warehouse / chat 接続案。 |
| `docs/scene-playbook-ui-minimum-fields.md` | Scene Playbook card、detail panel、related references に必要な最小項目。初期 UI で出す情報と省く情報の線引き。 |
| `docs/deep-review-ui-structure.md` | Deep Review UI の3層表示思想。最初は要点だけを見せ、詳細や根拠を下層に逃がす設計の参考。 |
| `docs/lens-warehouse-deep-review-design.md` | Lens Warehouse に Deep Review を置く場合の設計方針。`lens_data.json` を急に肥大化させず、倉庫内で使いこなし導線を扱う考え方。 |

Deep Review 系 docs は、レンズ単体の使いこなしと根拠整理を担当する。Scene Playbook はそれらを参照しつつ、シーン側から複数レンズを横断する導線として扱う。

## 3. Conceptual separation

### Deep Review

* 主語はレンズ
* このレンズをどう使うか
* 美味しいF値
* 解像、ボケ、収差、AF、比較候補
* レンズ倉庫カード / 詳細パネルと相性が良い

### Scene Playbook

* 主語はシーン
* この撮影でどう選ぶか
* 複数レンズ / 焦点距離 / F値 / 撮影距離 / 制約 / 動画適性を横断
* チャット相談、レンズ倉庫、専用ページの複数導線があり得る

結論として、Scene Playbook を Deep Review の中に直接混ぜすぎない方がよい。Deep Review 本文は「このレンズの使いこなし」に集中し、Scene Playbook は「関連する撮影攻略」として、別の導線または下部の関連リンクに分ける方が主語の違いを保ちやすい。

## 4. Candidate UI entry points

### A. Lens warehouse card

保存済みレンズカードの下部に、関連する Scene Playbook への小さな導線を出す。

```txt
関連する撮影攻略
- 家族写真
- 発表会
- 運動会
```

メリット:

* 保存済みレンズから実際の撮影シーンへ移動できる
* 「このレンズはどの場面で使えるか」が見える

注意:

* レンズカードが重くなりすぎる
* Deep Review 導線と競合しやすい
* 初期カードでは最大2〜3件程度に抑える

### B. Lens detail / Deep Review panel bottom

Deep Review 詳細の下部に、「このレンズが登場する撮影攻略」を表示する。

```txt
このレンズが登場する撮影攻略
- 家族写真攻略
- 発表会攻略
- 運動会攻略
```

メリット:

* Deep Review を読んだ後に、シーン横断の判断へ進める
* 主語の違いを保ちやすい

注意:

* Deep Review 本体に混ぜない
* 下部の関連リンクとして扱う

### C. Warehouse top / saved lenses overview

レンズ倉庫の上部やサイド領域に、保存済みレンズに関連する Scene Playbook をまとめて表示する。

```txt
保存中のレンズで読める撮影攻略
- 家族写真
- 発表会
- 運動会
```

メリット:

* レンズ単体ではなく、保存済みレンズ群からシーン攻略へ誘導できる
* 複数レンズを保存しているユーザーに合う

注意:

* 画面が情報過多になりやすい
* 初期実装では後回しでもよい

### D. Dedicated Scene Playbook page

将来的に `/scene-playbooks` のような専用ページを作る。

メリット:

* Scene Playbook の主語が明確
* SEO / OGP / 共有にも向く
* 家族写真、発表会、運動会、旅行、動画などを一覧化できる

注意:

* 初期実装としては少し大きい
* routing / page design / data structure が必要

### E. Chat recommendation flow

チャット相談中に、「運動会」「発表会」「家族写真」などのシーンが出たときに導線を表示する。

メリット:

* Lens Navi の「撮影判断ナビ」らしさが最も出る
* レンズ推薦だけでなく、撮影判断へ誘導できる

注意:

* Dify / API / prompt 設計が絡む
* 初期実装では docs / UI モック後に検討する

## 5. Recommended first UI connection

最初の UI 接続は、warehouse に直接組み込む前に小さく分ける方が安全。

推奨:

1. まずは静的な Scene Playbook card list を作る
2. その後、warehouse との接続を小さく試す
3. warehouse 側では、Deep Review 本文内ではなく、関連リンクとして表示する

最小案:

```txt
Lens warehouse / saved lens card
  ├─ 使いこなしレビューを見る
  └─ 関連する撮影攻略
       ├─ 家族写真
       ├─ 発表会
       └─ 運動会
```

ただし、初期実装では以下の段階が安全。

### Phase A: static card list

* `src/data/scenePlaybooks.ts` に静的データを置く
* 3枚の Scene Playbook card を表示するだけ
* warehouse にはまだ接続しない
* card 表示項目は `docs/scene-playbook-ui-minimum-fields.md` の minimum fields に絞る

### Phase B: warehouse related links

* Lens card または Deep Review panel 下部に関連リンクだけ追加
* `relatedLensIds` に一致するものを表示
* クリックして詳細を開くか、別パネルへ遷移するかは後で検討する
* localStorage の保存形式は変えない

### Phase C: dedicated page / chat flow

* `/scene-playbooks` のような専用ページを検討する
* チャット相談からの導線は Dify / API / prompt 設計が絡むため最後に回す

## 6. Existing UI reuse check

既存 UI ファイルは読むだけに留め、編集しない前提で確認した。

確認した主なファイル:

* `src/app/warehouse/page.tsx`
* `src/components/LensRecommendationCards.tsx`
* `src/components/WarehouseList.tsx`
* `src/components/ChatInterface.tsx`

確認結果:

* `src/app/warehouse/page.tsx` が現在の warehouse page の中心。保存済みレンズを `localStorage` の `warehouse` から読み、`LensCard` を表示している。
* `LensCard` と `LensDeepReviewPanel` は `src/app/warehouse/page.tsx` 内にインラインで定義されている。Scene Playbook の最初の接続は、この構造を大きく分解せず、関連リンクの追加候補として考えるのが現実的。
* `LensCard` にはすでに `使いこなし` の開閉ボタンがあり、Deep Review panel をカード内に展開する導線がある。Scene Playbook はこのボタンと競合しないよう、「関連する撮影攻略」として別ラベルにする必要がある。
* `LensDeepReviewPanel` は固定サンプルと fallback を持ち、F値チップ、注意点、強み、折りたたみ詳細を使っている。Scene Playbook detail panel でも、短い要約、注意点、折りたたみ詳細の見せ方は参考にできる。
* ただし warehouse card は画像、価格、AIコメント、購入リンク、Deep Review ですでに情報量が多い。Scene Playbook をカード内に長文で入れると読みづらくなるため、初期は1〜2行の関連リンクに抑える方がよい。
* `src/components/LensRecommendationCards.tsx` は推薦カードから `localStorage` の `warehouse` に保存する役割を持つ。Scene Playbook 接続のために localStorage 形式を変えるべきではない。
* `src/components/WarehouseList.tsx` も `warehouse` localStorage を扱っている。現在の主要導線との関係は要確認であり、実装時にどちらを正とするかを改めて確認する。
* `src/components/ChatInterface.tsx` は `/warehouse` への導線と倉庫件数表示を持つ。チャットから Scene Playbook を出す場合は自然な入口になり得るが、Dify / API 変更を伴うため後回しにする。
* 既存 E2E hooks / `data-testid` を壊さないことが重要。特に `lens-card`、`lens-card-image`、`lens-card-placeholder`、`price-badge` などは削除・改名しない。
* mobile ではカードが長くなりやすい。関連 Scene Playbook は最大2〜3件、または横並びチップではなく短いリンク群として扱う方が安全。

使い回せそうな考え方:

* 既存 lens card の白 / slate 基調、薄い border、控えめな gradient accent
* Deep Review panel の折りたたみ構造
* F値チップや注意点ブロックのような短い判断単位
* detail panel 下部に関連リンクを置く考え方

要確認:

* `src/app/warehouse/page.tsx` 内のインライン `LensCard` / `LensDeepReviewPanel` を将来分離するか
* `src/components/WarehouseList.tsx` が現行 UI で使われているか
* Scene Playbook card list を dedicated page に置くか、まず既存 page 内の静的モックにするか

## 7. Minimum static data connection

将来の静的データ接続案としては、Scene Playbook を `lens_data.json` に混ぜず、別の静的データとして持つ方が自然。

```ts
type ScenePlaybookCard = {
  id: string
  title: string
  shortTitle: string
  sceneType: 'family' | 'recital' | 'sports-day' | 'travel' | 'portrait' | 'video'
  headline: string
  keyDecisions: string[]
  representativeFocalRanges: string[]
  mainLensRoles: {
    label: string
    role: string
  }[]
  primaryCaution: string
  relatedLensIds: string[]
  status: 'manual-draft' | 'verified' | 'ai-assisted' | 'not-ready'
}
```

関連付け例:

```ts
const scenePlaybookCards = [
  {
    id: 'family-photography',
    relatedLensIds: [
      'sony-fe-50mm-f14-gm',
      'sony-fe-85mm-f14-gmii',
      'sony-fe-135mm-f18-gm'
    ]
  },
  {
    id: 'recital-stage',
    relatedLensIds: [
      'sony-fe-85mm-f14-gmii',
      'sony-fe-135mm-f18-gm',
      'sony-fe-70-200mm-f28-gm-ii'
    ]
  },
  {
    id: 'sports-day',
    relatedLensIds: [
      'sony-fe-85mm-f14-gmii',
      'sony-fe-135mm-f18-gm',
      'sony-fe-70-200mm-f28-gm-ii',
      'sony-fe-100-400mm-gm'
    ]
  }
]
```

この docs では実装しない。`src/data/scenePlaybooks.ts` を作るかどうかは、次フェーズで UI モックの範囲を決めてから判断する。

## 8. UX rules

Scene Playbook を warehouse に接続する場合の UX ルール:

* Deep Review と同じカード内で競合させない
* Scene Playbook は「関連する撮影攻略」として表示する
* 表示件数は最大2〜3件から始める
* 長文はカードに出さない
* シーン名、短い headline、代表焦点距離、注意点だけにする
* 詳細はパネルまたは別画面に逃がす
* スコア・ランキングは表示しない
* 関連レンズがない場合は無理に表示しない
* 保存済みレンズがない場合は Scene Playbook 一覧の方が自然
* mobile ではカード内導線を1〜2行に抑える

## 9. Implementation risks

実装前に注意すべきリスク:

* `lens_data.json` に混ぜると、レンズ単体のデータ構造が重くなる
* localStorage の保存形式を変えると既存ユーザーに影響する
* warehouse card が情報過多になる
* Deep Review と Scene Playbook の違いが分かりにくくなる
* `relatedLensIds` が既存 lens id と一致しない可能性
* 70-200mm や 100-400mm など、望遠ズーム候補が現行 `lens_data.json` に十分存在しない可能性
* chat flow 連携は Dify / API / prompt 変更が必要になるため後回しにする
* dedicated page は routing とデザイン負荷がある
* 既存 E2E / `data-testid` を壊さないようにする

## 10. Do not implement yet

この段階では以下を実装しない。

* `src/data/scenePlaybooks.ts` はまだ作らない
* UIはまだ触らない
* warehouse page はまだ触らない
* Deep Review panel はまだ触らない
* Dify / API はまだ触らない
* `lens_data.json` はまだ触らない
* localStorage形式はまだ触らない
* scene page routing はまだ作らない
* 既存推薦ロジックはまだ触らない

## 11. Next recommended steps

1. `scene-playbook-warehouse-ui-connection.md` を作成
2. 既存 warehouse / Deep Review UI モックの実装ファイルを改めて読む
3. `src/data/scenePlaybooks.ts` の静的データ案を docs または小実装で検討
4. 最初は dedicated page ではなく、3枚カードの静的モックで UI を確認
5. その後、warehouse card か Deep Review panel 下部に関連リンクを追加するか判断
6. chat flow / Dify / API 連携は最後に回す
