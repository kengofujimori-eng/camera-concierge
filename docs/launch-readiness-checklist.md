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


## Price data review notes

公開β前の実機確認で、推薦内容は自然でも価格表示が信頼感を損なうケースがあることを確認した。

Example:
- RF35mm F1.8 Macro IS STM が Canon RF-S / R50 室内子供撮影の候補として表示された。
- 推薦内容自体は概ね自然だった。
- ただし新品価格が 157,000 円として表示され、高すぎる可能性があった。
- この種の問題は推薦ロジックではなく、price_info の個別データ品質問題として扱う。

Current policy:
- 価格は推薦品質の一部として扱う。
- 推薦候補の妥当性、画像の正確性、価格の妥当性をセットで確認する。
- 主要候補に出やすいレンズから優先的に価格妥当性を確認する。
- 明らかな価格異常は P1 として β前修正候補にする。
- ただし価格データ全体の大規模更新は、この公開β前チェックでは行わない。
- 個別修正する場合も、対象レンズを限定して小さく変更する。

Future price update direction:
- 価格更新は別フェーズで扱う。
- まずは scripts/check_lens_data.js などで価格異常候補を検出する。
- 自動で価格を書き換えるのではなく、最初は review 用レポート生成に留める。
- 価格.com 等と連携する場合は、レンズ名検索だけに頼らない。
- 可能なら kakaku item ID / kakaku URL を検証済み source として保持する。
- レンズ名、マウント、メーカー、焦点距離、F値、公式URL、価格.com item ID を突合して、誤マッチを避ける。
- 新品価格と中古価格は別々の source / fetched_at を持てる設計を検討する。
- 価格差分が大きい場合は自動反映せず、人間が確認してから反映する。

Potential audit checks:
- used_price が new_price より高い。
- used_price が new_price の一定倍率以上。
- 非L / 小型単焦点なのに新品価格が極端に高い。
- 中古価格に対して新品価格が不自然に高すぎる。
- 価格取得日 fetched_at が古い。
- kakaku_url がない、またはレンズ名と item が一致しているか未確認。
- price_info がない、または new_price / used_price が両方 null。


## Image audit unresolved notes

公開β前画像監査で、Canon RF 系の明らかなフード画像・説明図・迷彩カバー画像は Batch 1 / Batch 2 で修正済み。

Resolved image batches:
- fix: replace Canon RF hood images
- fix: replace Canon RF super telephoto images
- fix: adjust processed lens image crops
- fix: replace RF24-105 F2.8 Z image

Unresolved / follow-up:
- RF_500mm_F4_L_IS_USM.png
  - 現状画像は Canon 100-500 に見える別製品候補。
  - Canon 公式の確実な RF 500mm F4 L IS USM 商品画像を確認できなかったため未変更。
  - 正しい根拠が取れるまで自動差し替えしない。
- XF200mmF2_R_LM_OIS_WR.png
  - 白い望遠レンズ本体に加えて、テレコン/アクセサリ状のものが一緒に写っている。
  - 主役はレンズなので公開βブロッカーではないが、単体画像があれば差し替え候補。
- RF_24-105mm_F2.8_L_IS_USM_Z.png
  - 説明カード残骸のある画像から一度修正済み。
  - 最終カード表示でサイズ・位置・印象を確認する。

Image correction rule:
- 正しいレンズ単体画像の根拠が取れない場合は、無理に差し替えない。
- フード単体、説明図、装着例、迷彩カバー、別製品疑いは P1。
- 単体画像ではないが主役レンズが明確なものは P2 として後続対応。

