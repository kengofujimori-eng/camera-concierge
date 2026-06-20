# Warehouse localStorage inventory

## 目的

`/warehouse` とレンズ倉庫まわりで使われている localStorage の現行仕様を棚卸しする。

目的は、将来 `/warehouse-gallery` へ統合する場合に、既存ユーザーの保存済みレンズ、所有 / 欲しい状態、AI分析、焦点距離カバレッジを壊さないための前提資料を作ること。

今回は調査 docs であり、コード、UI、localStorage、route、データ構造、API / Dify、`public/lens_data.json` は変更しない。

## 調査対象ファイル

主に確認したファイル:

| File | Role |
| --- | --- |
| `docs/ARCHITECTURE.md` | `/warehouse` と `/warehouse-gallery` の役割、越境変更、localStorage 棚卸し方針 |
| `src/app/warehouse/page.tsx` | 現行 `/warehouse` 本番画面。localStorage `warehouse` の読み込み、migration、保存、削除、手動追加、焦点距離カバレッジ |
| `src/components/LensRecommendationCards.tsx` | 相談結果カードから `warehouse` localStorage へ所有 / 欲しいレンズを保存 |
| `src/components/ChatInterface.tsx` | warehouse 件数表示、`warehouseUpdated` 監視、旧 `details` DOM 注入ボタンから `/api/warehouse` へ保存 |
| `src/components/WarehouseList.tsx` | `warehouse` localStorage を読む / 書く別コンポーネント。現行 route で使われているかは未確認 |
| `src/components/ProductCard.tsx` | `/api/warehouse` へ保存する旧/別系統のカード |
| `src/app/api/warehouse/route.ts` | SQLite warehouse API。localStorage とは別系統 |
| `src/lib/db.ts` | `data/warehouse.db` を使う SQLite warehouse 実装 |
| `public/lens_data.json` | 価格、画像、購入リンク、モデルコード、一部レビューリンク、availability / recommendation metadata |
| `public/lens_links.json` | レビュー / 作例リンク |
| `data/kakaku_id_map.json` | 現状 `{}`。価格取得ID map の候補だが `/warehouse` UI から直接参照していない |
| `public/price_history.json` | 現状 `{}`。`/warehouse` UI から直接参照していない |

## localStorage keys

### `warehouse`

現行 `/warehouse` と推薦カード保存で使われる主要 key。

```ts
localStorage.getItem('warehouse')
localStorage.setItem('warehouse', JSON.stringify(items))
```

確認した読み書き箇所:

- `src/app/warehouse/page.tsx`
  - 初期読み込み。
  - migration。
  - 手動追加。
  - 削除。
  - `warehouseUpdated` event 受信。
- `src/components/LensRecommendationCards.tsx`
  - 推薦カードの `所有済み` / `欲しい` 保存。
  - 既存 item の type 切り替え。
  - AI分析の保存。
- `src/components/WarehouseList.tsx`
  - `warehouse` key を読む / 書く。
  - `memo` 更新を行う。
  - 現行 UI で使われているかは未確認。
- `src/components/ChatInterface.tsx`
  - 件数表示のため `warehouse` key を読む。
  - `warehouseUpdated` event を監視する。

### `warehouseUpdated`

localStorage key ではなく、同一タブ内更新通知用の custom event。

```ts
window.dispatchEvent(new Event('warehouseUpdated'))
window.addEventListener('warehouseUpdated', ...)
```

主な用途:

- `/warehouse` ページが保存・削除後に状態を同期する。
- `ChatInterface` が倉庫件数を更新する。
- `LensRecommendationCards` が保存後に通知する。

### SQLite warehouse API

localStorage ではない別系統として、以下が存在する。

- `src/app/api/warehouse/route.ts`
- `src/lib/db.ts`
- `data/warehouse.db`

`ChatInterface` の DOM 注入ボタンと `ProductCard` は `/api/warehouse` へ保存する。これは現行 `/warehouse/page.tsx` の localStorage `warehouse` とは統合されていないように見える。

将来統合時には、localStorage 倉庫と SQLite API 倉庫を同じものとして扱ってよいか、または旧経路として整理するかを確認する必要がある。

## 保存データ形式

`src/app/warehouse/page.tsx` の `LensItem`:

```ts
interface LensItem {
  id: number
  name: string
  addedAt: string
  type: 'owned' | 'wishlist'
  tag?: string
  pros?: string
  cons?: string
  advice?: string
  aiComment?: string
  focalMin?: number
  focalMax?: number
}
```

`src/components/LensRecommendationCards.tsx` の `WarehouseItem` もほぼ同じ構造。

`src/components/WarehouseList.tsx` の `StoredItem` は以下を追加で持つ可能性がある。

```ts
interface StoredItem {
  id: number
  name: string
  addedAt: string
  type?: 'owned' | 'wishlist'
  focalMin?: number
  focalMax?: number
  memo?: string
}
```

### field notes

| Field | Meaning | Source / notes |
| --- | --- | --- |
| `id` | 保存アイテムID | `Date.now()` 由来。レンズDBの安定IDではない |
| `name` | レンズ名 | 推薦カードまたは手動入力の文字列。DB照合の主キー的に使われる |
| `addedAt` | 保存日時 | `new Date().toISOString()` |
| `type` | 所有 / 欲しい | `'owned'` または `'wishlist'` |
| `tag` | 推薦内ラベル | `【選択肢1】` などのタグ由来。手動追加では通常なし |
| `pros` | AI分析: 長所 | 推薦回答から抽出、または `aiReason` 由来 |
| `cons` | AI分析: 短所 / 注意 | 推薦回答から抽出、または `aiCaution` 由来 |
| `advice` | AI分析: アドバイス | 推薦回答から抽出 |
| `aiComment` | AI分析: 結論 | 推薦回答から抽出 |
| `focalMin` | 焦点距離下限 | レンズ名から正規表現で推定 |
| `focalMax` | 焦点距離上限 | レンズ名から正規表現で推定 |
| `memo` | メモ | `WarehouseList.tsx` のみで扱う可能性。現行 `/warehouse/page.tsx` では扱わない |

### 例

```json
[
  {
    "id": 1710000000000,
    "name": "FE 70-200mm F2.8 GM OSS II",
    "addedAt": "2026-06-20T00:00:00.000Z",
    "type": "wishlist",
    "tag": "選択肢1",
    "pros": "運動会で距離と構図変更に強い",
    "cons": "重量と価格は大きめ",
    "advice": "席や撮影距離が読めない場合に安全",
    "aiComment": "望遠ズームを主力に考えると失敗しにくい",
    "focalMin": 70,
    "focalMax": 200
  }
]
```

## 所有 / 欲しい の状態管理

状態は `type` field で管理する。

```ts
type: 'owned' | 'wishlist'
```

### `/warehouse/page.tsx`

- `tab` state は `'owned' | 'wishlist'`。
- 表示時に `items.filter(i => i.type === 'owned')` と `items.filter(i => i.type === 'wishlist')` で分ける。
- URL query `?tab=wishlist` または `?tab=owned` で初期タブを設定する。
- 手動追加時に `type` を選ぶ。
- 削除は `id` で filter して localStorage へ再保存する。

### `LensRecommendationCards.tsx`

- 推薦カードで `owned` / `wishlist` を保存できる。
- 既に同じ `name` の item がある場合は、新規追加せず既存 item を更新する。
- type 切り替え時は、既存の AI分析を保持し、新しい値がある場合だけ上書きする。
- 保存後に `warehouseUpdated` event を dispatch する。

### migration

`/warehouse/page.tsx` 初期読み込み時に以下を補完する。

- `type` がない item は `owned` として扱う。
- `focalMin` / `focalMax` がない item は、`name` から焦点距離を推定して補完する。

注意:

- この migration は React state 上で補完しているが、読み込み直後に補完済みデータを localStorage へ書き戻しているわけではない。
- そのため、別コンポーネントが同じ key を読むと、古い shape が残っている可能性がある。

## レンズデータとの関係

localStorage の `warehouse` item は、レンズDB item そのものではない。

`/warehouse/page.tsx` は保存済み item の `name` を使い、次の静的JSONと名前照合する。

- `public/lens_data.json`
- `public/lens_links.json`

照合は `findInDb` で行う。

- brand prefix を一部取り除く。
- lowercase + 非英数字除去で normalize する。
- exact match。
- partial match。

### `public/lens_data.json`

`/warehouse` で使う主な情報:

- `name`
- `image_url`
- `image_url_external`
- `photo_yodobashi_url`
- `model_code`
- `source_url`
- `weight`
- `price_info`
  - `new_price`
  - `used_price`
  - `fetched_at`
  - `kakaku_url`
- `purchase_links`
  - `new.amazon`
  - `new.rakuten`
  - `new.yahoo`
  - `used.kitamura`
  - `used.mapcamera`

`LensRecommendationCards.tsx` では、推薦カード側でも `public/lens_data.json` を読み、価格、画像、購入リンク、availability / recommendation metadata、mount compatibility filtering に使う。

### `public/lens_links.json`

`/warehouse` で使う主な情報:

- `name`
- `review_links`
  - `site`
  - `url`
  - `label`

`/warehouse/page.tsx` は `Photo Yodobashi`、Google作例検索、海外レビューリンクの表示に使う。

### fallback links

`purchase_links` がない場合は、`generateFallbackShoppingLinks(cleanName)` から購入リンクを生成する。

新品:

- Amazon
- 楽天
- Yahoo

中古:

- キタムラ
- MapCamera など、helper の返却に依存

### `data/kakaku_id_map.json` / `public/price_history.json`

今回確認した状態ではどちらも `{}`。

- `/warehouse/page.tsx` は直接参照していない。
- 価格表示は `public/lens_data.json` の `price_info` を参照している。
- `price_info.kakaku_url` は `public/lens_data.json` 内に保持されている。

## 焦点距離カバレッジとの関係

`/warehouse/page.tsx` の `FocalMap` が、localStorage `warehouse` の `focalMin` / `focalMax` を参照する。

処理:

1. `items.filter(i => i.focalMin)` で焦点距離を持つ item のみ対象にする。
2. `type === 'owned'` と `type === 'wishlist'` に分ける。
3. `focalMin` / `focalMax` を `focalToPercent` で 10mm〜600mm の対数スケールへ変換する。
4. 所有は実線 gradient、欲しいは dashed / pale gradient で表示する。

焦点距離推定:

- `extractFocal(name)` がレンズ名から推定する。
- zoom: `(\d+)[–\-](\d+)\s*mm`
- prime: `(\d+)\s*mm`

注意:

- 名前に焦点距離が含まれない場合、カバレッジには出ない。
- 変則表記やスペース違いで推定できない可能性がある。
- `focalMin` が `0` になるケースは想定されていない。

## `/warehouse-gallery` 統合時の注意点

### `warehouse` key を壊さない

既存ユーザーの保存済みレンズは `localStorage['warehouse']` にある。

統合時に避けるべきこと:

- key 名を突然変える。
- `id` をレンズDB安定IDとして扱う。
- `name` だけを別名に置換する。
- `type` の既定値を変える。
- `pros` / `cons` / `advice` / `aiComment` を捨てる。
- `focalMin` / `focalMax` を再計算して既存値を上書きする。

### 保存アイテムIDとレンズIDを混同しない

`id` は `Date.now()` 由来の保存アイテムID。

将来 stable lens ID を導入する場合も、既存 `id` は維持し、別 field を optional に追加する方が安全。

例:

```ts
stableLensId?: string
```

### `name` 照合に依存している

現在は `name` を使って `public/lens_data.json` / `public/lens_links.json` と照合している。

統合時に表示名を変更すると、価格、画像、購入リンク、レビューリンクが外れる可能性がある。

### `WarehouseList.tsx` の扱い

`WarehouseList.tsx` も同じ `warehouse` key を扱い、`memo` field を持つ。

現行 route で直接使われている箇所は今回の `rg` では確認できなかったが、過去導線や未使用コンポーネントの可能性がある。

統合前に次を決める必要がある。

- `WarehouseList.tsx` を廃止するか。
- `memo` field を正式 schema に含めるか。
- 現行 `/warehouse/page.tsx` に memo を取り込むか。

### SQLite warehouse API との関係

`/api/warehouse` と `data/warehouse.db` は localStorage `warehouse` と別系統。

`ChatInterface` の DOM 注入ボタンと `ProductCard` は API へ保存するが、現行 `/warehouse/page.tsx` はこのDBを読んでいない。

統合時に次を確認する必要がある。

- この API 経路は現役か、旧実装か。
- DB 倉庫と localStorage 倉庫を統合する必要があるか。
- API 経路を残す場合、ユーザーが保存先の違いで混乱しないか。

### `warehouseUpdated` event

localStorage 更新後に同一タブ内で通知する仕組みとして使われている。

統合時に保存処理を変える場合も、`ChatInterface` の件数表示や `/warehouse` の再読み込み挙動を壊さないよう、この event を維持または代替する必要がある。

## 未確認事項

- `WarehouseList.tsx` が現行本番導線でまだ使われているか。
- `/api/warehouse` / `data/warehouse.db` が現在どの導線で実利用されているか。
- 既存ユーザーの `warehouse` localStorage に、古い shape の item がどの程度残っているか。
- `memo` field を正式に残すべきか。
- `pros` / `cons` / `advice` / `aiComment` の抽出パターンが、現在の Dify回答形式とどの程度一致しているか。
- `public/lens_data.json` の `name` と保存済み `name` の不一致率。
- `focalMin` / `focalMax` が未設定の保存済み item の割合。
- `/warehouse-gallery` の demo `LENSES` shape と `warehouse` localStorage item shape の対応関係。

## 次に決めるべきこと

1. `/warehouse-gallery` 統合時も localStorage key は `warehouse` を維持するか。
2. `warehouse` item の正式 schema をどこまで広げるか。
   - `memo`
   - `stableLensId`
   - `imageUrl`
   - `source`
   - `updatedAt`
3. `id: number` を保存アイテムIDとして維持し、レンズDB安定IDは別 field にするか。
4. 既存 item の migration をいつ、どこで、どのタイミングで localStorage へ書き戻すか。
5. `/api/warehouse` / SQLite 倉庫を廃止、維持、統合のどれにするか。
6. `/warehouse-gallery` で本番データ接続 pilot を行う場合、まず読み取り専用にするか。
7. 焦点距離カバレッジを gallery へ移植する場合、既存 `focalMin` / `focalMax` をそのまま使うか。
8. 価格、購入リンク、レビューリンクは引き続き `public/lens_data.json` / `public/lens_links.json` の名前照合でよいか。

## Guardrails

- `warehouse` key の破壊的変更をしない。
- 既存 `id` を stable lens ID として扱わない。
- 保存済み `name` を勝手に正規化して上書きしない。
- localStorage migration は docs と手動確認なしに実行しない。
- `/warehouse-gallery` から本番 localStorage を直接書き換える前に、読み取り専用 pilot を検討する。
- API / Dify / recommendation logic / lens data 更新と倉庫統合を同時に行わない。
