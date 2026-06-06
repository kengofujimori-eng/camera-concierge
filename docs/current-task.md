# Make scene guide chooser interactive

## Background

`/scene-playbooks` は、Scene Guide の card list、chooser intro、inline detail まで実装済みである。

現在のカードは4件。

- 家族写真ガイド
- 発表会ガイド
- 運動会ガイド
- 旅行・おでかけガイド

主要3シーンは detail 対応済み。

- `family-photography`
- `recital-stage`
- `sports-day`

`travel-outing` は card-only のまま。既存の inline detail は1つだけ開く state 管理になっている。

## Problem

上部の「どのガイドを見るべき？」は選択 UI に見えるが、現在は静的表示である。

ユーザーが撮りたい場面に近い項目を押したとき、対応するガイドへ進めるようにしたい。主要3シーンは detail を開き、旅行・おでかけは card-only のままカードへ誘導する。

## Direction

chooser intro の4項目を button として機能させる。

フィルターで他カードを非表示にはしない。4枚カード一覧は維持し、選択中のカードを控えめに強調する。warehouse / Deep Review / chat / API / Dify / localStorage とは接続しない。

## Allowed files

- `docs/active-mission.md`
- `docs/current-task.md`
- `src/app/scene-playbooks/page.tsx`
- `src/components/ScenePlaybookCard.tsx`

## Do not touch

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

- chooser intro の4項目をクリック可能にする。
- 家族写真 / 発表会 / 運動会はクリックで detail を開く。
- 旅行・おでかけは detail を開かず、card-only のまま自然に誘導する。
- 既存4枚カード表示を維持する。
- 既存 detail open の1つだけ開く挙動を維持する。
- 選択中のカードが分かるように控えめに強調する。
- 既存の `data-testid` を維持し、chooser button 用の `data-testid` は追加のみとする。
- build を通す。

## Do not

- 新しい Scene Guide card を追加しない。
- travel detail を追加しない。
- `scenePlaybooks.ts` の data structure を変更しない。
- `/scene-playbooks/[id]` は作らない。
- modal / drawer は作らない。
- warehouse / Deep Review / chat / API / Dify / localStorage に接続しない。
- `public/lens_data.json` を変更しない。
- `Navbar.tsx` を変更しない。
- スコア、ランキング、点数表現を入れない。
- 大きな UI 再設計をしない。

## Checks

実装後に確認すること:

- `git status`
- `git diff`
- `npm run lint`
  - ESLint 未設定で対話式セットアップになる場合は、その旨を報告する。
- `npm run build`
- 可能なら `npm run db:check`
- `npm run test:e2e`
  - Playwright Chromium 未インストールで失敗する既知状態なら、その旨を報告する。
- 可能なら `/scene-playbooks` をブラウザ確認する。
  - chooser の4項目がクリック可能に見える。
  - 家族写真を押すと家族写真 detail が開く。
  - 発表会を押すと発表会 detail が開く。
  - 運動会を押すと運動会 detail が開く。
  - 旅行を押しても破綻せず、旅行カードが card-only として自然に見える。
  - detail は同時に複数開かず、1つだけ開く。
  - 4枚カード一覧は維持される。
  - モバイル幅で横はみ出しや大きな崩れがない。
  - ナビは PC で `相談 / シーンガイド / 倉庫`、モバイルで `相談 / シーン / 倉庫` のまま。

## Commit

推奨コミットメッセージ:

```txt
feat: make scene guide chooser interactive
```
