# Lens data stable ID plan

## 1. Purpose

Lens Navi では、Deep Review、Scene Playbook、warehouse、chat recommendation を将来的に接続するために、レンズごとの安定IDが必要になる。

現状の warehouse item `id` は保存アイテムIDであり、レンズDBの安定IDではない。

この docs は、安定IDを追加する前に、命名ルール、移行方針、既存 localStorage への影響、Scene Playbook との接続方針を整理する。

今回も docs 追加のみで、`public/lens_data.json`、warehouse UI、localStorage、推薦ロジック、Dify / API は変更しない。

## 2. Current findings

実際にファイルを読んで確認した結果。

| Target | Finding | Stable ID impact |
| --- | --- | --- |
| `public/lens_data.json` | 現行のレンズDBは `public/lens_data.json`。`src/data/lens_data.json` は存在しない。 | Scene Playbook や Deep Review が参照するなら、まずこのDB側に安定IDを持たせる候補が自然。 |
| `public/lens_data.json` | `FE 50mm F1.4 GM`、`FE 50mm F1.2 GM`、`FE 85mm F1.4 GM II`、`FE 135mm F1.8 GM`、`FE 70-200mm F2.8 GM OSS II`、`FE 70-200mm F4 Macro G OSS II`、`FE 100-400mm F4.5-5.6 GM OSS` は名前として確認できた。 | Scene Playbook 初期3本に必要な主要 Sony FE 候補はデータ上に存在する。 |
| `public/lens_data.json` | 主要レコードに `model_code` は確認できるものが多い。例: `SEL50F14GM`、`SEL50F12GM`、`SEL85F14GM2`、`SEL135F18GM`、`SEL70200GM2`、`SEL70200G2`。 | `model_code` は fallback や照合材料に使えるが、人間が読む URL / docs 用IDとしては別の `stable_id` が欲しい。 |
| `public/lens_data.json` | 主要レコードに明示的な `stable_id` はまだない。汎用的な `id` フィールドも、今回確認した主要レコードでは見当たらない。 | `relatedLensIds` を安全に入れるには、安定ID方針を先に決める必要がある。 |
| `src/app/warehouse/page.tsx` | `LensItem` は `id: number`、`name`、`addedAt`、`type`、`tag`、`pros`、`cons`、`advice`、`aiComment`、`focalMin`、`focalMax` を持つ。 | `LensItem.id` は保存アイテムIDであり、レンズDBのIDではない。 |
| `src/app/warehouse/page.tsx` | `handleAdd` で `id: Date.now()` を使って warehouse item を作成している。 | 同じレンズでも保存タイミングでIDが変わるため、同一レンズ判定には使えない。 |
| `src/app/warehouse/page.tsx` | warehouse は `localStorage.getItem('warehouse')` / `localStorage.setItem('warehouse')` で読み書きしている。既存 item の migration では `type`、`focalMin`、`focalMax` を補っている。 | 将来 `stableLensId` を足す場合も optional にし、既存 item を壊さない必要がある。 |
| `src/app/warehouse/page.tsx` | `LensCard` / `LensDeepReviewPanel` は主に `item.name` と DB の `name` 照合で表示を組み立てている。 | 現状の識別は表示名依存。安定ID導入後も name fallback は必要。 |
| `src/components/LensRecommendationCards.tsx` | 推薦カードは `/lens_data.json` を fetch し、`findLensInDatabase` で `name`、alias、brand、`model_code` などを使って照合している。 | 保存時に `stableLensId` を入れるには、まず lens data 側に `stable_id` が必要。 |
| `src/components/LensRecommendationCards.tsx` | warehouse 保存時は `id: Date.now()`、`name`、`type`、`tag`、`pros`、`cons`、`advice`、`aiComment`、`focalMin`、`focalMax` を保存している。 | 新規保存 item に `stableLensId` を足す余地はあるが、今回の docs では実装しない。 |
| `src/components/WarehouseList.tsx` | `StoredItem` も `id: number`、`name`、`addedAt`、`type`、`focalMin`、`focalMax`、`memo` を持つ。 | こちらも warehouse item id は保存アイテムID。現行導線で使われているかは要確認。 |
| Scene Playbook relatedLensIds | `scene-playbook-static-data-plan.md` では、安定ID未導入のため `relatedLensIds` は空で始める方針。 | `stable_id` 導入後に `relatedLensIds` を更新するのが自然。 |

要確認:

* `src/components/WarehouseList.tsx` が現行 UI でどの程度使われているか。
* `public/lens_data.json` 全件で `model_code` / `product_code` がどの程度埋まっているか。
* 将来 `stable_id` を全件追加するか、主要レンズから段階追加するか。

## 3. Why stable lens IDs are needed

安定IDが必要になる用途:

* Scene Playbook の `relatedLensIds`
* Deep Review と lens data の紐づけ
* warehouse 保存レンズから関連 Scene Playbook を表示
* レンズ詳細 / 比較ノート / 購入判断比較へのリンク
* 将来の専用ページ URL
* analytics / user saved lens / recommendation tracking
* Dify / API 連携
* localStorage migration

重要な前提:

* 表示名は変わる可能性がある。
* `model_code` は有用だが、すべてのレンズで安定しているとは限らない。
* `Date.now()` の保存IDは、同一レンズ判定に使えない。
* 安定IDは人間が読める slug にする方が docs / UI / routing で扱いやすい。

安定IDは「評価のためのID」ではなく、関連リンクとデータ接続のためのキーである。スコアリングやランキングとは切り離して扱う。

## 4. Proposed stable ID rule

基本形:

```txt
{brand}-{mount-or-system}-{focal}-{aperture-or-range}-{series-or-version}
```

例:

```txt
sony-fe-50mm-f14-gm
sony-fe-50mm-f12-gm
sony-fe-85mm-f14-gmii
sony-fe-135mm-f18-gm
sony-fe-70-200mm-f28-gm-ii
sony-fe-70-200mm-f4-macro-g-ii
sony-fe-100-400mm-f45-56-gm-oss
```

ルール:

* lowercase
* spaces は `-`
* `F1.4` は `f14`
* `F4.5-5.6` は `f45-56`
* `GM II` は `gm-ii`
* `GMII` 表記にしない
* `OSS` は必要なら末尾に `oss`
* mount / system は `fe`, `rf`, `z`, `x`, `mft` など
* 同名の世代違いがある場合は version を入れる
* manufacturer slug は `sony`, `canon`, `nikon`, `sigma`, `tamron` など
* 将来 URL に使える形式にする

注意:

* 実装前に既存 lens names と重複チェックが必要。
* 既存 `model_code` がある場合でも、stable id は別フィールドとして持つ方が安全。
* 表記揺れを避けるため、命名規則を先に docs で固定してからデータへ入れる。

## 5. Field name proposal

`public/lens_data.json` に将来追加するフィールド名候補:

```json
{
  "stable_id": "sony-fe-85mm-f14-gmii"
}
```

TypeScript 側の候補:

```ts
type LensDataItem = {
  stable_id?: string
  model_code?: string
  name: string
}
```

方針:

* 既存 `id` という名前は warehouse item id と混同しやすいため避ける。
* `stable_id` を推奨。
* UI / code では必要に応じて `stableId` に変換してもよい。
* 既存データとの互換性のため、最初は optional にする。
* すべてのレンズへ一括追加する前に、主要レンズで試す。

## 6. Initial stable ID candidates

| Lens name | Suggested stable_id | Notes |
| --- | --- | --- |
| FE 50mm F1.4 GM | `sony-fe-50mm-f14-gm` | Deep Review / family photo baseline |
| FE 50mm F1.2 GM | `sony-fe-50mm-f12-gm` | 50GM family comparison |
| FE 85mm F1.4 GM II | `sony-fe-85mm-f14-gmii` | portrait / family / recital / sports-day |
| FE 135mm F1.8 GM | `sony-fe-135mm-f18-gm` | compression / recital / sports-day |
| FE 70-200mm F2.8 GM OSS II | `sony-fe-70-200mm-f28-gm-ii` | recital / sports-day safety zoom |
| FE 70-200mm F4 Macro G OSS II | `sony-fe-70-200mm-f4-macro-g-ii` | lightweight event zoom |
| FE 100-400mm F4.5-5.6 GM OSS | `sony-fe-100-400mm-f45-56-gm-oss` | sports-day / outdoor event |

確認メモ:

* 上記の Lens name は `public/lens_data.json` で名前として確認した。
* `FE 50mm F1.4 GM`、`FE 50mm F1.2 GM`、`FE 85mm F1.4 GM II`、`FE 135mm F1.8 GM`、`FE 70-200mm F2.8 GM OSS II`、`FE 70-200mm F4 Macro G OSS II` は `model_code` も確認できた。
* `FE 100-400mm F4.5-5.6 GM OSS` は名前と official URL は確認した。今回の短い確認では `model_code` の有無は要確認。

## 7. Relationship with warehouse item id

warehouse item `id` は保存アイテムIDであり、レンズIDではない。

例:

```ts
type WarehouseItem = {
  id: number // Date.now() derived saved item id
  lensName: string
  // future:
  stableLensId?: string
}
```

将来の方針:

* 既存 `id` は保存アイテムIDとして維持する。
* レンズDBとの接続には `stableLensId` または `lensStableId` を追加する。
* 既存 localStorage の破壊的変更は避ける。
* 古い warehouse item には `stableLensId` がない前提で動く。
* name / `model_code` から後方互換的に推定する migration helper を検討する。
* ただし今回の docs では実装しない。

互換性の観点では、warehouse item の `id` を stable lens id に置き換えないことが重要。削除、メモ更新、保存済みリスト操作は今の `id: number` を使い続け、レンズDBとの関連付けだけを別フィールドで行う。

## 8. Scene Playbook relatedLensIds policy

Scene Playbook の `relatedLensIds` には `stable_id` を入れる。

方針:

* `stable_id` が未導入の間は空配列でもよい。
* 仮IDを無理に入れない。
* 未登録のレンズカテゴリは `mainLensRoles.label` で表現する。
* `stable_id` 導入後に、family / recital / sports-day の `relatedLensIds` を更新する。
* `relatedLensIds` は最大3〜5件から始める。
* `relatedLensIds` がなくても Scene Playbook card は表示できるようにする。

例:

```ts
{
  id: 'sports-day',
  relatedLensIds: [
    'sony-fe-70-200mm-f28-gm-ii',
    'sony-fe-70-200mm-f4-macro-g-ii',
    'sony-fe-100-400mm-f45-56-gm-oss',
    'sony-fe-135mm-f18-gm'
  ]
}
```

この関連は「おすすめ順位」ではない。Scene Playbook 内で登場するレンズを、撮影条件ごとの役割として結びつけるための参照である。

## 9. Migration strategy

### Phase 0: Docs only

* 現在
* stable ID方針を docs 化
* データや UI は触らない

### Phase 1: Add optional stable_id to selected lens data

* `public/lens_data.json` の主要レンズに optional `stable_id` を追加
* まずは 50GM / 85GM II / 135GM / 70-200 / 100-400 など
* build / e2e を確認
* 推薦ロジックに影響しないか確認

### Phase 2: Add stableLensId to newly saved warehouse items

* `LensRecommendationCards.tsx` の保存時に `stableLensId` を含める
* 既存 `id` は維持
* 古い localStorage item でも壊れないようにする

### Phase 3: Backfill / infer stable ID for old warehouse items

* name / `model_code` から推定する helper を検討
* 一致しない場合は undefined のまま
* 強制 migration はしない

### Phase 4: Connect Scene Playbooks

* `scenePlaybooks` の `relatedLensIds` に `stable_id` を使う
* warehouse 保存レンズの `stableLensId` と一致する Scene Playbook を表示
* related links は最大2〜3件から始める

### Phase 5: Routing / Deep Review / API

* `stable_id` を将来の detail page URL や API key に使うか検討
* Dify / API 連携は最後に回す

## 10. Compatibility rules

* existing warehouse item `id` は変更しない。
* localStorage の既存 item を破壊しない。
* `stable_id` は optional から始める。
* `stableLensId` がなくても UI は動く。
* name fallback を持つ。
* `model_code` がある場合は fallback に使えるが、唯一のIDとはしない。
* 推薦ロジックは `stable_id` に依存させない。
* e2e の `data-testid` は触らない。
* build / e2e で確認してから UI 接続へ進む。

## 11. Risks

* `stable_id` の命名揺れ
* 既存レンズ名との不一致
* 同名世代違い
* `model_code` 未設定レンズ
* imported / third-party lenses
* localStorage に古い item が残る
* Scene Playbook に登場するが lens data にないカテゴリ
* `relatedLensIds` の過剰表示
* 既存 UI に意図せず影響する可能性
* Dify / API 側の名称との不一致

## 12. Do not implement yet

この段階では以下を実装しない。

* `public/lens_data.json` はまだ変更しない
* warehouse 保存形式はまだ変更しない
* `stableLensId` はまだ追加しない
* Scene Playbook data はまだ作らない
* UIはまだ触らない
* Dify / API はまだ触らない
* localStorage migration はまだしない
* routing はまだ作らない

## 13. Next recommended steps

1. `lens-data-stable-id-plan.md` を作成
2. `public/lens_data.json` の主要レンズ表記を再確認
3. `stable_id` を追加する対象レンズを最小セットに絞る
4. まずは docs-only で命名候補をレビュー
5. 次フェーズで `public/lens_data.json` に optional `stable_id` を少数追加
6. build / e2e を確認
7. その後 `src/data/scenePlaybooks.ts` の card only 実装に進む
