# Implement lens condition resolver pilot

## Background

Scene Guide の主要4シーンは interactive decision flow と相談 handoff 対応済みである。現在は主候補 / 次点 / 安全策を表示できるが、具体レンズへ進む前の「必要なレンズ条件」を明示する中間レイヤーは未実装である。

今回の pilot では DB や stable ID に接続せず、選択結果から焦点距離 / レンズタイプ / 優先要素 / 注意点を短く整理する。

## Direction

- `ScenePlaybookCard.tsx` 内に小さな resolver helper を追加する。
- 4シーンの result area に共通の `レンズ条件` カードを表示する。
- 主候補と選択条件から焦点距離 / タイプ / 優先 / 注意を導く。
- 既存の主候補 / 次点 / 安全策 / 焦点距離レール / handoff を維持する。
- レンズ名、商品名、DB接続、stable ID 接続は行わない。

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

- 4シーンの interactive result に Lens Condition Card を表示する。
- 主候補から focal range / lens type / priorities / caution を導く。
- 既存 interactive / handoff / generated prompt を維持する。
- `npm run build` を実行する。

## Do not

- Lens Condition Resolver の DB 接続 / Deep Review connection を実装しない。
- 具体レンズ名や商品名を表示しない。
- DB / stable ID / `relatedLensIds` に接続しない。
- API / Dify / warehouse / lens data / storage 仕様を変更しない。
- commit / push / e2e を実行しない。

## Checks

- `git status`
- `git diff --stat`
- `npm run build`
- 可能なら4シーンでレンズ条件が表示され、条件変更に応じて自然に変わることをブラウザで確認する。

## Commit

今回は commit / push を行わない。手動 commit 時の推奨メッセージ:

```txt
feat: add lens condition resolver pilot
```
