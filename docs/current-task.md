# Document scene guide resolver comparison review

## Background

Scene Guide の主要4シーンは interactive decision flow、相談 handoff、Lens Condition Resolver pilot、Deep Review comparison hooks pilot 対応済みである。

今回のタスクでは、Deep Review 実装や `stable_id` 接続に進む前に、現在のアーキテクチャ、公開β判断、非ブロッカー、次の roadmap を統合レビューとして記録する。

## Direction

- `scene-guide-resolver-comparison-review.md` を新規作成する。
- Scene Guide / Resolver / consultation handoff / comparison hooks の関係を整理する。
- 公開βブロッカーなしの判断と、既知の非ブロッカーを記録する。
- 次候補を stable ID pilot / visual polish / Deep Review comparison format として整理する。
- コード、API、データ、storage 仕様は変更しない。

## Allowed files

- `docs/active-mission.md`
- `docs/current-task.md`
- `docs/scene-guide-resolver-comparison-review.md`
- 必要な場合のみ `docs/scene-guide-public-beta-review.md`
- 必要な場合のみ `docs/launch-readiness-checklist.md`

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

- 統合レビュー docs を作成する。
- `active-mission.md` と `current-task.md` を現在地に更新する。
- 必要な既存 docs に参照を最小限追加する。
- `npm run build` を実行する。

## Do not

- コードを変更しない。
- Deep Review API / route / stable ID 接続を実装しない。
- API / Dify / warehouse / lens data / storage 仕様を変更しない。
- commit / push / e2e を実行しない。

## Checks

- `git status`
- `git diff --stat`
- `npm run build`
- 新規レビュー docs の見出し、重複、参照関係を確認する。

## Commit

今回は commit / push を行わない。手動 commit 時の推奨メッセージ:

```txt
docs: add scene guide resolver comparison review
```
