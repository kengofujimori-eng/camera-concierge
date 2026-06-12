# Public beta light operation plan

## Purpose

公開β後の実利用を軽く観察し、次に実装するものを感覚や単発意見ではなく、利用状況と重複フィードバックから判断できる状態にする。

この phase では analytics を実装せず、少人数の直接観察、問い合わせ、スクリーンショット、再現情報を中心に確認する。正式な現在地は `docs/active-mission.md`、`docs/scene-guide-visual-polish-review.md`、`docs/scene-guide-public-beta-review.md` とする。古い handoff や launch checklist に残る主要3シーン、旅行 card-only、初期カード改善の記述は現在地として扱わない。

## Observation funnel

```txt
相談 / シーンガイド / 倉庫へ到達
  ↓
目的に合う入口を選べる
  ↓
条件選択または相談入力を完了
  ↓
結果を理解する
  ↓
相談 handoff / 倉庫保存 / 再確認へ進む
  ↓
必要なら AI 深掘りや比較への関心を示す
```

### 相談

- 初回ユーザーが入力欄またはシーン選択へ迷わず進めるか。
- 相談文に対して回答と推薦カードが表示されるか。
- 推薦理由が撮影条件と一致し、明確なマウント非互換がないか。
- 価格、画像、購入リンク、倉庫保存が自然に理解できるか。
- 不要なフォローアップ質問や断定的なおすすめが信頼を下げていないか。

### シーンガイド

- chooser から近いシーンを選べるか。
- 4シーンのどれが使われ、どこで迷うか。
- 条件変更で本命 / 次点 / 安全策が変わる意味を理解できるか。
- Resolver の「レンズ条件」が具体レンズ名の前段として役立つか。
- comparison hooks が期待を作るか、未完成感を強めるか。
- `この条件で相談する` が自然な次の行動になるか。

### 倉庫

- 推薦後に所有済み / 欲しいレンズを保存するか。
- 保存後に倉庫へ戻り、候補を再確認するか。
- 価格、画像、購入リンク、AI分析、使いこなし表示が理解できるか。
- `AIで深掘り` や Deep Review 準備中表示が期待を作るか、混乱を招くか。
- Scene Guide 未接続の現状でも、保存場所として価値が伝わるか。

## Main observation items

### Scene Guide four-scene usage

各利用で次を記録する。

- 選ばれたシーン: 家族写真 / 発表会 / 運動会 / 旅行・おでかけ。
- 最初に選ばれた条件と、変更された条件。
- 本命 / 次点 / 安全策の違いを理解できたか。
- 焦点距離レール、VisualNote、icons、DistanceVisualization のどれが理解を助けたか。
- 家族写真 / 旅行で専用図解が必要そうか。

### Consultation handoff

- CTA が見つかるか。
- Scene Guide から相談画面へ進むか。
- 引き継ぎカードの内容が選択条件と一致するか。
- 自動送信されないことが安心につながるか。
- 入力欄へ反映した後、ユーザーが送信または編集できるか。
- handoff 後の AI 回答が Scene Guide の条件を自然に引き継ぐか。

### Resolver understanding

- 「レンズ条件」が具体商品ではなく必要条件だと理解されるか。
- 焦点距離、レンズタイプ、優先要素、注意点が判断に役立つか。
- 本命を絶対的ランキングと誤解しないか。
- 具体レンズ名を求めるタイミングが consultation handoff と自然につながるか。

### Comparison hooks

- 「比較して深掘り」に関心を示すか。
- placeholder / 連携予定の表示を未完成機能として不満に感じるか。
- どの比較テーマが求められるか。
- 比較への関心が複数ユーザーで確認されるか。

### AI consultation quality

- 相談条件と回答が一致するか。
- マウント、用途、焦点距離、予算を取り違えないか。
- 明確な非互換推薦、別製品、誤った購入リンクがないか。
- 回答が長すぎないか、最後の質問が不要でないか。
- Scene Guide handoff 後の回答が条件を無視していないか。

### Warehouse behavior

- 保存操作が成功し、再訪時に維持されるか。
- 保存したレンズを比較・再確認する行動があるか。
- AI分析や Deep Review 準備中表示が理解されるか。
- 画像、価格、購入リンクに違和感がないか。
- localStorage の既存形式で問題なく動くか。

## Device and browser checks

### Around 390px

- ナビ、chooser、条件ボタン、role badges、CTA が操作可能か。
- detail 展開時に横はみ出しや横スクロールがないか。
- 相談入力欄、handoff card、倉庫カードが画面外へ隠れないか。
- 長い detail でも閉じる / 相談する操作へ到達できるか。

### Android Chrome

- 戻る操作後に Scene Guide / 相談状態が不自然にならないか。
- ソフトウェアキーボード表示時に入力欄と送信操作が使えるか。
- chooser、pill button、購入リンクがタップしやすいか。
- sessionStorage handoff が通常遷移で維持されるか。

### iPhone Safari equivalent

- safe area、固定要素、入力欄、ナビが重ならないか。
- 戻る / 進む後に handoff card が繰り返し表示されないか。
- detail、DistanceVisualization、旅行の6項目 rail が崩れないか。
- 外部購入リンクと免責表示が自然に開けるか。

## What can be checked without analytics

- 直接観察で、入口選択、迷い、操作停止、理解不足を確認する。
- フィードバックごとに route、端末、相談文、選択条件、スクリーンショットを残す。
- 少人数でも同じ問題が繰り返されるかを確認する。
- consultation handoff、倉庫保存、比較への関心は、観察またはユーザーへの短い確認で記録する。
- blocker と推薦品質問題は、件数が少なくても即座に再現確認する。

## When analytics becomes necessary

以下のいずれかが発生した場合だけ、最小 analytics / feedback collection を検討する。

- 直接観察できる人数では、どの route や scene が使われているか判断できない。
- chooser 選択後の離脱や consultation handoff 利用率を、複数ユーザーで比較する必要がある。
- 同じ問題の頻度について、フィードバックと実利用が食い違う。
- 次の大型機能候補を選ぶために、行動量の比較が不可欠になる。

analytics を導入する場合も、まず route view、scene selection、handoff start、warehouse save 程度の最小イベントから始める。相談文や個人情報を不用意に収集しない。

## Feedback record template

```md
## Feedback

- Date:
- Reporter / observation context:
- Route:
- Device / browser / viewport:
- Category:
- Severity:
- Scene / selected conditions:
- Consultation text:
- Lens / mount:
- What happened:
- Expected:
- Reproduction steps:
- Reproducibility: once / repeated / unknown
- Evidence: screenshot / video / URL / console output
- Similar reports:
- Immediate action:
- Follow-up decision:
```

## Review cadence

- blocker は受領時に再現確認する。
- blocker 以外は、単発意見だけで即実装せず、同種の報告をまとめる。
- 定期的に feedback classification と post-beta priority decision を照合する。
- 「声が大きい意見」ではなく、再現性、影響範囲、重複、既存価値への影響で判断する。

## Guardrails

- 公開β直後に大型機能を追加しない。
- UI を細かく触り続けず、利用上の問題が確認された箇所だけ直す。
- recommendation quality の重大問題は、機能追加より優先する。
- stable ID なしで Resolver data connection を拡大しない。
- comparison hooks の関心が未確認のまま Deep Review API を実装しない。
- API / Dify / warehouse / lens data を同時に変更しない。
- Resolver をランキング化しない。
- localStorage / sessionStorage 仕様と既存 data-testid を保護する。
