# Public beta feedback classification

## Purpose

公開βのフィードバックを、緊急度、再現性、影響範囲、必要な証拠で分類する。

単発の好みと、複数ユーザーに共通する問題を分け、次の実装優先度を安定させるための基準である。

## Common evidence

可能な範囲で、各フィードバックに以下を残す。

- 発生日時。
- route と直前の導線。
- 端末、OS、ブラウザ、viewport。
- 再現手順と再現回数。
- screenshot または短い画面録画。
- Scene Guide の scene と選択条件。
- 相談文、選択マウント、カメラ、予算。
- 表示されたレンズ名、画像、価格、購入リンク。
- 期待した挙動と実際の挙動。

相談文や個人情報を残す場合は、必要部分だけに限定する。

## Severity and repetition

### Single report

- blocker 候補は単発でも即座に再現確認する。
- blocker 以外は、再現性と影響範囲を確認してから実装判断する。
- 好みや機能要望は、単発では backlog 候補に留める。

### Repeated pattern

- 異なるユーザー、端末、相談条件で同じ問題が2回以上発生した場合は、共通問題候補として扱う。
- 同一ユーザーが同じ操作で繰り返し再現できる場合も、再現性の高い問題として扱う。
- 件数だけでなく、主要ファネルを止めるか、信頼を損なうかを重視する。

## Blocker

### Definition

主要routeの利用、相談、判断、保存、購入導線を止める、または明確に誤った判断・購入へ導く問題。

### Examples

- `相談` / `シーンガイド` / `倉庫` の主要routeへ進めない。
- 相談送信または回答表示ができない。
- 明確なマウント非互換レンズを通常候補として推薦する。
- Scene Guide の選択条件と結果が明確に不一致。
- consultation handoff が破損し、条件が失われる、誤る、または自動送信される。
- 倉庫保存または再表示が破損する。
- モバイルで主要CTAや入力欄が操作不能。
- 購入リンクが明確な別製品へ遷移する。

### Boundary

表示の好み、軽微な余白、説明文の長さ、placeholder 機能は、主要操作を妨げない限り blocker ではない。

### Priority

最優先。単発でも即時再現確認し、確認できた場合は新機能を止めて最小修正を検討する。

### Single vs repeated

単発でも blocker 条件を満たせば対応候補にする。複数ユーザーで発生する場合は影響範囲を広く見積もり、公開継続判断も含めて扱う。

### Required reproduction evidence

- route、端末、操作手順、発生結果。
- screenshot / video / console output。
- 相談系では相談文、マウント、推薦レンズ名。
- 購入リンク系ではリンク元、遷移先、対象製品名。

## Usability issue

### Definition

機能は動くが、見つけにくい、理解しにくい、操作しにくい問題。

### Examples

- chooser が押せると分かりにくい。
- detail が長く、CTAへ到達しにくい。
- role badges や Resolver の意味を誤解する。
- モバイルで条件ボタンが窮屈。
- 倉庫保存後の確認場所が分からない。

### Blocker boundary

主要操作が不可能なら blocker。時間はかかるが完了できる場合は usability issue。

### Priority

複数ユーザーで同じ迷いが確認された場合に高める。単発では観察継続を基本とする。

### Single vs repeated

単発は操作環境や慣れの影響を確認する。異なるユーザーが同じ箇所で止まる場合は、共通 usability issue として改善候補にする。

### Required reproduction evidence

- 迷った箇所、停止時間、最終的に完了できたか。
- route、端末、viewport、スクリーンショット。
- 同種の報告件数。

## Wording issue

### Definition

表示文言、ラベル、説明が誤解、不安、違和感を生む問題。

### Examples

- `本命` が絶対ランキングに見える。
- `比較して深掘り` が実遷移できるように見える。
- AI回答が断定的すぎる。
- 未完成表示が公開βの価値を弱く見せる。

### Blocker boundary

文言が明確な誤購入や危険な判断へ導く場合は blocker または recommendation quality issue。印象や分かりにくさに留まる場合は wording issue。

### Priority

影響範囲が広く、小さな修正で改善できる場合は早めに対応する。単発の言い回しの好みは急がない。

### Single vs repeated

単発の語感の好みは記録に留める。同じ誤解や不安が複数回発生する場合は、共通 wording issue として扱う。

### Required reproduction evidence

- 問題の文言、route、周辺文脈。
- ユーザーがどう解釈したか。
- 望ましい意味。

## Recommendation quality issue

### Definition

AI回答、推薦候補、Scene Guide の判断結果が、入力条件や実用上の自然さに合わない問題。

### Examples

- 運動会で距離が遠いのに短い単焦点だけを主力として勧める。
- 旅行で軽さ優先なのに大型高額レンズへ偏る。
- Scene Guide handoff の条件を AI回答が無視する。
- マウントは合うが用途、予算、距離に不自然な候補を出す。

### Blocker boundary

明確な非互換、危険な誤情報、購入判断を大きく誤らせる問題は blocker。候補の偏りや説明不足は recommendation quality issue。

### Priority

重大度が高い場合は他の product phase より優先する。複数シナリオで繰り返す場合は AI相談品質改善を次タスク候補にする。

### Single vs repeated

単発でも明確な非互換や重大な条件無視なら blocker へ上げる。軽度でも複数ユーザーや複数相談で繰り返す場合は、AI相談品質改善を優先候補にする。

### Required reproduction evidence

- 完全な相談文、選択マウント、ボディ、予算、用途。
- AI回答と推薦されたレンズ名。
- 何が不自然か、より自然な候補または判断軸。
- 再現回数。

## Missing lens / data issue

### Definition

必要なレンズがDBにない、または画像、価格、マウント、リンク、availability などのデータが不足・誤りである問題。

### Examples

- 自然な候補が `public/lens_data.json` に存在しない。
- 別製品画像、価格欠損、誤った購入リンク。
- マウントや世代が曖昧なレコード。
- Resolver data connection に必要な stable ID がない。

### Blocker boundary

明確な別製品購入リンク、非互換推薦、主要候補の重大な誤データは blocker。候補不足や軽微な欠損は data issue。

### Priority

推薦頻度、購入影響、再現性で判断する。曖昧なレコードは推測で直さず、証拠が揃うまで保留する。

### Single vs repeated

単一レンズの欠損は利用頻度と購入影響で判断する。同じブランド、マウント、世代で欠損が繰り返す場合は、個別修正ではなくデータ整備課題として扱う。

### Required reproduction evidence

- レンズ名、マウント、モデルコード、表示箇所。
- 現在データと期待データ。
- メーカーまたは販売元の根拠URL。
- 画像・リンクの場合は表示と遷移先のスクリーンショット。

## Feature request

### Definition

現行機能の破損ではなく、新しい価値、接続、シーン、表示を求める要望。

### Examples

- comparison hooks から実比較を読みたい。
- 家族写真 / 旅行にも専用図解が欲しい。
- Scene Guide と倉庫を接続したい。
- 新しいシーンやマウントに対応してほしい。

### Blocker boundary

要望がなくても主要ファネルが成立するなら blocker ではない。現行説明が必要情報を欠き誤判断を生む場合は usability または recommendation quality issue。

### Priority

単発では backlog。複数ユーザーの共通要望、既存ファネルとの整合、依存関係、最小scopeを確認して判断する。

### Single vs repeated

単発要望は背景となる困りごとを記録する。異なるユーザーが同じ目的で求める場合は、post-beta priority decision の着手条件と照合する。

### Required reproduction evidence

- 何を達成したかったか。
- 現行機能でどこまでできたか。
- 要望が解決する具体的な困りごと。
- 同種要望の件数。

## Non-issue / misunderstanding

### Definition

仕様どおり動作している、または説明で解消できる誤解。実装変更が必要とは限らない。

### Examples

- `本命` をランキングと誤解したが、条件別候補だと説明すると解消した。
- comparison hooks を実比較機能と思ったが、連携予定表示を見落としていた。
- Scene Guide の結果が具体商品名ではないことを不具合と思った。

### Blocker boundary

同じ誤解が複数ユーザーで起きる場合は wording または usability issue へ再分類する。

### Priority

原則は記録のみ。繰り返す場合は説明・表示改善を検討する。

### Single vs repeated

単発で説明により解消する場合は non-issue のままにする。同じ誤解が複数回起きる場合は、wording issue または usability issue へ再分類する。

### Required reproduction evidence

- 誤解した箇所と理由。
- 説明後に解消したか。
- 同じ誤解の発生件数。

## Triage order

1. blocker を即時再現確認する。
2. recommendation quality issue と重大な data issue を確認する。
3. 複数ユーザーに共通する usability / wording issue をまとめる。
4. feature request は post-beta priority decision の条件と照合する。
5. non-issue は記録し、繰り返す場合だけ再分類する。

## Recorded public beta issue: profile settings persistence

- Category: usability issue
- Priority: High
- Blocker: no
- Report: 新規会話ではプロフィール設定を保持すると表示されるが、実際にはマウントやカメラの再選択が必要になる。
- Impact: 新規会話とページ再読み込みのたびに再設定が必要となり、相談開始までの利用摩擦が大きい。
- Cause: raw stringとして保存されたプロフィール値をJSON loaderで読み込み、parse失敗時にfallbackへ戻っていた。
- Boundary: 主要routeや相談送信そのものは利用可能なためblockerではない。ただし表示と挙動が矛盾し、繰り返し発生するため即時修正対象とする。
- Scope: localStorageの既存キーと保存形式を維持し、読み込み処理だけを分離する。
