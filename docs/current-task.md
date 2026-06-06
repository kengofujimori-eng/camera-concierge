# Make scene guide chooser filter cards

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

上部の「どのガイドを見るべき？」は button 化済みだが、現在は4枚カードが常時表示される。

detail を展開すると情報量が増えやすいため、公開β前の体験としては、ユーザーが chooser で選んだガイドだけを表示し、必要最低限の情報から読み進める形式にしたい。

## Direction

chooser intro の4項目を、選択したカードだけを表示するフィルター入口として機能させる。

初期状態では4枚カードを表示する。chooser で主要3シーンを選んだ場合は該当カードだけを表示し、detail を自動で開く。旅行・おでかけを選んだ場合は旅行カードだけを表示し、detail は開かず card-only の状態を保つ。

「すべてのガイドを見る」で4枚一覧に戻す。

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
- 初期状態では4枚カードを表示する。
- chooser 選択時は選択したカードだけ表示する。
- 家族写真 / 発表会 / 運動会は chooser 選択時に detail を自動で開く。
- 旅行・おでかけは card-only のまま選択表示する。
- `すべてのガイドを見る` または `一覧に戻る` 導線を追加する。
- カード本体の `撮影判断を見る` による開閉挙動を維持する。
- 既存 detail open の1つだけ開く挙動を維持する。
- 既存の `data-testid` を維持し、必要な `data-testid` は追加のみとする。
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
  - 初期状態で4枚カードが表示される。
  - chooser の4項目がクリック可能に見える。
  - 家族写真を押すと家族写真カードだけになり detail が開く。
  - 発表会を押すと発表会カードだけになり detail が開く。
  - 運動会を押すと運動会カードだけになり detail が開く。
  - 旅行を押すと旅行カードだけになり `要点のみ表示中` のままである。
  - `すべてのガイドを見る` で4枚一覧に戻る。
  - カード本体の開閉挙動が壊れていない。
  - モバイル幅で横はみ出しや大きな崩れがない。
  - ナビは PC で `相談 / シーンガイド / 倉庫`、モバイルで `相談 / シーン / 倉庫` のまま。

## Commit

推奨コミットメッセージ:

```txt
feat: make scene guide chooser filter cards
```
