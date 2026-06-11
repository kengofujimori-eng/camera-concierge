# Scene Guide public beta review

## Purpose

Scene Guide の現時点の公開β確認結果を記録する。

この review は、Scene Guide を「読むガイド」から「撮影条件を選び、必要な焦点距離を理解し、相談へつなぐ UI」へ進めた後の状態確認である。

## Current implementation summary

### Scene Guide page

- `/scene-playbooks` 実装済み。
- chooser から対象シーンを選び、選択したカードへ絞り込める。
- 主要3シーンは interactive decision flow 対応済み。
- 焦点距離レール、主候補、次点、安全策を役割別に表示する。
- スコア、ランキング、点数表現は使用しない。

### 家族写真ガイド

- `室内で撮る` / `屋外で撮る` を選択できる。
- 焦点距離レールで 35mm / 50mm / 85mm / 135mm の役割を表示する。
- 主候補 / 次点を表示する。
- `この条件で相談する` handoff 対応済み。

### 発表会ガイド

- 座席位置 / 会場サイズ / 狙いを選択できる。
- 焦点距離レールで 85mm / 135mm / 70-200mm / 200mm+ の役割を表示する。
- 主候補 / 次点 / 安全策を表示する。
- `この条件で相談する` handoff 対応済み。

### 運動会ガイド

- 会場の広さ / 子どもまでの距離 / 動きの速さを選択できる。
- 焦点距離レールで 85-135mm / 70-200mm / 100-400mm / 200mm+ の役割を表示する。
- 主候補 / 次点 / 安全策を表示する。
- 相談 handoff は未実装。

### 旅行・おでかけガイド

- card-only。
- `要点のみ表示中` として扱う。
- interactive detail は未実装。

### Scene Guide to consultation handoff

- 家族写真 / 発表会のみ対応済み。
- `sessionStorage` の `lensNaviSceneGuideHandoff` に構造化した選択条件を保存する。
- 相談画面に引き継ぎ確認カードを表示する。
- 自動送信はしない。
- ユーザーが入力欄へ反映、閉じる、または送信した時点で handoff を clear する。

## Manual review result

- PC 表示で大きな崩れなし。
- モバイル表示でも大きな崩れなし。
- 家族写真 interactive は動作する。
- 発表会 interactive は動作する。
- 運動会 interactive は動作する。
- 家族写真 / 発表会の相談 handoff は動作する。
- 相談画面の引き継ぎ確認カードは動作する。
- handoff 後に自動送信されず、ユーザーが確認してから入力へ反映できる。
- 旅行・おでかけは card-only を維持している。
- API / Dify / warehouse / lens data への副作用は確認されていない。
- `relatedLensIds` は全件 `[]` のまま。
- 直近の `npm run build` は成功している。

## Public beta judgment

**判定: 公開βブロッカーなし。**

理由:

- 主要3シーンで条件選択型の体験が成立している。
- 家族写真 / 発表会は、撮影条件の整理から相談へつながる。
- 運動会も、条件変更に応じて必要な焦点距離が変わる interactive guide として機能している。
- モバイルでも大きな崩れは見られない。
- 既存の相談 / 倉庫 / ナビ導線を壊していない。

## Known non-blocking UI issues

- まだ文字量はやや多い。
- アイコンやビジュアル要素は少ない。
- 薄黄色の補足 / 注意枠が少し野暮ったく見える。
- 焦点距離レールは有効だが、より直感的なアイコン・図解化の余地がある。
- 主候補 / 次点 / 安全策の意味は伝わるが、より視覚的な役割表現に改善できる。
- 旅行・おでかけは未 interactive。
- 運動会 handoff は未実装。
- Lens Condition Resolver / Deep Review connection は未実装。

## Suggested future polish

- 黄色い注意枠を muted note / info chip に変更する。
- 室内 / 屋外 / 座席 / 会場 / 動きなどに小さなアイコンを追加する。
- 焦点距離レールに、より直感的な距離感・被写体サイズ表現を追加する。
- 運動会にも `この条件で相談する` handoff を追加する。
- 旅行・おでかけの interactive 化を検討する。
- Scene Guide と Lens Condition Resolver を接続する。
- Scene Guide と Deep Review comparison hooks を接続する。

## Recommended next steps

1. Implement sports-day consultation handoff
2. Add non-blocking UI polish for caution notes and icons
3. Plan travel-outing interactive guide
4. Start Lens Condition Resolver pilot
5. Add Deep Review comparison hooks

## Notes

Scene Guide は現時点で、完全に洗練された UI ではない。

しかし、公開βに必要な機能価値は成立している。撮影条件を選び、必要な焦点距離の役割を理解し、具体的な相談へ進む導線は、Lens Navi の「撮影判断ナビ」という方向を表現できている。

ここから先は、UI 装飾の追い込みよりも、相談 / Lens Condition Resolver / Deep Review との接続を優先する。
