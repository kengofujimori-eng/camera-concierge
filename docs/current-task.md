# Document Scene Guide public beta review

## Background

Scene Guide は、主要3シーンの interactive decision flow、焦点距離レール、役割別候補表示まで実装済みである。家族写真 / 発表会は相談画面への handoff にも対応した。

公開β前の機能価値は成立しているため、次の機能追加へ進む前に現在の確認結果、非ブロッカー、次の推奨順序を docs として固定する。

## Direction

- `docs/scene-guide-public-beta-review.md` を新規作成する。
- 現在の実装、手動確認結果、公開β判断、既知の非ブロッカーを記録する。
- `docs/active-mission.md` を Scene Guide public beta review の現在地へ更新する。
- launch readiness から review docs を参照できるよう、1行だけ追記する。
- コードやデータ構造は変更しない。

## Allowed files

- `docs/active-mission.md`
- `docs/current-task.md`
- `docs/scene-guide-public-beta-review.md`
- 必要な場合のみ `docs/launch-readiness-checklist.md`
- 必要な場合のみ `docs/public-beta-manual-review.md`

## Do not touch

- `src/app/scene-playbooks/page.tsx`
- `src/components/ScenePlaybookCard.tsx`
- `src/data/scenePlaybooks.ts`
- `src/components/ChatInterface.tsx`
- API / Dify
- warehouse
- `public/lens_data.json`
- localStorage / sessionStorage 仕様
- 推薦ロジック

## Do

- Scene Guide の公開β確認結果を docs 化する。
- 公開βブロッカーと non-blocking issue を分けて記録する。
- 次の推奨タスクを順序付きで記録する。
- `npm run build` を実行する。

## Do not

- Scene Guide UI を追加修正しない。
- 新しい機能や data を追加しない。
- API / Dify / warehouse / storage 仕様を変更しない。
- commit / push / e2e を実行しない。

## Checks

- `git status`
- `git diff --stat`
- `npm run build`
- 変更が docs のみに収まっていることを確認する。

## Commit

今回は commit / push を行わない。手動 commit 時の推奨メッセージ:

```txt
docs: add scene guide public beta review
```
