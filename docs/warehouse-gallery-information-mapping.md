# Warehouse gallery information mapping

## 1. 目的

`/warehouse-gallery` の詳細パネルに載せる情報を、現行の `/warehouse`、localStorage 倉庫、レンズデータ、レビューリンク、価格リンクの実装から整理する。

この docs は、Claude から提案された詳細パネルの情報写像案を、Lens Navi の正式な検討資料として扱うためのもの。今回の範囲は調査と設計整理のみで、コード、UI、localStorage、route、本番データ構造は変更しない。

## 2. 前提

- `/warehouse` は現行本番のレンズ倉庫である。
- `/warehouse-gallery` は次期倉庫候補の実験領域であり、現時点では本番倉庫・本番データ層・localStorage と接続しない。
- localStorage 倉庫の key は `warehouse`。
- `owned` / `wishlist` は将来ギャラリー側にも表示したいが、今回は接続しない。
- SQLite 倉庫系統は localStorage 倉庫とは別系統である。
- `/warehouse-gallery` の詳細導線文言は、将来 `/warehouse` を引退させる可能性を考慮し、旧倉庫依存の言い方に固定しない。
  - 推奨: `詳しく見る`、`詳細レビューを開く`、`深掘り導線`
  - 固定しない: `詳しくは倉庫で`
- 深い情報の現行表示は `/warehouse` 側にあるが、将来の正はデータ構造化後に決める。

## 3. 推奨タブ構成

`/warehouse-gallery` の詳細パネルは、次の4タブを基本形にする。

| タブ | 役割 | 初期表示向き |
| --- | --- | --- |
| AI解析 | なぜこのレンズを見る価値があるかを短く示す | 最初に開く |
| 基本情報 | 焦点距離、F値、重量、カテゴリなどの確認 | 常時またはタブ |
| 価格・購入 | 新品・中古価格と購入導線 | 折りたたみ可 |
| レビュー・作例 | 使いこなしレビュー、外部レビュー、作例導線 | 折りたたみ可 |

現行 `/warehouse-gallery` は `AI解析`、`価格・購入`、`レビュー・作例` の3タブをデモ実装している。将来本番統合するなら、`基本情報` はタブ化するか、詳細パネル上部の固定サマリーとして出す。

## 4. 各タブに入れる情報

### AI解析

候補情報:

- `recommendation_status`
- `recommendation_note`
- localStorage 倉庫の `pros`
- localStorage 倉庫の `cons`
- localStorage 倉庫の `advice`
- localStorage 倉庫の `aiComment`
- `/warehouse-gallery` デモの `ai`

写像案:

- 先頭に短い総括を置く。
- `recommendation_status` がある場合は、`recommend` / `caution` / `avoid` を UI バッジへ写像する。
- `recommendation_note` は本番レンズデータ由来の短い判断メモとして扱う。
- localStorage の `pros` / `cons` / `advice` / `aiComment` は、相談回答から抽出されたユーザー文脈つきの保存情報として扱う。
- `pros` / `cons` は Deep Review の `強み` / `注意` とは別物として扱う。

### 基本情報

候補情報:

- 焦点距離
- 開放F値
- 重量
- マウント
- カテゴリ
- フィルター径
- 最短撮影距離
- 最大撮影倍率
- 手ぶれ補正
- `model_code`
- `brand` / `maker`
- 画像URL

写像案:

- 詳細パネル上部には、焦点距離、開放F値、重量、マウントを優先して表示する。
- カテゴリやフィルター径などは、基本情報タブの中で小さな spec grid にする。
- `public/lens_data.json` には `weight`、`mount`、`supported_mounts`、画像URL、価格・リンク系フィールドがある。
- `/warehouse-gallery` の現行デモは `focal`、`aperture`、`weight`、`mount` をハードコードしている。

### 価格・購入

候補情報:

- `price_info.new_price`
- `price_info.used_price`
- `price_info.fetched_at`
- `purchase_links.new.amazon`
- `purchase_links.new.rakuten`
- `purchase_links.new.yahoo`
- `purchase_links.used.kitamura`
- `purchase_links.used.mapcamera`
- フォールバック検索リンク

写像案:

- 新品価格と中古価格を上段に表示する。
- 購入リンクは `Amazon`、`楽天`、`Yahoo`、`キタムラ`、`MapCamera` を候補にする。
- affiliate / PR 表記は維持する。
- 価格がない場合は `-` ではなく、控えめな `価格未取得` 表示にする案を検討する。
- `data/kakaku_id_map.json` と `public/price_history.json` は現時点で中身が空のため、今回の詳細パネル写像では主データ源にしない。

### レビュー・作例

候補情報:

- `review_links`
- `photo_yodobashi_url`
- Google 作例検索
- `model_code` を使った作例検索
- 使いこなしレビュー総括
- 強み
- 注意
- 解像
- ボケ
- 収差
- 周辺減光
- 逆光
- 比較
- サイズ重量
- 根拠

写像案:

- 外部レビューリンクと作例導線は `review_links` と `model_code` から構成する。
- 使いこなしレビューは、現時点では `/warehouse` 内の固定サンプル UI が唯一のまとまった表示実装である。
- 将来本番化する場合、`一言でいうと`、`強み`、`注意`、解像、ボケ、収差、周辺減光、逆光、比較、サイズ重量、根拠は、コンポーネント内固定値ではなく構造化フィールドへ移す必要がある。
- UI文言は旧倉庫依存に固定せず、`詳細レビューを開く`、`深掘りする`、`比較レビューを見る` などの中立表現を使う。

## 5. 初期表示する情報と畳む情報

初期表示に向く情報:

- レンズ名
- 画像
- マウント
- 焦点距離
- 開放F値
- 重量
- 新品 / 中古価格の概要
- AI解析の一言要約
- `owned` / `wishlist` の読み取り専用バッジ

畳む情報:

- 購入リンク一覧
- 外部レビューリンク一覧
- 作例検索リンク
- 使いこなしレビューの詳細セクション
- 解像 / ボケ / 収差 / 逆光 / 比較 / 根拠などの長文
- AI解析の長い補足

詳細パネルは、まず「このレンズが何者か」を短く理解させ、購入・レビュー・使いこなしは必要な時だけ開く構成がよい。

## 6. owned / wishlist 状態表示案

将来 `/warehouse-gallery` を localStorage 倉庫へ接続する場合、詳細パネル上部に読み取り専用バッジとして表示する。

表示案:

- `所有`
- `欲しい`
- `未保存`

第1段階:

- localStorage `warehouse` から該当レンズ名を照合し、状態を読むだけにする。
- 詳細パネル上部に小さな状態バッジを置く。
- この段階ではトグル操作を入れない。

第2段階以降:

- `所有` / `欲しい` の切り替え操作を検討する。
- 既存 localStorage 形式を壊さない。
- `warehouseUpdated` event の扱いを `/warehouse` と揃える。
- レンズ名照合の曖昧さを解消するため、stable_id pilot 後に本格接続するのが望ましい。

## 7. 現行データ確認

### 結論

`一言でいうと` / `強み` / `注意` は、現行データファイル上の正式な構造化フィールドとしては確認できない。

ただし、`src/app/warehouse/page.tsx` の `LensDeepReviewPanel` 内に、`Sony FE 50mm F1.4 GM` 用の固定サンプルとして次のローカル構造がある。

| 表示内容 | 現行実装上のフィールド | 現行の場所 | 正式データ化状況 |
| --- | --- | --- | --- |
| 一言でいうと | `verdict` | `LensDeepReviewPanel` の固定サンプル | 未データ化 |
| 強み | `strengthSummary` | `LensDeepReviewPanel` の固定サンプル | 未データ化 |
| 注意 | `cautionSummary` | `LensDeepReviewPanel` の固定サンプル | 未データ化 |
| 解像 | `resolution` | `LensDeepReviewPanel` の固定サンプル | 未データ化 |
| ボケ | `bokeh` | `LensDeepReviewPanel` の固定サンプル | 未データ化 |
| 収差 | `rendering` | `LensDeepReviewPanel` の固定サンプル | 未データ化 |
| 周辺減光 / 逆光 | `vignettingBacklight` | `LensDeepReviewPanel` の固定サンプル | 未データ化 |
| 比較 | `comparison` | `LensDeepReviewPanel` の固定サンプル | 未データ化 |
| サイズ重量 | `sizeWeight` | `LensDeepReviewPanel` の固定サンプル | 未データ化 |
| 根拠 | `sources` | `LensDeepReviewPanel` の固定サンプル | 未データ化 |

### `public/lens_data.json`

確認できた構造化フィールド:

- `recommendation_status`
- `recommendation_note`
- `price_info`
- `purchase_links`
- `review_links`
- `weight`
- `image_url`
- `image_url_external`
- `availability_status`
- `discontinued`

確認できなかった構造化フィールド:

- `verdict`
- `strengthSummary`
- `cautionSummary`
- `resolution`
- `bokeh`
- `rendering`
- `vignettingBacklight`
- `comparison`
- `sizeWeight`
- `sources`

### `public/lens_links.json`

確認できた構造化フィールド:

- `source_url`
- `review_links`
- `review_links[].site`
- `review_links[].url`
- `review_links[].label`

使いこなしレビュー本文や、`一言でいうと` / `強み` / `注意` の本文は持っていない。

### localStorage `warehouse`

確認できた保存フィールド:

- `id`
- `name`
- `addedAt`
- `type`
- `tag`
- `pros`
- `cons`
- `advice`
- `aiComment`
- `focalMin`
- `focalMax`
- `memo` は `WarehouseList` 系で扱いあり

`pros` / `cons` / `advice` / `aiComment` は相談回答から抽出された保存メモであり、Deep Review の構造化レビューとは別扱いにする。

### `data/kakaku_id_map.json` / `public/price_history.json`

現時点では空データとして確認した。価格履歴や kakaku ID に基づく詳細パネル写像は、今回の主対象にしない。

## 8. `/warehouse-gallery` 側で今すぐ磨けるUI改善点

本番データ接続をしなくても磨ける範囲:

- 詳細パネルの4タブ構成を前提にしたレイアウト整理
- `基本情報` 相当の spec grid をデモデータで追加検討
- `AI解析` の文字量を短くし、要点と補足を分離
- `価格・購入` で新品 / 中古 / PR 表記の視認性を整える
- `レビュー・作例` の placeholder を中立表現にする
- `詳しく見る` や `詳細レビューを開く` のような将来互換の文言へ寄せる
- 詳細パネル上部に `所有` / `欲しい` の読み取り専用バッジを置く余白だけ設計する

まだやらない方がよいこと:

- localStorage `warehouse` への接続
- `owned` / `wishlist` の書き込みトグル
- `/warehouse` から `/warehouse-gallery` への route 統合
- 本番 lens_data 構造の変更
- 使いこなしレビューの新データ構造追加

## 9. まだ触ってはいけない領域

- `/warehouse` の現行本番挙動
- localStorage key `warehouse`
- localStorage 保存形式
- `owned` / `wishlist` の保存・更新処理
- `warehouseUpdated` event の既存挙動
- `public/lens_data.json`
- `public/lens_links.json`
- `public/price_history.json`
- `data/kakaku_id_map.json`
- SQLite warehouse API / DB
- API / Dify
- 推薦ロジック
- purchase links / affiliate logic
- route 統合
- data-testid

## 10. 未確認事項

- `LensDeepReviewPanel` の固定サンプルを、将来どのデータファイルまたはAPIに移すか。
- `一言でいうと` / `強み` / `注意` を全レンズへ付与するか、主要レンズ pilot から始めるか。
- `pros` / `cons` / `advice` / `aiComment` と Deep Review structured fields を UI 上でどう区別するか。
- レンズ名照合だけで `/warehouse-gallery` と localStorage `warehouse` を接続してよいか。
- stable_id 導入前に `owned` / `wishlist` を `/warehouse-gallery` へ出す場合の誤照合リスク。
- `public/lens_links.json` と `public/lens_data.json` の `review_links` をどちらに寄せるか。
- `price_history.json` と kakaku ID を将来使うか。
- 作例導線を Photo Yodobashi / Google 検索に留めるか、専用 source list を作るか。

## 11. 次に決めるべきこと

1. `/warehouse-gallery` 詳細パネルの第1段階を、デモデータのまま4タブ構成へ整えるか。
2. localStorage `warehouse` へ接続する前に stable_id pilot を先に進めるか。
3. `owned` / `wishlist` はまず読み取り専用バッジだけにするか。
4. 使いこなしレビューの構造化フィールドを、どの最小schemaで始めるか。
5. Deep Review 比較 hooks と、倉庫詳細レビューの情報単位を揃えるか。
6. `/warehouse` と `/warehouse-gallery` の統合判断を、どの合格ラインで行うか。

推奨順序:

1. `/warehouse-gallery` の詳細パネル UI をデモデータのまま4タブ前提で磨く。
2. stable_id pilot を主要 Sony FE レンズから始める。
3. `owned` / `wishlist` を読み取り専用バッジとして試す。
4. 使いこなしレビューの最小 structured schema を1本だけ pilot する。
5. localStorage 接続と route 統合は、既存ユーザーデータを壊さない確認が済んでから行う。
