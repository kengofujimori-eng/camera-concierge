# Make family scene guide decision flow interactive

## Background

`/scene-playbooks` は chooser、4枚の Scene Guide card、主要3シーンの inline detail まで実装済みである。

家族写真ガイドは、共通前提、室内 / 屋外の分岐、焦点距離候補、総評、注意点を持つ decision flow に整理済み。ただし現在は2つの分岐を同時に表示する静的な読み物で、条件を選ぶと候補が絞られる体験にはなっていない。

Lens Navi を「撮影判断ナビ」へ寄せるため、まず家族写真ガイドだけで interactive decision flow を検証する。

## Problem

- 室内と屋外の候補が同時に見えるため、35mm / 50mm / 85mm / 135mm の優先度差を体感しにくい。
- ユーザーの撮影条件に合う候補だけへ絞り込めない。
- decision flow が、まだ静的な説明カードに見える。

## Direction

家族写真ガイドの detail 内に、`室内で撮る` / `屋外で撮る` の条件選択を追加する。

条件を選ぶと、その branch の候補2本、総評、注意点だけを表示する。初期状態は分かりやすさを優先し、最初の branch である `室内で撮る` を選択済みにする。

`decisionFlow.branches` を使う汎用的な UI とし、発表会 / 運動会の従来 detail、旅行・おでかけの card-only 表示は維持する。

## Allowed files

- `docs/active-mission.md`
- `docs/current-task.md`
- `src/components/ScenePlaybookCard.tsx`
- 必要な場合のみ `src/app/scene-playbooks/page.tsx`
- 必要な場合のみ `src/data/scenePlaybooks.ts`

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

- 家族写真 decision flow で室内 / 屋外を選択できるようにする。
- 選択した branch の候補だけを強く表示する。
- 条件に合う短い総評と注意点を表示する。
- 選択中の条件を控えめな border / violet accent で示す。
- 既存の chooser、カード絞り込み、1つだけ detail を開く挙動、選択時全幅化、`data-testid` を維持する。
- 発表会 / 運動会の従来 detail 表示を維持する。
- build を通す。

## Do not

- 発表会 / 運動会を interactive 化しない。
- 旅行 detail や新しい Scene Guide card を追加しない。
- `/scene-playbooks/[id]`、modal、drawer を作らない。
- warehouse / Deep Review / chat / API / Dify / localStorage に接続しない。
- `public/lens_data.json` や `Navbar.tsx` を変更しない。
- スコア、ランキング、点数表現を入れない。
- Scene Guide 全体を大きく再設計しない。

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
- 可能なら `/scene-playbooks` をブラウザ確認する。
  - 家族写真ガイドで室内 / 屋外を選べる。
  - 室内選択時は35mm / 50mmだけが中心に見える。
  - 屋外選択時は85mm / 135mmだけが中心に見える。
  - 条件ごとの総評と注意点が切り替わる。
  - 発表会 / 運動会 detail が従来どおり表示される。
  - 旅行・おでかけは card-only のまま。
  - モバイル幅で横はみ出しや大きな崩れがない。

## Commit

推奨コミットメッセージ:

```txt
feat: make family scene guide interactive
```
