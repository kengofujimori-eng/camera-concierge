# Scene Playbook card component plan

## 1. Purpose

Scene Playbook の最初の UI 実装前に、カードコンポーネント、表示場所、既存 warehouse / Deep Review UI との関係、最小実装範囲を整理する。

この docs は UI 実装ではなく、UI 実装前の設計メモである。

Scene Playbook は Lens Navi を「レンズレビューサイト」ではなく「撮影判断ナビ」に寄せるための入口になる。最初の UI では、長文の攻略本文ではなく、撮影シーンごとの判断カードを小さく表示することを優先する。

## 2. Current state

| Area | Current state | Notes for first UI |
| --- | --- | --- |
| `src/data/scenePlaybooks.ts` | card-only static data。`ScenePlaybookCard` 型と `scenePlaybooks` 3件がある。 | `family-photography`、`recital-stage`、`sports-day` をそのままカード表示に使える。 |
| `src/data/scenePlaybooks.ts` | `relatedLensIds` は3件とも空配列。 | stable_id 未導入のため、初期 UI では関連レンズ接続に使わない。 |
| `public/lens_data.json` | `stable_id` は未導入。 | Scene Playbook と lens data の接続は後段にする。 |
| warehouse | `localStorage("warehouse")` があり、item `id` は `Date.now()` 由来の保存ID。 | レンズ安定IDではないため、Scene Playbook 関連表示のキーには使わない。 |
| Deep Review | `src/app/warehouse/page.tsx` 内に `LensDeepReviewPanel` のモック / fallback UI がある。 | 主語はレンズ。Scene Playbook 本文を混ぜすぎない。 |
| Scene Playbook | UI未接続。 | まずは card list から始めるのが安全。 |

## 3. Component placement options

### Option A: `src/components/ScenePlaybookCard.tsx`

メリット:

* 汎用コンポーネントとして使いやすい
* 将来 `/scene-playbooks`, warehouse, chat で再利用しやすい
* 既存 components 配下の慣習に合う

注意:

* 最初から汎用化しすぎない
* props は `ScenePlaybookCard` 型をそのまま受ける程度でよい

### Option B: `src/app/scene-playbooks/_components/ScenePlaybookCard.tsx`

メリット:

* 専用ページ内に閉じられる
* 初期実装の影響範囲が小さい

注意:

* 後で warehouse / chat で使う場合に移動が必要になる
* App Router の構成確認が必要

### Option C: warehouse page 内にインライン実装

メリット:

* 既存 LensCard の近くで見た目を合わせやすい

注意:

* `src/app/warehouse/page.tsx` がさらに肥大化する
* Deep Review / Warehouse と Scene Playbook の主語が混ざる
* 初期実装としては避けたい

推奨:

* 最初は `src/components/ScenePlaybookCard.tsx` か、専用ページ内 `_components`。
* 長期的には再利用しやすい `src/components/ScenePlaybookCard.tsx` が有力。
* 既存 warehouse にインライン追加する案は後回し。

## 4. First display location options

### Option A: `/scene-playbooks` dedicated static page

推奨候補。

メリット:

* warehouse / localStorage に触らない
* Scene Playbook の主語が明確
* 3枚カードの見え方だけ検証できる
* 将来の専用ページ構想と合う
* Deep Review と混ざらない

注意:

* route / page を追加するため、公開導線をどうするか考える必要がある
* 最初は nav からリンクせず、直URL確認でもよい

### Option B: warehouse top section

メリット:

* 保存済みレンズとの関係が見えやすい

注意:

* warehouse card が情報過多になりやすい
* localStorage / saved lens context と混ざる
* 初期段階ではまだ早い

### Option C: Deep Review panel bottom

メリット:

* レンズ単体から関連シーンへ移動できる

注意:

* `relatedLensIds` / `stable_id` が未整備なのでまだ早い

### Option D: chat flow

メリット:

* Lens Navi の撮影判断ナビらしさが最も出る

注意:

* Dify / API / prompt が絡むため後回し

推奨:

* 最初は `/scene-playbooks` dedicated static page。
* ただしグローバル導線はまだ追加しない。
* UI確認後に warehouse / chat 連携を検討する。

## 5. Card visual direction

既存 UI 方針に合わせて、ScenePlaybookCard は静かな product UI として扱う。

前提:

* 白 / slate ベース
* Vercel / Linear 風のシンプルなプロダクトUI
* blue-violet → magenta は局所アクセントのみ
* 大きなグラデーション塗りは避ける
* full-screen purple haze / pastel fog / noisy neon は避ける
* 選択状態や hover は、薄いグラデーションアウトライン＋白/slate内面
* 既存 `data-testid` は壊さない

ScenePlaybookCard の見た目:

* 白ベースのカード
* 薄い slate border
* hover で薄い shadow / border 強調
* 小さなラベル: 撮影攻略
* title / headline
* `keyDecisions` を chip 表示
* `representativeFocalRanges` を chip 表示
* `primaryCaution` を小さな注意メモとして表示
* CTA は「攻略を見る」または「撮影判断を見る」
* スコア・ランキング・点数は出さない

既存 warehouse `LensCard` は gradient outline と白/slate内面を使っている。Scene Playbook でも質感は近づけてよいが、レンズカードと同じ情報密度にしない。Scene Playbook はシーン判断のカードであり、価格・画像・購入リンクは持たない。

## 6. Minimum card content

`ScenePlaybookCard` で表示する最小項目:

* `shortTitle`
* `title`
* `headline`
* `keyDecisions` から最大3件
* `representativeFocalRanges` から最大4件
* `mainLensRoles` から最大2〜3件
* `primaryCaution`
* `status` は初期 UI では小さく、または非表示

表示しない項目:

* 長文 detail
* sources
* future checks
* `relatedLensIds`
* TypeScript 型
* Deep Review 本文
* score / ranking

## 7. Props and behavior

初期コンポーネントの props 方針:

```ts
type ScenePlaybookCardProps = {
  playbook: ScenePlaybookCard
  onOpen?: (id: string) => void
}
```

初期挙動:

* まずは表示のみ
* `onOpen` は任意
* 詳細パネルはまだ実装しない
* card click はまだ不要でもよい
* CTA はボタン風に見せるだけでもよい
* 将来的に `/scene-playbooks/[id]` または detail panel に接続

## 8. Data-testid plan

E2E / 回帰確認のために、Scene Playbook 用の `data-testid` は追加のみで扱う。

候補:

* `scene-playbook-card`
* `scene-playbook-card-${id}`
* `scene-playbook-title-${id}`
* `scene-playbook-open-${id}`
* `scene-playbook-page`

注意:

* 既存 `data-testid` は変更しない
* 最初は追加のみ
* id に `/` や空白を入れない
* `scenePlaybooks.ts` の `id` をそのまま使える

既存で保護すべき代表例:

* `lens-card`
* `lens-card-image`
* `lens-card-placeholder`
* `price-badge`
* `chat-input`
* `chat-send-button`
* `assistant-answer`

## 9. First implementation scope

### Do

* `src/components/ScenePlaybookCard.tsx` 追加
* `/scene-playbooks` の静的ページ追加
* `scenePlaybooks` から3枚カードを表示
* 既存 UI 方針に合わせたカードデザイン
* build 確認
* 可能なら既存 e2e を壊していないか確認

### Do not

* warehouse に接続しない
* Deep Review panel に接続しない
* chat flow に接続しない
* Dify / API に接続しない
* `public/lens_data.json` を変更しない
* localStorage を変更しない
* `relatedLensIds` を使わない
* 詳細ページ / dynamic route は作らない
* stable_id は追加しない

## 10. Route and navigation

`/scene-playbooks` を作る場合の導線方針:

* 最初はページだけ追加し、ヘッダーやチャットからの導線は追加しない
* 直URLで確認できればよい
* 公開導線を出すのは、表示内容を確認してから

将来の導線候補:

* warehouse 上部
* `ChatInterface`
* `LensCard`
* Deep Review panel

`src/components/ChatInterface.tsx` には現在 `/warehouse` への導線がある。Scene Playbook も将来ここに並べる余地はあるが、初期実装では触らない。

## 11. Risks

* 専用ページを作ると、まだ未完成の機能が見える可能性
* warehouse に早く混ぜると情報過多になる
* Scene Playbook と Deep Review の違いが伝わりにくい
* `relatedLensIds` が空のため、レンズ連携はまだできない
* stable_id 未導入なので、関連表示は後回し
* card が長くなりすぎる
* mobile で chip が増えすぎる
* デザインが Deep Review と似すぎると主語の違いが曖昧になる
* 既存 e2e / `data-testid` を壊さないようにする

## 12. Recommended next steps

1. `scene-playbook-card-component-plan.md` を作成
2. 次フェーズで `src/components/ScenePlaybookCard.tsx` と `/scene-playbooks` を小さく実装
3. `scenePlaybooks` 3件を card-only 表示
4. build を確認
5. 既存 e2e を確認
6. UI確認後に、warehouse 接続または stable_id 追加へ進むか判断

## 13. Do not implement yet

この段階では以下を実装しない。

* `src/components/ScenePlaybookCard.tsx` はまだ作らない
* `/scene-playbooks` はまだ作らない
* warehouse page はまだ触らない
* Deep Review panel はまだ触らない
* Dify / API はまだ触らない
* `public/lens_data.json` はまだ触らない
* localStorage形式はまだ触らない
* stable_id はまだ追加しない
* `relatedLensIds` はまだ使わない
* 既存推薦ロジックはまだ触らない
