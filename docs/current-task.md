# Implement minimal feedback logging for AI consultation quality

## Background

Public Beta Light Operation & Feedback Review Phase では、次に実装するものを感覚ではなく、実利用とフィードバックから判断する。

今回の目的は、AI相談品質改善に必要な最小証拠を集めることであり、フル analytics や外部送信を実装することではない。

## Problem

公開βでは、AI回答が以下のどこで違和感を持たれたかを後から確認しにくい。

- マウント互換性
- 用途とのズレ
- 焦点距離のズレ
- 価格 / 重量のズレ
- 説明の分かりにくさ
- 候補不足

相談文全文やDify回答全文を集めるのではなく、ユーザーが明示的に押した小さな feedback と、その時点のプロフィール metadata だけをローカルに残す。

## Direction

- assistant 回答の下に、控えめな feedback UI を表示する。
- `よかった` / `違和感あり` を選べるようにする。
- `違和感あり` では category と短い任意メモを入力できる。
- feedback record は localStorage の `lensNaviFeedbackLogs` に保存する。
- 新しい記録を含め、最新50件だけを保持する。
- 外部送信はしない。
- Dify API payload、prompt、recommendation logic は変更しない。

## Allowed files

- `docs/current-task.md`
- `docs/public-beta-feedback-classification.md`
- `docs/minimal-feedback-logging-plan.md`
- `src/components/ChatInterface.tsx`
- `tests/e2e/recommendations.spec.ts`

## Do

- AI相談回答後に feedback UI を追加する。
- localStorage に最小 feedback record を保存する。
- profile metadata を保存する。
- 相談文全文とDify回答全文を保存しない。
- 既存 data-testid を削除・変更しない。
- 既存 e2e に最小回帰ケースを追加する。
- `git diff --check` と `npm run build` を実行する。

## Do not

- API / Dify を変更しない。
- recommendation logic を変更しない。
- warehouse / Scene Guide / Resolver / comparison hooks を変更しない。
- `public/lens_data.json` を変更しない。
- 既存 localStorage key や保存形式を変更しない。
- 外部 analytics SDK を追加しない。
- 個人情報や相談文全文を収集しない。
- e2e は実行しない。
- commit / push しない。

## Checks

- `git status`
- `git diff --check`
- `git diff --stat`
- `npm run build`

## Manual verification

1. 相談画面でプロフィールを設定する。
2. 相談を送信し、assistant 回答を表示する。
3. 回答下に `よかった` / `違和感あり` が表示されることを確認する。
4. `違和感あり` を押し、category と短いメモを保存する。
5. browser console で以下を確認する。

```js
JSON.parse(localStorage.getItem('lensNaviFeedbackLogs') ?? '[]')
```

6. record に `source: "consultation"`、feedback type、category、profile metadata が含まれることを確認する。
7. 相談文全文と回答全文が保存されていないことを確認する。

## Commit

今回は commit / push を行わない。手動 commit 時の推奨メッセージ:

```txt
feat: add minimal consultation feedback logging
```
