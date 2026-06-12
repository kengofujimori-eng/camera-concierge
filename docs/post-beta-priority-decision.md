# Post-beta priority decision

## Purpose

Public Beta Light Operation & Feedback Review の観察結果から、次に着手する product phase を選ぶ基準を定義する。

固定順位ではなく、重大度、重複、実利用、依存関係、最小scopeで判断する。

## Decision principles

- recommendation quality の重大問題があれば、他候補より E を優先する。
- B: Resolver data connection pilot は A: Stable ID pilot より先に行わない。
- comparison hooks への関心が複数回確認された場合に C を検討する。
- 家族写真 / 旅行で理解不足が複数回確認された場合だけ D を検討する。
- analytics は、少人数の直接観察では判断できない場合だけ F を検討する。
- Deep Review API 接続を急がない。
- Resolver をランキング化しない。
- API / Dify / warehouse / lens data を同時変更しない。
- blocker 修正はこの候補選定より優先する。

## A. Stable ID pilot

### Start when

- Resolver data connection または Deep Review 比較接続の必要性が観察で確認された。
- 主要レンズの関連付けを表示名だけで維持するリスクが具体化した。
- 対象を Sony FE の主要レンズなど小さなセットに絞れる。

### Do not start when

- 具体レンズ接続への関心がまだ確認できない。
- 命名ルール、対象レンズ、重複確認が曖昧。
- lens data の別問題と同時に大規模整理しようとしている。

### Needed observations

- 具体候補を見たいという要望。
- comparison hooks や Resolver から次へ進みたい行動。
- 表示名や model_code だけでは関連付けが不安定な実例。

### Dependencies

- `docs/lens-data-stable-id-plan.md`。
- `public/lens_data.json` の主要レンズ表記確認。

### Minimum scope

- Sony FE の主要5〜10本へ optional `stable_id` を追加する pilot。
- 既存推薦、warehouse item id、localStorage 形式に依存させない。

### Do not change

- warehouse item の既存 `id`。
- recommendation logic、API / Dify、全レンズDB。

## B. Resolver data connection pilot

### Start when

- A の stable ID pilot が完了している。
- 「レンズ条件の次に具体候補を見たい」という観察が複数ある。
- 1シーン / 1マウントへ絞れる。

### Do not start when

- stable ID がない。
- Resolver の意味自体が理解されていない。
- 具体候補より AI相談品質の問題が大きい。

### Needed observations

- Resolver card を理解し、具体レンズへ進みたい行動。
- 発表会または旅行など、利用が確認されたシーン。
- 対象マウントと主要候補の需要。

### Dependencies

- A: Stable ID pilot。
- 対象レンズの mount、焦点距離、タイプ、役割情報。

### Minimum scope

- 1シーン / Sony FE / 少数候補の deterministic resolver。
- 本命 / 安全策 / 条件付きとして表示し、ランキングにしない。

### Do not change

- 全マウント、全レンズ、Dify prompt、warehouse localStorage。

## C. Deep Review comparison format

### Start when

- comparison hooks への関心や比較要望が複数確認された。
- 求められる比較テーマが特定できる。
- static comparison format で価値を検証できる。

### Do not start when

- placeholder が未完成感を生むだけで、比較への関心がない。
- 具体レンズの関連付けが必要なのに stable ID がない。
- API生成を先に実装しようとしている。

### Needed observations

- 85mm vs 135mm、135mm vs 70-200mm など実際に求められる比較。
- ユーザーが比較で知りたい判断軸。
- Scene Guide から比較へ進む意欲。

### Dependencies

- comparison format の静的設計。
- 実レンズ接続を行う場合は A。

### Minimum scope

- 1〜2テーマの static comparison docs / panel。
- 条件別の違い、注意、Scene Guide との接続を短く示す。

### Do not change

- Deep Review API / Dify、全比較生成、ランキング。

## D. Family / travel visualization small pass

### Start when

- 家族写真の距離感、または旅行の軽さ / 便利さで理解不足が複数回確認された。
- 専用図解で解消できる具体的な迷いがある。

### Do not start when

- 見た目の好みだけで、利用上の問題がない。
- 単発意見しかない。
- 図解追加で detail がさらに重くなる。

### Needed observations

- どの条件・焦点距離で迷ったか。
- 説明文や既存レールで解消できなかったか。
- 複数ユーザーで同じ理解不足があるか。

### Dependencies

- `DistanceVisualization` pilot と Visual Polish Review。

### Minimum scope

- 家族写真または旅行の片方だけへ compact な図解を追加する。
- result logic は変更しない。

### Do not change

- recommendation / Resolver / comparison / handoff logic。

## E. AI consultation quality improvement

### Start when

- recommendation quality issue が重大、再現可能、または複数シナリオで繰り返す。
- 明確なマウント非互換や条件無視が確認された。
- Scene Guide handoff 後の回答が選択条件を無視する。

### Do not start when

- 単発で再現できない好みの違い。
- 原因が lens data / missing lens issue なのに prompt だけで直そうとしている。
- UI問題と回答品質問題を同時変更しようとしている。

### Needed observations

- 完全な相談文、マウント、条件、回答、推薦レンズ。
- 再現回数と期待される判断。
- Dify / prompt / data のどこが原因かの切り分け。

### Dependencies

- Feedback classification による recommendation quality issue の証拠。

### Minimum scope

- 1つの再現可能な重大シナリオを対象に、小さな修正と確認を行う。

### Do not change

- UI、warehouse、lens data を同時に変更しない。
- 根拠なく推薦ルールを広げない。

## F. Analytics / feedback collection minimum introduction

### Start when

- 少人数の直接観察だけでは、route / scene / handoff / save の利用差を判断できない。
- 次のphase選定に頻度データが不可欠。
- フィードバック件数と実利用の傾向が食い違う。

### Do not start when

- 直接観察と手動記録で十分判断できる。
- 収集目的、保存期間、プライバシー範囲が曖昧。
- 相談文や個人情報を広く収集しようとしている。

### Needed observations

- 判断できなかった具体的な問い。
- 必要な最小イベントと、そのイベントで変わる意思決定。

### Dependencies

- 収集目的、privacy、保管、確認方法の docs。

### Minimum scope

- route view、scene selection、consultation handoff start、warehouse save など最小イベント。
- 自由入力の相談文は原則収集しない。

### Do not change

- recommendation logic、API / Dify payload、storage 仕様を同時に変更しない。

## Decision matrix

| Observation | Preferred next candidate |
| --- | --- |
| 明確な非互換推薦、条件無視、重大な回答品質問題 | E |
| Resolver の次に具体候補を求める声が複数あり、stable ID 未導入 | A |
| A 完了後、特定シーン / マウントで具体候補需要がある | B |
| comparison hooks への関心と比較テーマが複数確認された | C |
| 家族写真 / 旅行の同じ理解不足が複数確認された | D |
| 直接観察だけでは利用傾向を判断できない | F |
| blocker がある | 候補選定を止め、blocker を最小修正 |

## Selection process

1. Feedback を分類し、blocker を除外・対応する。
2. 同種フィードバックの重複と再現性を確認する。
3. 主要ファネルへの影響と product value を確認する。
4. 依存関係を満たす候補だけを残す。
5. 最小scopeと変更禁止範囲を定義する。
6. `docs/current-task.md` に1タスクとして切り出す。

## Guardrails

- 固定 roadmap を実利用より優先しない。
- 単発 feature request を大型実装へ直結させない。
- stable ID なしで Resolver data connection を拡大しない。
- Deep Review API 接続を急がない。
- Resolver をスコア / ランキング化しない。
- API / Dify / warehouse / lens data を同時変更しない。
- 公開βで成立している相談 / シーンガイド / 倉庫を壊さない。
