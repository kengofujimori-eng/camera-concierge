# Create Scene Guide visual polish plan

## Background

Scene Guide の主要4シーンは interactive decision flow、相談 handoff、Lens Condition Resolver pilot、Deep Review comparison hooks pilot 対応済みで、公開βブロッカーはない。

今回のタスクではロジックを追加せず、既存の判断構造を「読む」より「見て触って分かる」UIへ進める visual polish 計画を記録する。

## Direction

- `scene-guide-visual-polish-plan.md` を新規作成する。
- visual first / no new logic / scene-specific but reusable / mobile first を設計原則とする。
- VisualNote、scene icons、distance visualization、focal rail、mobile readability を段階化する。
- 最初の実装候補を `Polish Scene Guide visual notes and info chips` として定義する。
- コード、API、データ、storage 仕様は変更しない。

## Allowed files

- `docs/active-mission.md`
- `docs/current-task.md`
- `docs/scene-guide-visual-polish-plan.md`

## Do not touch

- `src/data/scenePlaybooks.ts`
- `src/components/ScenePlaybookCard.tsx`
- `src/components/ChatInterface.tsx`
- `src/components/Navbar.tsx`
- `src/app/warehouse/page.tsx`
- API / Dify
- warehouse localStorage
- `public/lens_data.json`
- 推薦ロジック

## Do

- visual polish plan docs を作成する。
- `active-mission.md` と `current-task.md` を現在地に更新する。
- 既存 `lucide-react` 依存と現在の component boundaries を確認する。
- `npm run build` を実行する。

## Do not

- コードを変更しない。
- UI / Resolver / comparison hooks / handoff logic を変更しない。
- Deep Review API / route / stable ID 接続を実装しない。
- API / Dify / warehouse / lens data / storage 仕様を変更しない。
- commit / push / e2e を実行しない。

## Checks

- `git status`
- `git diff --stat`
- `npm run build`
- 新規 plan docs の見出し、フェーズ、guardrails を確認する。

## Commit

今回は commit / push を行わない。手動 commit 時の推奨メッセージ:

```txt
docs: add scene guide visual polish plan
```
