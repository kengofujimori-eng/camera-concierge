# Add scene guide chooser intro

## Background

`/scene-playbooks` は、Scene Guide の card-only 初期 UI として表示されている。

現在は `家族写真ガイド`、`発表会ガイド`、`運動会ガイド`、`旅行・おでかけガイド` の4枚カードが並んでいる。

## Problem

カード一覧だけだと、ユーザーが最初にどのガイドを読めばよいか少し判断しにくい。

Lens Navi はレンズ名より先に撮影条件を見る「撮影判断ナビ」を目指しているため、カード一覧の前に、撮りたい場面から近いガイドを選ぶ小さな導入があると自然になる。

## Direction

`/scene-playbooks` の header と card grid の間に、chooser intro セクションを追加する。

見せたいこと:

- どのガイドを見るべきかを短く案内する。
- 4つの既存ガイドを、撮影条件の言葉から選べるようにする。
- 既存カード表示は壊さない。
- 詳細ページや動的ルートは作らない。

## Allowed files

- `docs/active-mission.md`
- `docs/current-task.md`
- `src/app/scene-playbooks/page.tsx`

## Do not touch

- `src/data/scenePlaybooks.ts`
- `src/components/ScenePlaybookCard.tsx`
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

- `/scene-playbooks` のカード一覧前に chooser intro を追加する。
- `data-testid="scene-guide-chooser"` を追加する。
- 既存の `data-testid="scene-playbook-page"` と `data-testid="scene-playbook-grid"` は変更しない。
- UI は白 / slate ベース、薄い border、控えめな shadow、局所的な blue-violet to magenta accent にする。
- モバイルでは縦に自然に並ぶ構成にする。
- 既存の初期モック注意文は残す。

## Do not

- `ScenePlaybookCard.tsx` を変更しない。
- `scenePlaybooks.ts` に新しいカードを追加しない。
- `Navbar.tsx` を変更しない。
- warehouse / Deep Review / chat / API / Dify / localStorage へ接続しない。
- `public/lens_data.json` を変更しない。
- 詳細ページや dynamic route は作らない。
- スコア、ランキング、点数表現は入れない。
- 大きなグラデーション塗り、派手な glow、noisy neon は使わない。

## Copy

見出し:

```txt
どのガイドを見るべき？
```

説明:

```txt
撮りたい場面に近いものから選ぶと、レンズ名より先に見るべき判断軸が分かります。
```

項目:

- 日常・子ども・家族の記録 → 家族写真ガイド
- ホール・体育館・暗い会場 → 発表会ガイド
- 屋外イベント・動く子ども → 運動会ガイド
- 旅行・街歩き・荷物を減らしたい → 旅行・おでかけガイド

CTA風の文言:

```txt
まずは撮影条件を選ぶ
```

## Checks

実装後に確認すること:

- `git status`
- `git diff`
- `npm run lint`
  - ESLint 未設定で対話式セットアップになる場合は、その旨を報告する。
- `npm run build`
- 可能なら `/scene-playbooks` をブラウザ確認する。
  - chooser intro が表示されること
  - 4枚のカードがそのまま表示されること
  - モバイル幅で破綻しないこと
  - ナビは `相談 / シーンガイド / 倉庫` のままであること

## Commit

推奨コミットメッセージ:

```txt
feat: add scene guide chooser intro
```
