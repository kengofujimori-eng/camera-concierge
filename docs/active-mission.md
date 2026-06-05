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

現在の優先タスクは、`/scene-playbooks` を公開β前に自然に見える状態へ整えること。

今回の方針:

- `docs/current-task.md` を今回の実装内容に更新する。
- `初期モック` のような弱く見える表現を避け、Scene Guide 単体公開中の文言へ整える。
- 主要3シーン detail 対応済み、旅行・おでかけ card-only の状態を自然に見せる。
- 既存の inline detail UI と `data-testid` を保ったまま、必要最小限の文言・表示調整に留める。
- Scene Guide detail は「この撮影シーンでどう選ぶか」を扱い、Deep Review の「このレンズをどう使うか」と主語を混ぜない。
- warehouse / chat / API / Dify / localStorage / `public/lens_data.json` には接続変更を加えない。

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
