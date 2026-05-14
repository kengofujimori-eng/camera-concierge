# Launch readiness checklist

Camera Concierge public beta 前の実用チェックリスト。
次チャットや将来の Codex が迷わないよう、短く確認観点を残す。

## Current readiness

- main 最新: 536d5d3 test: add RF-S indoor child recommendation smoke case
- RF-S 推薦品質改善フェーズは実施済み。
- build / db:check / e2e は通過済み。
- e2e は 7 tests passed。
- UI 方向性は Precision Console。
- docs 以外のコード、lens DB、画像、価格、affiliate、localStorage、data-testid はこの pass では触らない。

## Must check before public beta

- main が最新であること。
- Vercel 本番に最新 main が反映されていること。
- スマホ表示で初回導線が破綻していないこと。
- 主要マウントで推薦カード、画像、価格バッジ、倉庫操作が見えること。
- 変な推薦、画像不備、欠損データを見つけたら小さく分けて直すこと。

## Recommendation quality checks

主要マウント別に手動で確認する。

- Sony E
  - 室内子供
  - 旅行標準ズーム
  - 50mm 単焦点
  - 望遠 / 運動会
- Canon RF
  - 旅行
  - 子供撮影
  - 標準ズーム
- Canon RF-S
  - R50 / R10 / R7 向け
  - 室内子供
  - 旅行
  - APS-C 1.6倍換算の説明
  - RF-S 専用だけでなく RF フルサイズ用レンズも通常候補に入ること
  - EF-M は非互換、EF / EF-S はアダプター前提として扱われること
- Nikon Z
  - フルサイズ標準域
  - DX 入門機
- Fujifilm X
  - 旅行
  - 日常
  - 単焦点

## Image / lens data checks

- 主要候補の画像が正しい製品画像になっていること。
- フードだけ、キャップだけ、白背景の極小表示、別製品画像になっていないこと。
- 画像変更時は npm run audit:images を実行する。
- audit-output/ は生成物なのでコミットしない。
- npm run db:check は warnings only の場合がある。
- ただし主要候補の欠損、互換性ミス、画像ミスは優先して直す。

## UX / first-time user checks

- 初見で「カメラと用途からレンズを相談するアプリ」だと分かること。
- まずマウントを選ぶ必要があると分かること。
- マウント未選択時の導線が自然なこと。
- 倉庫機能の意味が分かること。
- スマホでチャット入力、送信、推薦カード、価格バッジが読めること。
- light / dark mode で sidebar が読めること。

## Production / Vercel checks

- Vercel の最新 deployment が main を指していること。
- 本番 URL で主要シナリオを手動確認すること。
- スマホ幅で初回導線、チャット、推薦カードを確認すること。
- ローカルでは通常チェックを通すこと:
  - npm run build
  - npm run db:check
  - npm run test:e2e
- Playwright / Chromium が環境理由で落ちた場合は、エラーをそのまま記録する。

## Feedback and launch notes

- β公開後は変な推薦をスクリーンショット付きで集める。
- 画像不備はレンズ名、表示画像、期待画像をセットで記録する。
- 互換性ミスはカメラ本体、マウント、推薦されたレンズ名を記録する。
- 初見ユーザーが迷った箇所を優先して直す。
- 大きな設計変更より、小さな修正を積む。

## Not in scope for this pass

- 推薦ロジックの大きな変更。
- Dify / API 契約の変更。
- lens DB の大規模整理。
- 価格、review link、affiliate link の変更。
- localStorage format の変更。
- 既存 data-testid の rename / remove。
- UI 全体の再設計。

## Public beta manual review log

公開β前に、本番 URL / 実機 / スマホ幅で確認する。
この表は「実際に人に触ってもらえる状態か」を見るための記録欄。

### Review environment

- Date:
- Reviewer:
- Device:
- Browser:
- URL:
- Commit:

### Severity

- P0: 公開βブロッカー。公開前に必ず修正。
- P1: β前にできれば修正。誤推薦、互換性ミス、主要画像ミスなど。
- P2: βでは許容。公開後の改善で対応。
- P3: メモ。好み、文言、軽微な違和感。

### Manual scenario results

| Mount | Scenario | Prompt | Result | Notes | Severity |
| --- | --- | --- | --- | --- | --- |
| Sony E | 室内子供撮影 | Sony Eマウントで、室内で子供を撮るのにおすすめのレンズを教えてください。 | 未確認 |  |  |
| Sony E | 旅行標準ズーム | Sony Eマウントで旅行用の標準ズームを探しています。軽さと画質のバランス重視です。 | 未確認 |  |  |
| Sony E | 50mm前後単焦点 | Sony Eマウントで50mm前後の単焦点が欲しいです。ポートレートと日常で使います。 | 未確認 |  |  |
| Sony E | 運動会 / 望遠 | Sony Eマウントで運動会を撮りたいです。望遠レンズのおすすめを教えてください。 | 未確認 |  |  |
| Canon RF | 旅行 | Canon RFマウントで旅行用に1本だけ持っていくなら、どのレンズがいいですか？ | 未確認 |  |  |
| Canon RF | 子供撮影 | Canon RFマウントで子供撮影におすすめのレンズを教えてください。 | 未確認 |  |  |
| Canon RF | 標準ズーム | Canon RFマウントで標準ズームを選びたいです。初心者でも扱いやすいものがいいです。 | 未確認 |  |  |
| Canon RF-S | R50 / 室内子供 | Canon EOS R50を使っています。室内で子供を撮るおすすめレンズを教えてください。 | 未確認 | RF-S / RF候補、APS-C換算、超広角の扱いを見る |  |
| Canon RF-S | R10 / 旅行 | Canon EOS R10で旅行に使うレンズを探しています。軽くて便利なものがいいです。 | 未確認 | RF-S専用だけに閉じていないかを見る |  |
| Canon RF-S | R7 / 日常 | Canon EOS R7を使っています。APS-C換算も含めて、日常撮影向けレンズを教えてください。 | 未確認 | 1.6倍換算説明を見る |  |
| Canon RF-S | 換算説明 | Canon RF-S機で24mmや35mmや50mmのレンズを使うと、画角はどんな感じになりますか？ | 未確認 | 24mm=約38mm、35mm=約56mm、50mm=約80mm相当を確認 |  |
| Canon RF-S | EF-M互換性 | Canon EOS R50でEF-Mレンズは使えますか？おすすめ候補に入りますか？ | 未確認 | EF-M非互換、EF/EF-Sはアダプター前提の説明を見る |  |
| Nikon Z | フルサイズ標準域 | Nikon Zのフルサイズ機で、標準域のおすすめレンズを教えてください。 | 未確認 |  |  |
| Nikon Z | DX入門機 | Nikon Z fcまたはZ50で、最初に買うレンズを選びたいです。 | 未確認 | DX / フルサイズの扱いを見る |  |
| Nikon Z | DX旅行・日常 | Nikon Z DX機で旅行と日常に使いやすいレンズを教えてください。 | 未確認 |  |  |
| Fujifilm X | 旅行 | Fujifilm Xマウントで旅行におすすめのレンズを教えてください。 | 未確認 |  |  |
| Fujifilm X | 日常 | Fujifilm Xマウントで日常撮影に使いやすいレンズを探しています。 | 未確認 |  |  |
| Fujifilm X | 単焦点 | Fujifilm Xマウントで単焦点を1本買うなら、どれがいいですか？ | 未確認 | 23mm / 35mm / 50mm系の説明を見る |  |

### Findings

| Severity | Area | Finding | Action |
| --- | --- | --- | --- |
|  |  |  |  |

### Beta decision

- [ ] P0 がない
- [ ] 主要マウントで推薦カードが表示される
- [ ] 主要候補の画像に明らかな別製品がない
- [ ] スマホ幅で初回導線、チャット、推薦カード、価格バッジが読める
- [ ] 倉庫操作が最低限分かる
- [ ] 公開βで集めるべきフィードバック観点が明確

