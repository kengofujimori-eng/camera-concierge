# Plan scene guide detail panel

## Background

`/scene-playbooks` は、Scene Guide の card-only 初期 UI として表示されている。

現在は chooser intro と4枚の card list があり、家族写真、発表会、運動会、旅行・おでかけの入口として機能している。

## Problem

card-only では、撮影シーンごとの失敗しやすい条件、まず考えるべき判断、焦点距離の使い分け、レンズ役割の深い説明までは伝えきれない。

一方で、public beta 前に dedicated route や warehouse / chat 連携まで広げると実装範囲が大きくなる。

## Direction

今回はコード実装をせず、Scene Guide detail panel の設計 docs を作成する。

設計では、Deep Review と Scene Guide detail の主語の違いを明確にする。

- Deep Review: このレンズをどう使うか
- Scene Guide detail: この撮影シーンでどう選ぶか

## Allowed files

- `docs/active-mission.md`
- `docs/current-task.md`
- `docs/scene-guide-detail-panel-plan.md`

## Do not touch

- `src/app/scene-playbooks/page.tsx`
- `src/components/ScenePlaybookCard.tsx`
- `src/data/scenePlaybooks.ts`
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

- `docs/scene-guide-detail-panel-plan.md` を新規作成する。
- detail display options を比較する。
- public beta 前の推奨案として inline expand を整理する。
- minimum detail fields と optional detail data の型候補を書く。
- UI behavior、visual direction、implementation phases、guardrails を整理する。
- 既存 card-only data と stable_id 未導入の制約を前提に書く。

## Do not

- UI 実装をしない。
- `scenePlaybooks.ts` に detail field を追加しない。
- `ScenePlaybookCard.tsx` に `onOpen` 実装を追加しない。
- route `/scene-playbooks/[id]` を作らない。
- warehouse / Deep Review / chat / API / Dify / localStorage へ接続しない。
- `relatedLensIds` を使った関連レンズ接続を進めない。
- スコア、ランキング、点数表現を入れない。

## Checks

実装後に確認すること:

- `git status`
- `git diff`
- `npm run build`
- docs only なので lint は任意。
  - 実行する場合、ESLint 未設定で対話式セットアップになるならその旨を報告する。
- 許可された docs 以外を変更していないことを確認する。

## Commit

推奨コミットメッセージ:

```txt
docs: plan scene guide detail panel
```
