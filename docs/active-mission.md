# Active mission

Lens Navi は、旧 camera-concierge から継続して、単なるレンズレビューサイトではなく「撮影判断ナビ」へ発展中である。

現在の中心テーマは、ユーザーがレンズ名やスペックだけでなく、撮影シーン、距離、明るさ、被写体の動き、持ち出しやすさから判断できる導線を整えること。

## Current direction

- Lens Navi は「レンズレビューサイト」ではなく「撮影判断ナビ」へ発展中。
- 主要導線として `相談` / `シーンガイド` / `倉庫` の3導線が成立。
- Scene Guide は `/scene-playbooks` で公開β前の UI として整備中。
- Scene Guide は家族写真、発表会、運動会に続き、旅行・おでかけも含む中核機能へ育てている。
- 主要3シーン（家族写真 / 発表会 / 運動会）は interactive decision flow と相談 handoff 対応済み。
- 主要4シーン（家族写真 / 発表会 / 運動会 / 旅行・おでかけ）は interactive decision flow と相談 handoff 対応済み。
- Scene Guide の結果を、具体レンズ名の前段となる「必要なレンズ条件」へ変換する Lens Condition Resolver pilot を実装済み。
- 候補同士の違いを将来の Deep Review 比較へつなぐ comparison hooks pilot を実装済み。
- Scene Guide / Resolver / Comparison の到達点は統合レビューとして記録済み。
- Scene Guide Visual Polish Phase は完了し、VisualNote、scene icons、発表会 / 運動会の距離図解、focal rail role badges、mobile readability を実装済み。
- Visual Polish Phase の到達点と残課題は `docs/scene-guide-visual-polish-review.md` に記録する。
- Scene Playbook はスコアやランキングではなく、撮影条件ごとの失敗しにくい判断を扱う。
- Deep Review はレンズを主語にし、Scene Playbook は撮影シーンを主語にする。

## Current priority

モバイルナビの視認性改善と Scene Guide の公開β review は完了。

現在の優先タスクは、Scene Guide Visual Polish Phase の完了レビューを記録し、public beta manual review へ進める状態にすること。

今回の方針:

- `scene-guide-visual-polish-review.md` に実装済み scope、公開βへの効果、残課題、次の候補を記録する。
- Visual Polish Phase では、既存ロジックを維持しながら表示密度と視覚的な理解を改善した。
- 次の推奨は public beta manual review とし、家族写真 / 旅行の追加図解は確認結果に応じて判断する。
- Resolver / comparison hooks / consultation handoff のロジックは変更しない。
- warehouse / API / Dify / storage 仕様 / `public/lens_data.json` は変更しない。

## Working model

今後は `docs/current-task.md` を単位に、小さく実装する。

基本フロー:

1. `docs/active-mission.md` で現在の目的を確認する。
2. `docs/current-task.md` で今回の作業範囲を明確にする。
3. 許可されたファイルだけを変更する。
4. lint / build / 必要な確認を行う。
5. 1タスク1コミットで commit / push する。

## Guardrails

- 推薦ロジックは、明示依頼がない限り変更しない。
- API / Dify は、明示依頼がない限り変更しない。
- localStorage 形式は、明示依頼がない限り変更しない。
- `public/lens_data.json` は、明示依頼がない限り変更しない。
- 既存の data-testid は壊さない。
- UI は白 / slate ベース、薄い border、控えめな shadow、局所的な blue-violet to magenta accent を基本にする。
