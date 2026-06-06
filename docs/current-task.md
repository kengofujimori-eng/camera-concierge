# Public beta three-route manual review

## Background

Lens Navi は、公開βに向けて `相談` / `シーンガイド` / `倉庫` の主要3導線を整備している。

Scene Guide は4件を表示し、家族写真は interactive decision flow、発表会と運動会は inline detail、旅行・おでかけは card-only に対応済み。今回は新機能を追加せず、主要3導線を実際に通して確認し、公開判断と既知課題を docs に記録する。

## Problem

- 各機能は個別に確認してきたが、3導線を横断した公開β前レビューが未記録。
- 相談から推薦・倉庫保存・Scene Guide まで、環境上どこまで確認できるかを明確にする必要がある。
- ESLint と Playwright の既知環境課題を、実装不具合と分けて記録する必要がある。

## Direction

PC / mobile で共通ナビ、相談、Scene Guide、倉庫を手動確認する。確認結果は `docs/public-beta-manual-review.md` に記録し、必要に応じて `docs/launch-readiness-checklist.md` を軽く更新する。

公開βを妨げる明らかな問題がない限り、コード・データ・ロジックは変更しない。

## Allowed files

- `docs/active-mission.md`
- `docs/current-task.md`
- `docs/public-beta-manual-review.md`
- 必要な場合のみ `docs/launch-readiness-checklist.md`

## Do not touch

- `src/components/Navbar.tsx`
- `src/app/scene-playbooks/page.tsx`
- `src/components/ScenePlaybookCard.tsx`
- `src/data/scenePlaybooks.ts`
- `src/app/warehouse/page.tsx`
- `src/components/ChatInterface.tsx`
- `src/components/LensRecommendationCards.tsx`
- `src/components/WarehouseList.tsx`
- `public/lens_data.json`
- API / Dify
- localStorage
- 推薦ロジック

## Do

- `相談` / `シーンガイド` / `倉庫` の表示と遷移を PC / mobile で確認する。
- 相談ルートは初期表示と、可能な範囲で推薦・倉庫保存まで確認する。
- Scene Guide の chooser、家族写真の条件選択、発表会・運動会 detail、旅行 card-only を確認する。
- 倉庫の保存済み状態または空状態を確認する。
- 確認できた範囲、未確認範囲、既知課題、公開β判断を docs に記録する。
- build を通す。

## Do not

- 新機能、Scene Guide detail、導線を追加しない。
- UI、推薦ロジック、API / Dify、localStorage、`public/lens_data.json` を変更しない。
- 手動確認で見つけた問題を、合意なく大きく修正しない。
- 既存 data-testid を変更しない。

## Checks

確認すること:

- `git status`
- `git diff`
- `npm run lint`
  - ESLint 未設定で対話式セットアップになる場合は、その旨を報告する。
- `npm run build`
- `npm run db:check`
- `npm run test:e2e`
  - Playwright Chromium 未インストールで失敗する場合は、正確なエラーを報告する。
- ブラウザで `相談` / `シーンガイド` / `倉庫` を確認する。
- PC のナビが `相談 / シーンガイド / 倉庫`、mobile が `相談 / シーン / 倉庫` で破綻しないことを確認する。
- 確認結果を `docs/public-beta-manual-review.md` に記録する。

## Commit

推奨コミットメッセージ:

```txt
docs: record public beta three-route review
```
