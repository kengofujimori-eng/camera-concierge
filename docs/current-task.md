# Add sports-day scene guide detail

## Background

`/scene-playbooks` は、Scene Guide の card list、chooser intro、家族写真ガイド、発表会ガイドの inline detail まで実装済みである。

現在のカードは4件。

- 家族写真ガイド
- 発表会ガイド
- 運動会ガイド
- 旅行・おでかけガイド

`family-photography` と `recital-stage` が `detail` data を持ち、`sports-day` と `travel-outing` は card-only のまま。

## Problem

Scene Guide detail の挙動は家族写真ガイドと発表会ガイドで確認できた。次は、屋外イベントで距離変化、動体、重量、ズームの安全性が問題になる運動会でも、同じ最小 detail 型で撮影判断を表現できるかを確認したい。

## Direction

今回は `sports-day` にだけ optional detail data を追加する。

既存の `ScenePlaybookDetail` 型と inline detail UI をそのまま使う。UI component、page、Navbar、lens data、warehouse、chat、API / Dify、localStorage は触らない。

## Allowed files

- `docs/active-mission.md`
- `docs/current-task.md`
- `src/data/scenePlaybooks.ts`

## Do not touch

- `src/components/ScenePlaybookCard.tsx`
- `src/app/scene-playbooks/page.tsx`
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

- `sports-day` に `detail` data を追加する。
- 既存の `ScenePlaybookDetail` 型を使う。
- 家族写真 / 発表会 detail は変更しない。
- 旅行は card-only のままにする。
- `relatedLensIds` は全件 `[]` のままにする。
- スコアやランキングではなく、距離、動き、構図変更、重量、歩留まりの判断として書く。

## Do not

- `ScenePlaybookCard.tsx` を変更しない。
- `page.tsx` を変更しない。
- 4件すべてに detail を追加しない。
- 旅行に detail を追加しない。
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
  - 家族写真ガイドが detail 展開できる。
  - 発表会ガイドが detail 展開できる。
  - 運動会ガイドが detail 展開できる。
  - detail は同時に複数開かず、1つだけ開く。
  - 旅行・おでかけガイドは `今は要点のみ` のまま。
  - モバイル幅で横はみ出しや大きな崩れがない。
  - ナビは PC で `相談 / シーンガイド / 倉庫`、モバイルで `相談 / シーン / 倉庫` のまま。

## Commit

推奨コミットメッセージ:

```txt
feat: add sports-day scene guide detail
```
