# Implement Deep Review comparison hooks pilot

## Background

Scene Guide の主要4シーンは interactive decision flow、相談 handoff、Lens Condition Resolver pilot 対応済みである。現在は主候補 / 次点 / 安全策と必要なレンズ条件を表示できるが、最後に迷いやすい候補同士の比較へ進む導線は未実装である。

今回の pilot では Deep Review API や stable ID に接続せず、現在の候補から将来比較できるテーマを短く示す。

## Direction

- `ScenePlaybookCard.tsx` 内に小さな comparison hooks helper を追加する。
- 4シーンの result area に共通の `比較して深掘り` セクションを表示する。
- 主候補 / 次点 / 安全策から、重複しない比較テーマを最大2件導く。
- 比較テーマが不足する場合は、シーン別の自然な fallback を使う。
- Deep Review 連携予定であることを示し、実遷移は行わない。
- 既存の interactive / resolver / handoff を維持する。

## Allowed files

- `docs/active-mission.md`
- `docs/current-task.md`
- `src/components/ScenePlaybookCard.tsx`

## Do not touch

- `src/data/scenePlaybooks.ts`
- `src/components/ChatInterface.tsx`
- `src/components/Navbar.tsx`
- `src/app/warehouse/page.tsx`
- API / Dify
- warehouse localStorage
- `public/lens_data.json`
- 推薦ロジック

## Do

- 4シーンの interactive result に comparison hooks セクションを表示する。
- 主候補 / 次点 / 安全策から比較テーマを生成する。
- 既存 interactive / resolver / handoff / generated prompt を維持する。
- `npm run build` を実行する。

## Do not

- Deep Review API / route / stable ID 接続を実装しない。
- 具体レンズ名や商品名を表示しない。
- DB / stable ID / `relatedLensIds` に接続しない。
- API / Dify / warehouse / lens data / storage 仕様を変更しない。
- commit / push / e2e を実行しない。

## Checks

- `git status`
- `git diff --stat`
- `npm run build`
- 可能なら4シーンで比較テーマが表示され、条件変更に応じて自然に変わることをブラウザで確認する。

## Commit

今回は commit / push を行わない。手動 commit 時の推奨メッセージ:

```txt
feat: add deep review comparison hooks pilot
```
