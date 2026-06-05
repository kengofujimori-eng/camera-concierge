# Implement family scene guide inline detail

## Background

`/scene-playbooks` は、Scene Guide の card list と chooser intro まで実装済みである。

現在のカードは4件。

- 家族写真ガイド
- 発表会ガイド
- 運動会ガイド
- 旅行・おでかけガイド

`docs/scene-guide-detail-panel-plan.md` では、public beta 前の最小方針として inline expand で detail を小さく検証する方向を整理済み。

## Problem

card-only では、撮影シーンごとの失敗しやすい条件、最初に考えるべき判断、焦点距離の使い分け、レンズの役割までは読めない。

ただし、4件すべての detail、dedicated route、warehouse / chat 連携まで同時に進めると範囲が大きくなる。

## Direction

今回は `家族写真ガイド` だけに optional detail data を追加し、カード内で inline detail を開けるようにする。

Scene Guide detail は「家族写真という撮影シーンでどう選ぶか」を主語にする。Deep Review のようなレンズ単体評価には寄せない。

## Allowed files

- `docs/active-mission.md`
- `docs/current-task.md`
- `src/data/scenePlaybooks.ts`
- `src/components/ScenePlaybookCard.tsx`
- `src/app/scene-playbooks/page.tsx`

## Do not touch

- `src/components/Navbar.tsx`
- `src/app/warehouse/page.tsx`
- `src/components/ChatInterface.tsx`
- `src/components/LensRecommendationCards.tsx`
- `src/components/WarehouseList.tsx`
- `public/lens_data.json`
- API / Dify
- localStorage
- 推薦ロジック

## Do

- `ScenePlaybookDetail` 型を追加する。
- `ScenePlaybookCard` に `detail?: ScenePlaybookDetail` を optional で追加する。
- `family-photography` だけに detail data を入れる。
- `recital-stage`、`sports-day`、`travel-outing` は card-only のままにする。
- `relatedLensIds` は全件 `[]` のままにする。
- `ScenePlaybookCard` に `onOpen?: (id: string) => void` と `isOpen?: boolean` を追加する。
- detail があるカードだけ `撮影判断を見る` をクリック可能にする。
- page 側で1つだけ開く state を持つ。
- 既存 data-testid を維持し、detail 用 test id は追加のみで扱う。

## Do not

- 4件すべてに detail data を追加しない。
- `/scene-playbooks/[id]` は作らない。
- modal / drawer は作らない。
- warehouse / Deep Review / chat / API / Dify / localStorage に接続しない。
- `public/lens_data.json` を変更しない。
- `Navbar.tsx` を変更しない。
- `relatedLensIds` に仮IDを入れない。
- スコア、ランキング、点数表現を入れない。

## Checks

実装後に確認すること:

- `git status`
- `git diff`
- `npm run lint`
  - ESLint 未設定で対話式セットアップになる場合は、その旨を報告する。
- `npm run build`
- 可能なら `/scene-playbooks` をブラウザ確認する。
  - chooser intro が残っている。
  - 4枚カードが表示される。
  - 家族写真ガイドだけ `撮影判断を見る` で detail が開く。
  - もう一度押すと閉じる。
  - 他3件は detail 未実装として破綻しない。
  - モバイル幅で大きく崩れない。
  - ナビは `相談 / シーンガイド / 倉庫` のまま。

## Commit

推奨コミットメッセージ:

```txt
feat: add family scene guide inline detail
```
