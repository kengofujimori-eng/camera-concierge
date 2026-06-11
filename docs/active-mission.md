# Active mission

Lens Navi は、旧 camera-concierge から継続して、単なるレンズレビューサイトではなく「撮影判断ナビ」へ発展中である。

現在の中心テーマは、ユーザーがレンズ名やスペックだけでなく、撮影シーン、距離、明るさ、被写体の動き、持ち出しやすさから判断できる導線を整えること。

## Current direction

- Lens Navi は「レンズレビューサイト」ではなく「撮影判断ナビ」へ発展中。
- 主要導線として `相談` / `シーンガイド` / `倉庫` の3導線が成立。
- Scene Guide は `/scene-playbooks` で公開β前の UI として整備中。
- Scene Guide は家族写真、発表会、運動会に続き、旅行・おでかけも含む中核機能へ育てている。
- 主要3シーン（家族写真 / 発表会 / 運動会）は interactive decision flow 対応済み。
- 主要3シーン（家族写真 / 発表会 / 運動会）は、選択した条件を相談画面へ引き継ぐ handoff 対応済み。
- 旅行・おでかけは card-only のまま、まずは要点表示として扱う。
- Scene Playbook はスコアやランキングではなく、撮影条件ごとの失敗しにくい判断を扱う。
- Deep Review はレンズを主語にし、Scene Playbook は撮影シーンを主語にする。

## Current priority

モバイルナビの視認性改善と Scene Guide の公開β review は完了。

現在の優先タスクは、主要3シーンを interactive guide から具体的な相談へつなぎ、公開β前に一貫した体験として確認できる状態にすること。

今回の方針:

- 運動会ガイドの会場・距離・動き・候補焦点距離を、既存の structured handoff 形式へ変換する。
- 家族写真 / 発表会と同じ `sessionStorage` handoff と相談画面の確認カードを再利用する。
- 自動送信は行わず、ユーザーが内容を確認してから入力欄へ反映する。
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
