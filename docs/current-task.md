# Review family scene guide detail UI

## Background

`/scene-playbooks` は、Scene Guide の card list、chooser intro、家族写真ガイドの inline detail まで実装済みである。

現在のカードは4件。

- 家族写真ガイド
- 発表会ガイド
- 運動会ガイド
- 旅行・おでかけガイド

`family-photography` だけが `detail` data を持ち、他3件は card-only のまま。

## Problem

家族写真 detail は機能としては開けるが、公開β前には以下を確認する必要がある。

- detail が長すぎてカードが重く見えないか。
- 見出し、リスト、余白が撮影判断の要点として読みやすいか。
- モバイルで横はみ出しや過剰な余白がないか。
- 他3件の未実装状態が強すぎないか。

## Direction

今回は大きな再設計はしない。

必要な場合のみ、`ScenePlaybookCard.tsx` の detail 表示と状態表示を軽く整える。データ本文は意味を変えず、`relatedLensIds` は全件 `[]` のままにする。

## Allowed files

- `docs/active-mission.md`
- `docs/current-task.md`
- `src/components/ScenePlaybookCard.tsx`
- `src/app/scene-playbooks/page.tsx`
- `src/data/scenePlaybooks.ts`

`src/data/scenePlaybooks.ts` は文言の微修正が必要な場合のみ触る。

## Do not touch

- `src/components/Navbar.tsx`
- `src/app/warehouse/page.tsx`
- `src/components/ChatInterface.tsx`
- `src/components/LensRecommendationCards.tsx`
- `src/components/WarehouseList.tsx`
- `public/lens_data.json`
- API / Dify
- localStorage
- 推薦ロジック

## Do

- 家族写真 detail の読みやすさを確認する。
- chooser intro と4枚カードが残っていることを確認する。
- 家族写真ガイドだけ detail を開閉できることを確認する。
- 他3件は未実装状態として自然に見えるようにする。
- 必要なら detail section の余白、見出し、未実装ラベルを軽く調整する。
- 既存 data-testid は変更しない。

## Do not

- 発表会 / 運動会 / 旅行に detail を追加しない。
- `/scene-playbooks/[id]` は作らない。
- modal / drawer は作らない。
- warehouse / Deep Review / chat / API / Dify / localStorage に接続しない。
- `public/lens_data.json` を変更しない。
- `Navbar.tsx` を変更しない。
- `relatedLensIds` に仮IDを入れない。
- スコア、ランキング、点数表現を入れない。

## Review notes

確認した結果、家族写真 detail の情報構成は目的に沿っている。

軽微な調整方針:

- detail 内の余白を少し詰め、カード全体の重さを抑える。
- 未実装カードの CTA 表示を `詳細準備中` から `今は要点のみ` にして、未完成感を弱める。
- detail 内の「一言でいうと」は小さな要約ボックスとして読み始めやすくする。

## Checks

実装後に確認すること:

- `git status`
- `git diff`
- `npm run lint`
  - ESLint 未設定で対話式セットアップになる場合は、その旨を報告する。
- `npm run build`
- 可能なら `/scene-playbooks` をブラウザ確認する。
  - chooser intro が残っている。
  - 4枚カードが表示される。
  - 家族写真ガイドだけ detail を開閉できる。
  - 他3件は未実装状態として自然に見える。
  - モバイル幅で横はみ出しや大きな崩れがない。
  - ナビは PC で `相談 / シーンガイド / 倉庫`、モバイルで `相談 / シーン / 倉庫` のまま。

## Commit

推奨コミットメッセージ:

```txt
refactor: polish family scene guide detail UI
```
