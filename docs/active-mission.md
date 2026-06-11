# Active mission

Lens Navi は、旧 camera-concierge から継続して、単なるレンズレビューサイトではなく「撮影判断ナビ」へ発展中である。

現在の中心テーマは、ユーザーがレンズ名やスペックだけでなく、撮影シーン、距離、明るさ、被写体の動き、持ち出しやすさから判断できる導線を整えること。

## Current direction

- Lens Navi は「レンズレビューサイト」ではなく「撮影判断ナビ」へ発展中。
- 主要導線として `相談` / `シーンガイド` / `倉庫` の3導線が成立。
- Scene Guide は `/scene-playbooks` で公開β前の UI として整備中。
- Scene Guide は家族写真、発表会、運動会に続き、旅行・おでかけも含む中核機能へ育てている。
- 主要3シーン（家族写真 / 発表会 / 運動会）は inline detail 対応済み。
- 旅行・おでかけは card-only のまま、まずは要点表示として扱う。
- Scene Playbook はスコアやランキングではなく、撮影条件ごとの失敗しにくい判断を扱う。
- Deep Review はレンズを主語にし、Scene Playbook は撮影シーンを主語にする。

## Current priority

モバイルナビの視認性改善は完了。

現在の優先タスクは、Scene Guide で選んだ撮影条件を相談画面へ引き継ぎ、具体的なレンズ候補の相談へ自然につなぐこと。

今回の方針:

- `docs/current-task.md` を Scene Guide から相談への handoff 実装内容へ更新する。
- 家族写真と発表会の interactive result から、選択条件を含む相談文を生成する。
- handoff は短期画面遷移用の `sessionStorage` に保存し、相談画面で確認後に入力へ反映する。
- 自動送信はせず、通常相談フロー、運動会 detail、旅行の card-only 表示を維持する。
- Lens Condition Resolver、Deep Review、warehouse / API / Dify / localStorage / `public/lens_data.json` には接続変更を加えない。

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
