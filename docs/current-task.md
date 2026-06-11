# Implement scene guide to consultation handoff

## Background

Scene Guide は、家族写真と発表会で条件を選び、必要な焦点距離や候補役割を絞れる状態になった。

次の段階では、Scene Guide 内で整理した撮影条件を、具体的なレンズ候補を尋ねる相談画面へ自然に引き継ぐ。

## Problem

- Scene Guide で条件を絞っても、相談画面で同じ条件を入力し直す必要がある。
- 選択した条件と候補役割を、相談文へ変換する接続がない。
- 自動送信は避けつつ、ユーザーが確認して相談を開始できる導線が必要。

## Direction

家族写真と発表会の interactive result に `この条件で相談する` 導線を追加する。

- 選択条件、候補役割、相談文を構造化した handoff として `sessionStorage` に保存する。
- 相談画面へ移動後、入力欄の近くに引き継ぎカードを表示する。
- ユーザーが `この内容で相談する` を押したときだけ入力へ反映する。
- 自動送信はしない。反映または dismiss 後は handoff を削除する。

## Allowed files

- `docs/active-mission.md`
- `docs/current-task.md`
- `src/components/ScenePlaybookCard.tsx`
- `src/components/ChatInterface.tsx`
- 必要な場合のみ `src/app/scene-playbooks/page.tsx`
- 必要な場合のみ `src/data/scenePlaybooks.ts`

## Do not touch

- `src/components/Navbar.tsx`
- `src/app/warehouse/page.tsx`
- `src/components/LensRecommendationCards.tsx`
- `src/components/WarehouseList.tsx`
- `public/lens_data.json`
- API / Dify
- warehouse localStorage 形式
- 推薦ロジック

## Do

- 家族写真と発表会に `この条件で相談する` CTA を追加する。
- 選択状態を反映した構造化 handoff と相談文を `sessionStorage` に保存する。
- 相談画面に引き継ぎカードを表示し、確認操作で入力へ反映する。
- 自動送信せず、通常相談フローを維持する。
- 運動会 detail と旅行 card-only を維持する。
- build を通す。

## Do not

- Lens Condition Resolver、Deep Review connection を実装しない。
- 運動会 / 旅行の handoff を実装しない。
- API / Dify payload、warehouse localStorage 形式、`public/lens_data.json` を変更しない。
- 自動送信しない。
- スコア、ランキング、点数表現を入れない。

## Checks

実装後に確認すること:

- `git status`
- `git diff`
- `npm run lint`
  - ESLint 未設定で対話式セットアップになる場合は、その旨を報告する。
- `npm run build`
- `npm run db:check`
- `npm run test:e2e`
  - Playwright Chromium 未インストールで失敗する場合は、正確なエラーを報告する。
- ブラウザ確認する。
  - 家族写真 / 発表会の現在条件から相談 CTA を使える。
  - 相談画面に条件を要約した引き継ぎカードが表示される。
  - `この内容で相談する` で入力へ反映され、自動送信されない。
  - dismiss / 反映後に `sessionStorage` が削除される。
  - 運動会、旅行、通常相談が壊れていない。
  - mobile 幅で横はみ出しがない。

## Commit

推奨コミットメッセージ:

```txt
feat: add scene guide consultation handoff
```
