# Public beta manual review

Camera Concierge 公開β前の手動レビュー結果メモ。
DB / API / 推薦ロジック / 価格 / localStorage はこの記録では変更しない。

## Current status

- Canon RF-S: pass
- Canon RF: pass with unresolved RF500mm F4 image note
- Sony E: pass
- Nikon Z: pass
- Fujifilm X: pass with future brand-tone improvement note
- Image audit: ongoing, important for public trust

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
