# Implement sports-day scene guide interactive v1

## Background

Scene Guide は、家族写真と発表会で撮影条件を選び、候補焦点距離を絞れる状態になった。家族写真と発表会には、選択した条件を相談画面へ引き継ぐ導線もある。

運動会ガイドは detail 対応済みだが、現在は読み物型であり、会場の広さや距離、動きに応じた候補の変化を体感しにくい。

## Problem

- 運動会で重要な「届く・追える・一日持てる」の判断が、長い説明の中に埋もれやすい。
- 会場、距離、動きの組み合わせによって、70-200mm と 100-400mm の役割が変わることを選択操作で確認できない。
- 家族写真 / 発表会と比べ、Scene Guide の撮影判断ナビらしさが弱い。

## Direction

運動会ガイドに interactive decision flow v1 を追加する。

- 会場の広さ: `園庭・小さめ` / `校庭・標準` / `広いグラウンド`
- 子どもまでの距離: `近い` / `中くらい` / `遠い`
- 動きの速さ: `ゆっくり` / `ふつう` / `速い`
- 選択条件に応じて、主候補 / 次点候補 / 安全策 / 理由 / 注意点を即時に切り替える。
- 初期値は `校庭・標準 / 中くらい / ふつう` とする。

既存の汎用 condition decision flow UI を使い、運動会では相談 handoff CTA を表示しない。

## Allowed files

- `docs/active-mission.md`
- `docs/current-task.md`
- `src/components/ScenePlaybookCard.tsx`
- `src/data/scenePlaybooks.ts`
- 必要な場合のみ `src/app/scene-playbooks/page.tsx`

## Do not touch

- `src/components/Navbar.tsx`
- `src/components/ChatInterface.tsx`
- `src/app/warehouse/page.tsx`
- `src/components/LensRecommendationCards.tsx`
- `src/components/WarehouseList.tsx`
- `public/lens_data.json`
- API / Dify
- 推薦ロジック
- warehouse localStorage 形式

## Do

- 運動会ガイドを interactive v1 化する。
- 3条件の組み合わせで候補と説明を切り替える。
- 家族写真 / 発表会の interactive behavior と相談 handoff を維持する。
- 旅行・おでかけは card-only のまま維持する。
- `relatedLensIds` は全件空配列のまま維持する。
- `npm run build` を通す。

## Do not

- 運動会に相談 handoff CTA を追加しない。
- Lens Condition Resolver、Deep Review connection を実装しない。
- travel detail や新しい Scene Guide card を追加しない。
- dedicated route、modal、drawer を追加しない。
- warehouse / chat API / Dify / localStorage に新しい接続を追加しない。
- スコア、ランキング、点数表現を入れない。
- commit / push / e2e を実行しない。

## Checks

実装後に確認すること:

- `git status`
- `git diff --stat`
- `npm run build`
- 可能ならブラウザで `/scene-playbooks` を確認する。
  - 運動会の3条件を切り替えられる。
  - 初期値が `校庭・標準 / 中くらい / ふつう` である。
  - 条件変更で主候補 / 次点候補 / 安全策が変わる。
  - 運動会には相談 handoff CTA が表示されない。
  - 家族写真 / 発表会の interactive behavior と handoff が壊れていない。
  - 旅行・おでかけは card-only のままである。
  - mobile 幅で横はみ出しがない。

## Commit

今回は commit / push を行わない。手動 commit 時の推奨メッセージ:

```txt
feat: add sports-day scene guide interactive flow
```
