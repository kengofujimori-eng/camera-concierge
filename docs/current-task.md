# Implement sports-day consultation handoff

## Background

Scene Guide の主要3シーンは interactive decision flow 対応済みである。家族写真 / 発表会は選択した撮影条件を相談画面へ引き継げるが、運動会は interactive result で止まっている。

運動会でも会場の広さ、子どもまでの距離、動きの速さ、主候補、安全策を相談へ渡し、主要3シーンの体験を揃える。

## Direction

- 運動会 interactive result の下に `この条件で相談する` CTA を追加する。
- 既存の `lensNaviSceneGuideHandoff` と structured handoff 形式を再利用する。
- 選択条件、主候補、次点、安全策を自然な相談 prompt へ変換する。
- 相談画面の既存 handoff card を利用し、自動送信は行わない。
- 家族写真 / 発表会 handoff と旅行 card-only の状態を維持する。

## Allowed files

- `docs/active-mission.md`
- `docs/current-task.md`
- `src/components/ScenePlaybookCard.tsx`
- 必要な場合のみ `src/data/scenePlaybooks.ts`
- 必要な場合のみ `src/components/ChatInterface.tsx`

## Do not touch

- `src/components/Navbar.tsx`
- `src/app/warehouse/page.tsx`
- API / Dify
- warehouse localStorage
- `public/lens_data.json`
- 推薦ロジック

## Do

- 運動会ガイドに相談 handoff CTA を追加する。
- 既存の sessionStorage handoff 仕様を再利用する。
- 相談画面の既存 handoff card で扱える形式を維持する。
- 家族写真 / 発表会 handoff を維持する。
- 旅行は card-only のまま維持する。
- `npm run build` を実行する。

## Do not

- 旅行を interactive 化しない。
- Lens Condition Resolver / Deep Review connection を実装しない。
- API / Dify / warehouse / lens data / storage 仕様を変更しない。
- 自動送信を追加しない。
- commit / push / e2e を実行しない。

## Checks

- `git status`
- `git diff --stat`
- `npm run build`
- 可能なら運動会の条件変更、相談画面への遷移、handoff card、入力反映、自動送信なしをブラウザで確認する。

## Commit

今回は commit / push を行わない。手動 commit 時の推奨メッセージ:

```txt
feat: add sports-day consultation handoff
```
