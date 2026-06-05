# Fix mobile navbar layout for scene guide

## Background

Lens Navi では、`相談` / `シーンガイド` / `倉庫` の3導線をグローバルナビに追加済み。

Scene Playbook は `/scene-playbooks` で初期 UI 化されており、現在はアプリ内ナビから移動できる。

## Problem

モバイル表示で `相談 / シーン / 倉庫` の並びがチグハグに見えている。

特に `シーン` は横幅の都合で中途半端に見えやすく、ナビ全体が Lens Navi のロゴ文字を圧迫している。

## Direction

モバイルでは、ナビ項目をアイコン上、ラベル下の2段表示にする。

PC では既存に近い横並び表示を維持する。

表示方針:

- PC: `相談 / シーンガイド / 倉庫`
- モバイル: アイコン上、ラベル下の `相談 / シーン / 倉庫`
- `/scene-playbooks` へのリンクは維持する。
- active 表示、グラデーション枠、既存トーンは維持する。
- Lens Navi ロゴ横のサブタイトルはモバイルでは非表示にする。

## Allowed files

- `src/components/Navbar.tsx`
- `docs/active-mission.md`
- `docs/current-task.md`

## Do not touch

- `src/app/scene-playbooks/page.tsx`
- `src/components/ScenePlaybookCard.tsx`
- `src/data/scenePlaybooks.ts`
- `src/app/warehouse/page.tsx`
- `src/components/ChatInterface.tsx`
- `public/lens_data.json`
- localStorage 関連処理
- API / Dify
- 推薦ロジック

## Do

- `Navbar.tsx` のみでモバイルナビを調整する。
- PC 表示は `相談 / シーンガイド / 倉庫` を維持する。
- モバイル表示は `相談 / シーン / 倉庫` を2段表示にする。
- `whitespace-nowrap` などで文字割れを防ぐ。
- active 表示は既存のグラデーション枠と白 / slate 内面を維持する。
- 既存 data-testid があれば変更しない。

## Do not

- `相談` を `チャット` に変えない。
- `倉庫` を `キャビネット` に変えない。
- `攻略` という語は使わない。
- `/scene-playbooks` ページ本体は変更しない。
- Scene Playbook data や warehouse / chat / Deep Review には接続しない。
- localStorage / API / Dify / 推薦ロジックは変更しない。

## Checks

実装後に確認すること:

- `git status`
- `git diff`
- `npm run lint`
  - ESLint 未設定で対話式セットアップになる場合は、その旨を報告する。
- `npm run build`
- 可能ならブラウザで確認する。
  - PC: `相談 / シーンガイド / 倉庫`
  - モバイル: アイコン上、文字下の `相談 / シーン / 倉庫`
  - Lens Navi ロゴが圧迫されすぎない
  - `/scene-playbooks` に遷移できる

## Commit

推奨コミットメッセージ:

```txt
fix: improve mobile navbar layout
```
