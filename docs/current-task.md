# Redesign family scene guide as decision flow

## Background

`/scene-playbooks` は chooser、4枚の Scene Guide card、主要3シーンの inline detail まで実装済みである。

現在の inline detail は、失敗しやすいこと、判断軸、焦点距離、レンズの役割、結論を一度に表示する。情報は揃っているが、家族写真で何を選べばよいかを短時間で判断しにくく、読み物として重く見えやすい。

Lens Navi はレビューサイトではなく「撮影判断ナビ」であるため、まず家族写真ガイドだけを、撮影条件から候補へ進む判断フローとして検証する。

## Problem

- 家族写真 detail の情報が同じ重さで縦に並び、焦点距離の役割差を見分けにくい。
- ユーザーが最初に見るべき「室内か屋外か」「子どもとの距離」を起点に候補を絞れない。
- 長文説明に見えやすく、Scene Guide の「条件で選ぶ」価値が弱い。

## Direction

家族写真 detail を、以下の順で読める静的な decision flow にする。

1. 家族写真でまず見る共通前提
2. 室内 / 屋外ごとの条件分岐
3. 条件に合う 35mm / 50mm / 85mm / 135mm 候補
4. 総評
5. 注意点

`decisionFlow` は optional field とし、発表会 / 運動会は従来の detail 表示を維持する。旅行・おでかけには detail を追加しない。

## Allowed files

- `docs/active-mission.md`
- `docs/current-task.md`
- `src/data/scenePlaybooks.ts`
- `src/components/ScenePlaybookCard.tsx`
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

- `ScenePlaybookDetail` に optional な `decisionFlow` を追加する。
- `family-photography` だけに decision flow data を追加する。
- `decisionFlow` がある場合は、従来の詳細リストより判断フローを優先表示する。
- 条件から焦点距離候補へ進む流れを、小さなカードと明確な見出しで示す。
- 発表会 / 運動会の従来 detail 表示を維持する。
- chooser、カード絞り込み、1つだけ detail を開く挙動、既存 `data-testid` を維持する。
- build を通す。

## Do not

- 発表会 / 運動会を decision flow 化しない。
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
  - 家族写真ガイドが、条件 → 候補 → 総評 → 注意点の順で読める。
  - 35mm / 50mm / 85mm / 135mm の役割差が見分けやすい。
  - 発表会 / 運動会 detail が従来どおり表示される。
  - 旅行・おでかけは card-only のまま。
  - chooser と1つだけ detail を開く挙動が壊れていない。
  - モバイル幅で横はみ出しや大きな崩れがない。

## Commit

推奨コミットメッセージ:

```txt
refactor: make family scene guide decision flow
```
