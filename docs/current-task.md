# Add travel scene guide card

## Background

Scene Guide は `/scene-playbooks` で card-only の初期 UI として表示されている。

現在のカードは、家族写真、発表会、運動会の3件。次のシーンとして、日常ユーザーが使いやすい `旅行・おでかけガイド` を追加する。

## Problem

旅行やおでかけでは、単純な最高画質や明るさだけでは失敗しにくい判断にならない。

荷物を減らすか、夜も撮るか、人物も風景も撮るか、レンズ交換できるかによって、使いやすいレンズ構成が変わる。

## Direction

`src/data/scenePlaybooks.ts` に `travel` タイプの card-only データを1件追加する。

旅行ガイドでは、最高画質よりも以下を優先する。

- 持ち出せること
- 交換しなくて済むこと
- 夜も撮れること
- 人物と風景の両方を無理なく撮れること

## Allowed files

- `docs/active-mission.md`
- `docs/current-task.md`
- `src/data/scenePlaybooks.ts`

## Do not touch

- `src/app/scene-playbooks/page.tsx`
- `src/components/ScenePlaybookCard.tsx`
- `src/components/Navbar.tsx`
- `src/app/warehouse/page.tsx`
- `src/components/ChatInterface.tsx`
- `src/components/LensRecommendationCards.tsx`
- `src/components/WarehouseList.tsx`
- `public/lens_data.json`
- warehouse / Deep Review
- localStorage 関連処理
- API / Dify
- 推薦ロジック

## Do

- `scenePlaybooks` に4件目として `travel` タイプのカードを追加する。
- `title` は `旅行・おでかけガイド` にする。
- `shortTitle` は `旅行` にする。
- `relatedLensIds` は stable_id 未導入のため `[]` にする。
- 代表焦点距離は `24-70mm` / `20-70mm` / `35mm` / `50mm` を使う。
- レンズの役割は、標準ズーム、軽量標準ズーム、35mm、50mmを短く整理する。
- 既存3件の `id`、型、構造、helper を壊さない。

## Do not

- `ScenePlaybookCard.tsx` を変更しない。
- `Navbar.tsx` を変更しない。
- `/scene-playbooks` ページを変更しない。
- `public/lens_data.json` に stable_id を追加しない。
- `relatedLensIds` に仮IDを入れない。
- warehouse / Deep Review / chat / API / Dify / localStorage / 推薦ロジックへ接続しない。

## Data draft

追加するカードの方向性:

- headline: 旅行では最高画質より、持ち出せること・交換しなくて済むこと・夜も撮れることを優先する。
- primaryUse: `旅行`、`街歩き`、`おでかけ`、`家族記録`
- keyDecisions:
  - 荷物を減らすか
  - 夜も撮るか
  - 人物も風景も撮るか
  - レンズ交換できるか
- representativeFocalRanges:
  - `24-70mm`
  - `20-70mm`
  - `35mm`
  - `50mm`
- primaryCaution: 旅行では「持って行ける重さ」と「交換しなくてよい安心感」を画質より先に見る。

## Checks

実装後に確認すること:

- `git status`
- `git diff`
- `npm run build`
- 可能なら `/scene-playbooks` で4枚表示を確認する。
- `relatedLensIds` が空配列であることを確認する。
- 許可された3ファイル以外を変更していないことを確認する。

## Commit

推奨コミットメッセージ:

```txt
feat: add travel scene guide card
```
