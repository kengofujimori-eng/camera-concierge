# Public beta manual review

Lens Navi 公開β前の手動レビュー結果メモ。
DB / API / 推薦ロジック / 価格 / localStorage はこの記録では変更しない。

## Current status

- Public name / domain: Lens Navi at https://lensnavi.app
- Canon RF-S: pass
- Canon RF: pass with unresolved RF500mm F4 image note
- Sony E: pass
- Nikon Z: pass
- Fujifilm X: pass with future brand-tone improvement note
- Image audit: ongoing, important for public trust
- Brand / metadata / favicon / OGP: implemented, production cache check still needed
- Affiliate disclosure / disclaimer: implemented, mobile readability check still needed
- Lens warehouse deep review mock: implemented, visual review still needed

## Public beta automated audit workflow

- 公開β前チェックの入口は npm run audit:beta。
- audit:beta は検出専用で、自動修正しない。
- レポートは標準出力と /tmp 系に出る。
- repo 内の audit-output/ は生成物なので commit 禁止。
- P1 は公開β前に確認する。
- P2 はβ後すぐの改善候補として扱う。
- 実Dify回答の自然さ、画像の意味的正誤、トリミングの印象は人間レビューが必要。
- 推奨チェック順:
  - npm run audit:beta
  - npm run build
  - npm run db:check
  - npm run test:e2e

## Brand / production checks

- lensnavi.app で title / favicon / app icon / OGP / header logo を確認する。
- X / LINE / Slack などで OGP カードの再取得を確認する。
- メイン画面に大きな OGP 画像が出ず、初期導線が軽いことを確認する。
- 入力欄左の新規会話ボタンが desktop / mobile で押しやすいことを確認する。

## Affiliate / purchase link checks

- 推薦カードとレンズ倉庫の Amazon リンクが amazon.co.jp に遷移することを確認する。
- Amazon リンクに `tag=techddd-22` が付くことを確認する。
- PR 表記が購入導線近くで分かることを確認する。
- 免責・広告モーダルが desktop / mobile で読めることを確認する。

## Lens warehouse checks

- 所有済み / 欲しいリストの保存と表示を確認する。
- 深掘りレビュー UI モックが開閉できることを確認する。
- `deepReview` がなくても「詳細レビューは準備中です」の fallback UI が自然に見えることを確認する。
- 倉庫内 AI 分析から、チャット用の末尾フォローアップ質問が消えていることを確認する。

## Canon RF-S

- incompatible Viltrox recommendation は修正済み。
- Canon RF-S 選択時に Fujifilm X / Viltrox XF 系が通常候補へ混入しないことを確認済み。
- RF-S では RF-S 専用だけでなく Canon RF フルサイズ用レンズも通常候補に含める方針。
- APS-C 1.6倍換算の説明を確認済み。
- 実機確認 pass。

## Canon RF

- フード単体 / JJCフード商品画像 / 装着説明図の誤混入は修正済み。
- super telephoto の迷彩カバー画像 / 別製品候補画像は修正済み。
- RF24-105mm F2.8 L IS USM Z は画像改善済み。
- RF500mm F4 L IS USM は unresolved。
  - 現状画像は Canon 100-500 に見える別製品候補。
  - Canon 公式の確実な RF500mm F4 L IS USM 商品画像を確認できていない。
  - 正しい根拠が取れるまで自動差し替えしない。

## Sony E

- 推薦整合性 pass。
- マウント互換性の大きな違和感は確認されていない。
- 室内子供、旅行標準ズーム、50mm前後単焦点、望遠 / 運動会の基本シナリオは継続してβ後も見る。

## Nikon Z

- 推薦整合性 pass。
- DX系動作確認済み。
- Nikon Z は S-Line 高級単焦点だけに偏らないかを継続確認する。
- DX機では DX 16-50mm、DX 24mm f/1.7、DX 18-140mm など軽量・実用候補が自然に出るかを見る。
- フルサイズでは Z 24-120mm f/4 S、Z 24-200mm、Z 40mm f/2、Z 28mm f/2.8 など日常・旅行候補も見る。

## Fujifilm X

- 推薦整合性 pass。
- XF50mmF1.0 R WR 画像は修正済み。
- Fujiらしさ改善は今後の課題。
  - 軽快性、趣味性、持ち出したくなる感じをより強めたい。
  - 大型高額レンズだけに寄せない。
  - XF27mmF2.8、XF23mmF2、XF35mmF2、XC35mmF2、XF18-55mmF2.8-4、XF16-50mmF2.8-4.8 などを日常・旅行文脈で拾えるかを見る。

## Image audit

- audit-output/ は生成物なので commit 禁止。
- 人間レビューによるトリミング修正を実施済み。
- 画像監査は公開βの信頼感に直結するため重要。
- フード単体、説明図、装着例、迷彩カバー、別製品疑いは P1。
- 公式商品画像、レンズ単体、白背景または透過背景を優先する。
- 正しい画像が見つからない場合は変更せず、unresolved note に残す。

## Prompt improvement candidates

Nikon Z:

```text
Nikon Z相談では、S-Line高級単焦点や大三元だけに偏らず、旅行・日常・軽快用途では NIKKOR Z 24-120mm f/4 S、24-200mm f/4-6.3 VR、40mm f/2、28mm f/2.8 などの実用人気レンズも優先候補に含めてください。DXボディでは DX 16-50mm、DX 24mm f/1.7、DX 18-140mm など軽量・価格現実性の高い候補をまず検討してください。
```

Fujifilm X:

```text
Fujifilm X相談では、解像力や明るさだけでなく、Xシリーズらしい軽快性・趣味性・持ち出しやすさを重視してください。旅行や日常では XF16-50mmF2.8-4.8、XF18-55mmF2.8-4、Sigma 18-50mm F2.8、軽量重視なら XC15-45mm も候補に含めてください。街歩き・日常単焦点では XF27mmF2.8、XF23mmF2、XF35mmF2、XC35mmF2 を優先的に検討し、大型高額レンズは用途が明確な場合に限定してください。
```

## Not changed in this review

- lens_data.json
- DB structure
- API
- recommendation logic
- price data
- localStorage
- UI

## Audit triage unresolved notes

`npm run audit:triage` により、P1 auto-fix candidate のうち根拠が取れたものだけを修正した。

Resolved:
- Viltrox AF 35mm F1.8 EVO Z ニコンZマウント
  - Viltrox Japan / Viltrox global の公式根拠を確認し、`price_info.new_price` を追加済み。

Unresolved:
- AF 14mm F2.8 FE/RF
  - DB上で FE/RF mixed のため、同一製品・同一マウントとして価格を確定できず保留。
- Viltrox AF 50mm F1.8 Z
  - 公式/販売ページの同一製品価格を確定できず保留。
- Samyang AF 50mm F1.8 FE
  - 公式の商品画像・同一製品ページを確定できず保留。
  - Samyang 45mm F1.8 FE や Viltrox 50mm F1.8 FE と混線しやすいため、画像追加は行わない。

Policy:
- 価格・画像は、同一製品・同一マウントの根拠が取れた場合のみ修正する。
- 曖昧な候補は自動修正せず、manual review / unresolved として残す。
- 公開βでは、価格・画像の違和感があればフィードバック対象とする。

## Public beta three-route manual review

Date: 2026-06-06
Commit: `04220ec`

### Summary

- 相談: localhost の実 Dify 応答で Sony E / 運動会相談を完走し、3件の推薦カード、画像、価格、購入リンク、倉庫保存を確認した。
- シーンガイド: chooser、4件一覧、主要3シーンの detail、家族写真の interactive decision flow、旅行・おでかけの card-only 表示を確認した。
- 倉庫: 相談ルートから保存した欲しいレンズを確認し、価格、画像、AI分析、使いこなし準備中表示、購入導線を確認した。
- 共通ナビ: PC では `相談 / シーンガイド / 倉庫`、390px mobile では `相談 / シーン / 倉庫`。3ルートの active state と遷移を確認した。

### Checks

#### Common navigation

- PC 1280px で、Lens Navi ロゴ、`相談 / シーンガイド / 倉庫`、ダークモード切替を確認した。
- 3ルートそれぞれで、現在ページだけに active gradient outline が表示された。
- ダークモードは on / off / 元の状態への復帰を確認した。
- mobile 390px で `相談 / シーン / 倉庫` が表示され、相談・シーンガイド・倉庫の各ルートで横はみ出しはなかった。

#### Consultation route

- 初回表示、カメラ選択カード、クイック質問、新規会話ボタン、入力欄を確認した。
- `chat-input` と `chat-send-button` が存在することを確認した。
- Sony E フルサイズを選択し、次の相談例で実回答を確認した。

```txt
子供の運動会を撮りたいです。Sony Eマウントでおすすめを教えてください。
```

- 推薦カードは3件表示され、`assistant-answer`、`lens-card` 3件、`lens-card-image` 3件、`price-badge` 6件を確認した。placeholder は表示されなかった。
- 推薦カードの画像、価格、新品 / 中古購入導線、所有済み / 欲しいリストの保存ボタンは自然に表示された。
- 確認した Amazon リンクは `amazon.co.jp` で、`tag=techddd-22` が付いていた。
- PR 表記は購入先の近くに表示されていた。
- 欲しいリストへの保存後、倉庫で保存レンズを確認できた。
- AI回答末尾に「この中からさらに絞るなら...」のフォローアップ質問が残るケースを確認した。表示崩れや推薦停止ではないが、公開β後も回答トーンの確認対象とする。

#### Scene guide route

- 見出し `撮影シーンガイド`、chooser intro、4件の chooser button、4枚カード一覧を確認した。
- `初期モック` 表現は残っていなかった。
- chooser 選択時は対象カード1枚だけになり、`すべてのガイドを見る` で4枚一覧へ戻れた。
- 家族写真:
  - chooser 選択で detail が自動表示された。
  - 室内では 35mm / 50mm、屋外では 85mm / 135mm が中心に表示された。
  - 条件、候補、総評、注意の順で読み進められ、撮影条件で候補を絞る体験になっていた。
- 発表会:
  - detail が表示され、座席、暗所、距離不足、70-200mm の安全性を読み取れた。
- 運動会:
  - detail が表示され、校庭、動体、届くこと、望遠ズーム、一日持ち歩けることを読み取れた。
- 旅行・おでかけ:
  - card-only で表示され、`要点のみ表示中` は強い未完成感なく表示された。
- mobile 390px で、4枚一覧と家族写真 detail 展開時の横はみ出しはなかった。
- `scene-playbook-page`、`scene-playbook-grid`、`scene-guide-chooser`、カード / detail 系の既存 data-testid がコード上維持されていることを確認した。

#### Warehouse route

- 相談ルートから保存した欲しいレンズを倉庫で確認した。
- 保存レンズの画像、価格、焦点距離カバレッジ、AI分析、購入導線、レビュー導線を確認した。
- `使いこなし` を開き、Deep Review 未実装レンズの「使いこなしレビューは準備中です」表示を確認した。
- Scene Guide は倉庫に未接続だが、現状の倉庫単体 UI として不自然な欠落には見えなかった。
- 保存と表示が既存 localStorage 形式で動作した。形式変更は行っていない。
- `lens-card`、`lens-card-image`、`lens-card-placeholder`、`price-badge` は推薦カード側で維持されていることを確認した。倉庫カード自体には同じ data-testid は付いていないため、倉庫内の selector 確認対象ではない。
- mobile 390px で横はみ出しはなかった。

#### Cross-route flow

次の流れを localhost で確認した。

```txt
相談
↓
Sony E / 運動会のレンズ推薦
↓
欲しいリストへ保存
↓
倉庫で保存済みレンズと使いこなし準備中表示を確認
↓
シーンガイドへ移動
↓
運動会ガイドと家族写真の判断フローを確認
```

本番環境、Safari、実機 mobile、外部購入リンクの最終遷移先は今回の localhost レビュー対象外。

### Known issues

- `npm run lint` は ESLint 未設定のため Next.js の対話式セットアップで停止した。今回も設定変更は行っていない。
- `npm run test:e2e` は9件すべて、Playwright Chromium executable 未インストールのためテスト実行前に失敗した。Scene Guide 実装起因ではない。
- `npm run db:check` は exit code 0 で成功し、500 lenses に対する既存 398 warnings を報告した。
- AI回答末尾に不要なフォローアップ質問が残るケースがある。
- 本番ドメイン、Safari、実機 mobile、OGP、外部購入リンクの最終遷移は別途確認が必要。

### Public beta judgment

- Blocker: localhost の主要3導線レビューでは、公開を止める表示崩れ・遷移不能・保存不能は確認されなかった。
- Non-blocking known issues: AI回答末尾のフォローアップ質問、ESLint 未設定、Playwright Chromium 未インストール、DB warning、本番 / 実機 / Safari の最終確認。
- Next recommended task: 本番ドメインと実機 mobile / Safari で3導線を再確認し、AI回答末尾のフォローアップ質問を回答品質課題として切り分ける。
