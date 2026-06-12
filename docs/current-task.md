# Plan Public Beta Light Operation & Feedback Review

## Background

Scene Guide Visual Polish Phase と Public Beta Manual Review は完了し、公開β blocker なしと判断した。

今回のタスクではコードや analytics を変更せず、公開β後の軽運用確認、フィードバック分類、次 phase の優先判断基準を docs に整理する。

## Direction

- `public-beta-light-operation-plan.md` に、相談 / シーンガイド / 倉庫の観察方針を整理する。
- `public-beta-feedback-classification.md` に、フィードバックの分類と証拠の残し方を整理する。
- `post-beta-priority-decision.md` に、観察結果から次 phase を選ぶ基準を整理する。
- `active-mission.md` を Public Beta Light Operation & Feedback Review Phase に更新する。
- 古い handoff / checklist の状態ではなく、`active-mission.md`、`scene-guide-visual-polish-review.md`、`scene-guide-public-beta-review.md` を現在地の正本とする。
- コード、API、データ、storage 仕様は変更しない。

## Allowed files

- `docs/active-mission.md`
- `docs/current-task.md`
- `docs/public-beta-light-operation-plan.md`
- `docs/public-beta-feedback-classification.md`
- `docs/post-beta-priority-decision.md`

## Do not touch

- `src/` 以下すべて
- API / Dify
- recommendation logic
- Resolver logic
- comparison hooks logic
- consultation handoff logic
- warehouse
- warehouse localStorage
- sessionStorage 仕様
- `public/lens_data.json`
- data-testid
- `package.json`
- lockfile

## Do

- 軽運用計画、分類基準、次 phase の判断基準を docs 化する。
- `active-mission.md` と `current-task.md` を現在地に更新する。
- docs 間の依存関係と guardrails を確認する。
- `npm run build` を実行する。

## Do not

- コードを変更しない。
- analytics を実装しない。
- UI / recommendation / Resolver / comparison hooks / handoff logic / data を変更しない。
- API / Dify / warehouse / lens data / storage 仕様を変更しない。
- commit / push / e2e を実行しない。

## Checks

- `git status`
- `git diff --stat`
- `git diff --check`
- `npm run build`
- コードやデータに今回の変更がないことを確認する。
- 新規 docs が、観察、分類、優先判断の役割を重複なく分担していることを確認する。

## Commit

今回は commit / push を行わない。手動 commit 時の推奨メッセージ:

```txt
docs: plan public beta light operation review
```
