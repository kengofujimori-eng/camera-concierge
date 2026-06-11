# Implement recital scene guide interactive v1

## Background

Scene Guide は、条件を選んで候補が絞られる「撮影判断ナビ」へ発展中である。

家族写真ガイドは室内 / 屋外の interactive decision flow に対応済み。一方、発表会ガイドは座席、会場、狙いによって候補が大きく変わるが、現在は読み物型 detail のままである。

## Problem

- 発表会の条件差が文章を読まないと分かりにくい。
- 85mm / 135mm / 70-200mm / 200mm以上の役割が、選んだ条件に応じて変わる体感がない。
- 情報量が多く、ユーザーが最初に何を選べばよいか分かりにくい。

## Direction

`recital-stage` に optional な複数条件 decision flow data を追加し、発表会ガイド内で次の3条件を選べるようにする。

- 座席位置: 前方席 / 中央席 / 後方席
- 会場サイズ: 小ホール / 体育館 / 大ホール
- 狙い: 全身も残したい / 表情を切り出したい

選択結果として、主候補 / 次点候補 / 安全策 / 理由 / 注意点を表示する。家族写真の既存 `decisionFlow` は変更しない。

## Allowed files

- `docs/active-mission.md`
- `docs/current-task.md`
- `src/components/ScenePlaybookCard.tsx`
- `src/data/scenePlaybooks.ts`
- 必要な場合のみ `src/app/scene-playbooks/page.tsx`

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

- 発表会ガイドで3条件を選べるようにする。
- 初期値を `中央席 / 小ホール / 表情を切り出したい` にする。
- 条件変更時に主候補 / 次点候補 / 安全策 / 理由 / 注意点を即時更新する。
- 家族写真 interactive、運動会 detail、旅行 card-only を維持する。
- `relatedLensIds` を全件空配列のまま維持する。
- build を通す。

## Do not

- 相談への handoff、Deep Review、Lens Condition Resolver を実装しない。
- 運動会を interactive 化しない。
- 旅行 detail や新しい Scene Guide card を追加しない。
- warehouse / chat / API / Dify / localStorage / `public/lens_data.json` を変更しない。
- スコア、ランキング、点数表現を入れない。

## Checks

実装後に確認すること:

- `git status`
- `git diff`
- `npm run lint`
  - ESLint 未設定で対話式セットアップになる場合は、その旨を報告する。
- `npm run build`
- `npm run db:check`
- `npm run test:e2e`
  - Playwright Chromium 未インストールで失敗する場合は、正確なエラーを報告する。
- `/scene-playbooks` をブラウザ確認する。
  - 発表会ガイドの3条件を切り替えられる。
  - 初期状態が `中央席 / 小ホール / 表情を切り出したい`。
  - 条件変更で候補と説明が切り替わる。
  - 家族写真、運動会、旅行の既存表示が壊れていない。
  - mobile 幅で横はみ出しがない。

## Commit

推奨コミットメッセージ:

```txt
feat: add recital scene guide interactive flow
```
