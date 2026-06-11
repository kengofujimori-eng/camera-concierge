# Refine scene guide focal length visualization

## Background

家族写真 / 発表会 / 運動会の interactive UI は、条件選択と焦点距離レールに対応した。文字量は減ったが、焦点距離レールが装飾的に見え、各焦点距離の意味と主候補がまだ十分に主役になっていない。

## Problem

- レール上の焦点距離が、どの撮影条件に向くかを読み取りにくい。
- 主候補が次点 / 安全策と同じチップ表現で、判断の中心が弱い。
- 独立した理由カードが残り、焦点距離より説明カードへ視線が流れやすい。
- 注意カードが警告としてやや強く見える。

## Direction

- 焦点距離レールへシーン別の意味ラベルを加える。
- 主候補を `この条件の本命` として、理由1行を含む焦点距離カードで表示する。
- 次点 / 安全策は短い意味ラベル付きの補助チップとして残す。
- 理由を主候補カードへ統合し、注意は控えめな補足メモへ弱める。
- 条件選択、相談 handoff、旅行 card-only の挙動は維持する。

## Allowed files

- `docs/active-mission.md`
- `docs/current-task.md`
- `src/components/ScenePlaybookCard.tsx`

## Do not touch

- `src/data/scenePlaybooks.ts`
- `src/components/ChatInterface.tsx`
- `src/components/Navbar.tsx`
- warehouse
- `public/lens_data.json`
- API / Dify
- localStorage / sessionStorage の仕様
- 推薦ロジック

## Do

- 主要3シーンで焦点距離レールの意味を分かりやすくする。
- 主候補を大きく、次点 / 安全策を控えめに表示する。
- 理由と注意を短く見せる。
- 家族写真 / 発表会の相談 handoff を維持する。
- 運動会には相談 CTA を追加しない。
- `npm run build` を通す。

## Do not

- 条件ロジックや Scene Guide data を変更しない。
- 文章量を増やしすぎない。
- 新しい route、modal、drawer を追加しない。
- warehouse / API / Dify / lens data に接続しない。
- ランキング、スコア、点数表現を入れない。
- commit / push / e2e を実行しない。

## Checks

- `git status`
- `git diff --stat`
- `npm run build`
- 可能なら `/scene-playbooks` をブラウザ確認する。
  - 発表会の後方席 / 大ホールで `200mm以上` が主役に見える。
  - 発表会の中央席 / 小ホールで `135mm` が自然に見える。
  - 運動会で `100-400mm` の意味が分かる。
  - 家族写真の室内 / 屋外の違いが分かる。
  - 家族写真 / 発表会の相談 handoff が維持される。
  - 運動会に相談 CTA が表示されない。

## Commit

今回は commit / push を行わない。手動 commit 時の推奨メッセージ:

```txt
refactor: refine scene guide focal length visualization
```
