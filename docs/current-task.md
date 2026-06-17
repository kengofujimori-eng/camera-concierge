# Fix profile settings persistence

## Background

公開βユーザーから、新規会話後やページ再読み込み後にプロフィール設定が復元されず、マウントやカメラを再選択する必要があるという報告があった。

表示ではプロフィール設定を保持すると案内しているため、実挙動との矛盾を解消する high-priority usability issue として扱う。

## Direction

- JSON保存値とraw string保存値の読み込みを分離する。
- 既存のlocalStorageキー名と保存形式は変更しない。
- 新規会話では会話メッセージとconversation IDだけをリセットする。
- プロフィール設定とセットアップ完了状態を、新規会話後とreload後に復元する。
- recommendation logic、API / Dify、warehouseには触れない。

## Allowed files

- `docs/current-task.md`
- `docs/public-beta-feedback-classification.md`
- `src/components/ChatInterface.tsx`
- `tests/e2e/recommendations.spec.ts`

## Feedback classification

- Category: usability issue
- Priority: High
- Public beta blocker: no
- Reason: プロフィール保持の表示と実挙動が矛盾し、新規会話ごとに再設定が必要になる。

## Root cause

- 既存の `loadFromStorage` が取得値を常に `JSON.parse` していた。
- `selectedMountId`、`selectedBudgetId`、`selectedLensType`、`cameraBody`、`chatConversationId` はraw stringとして保存されているため、復元時にfallbackへ戻っていた。
- `setupDone` はraw stringの `'true'` がbooleanへparseされ、文字列比較に失敗していた。

## Do not touch

- API / Dify
- recommendation logic
- warehouse
- `public/lens_data.json`
- purchase links / affiliate logic
- Scene Guide / Resolver / comparison hooks / consultation handoff
- localStorage key names / saved data structures
- data-testid

## Do

- raw stringとJSONの読み込みを分離する。
- raw stringの既存ユーザー設定を復元する。
- 新規会話時にプロフィールを保持し、会話データだけを消す。
- 既存E2Eファイルへ回帰ケースを追加する。
- `npm run build` を実行する。

## Do not

- e2eを実行しない。
- commit / pushしない。
- API、データ、推薦結果を変更しない。

## Checks

- `git status`
- `git diff --stat`
- `git diff --check`
- raw string localStorage値の復元を確認する。
- 新規会話後にプロフィールが保持されることを確認する。
- reload後にプロフィールが保持されることを確認する。
- 新規会話時に `chatMessages` と `chatConversationId` が削除されることを確認する。
- `npm run build`

## Commit

今回は commit / push を行わない。手動 commit 時の推奨メッセージ:

```txt
fix: preserve profile settings across new chats
```
