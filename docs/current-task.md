# Record Scene Guide Public Beta Manual Review

## Background

Scene Guide Visual Polish Phase 後の `/scene-playbooks` を、公開β前に PC とモバイル観点で手動確認した。

主要4シーンの interactive flow、consultation handoff、VisualNote、icons、DistanceVisualization、FocalLengthRail role badges を確認し、公開β blocker なしと判断した。

今回のタスクではコードを変更せず、確認結果を正式な review docs に反映する。

## Direction

- `scene-guide-public-beta-review.md` の古い実装状態を最新状態へ更新する。
- `active-mission.md` に Visual Polish Phase と Public Beta Manual Review の完了を反映する。
- 4シーン interactive / handoff、Resolver pilot、comparison hooks pilot、visual polish の確認結果を記録する。
- 390px 実機相当確認など、残る非ブロッカーを明記する。
- コード、API、データ、storage 仕様は変更しない。

## Allowed files

- `docs/active-mission.md`
- `docs/current-task.md`
- `docs/scene-guide-public-beta-review.md`

## Do not touch

- `docs/scene-guide-visual-polish-plan.md`
- `docs/scene-guide-visual-polish-review.md`
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

- manual review 結果を `scene-guide-public-beta-review.md` に正式記録する。
- `active-mission.md` と `current-task.md` を公開βへ進める現在地に更新する。
- `npm run build` を実行する。

## Do not

- コードを変更しない。
- UI / Resolver / comparison hooks / handoff logic / data を変更しない。
- API / Dify / warehouse / lens data / storage 仕様を変更しない。
- commit / push / e2e を実行しない。

## Checks

- `git status`
- `git diff --stat`
- `npm run build`
- `scene-guide-public-beta-review.md` に古い状態記述が残っていないことを確認する。
- コードやデータに今回の変更がないことを確認する。

## Commit

今回は commit / push を行わない。手動 commit 時の推奨メッセージ:

```txt
docs: record scene guide public beta manual review
```
