# Launch readiness checklist

Lens Navi public beta 前の実用チェックリスト。
次チャットや将来の Codex が迷わないよう、完了済み・残タスク・次フェーズを短く残す。

## Current readiness

- 公開名: Lens Navi。
- 本番ドメイン: https://lensnavi.app。
- 旧 Camera Concierge 表記は、公開向け UI / metadata では Lens Navi に変更済み。
- 最新付近の重要コミット:
  - 29894e5 fix: trim follow-up questions in warehouse analysis
  - 7ea17a3 feat: add lens deep review mock panel
  - ba94afe fix: handle decorated recommendation choice labels
  - 069ed9d docs: add lens warehouse deep review design
  - f4fdfbd feat: add disclosure and input reset controls
- UI 方向性は白 / slate ベース + blue → purple → magenta の local accent。
- 推薦ロジック、Dify / API、lens DB、localStorage 形式、data-testid は維持する。

## Completed before public beta

### Brand / domain

- Lens Navi に公開名変更済み。
- lensnavi.app を Vercel に接続済み。
- title / metadata / OGP / Twitter metadata を Lens Navi / lensnavi.app に更新済み。
- favicon / app icon / OGP 画像を追加済み。
- 左上ロゴも Lens Navi アイコンに更新済み。

### UI / design

- blue → purple → magenta の gradient outline / subtle glow 方針に整理済み。
- ヘッダーから重複ブランドを整理し、左上に Lens Navi ブランドを配置済み。
- サイドバーの重複ブランドは削除済み。
- 入力欄左に新規会話ボタンを復活済み。
- メイン画面に大きな OGP 画像は出さず、初期導線を軽く維持。
- 選択カード / スライダー / hover outline の統一感を改善済み。
- `相談 / シーンガイド / 倉庫` の主要3導線を localhost の PC 1280px / mobile 390px で手動確認済み。
- Scene Guide は4件を表示し、主要3シーンの detail と家族写真の interactive decision flow を確認済み。

### Affiliate / purchase links

- Amazon リンクは amazon.co.jp に正規化済み。
- `tag=techddd-22` を付与。
- ProductCard / WarehouseList など直接 URL 経路も共通ヘルパー経由に修正済み。
- アフィリエイト表記・免責表示を追加済み。
- サイドバー下部 / 入力欄下 / 購入リンク周辺に控えめな PR 表記あり。
- Amazon アソシエイト表記、価格 / 在庫 / 仕様変動、AI 提案の免責を表示済み。

### Recommendation display

- 選択肢 1〜3 のカード表示を改善済み。
- `✨【選択肢3】` などの表記ゆれでもカード化されるよう修正済み。
- 選択肢 3 が本文に残るバグを修正済み。

### Lens warehouse

- レンズ倉庫 UI 改善済み。
- 所有済み / 欲しいリスト導線あり。
- レンズ倉庫の深掘りレビュー設計 docs を追加済み。
- レンズ倉庫に深掘りレビュー UI モックを追加済み。
- `deepReview` がない場合は「詳細レビューは準備中です」の fallback UI を表示。
- `AIで深掘り` は準備中ボタン風 UI のみで、API 呼び出しはなし。
- 倉庫内 AI 分析から、チャット用の末尾フォローアップ質問を表示時だけ除去済み。
- localStorage 形式は維持。

### Preserved constraints

- 推薦ロジックは変更なし。
- Dify / API は変更なし。
- lens DB の大規模変更なし。
- 価格 / 画像 / affiliate URL 生成以外のデータ構造は維持。
- localStorage 形式は維持。
- data-testid は壊していない想定。

## Must check before public beta

### Device / browser

- desktop / mobile で確認する。
- Chrome / Safari など最低限のブラウザで見る。
- https://lensnavi.app で表示名、favicon、OGP、ヘッダー、倉庫、入力欄を確認する。

### OGP

- X / LINE / Slack などでカード表示を確認する。
- キャッシュが残る場合は再取得を確認する。

### Purchase links

- 推薦カードの Amazon リンクを確認する。
- レンズ倉庫内の Amazon リンクを確認する。
- 楽天 / Yahoo / 中古リンクがある場合の遷移を確認する。
- Amazon は amazon.co.jp と `tag=techddd-22` を確認する。

### Affiliate / disclaimer

- PR 表記が邪魔でないか確認する。
- 免責モーダルがモバイルで読めるか確認する。
- 文言が過剰 / 不足でないか確認する。

### Lens warehouse deep review

- 深掘りレビュー UI モックの高さ・読みやすさを確認する。
- 「詳細レビューは準備中です」の fallback が自然に見えるか確認する。
- 今後、売れ筋 5〜10 本だけ手動 `deepReview` を追加する候補を決める。
- まだ AI API は追加しない。

### Recommendation quality

主要シナリオを手動確認する。

- 子供 / 室内
- ポートレート
- 風景 / 星空
- 運動会 / スポーツ
- Sony E
- Canon RF
- Canon RF-S / APS-C
- Nikon Z
- Fujifilm X

注意:
- RF-S / APS-C でフルサイズレンズに偏りすぎないか見る。
- 実Dify回答の自然さ、画像の意味的正誤は人間レビューで確認する。
- Sony E / 運動会相談は localhost で推薦カード、購入リンク、倉庫保存まで確認済み。
- AI回答末尾に不要なフォローアップ質問が残るケースは、公開β後も回答品質課題として確認する。

### Three-route final checks

- localhost の `相談 → 推薦 → 倉庫保存 → 倉庫確認 → シーンガイド` は確認済み。
- 本番ドメインで `相談 / シーンガイド / 倉庫` を再確認する。
- Safari と実機 mobile でナビ、Scene Guide detail、倉庫カードを確認する。
- 旅行・おでかけガイドは card-only のため、`要点のみ表示中` が自然に見えることを継続確認する。

## Image / lens data checks

- npm run audit:beta は自動修正しない検出専用ツール。
- audit:beta のレポートは標準出力と /tmp 系に出る。
- audit:beta の P1 は公開β前に確認する。
- audit:beta の P2 はβ後すぐの改善候補として扱う。
- 主要候補の画像が正しい製品画像になっていること。
- フードだけ、キャップだけ、白背景の極小表示、別製品画像になっていないこと。
- 画像変更時は npm run audit:images を実行する。
- audit-output/ は生成物なのでコミットしない。
- npm run db:check は warnings only の場合がある。
- ただし主要候補の欠損、互換性ミス、画像ミスは優先して直す。
- 正しい公式根拠が取れない画像は、無理に差し替えず unresolved note に残す。

## Final pre-launch commands

- npm run build
- 可能なら npm run test:e2e
- 必要に応じて npm run audit:beta
- 必要に応じて npm run db:check
- git status clean
- Vercel production 反映確認

## Feedback and launch notes

- β公開後は変な推薦をスクリーンショット付きで集める。
- 画像不備はレンズ名、表示画像、期待画像をセットで記録する。
- 互換性ミスはカメラ本体、マウント、推薦されたレンズ名を記録する。
- 購入リンク不備はリンク元、遷移先、tag の有無を記録する。
- 初見ユーザーが迷った箇所を優先して直す。
- 大きな設計変更より、小さな修正を積む。

## Next phases

- Phase 1: 公開β前の実機確認。
- Phase 2: 売れ筋 5〜10 本の `deepReview` 手動追加。
- Phase 3: `LensDeepReview` 型の optional 追加。
- Phase 4: AI 深掘り API 検討。
- Phase 5: ブログ / SEO / 記事導線との連携。
- Phase 6: 収益化導線の検証。

## Not in scope for this pass

- 推薦ロジックの大きな変更。
- Dify / API 契約の変更。
- lens DB の大規模整理。
- localStorage format の変更。
- 既存 data-testid の rename / remove。
- UI 全体の再設計。
- AI 深掘り API の追加。
