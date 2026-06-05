# Scene guide public beta polish

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

`travel-outing` は card-only のまま。warehouse / Deep Review / chat / API / Dify / localStorage とは未接続で、stable_id 未導入のため `relatedLensIds` は全件空配列である。

## Problem

公開β前の画面として見ると、`初期モック` のような表現は弱く見える。

Scene Guide はまだ warehouse / chat と接続していないが、単体の撮影判断ガイドとしては主要3シーンを読める状態になっている。現在地に合わせて、ページ文言、card-only の状態表示、CTA の見え方を小さく整えたい。

## Direction

今回は新機能追加ではなく、公開β前の polish として `/scene-playbooks` の文言と表示状態を整える。

大きな UI 再設計はしない。Scene Guide は、スコアやランキングではなく、撮影条件ごとの判断を見せる入口として扱う。

## Allowed files

- `docs/active-mission.md`
- `docs/current-task.md`
- `src/app/scene-playbooks/page.tsx`
- `src/components/ScenePlaybookCard.tsx`

文言誤字や明らかな表現調整が必要な場合のみ、`src/data/scenePlaybooks.ts` を触ってよい。ただし新しい detail data や新しいカードは追加しない。

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

- `/scene-playbooks` の公開β前文言を自然にする。
- `初期モック` 表現が残っていれば見直す。
- detail 対応済み / card-only の状態が自然に見えるようにする。
- 旅行・おでかけは card-only のままにする。
- 既存の `data-testid` を維持する。
- build を通す。

## Do not

- travel detail を追加しない。
- 新しい Scene Guide card を追加しない。
- `scenePlaybooks.ts` の構造変更をしない。
- `/scene-playbooks/[id]` は作らない。
- modal / drawer は作らない。
- warehouse / Deep Review / chat / API / Dify / localStorage に接続しない。
- `public/lens_data.json` を変更しない。
- `Navbar.tsx` を変更しない。
- `relatedLensIds` に仮IDを入れない。
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
  - chooser intro が残っている。
  - 4枚カードが表示される。
  - 家族写真 / 発表会 / 運動会 が detail 展開可能に見える。
  - 旅行・おでかけが card-only として自然に見える。
  - `初期モック` という表現が残っていない。
  - モバイル幅で横はみ出しや大きな崩れがない。
  - ナビは PC で `相談 / シーンガイド / 倉庫`、モバイルで `相談 / シーン / 倉庫` のまま。

## Commit

推奨コミットメッセージ:

```txt
refactor: polish scene guide for public beta
```
