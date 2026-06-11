# Polish scene guide interactive UI

## Background

家族写真 / 発表会 / 運動会の主要3シーンは、撮影条件を選ぶと候補が変わる interactive UI に対応した。家族写真と発表会には、選択条件を相談画面へ引き継ぐ導線もある。

現在の UI は判断機能として成立しているが、説明カードが多く、候補の変化より文章を読む印象がまだ強い。

## Problem

- 条件変更で焦点距離候補が動くことを、位置関係として把握しにくい。
- 主候補 / 次点 / 安全策がカードとして重く、フォーム的に見える。
- 理由、注意、相談 CTA の説明が積み重なり、detail が縦長になりやすい。
- 家族写真と発表会 / 運動会で、候補表示の視覚言語が揃っていない。

## Direction

interactive UI を「読む」より「触って分かる」方向へ軽くする。

- 家族写真 / 発表会 / 運動会に焦点距離レールを表示する。
- 現在の主候補を強く、次点と安全策を控えめに表示する。
- 候補表示は役割と焦点距離を中心に圧縮する。
- 上部説明、理由、注意、相談 CTA の文章量と余白を抑える。
- 条件選択、既存 handoff、旅行 card-only の挙動は維持する。

## Allowed files

- `docs/active-mission.md`
- `docs/current-task.md`
- `src/components/ScenePlaybookCard.tsx`
- 必要な場合のみ `src/data/scenePlaybooks.ts`

## Do not touch

- `src/components/ChatInterface.tsx`
- `src/components/Navbar.tsx`
- `src/app/warehouse/page.tsx`
- `public/lens_data.json`
- API / Dify
- localStorage / sessionStorage の仕様
- 推薦ロジック

## Do

- 主要3シーンの interactive UI を軽くする。
- 焦点距離レールで候補の変化を視覚化する。
- 候補、理由、注意、相談 CTA を短く見せる。
- 家族写真 / 発表会の handoff を維持する。
- 運動会には handoff を追加しない。
- 旅行・おでかけは card-only のまま維持する。
- `npm run build` を通す。

## Do not

- 条件ロジックやデータ構造を大きく変更しない。
- 新しい route、modal、drawer を追加しない。
- Lens Condition Resolver、Deep Review connection を実装しない。
- warehouse / API / Dify / lens data に接続しない。
- ランキング、スコア、点数表現を入れない。
- commit / push / e2e を実行しない。

## Checks

- `git status`
- `git diff --stat`
- `npm run build`
- 可能なら `/scene-playbooks` をブラウザ確認する。
  - 主要3シーンで焦点距離レールと候補の変化が分かる。
  - 家族写真 / 発表会の相談 handoff が維持される。
  - 運動会に相談 CTA が表示されない。
  - 旅行・おでかけは card-only のままである。
  - PC / mobile 幅で横はみ出しがない。

## Commit

今回は commit / push を行わない。手動 commit 時の推奨メッセージ:

```txt
refactor: polish scene guide interactive UI
```
