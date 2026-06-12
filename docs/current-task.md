# Document scene guide visual polish review

## Background

Scene Guide Visual Polish Phase では、VisualNote、scene specific icons、発表会 / 運動会の DistanceVisualization pilot、FocalLengthRail role badges、mobile readability pass を実装した。

今回のタスクではコードを変更せず、実装済み scope、公開βへの効果、意図的に変更しなかった領域、残課題、次の候補をレビュー docs に記録する。

## Direction

- `scene-guide-visual-polish-review.md` を新規作成する。
- Visual Polish Phase の実装結果と public beta impact を記録する。
- 家族写真 / 旅行の専用図解、Resolver、Deep Review hooks などの残課題を明記する。
- 次の推奨タスクを public beta manual review とする。
- コード、API、データ、storage 仕様は変更しない。

## Allowed files

- `docs/active-mission.md`
- `docs/current-task.md`
- `docs/scene-guide-visual-polish-review.md`

## Do not touch

- `docs/scene-guide-visual-polish-plan.md`
- `src/data/scenePlaybooks.ts`
- `src/components/ScenePlaybookCard.tsx`
- `src/app/scene-playbooks/page.tsx`
- `src/components/ChatInterface.tsx`
- `src/components/Navbar.tsx`
- `src/app/warehouse/page.tsx`
- API / Dify
- warehouse localStorage
- `public/lens_data.json`
- 推薦ロジック

## Do

- visual polish review docs を作成する。
- `active-mission.md` と `current-task.md` を現在地に更新する。
- `npm run build` を実行する。

## Do not

- コードを変更しない。
- UI / Resolver / comparison hooks / handoff logic / data を変更しない。
- Deep Review API / route / stable ID 接続を実装しない。
- API / Dify / warehouse / lens data / storage 仕様を変更しない。
- commit / push / e2e を実行しない。

## Checks

- `git status`
- `git diff --stat`
- `npm run build`
- 新規 review docs の実装 scope、残課題、roadmap、guardrails を確認する。

## Commit

今回は commit / push を行わない。手動 commit 時の推奨メッセージ:

```txt
docs: add scene guide visual polish review
```
