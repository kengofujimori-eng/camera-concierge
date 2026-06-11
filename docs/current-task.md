# Implement travel-outing scene guide interactive v1

## Background

Scene Guide の家族写真 / 発表会 / 運動会は interactive decision flow と相談 handoff 対応済みである。旅行・おでかけだけが card-only のため、主要4シーンの体験に差がある。

旅行・おでかけでも荷物、撮るもの、レンズ交換の条件から候補を切り替え、相談画面へ引き継げる状態にする。

## Direction

- `travel-outing` に optional `conditionDecisionFlow` data を追加する。
- 荷物の優先 / 撮るもの / レンズ交換の3条件で、主候補 / 次点 / 安全策を切り替える。
- 旅行向けの6項目の焦点距離レールを表示する。
- interactive result の下に `この条件で相談する` CTA を追加する。
- 既存の `lensNaviSceneGuideHandoff` と structured handoff 形式を再利用する。
- 選択条件、主候補、次点、安全策を自然な相談 prompt へ変換する。
- 相談画面の既存 handoff card を利用し、自動送信は行わない。
- 家族写真 / 発表会 / 運動会の interactive と handoff を維持する。

## Allowed files

- `docs/active-mission.md`
- `docs/current-task.md`
- `src/components/ScenePlaybookCard.tsx`
- `src/data/scenePlaybooks.ts`
- 必要な場合のみ `src/components/ChatInterface.tsx`

## Do not touch

- `src/components/Navbar.tsx`
- `src/app/warehouse/page.tsx`
- API / Dify
- warehouse localStorage
- `public/lens_data.json`
- 推薦ロジック

## Do

- 旅行・おでかけガイドを interactive v1 化する。
- 旅行ガイドに相談 handoff CTA を追加する。
- 既存の sessionStorage handoff 仕様を再利用する。
- 相談画面の既存 handoff card で扱える形式を維持する。
- 家族写真 / 発表会 / 運動会の挙動を維持する。
- `npm run build` を実行する。

## Do not

- Lens Condition Resolver / Deep Review connection を実装しない。
- API / Dify / warehouse / lens data / storage 仕様を変更しない。
- 自動送信を追加しない。
- commit / push / e2e を実行しない。

## Checks

- `git status`
- `git diff --stat`
- `npm run build`
- 可能なら旅行ガイドの条件変更、焦点距離レール、相談画面への遷移、handoff card、入力反映、自動送信なしをブラウザで確認する。

## Commit

今回は commit / push を行わない。手動 commit 時の推奨メッセージ:

```txt
feat: add travel scene guide interactive flow
```
