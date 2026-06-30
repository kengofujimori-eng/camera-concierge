# Active mission

Lens Navi は、旧 camera-concierge から継続して、単なるレンズレビューサイトではなく「撮影判断ナビ」へ発展中である。

現在の中心テーマは、ユーザーがレンズ名やスペックだけでなく、撮影シーン、距離、明るさ、被写体の動き、持ち出しやすさから判断できる導線を整えること。

## Current direction

- Lens Navi は「レンズレビューサイト」ではなく「撮影判断ナビ」へ発展中。
- 主要導線として `相談` / `シーンガイド` / `倉庫` の3導線が成立。
- Scene Guide は `/scene-playbooks` で公開βへ進める状態まで整備済み。
- Scene Guide は家族写真、発表会、運動会に続き、旅行・おでかけも含む中核機能へ育てている。
- 主要4シーン（家族写真 / 発表会 / 運動会 / 旅行・おでかけ）は interactive decision flow と相談 handoff 対応済み。
- Scene Guide の結果を、具体レンズ名の前段となる「必要なレンズ条件」へ変換する Lens Condition Resolver pilot を実装済み。
- 候補同士の違いを将来の Deep Review 比較へつなぐ comparison hooks pilot を実装済み。
- Scene Guide / Resolver / Comparison の到達点は統合レビューとして記録済み。
- Scene Guide Visual Polish Phase は完了し、VisualNote、scene icons、発表会 / 運動会の距離図解、focal rail role badges、mobile readability を実装済み。
- Visual Polish Phase の到達点と残課題は `docs/scene-guide-visual-polish-review.md` に記録済み。
- Scene Guide Public Beta Manual Review は完了し、公開β blocker なしと判断済み。
- 正式な確認結果は `docs/scene-guide-public-beta-review.md` に記録済み。
- Scene Playbook はスコアやランキングではなく、撮影条件ごとの失敗しにくい判断を扱う。
- Deep Review はレンズを主語にし、Scene Playbook は撮影シーンを主語にする。

## Current priority

モバイルナビの視認性改善、Scene Guide Visual Polish Phase、Scene Guide Public Beta Manual Review は完了。

現在の優先タスクは、Public Beta Light Operation & Feedback Review Phase を進め、実利用と重複フィードバックから次の product phase を選ぶこと。

Product roadmap の整理では、Lens Navi の本筋を「撮影前の意思決定を助ける」ことに置く。優先順位は シーンガイド -> AI深掘り -> ギャラリー -> カメラバッグ を基本線とし、`/warehouse-gallery` は `/warehouse` の即時置換ではなく、所有レンズを愛でるギャラリーモードとして扱う。

今回の方針:

- `scene-guide-public-beta-review.md` を Scene Guide の公開β前確認における正式記録とする。
- 公開β blocker はなく、主要4シーンの interactive flow と consultation handoff は成立している。
- 公開β後は UI を細かく触り続けず、実利用と複数ユーザーに共通するフィードバックを優先する。
- 単発意見だけで大型機能を追加せず、観察結果を分類して次 phase を判断する。
- stable ID なしで Resolver data connection を拡大しない。
- Deep Review API 接続を急がず、比較への関心と静的 format の必要性を先に確認する。
- 家族写真 / 旅行の追加図解は、理解不足が複数回確認された場合に検討する。
- 次の product phase 候補は stable ID pilot、Resolver data connection pilot、Deep Review comparison format、AI相談品質改善、最小 analytics。
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
