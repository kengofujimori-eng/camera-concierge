# Rename scene playbook UI copy from攻略 toガイド

## Background

Scene Playbook は、ゲーム的な「攻略本」ではなく、撮影シーンからレンズ選びの判断軸を整理するためのガイドである。

ナビはすでに `シーンガイド` に整理済み。一方で `/scene-playbooks` ページやカード内に `攻略` 表現が残っており、UI 上のトーンが少しチグハグになっている。

## Problem

UI 上で以下のような表現が残っている。

- `撮影シーン攻略`
- `家族写真攻略`
- `発表会攻略`
- `運動会攻略`
- `撮影攻略`

Lens Navi の現在のプロダクトトーンでは、強い「攻略」よりも、撮影判断を落ち着いて支える「ガイド」の方が合う。

## Direction

UI に出る文言を中心に、`攻略` 表現を `ガイド` 表現へ寄せる。

変更方針:

- `撮影シーン攻略` → `撮影シーンガイド`
- `家族写真攻略` → `家族写真ガイド`
- `発表会攻略` → `発表会ガイド`
- `運動会攻略` → `運動会ガイド`
- `撮影攻略` → `撮影ガイド`

`Scene Playbook` という英語ラベルは維持してよい。

## Allowed files

- `docs/active-mission.md`
- `docs/current-task.md`
- `src/app/scene-playbooks/page.tsx`
- `src/components/ScenePlaybookCard.tsx`
- `src/data/scenePlaybooks.ts`

## Do not touch

- `src/components/Navbar.tsx`
- `src/app/warehouse/page.tsx`
- `src/components/ChatInterface.tsx`
- `src/components/LensRecommendationCards.tsx`
- `src/components/WarehouseList.tsx`
- `public/lens_data.json`
- localStorage 関連処理
- API / Dify
- 推薦ロジック
- 既存 docs の大幅編集

## Do

- UI 上に出る Scene Playbook 周辺コピーを `ガイド` 表現に寄せる。
- `src/data/scenePlaybooks.ts` の `title` だけを変更する。
- `id`、`sceneType`、`relatedLensIds`、型定義、helper は変更しない。
- `Navbar.tsx` はナビがすでに `シーンガイド` で整っているため触らない。
- docs は active mission と current task の更新に留める。

## Do not

- docs 内の歴史的な設計文脈としての「攻略」を無理に全置換しない。
- `攻略` をナビに再導入しない。
- ルーティング、active 表示、data-testid は変更しない。
- warehouse / chat / Deep Review / API / Dify / localStorage / 推薦ロジックは変更しない。
- `relatedLensIds` や data structure は変更しない。

## Checks

実装後に確認すること:

- `git status`
- `git diff`
- `npm run lint`
  - ESLint 未設定で対話式セットアップになる場合は、その旨を報告する。
- `npm run build`
- 可能ならブラウザで `/scene-playbooks` を確認する。
  - H1 が `撮影シーンガイド`
  - カードタイトルが `家族写真ガイド` / `発表会ガイド` / `運動会ガイド`
  - 小ラベルが `撮影ガイド`
  - ナビは `相談 / シーンガイド / 倉庫` のまま

## Commit

推奨コミットメッセージ:

```txt
refactor: align scene guide copy
```
