# Amazon ASIN direct-link workflow

## 1. Purpose

`public/lens_data.json` の `purchase_links.new.amazon` は、初期状態では Amazon の
検索URL (`/s?k=...`) になっている。検索URLは検索結果に競合商品・中古出品が並ぶため
CVRが低い。これを ASIN直リンク (`/dp/{ASIN}/ref=nosim?tag=...`) に置き換えることで、
ユーザーを目的の商品ページへ直接誘導し、アフィリエイトの成約率を上げる。

この docs は、新しいレンズが追加されたとき、または未対応レンズの ASIN を埋めるときに
実行する手順を記録する。ASIN収集は手動。Amazon検索結果の自動スクレイピングは
アソシエイト規約違反になるため行わない（将来 PA-API の利用資格を得たら自動化を検討）。

関連ファイル:

| File | Role |
| --- | --- |
| `scripts/update-amazon-links.js` | 本体スクリプト（worklist生成 / import / 適用 / report） |
| `data/amazon_asin_map.json` | レンズ名 → ASIN の対応表。コミット対象の資産 |
| `audit-output/amazon-asin-worklist.csv` | 記入用の作業ファイル。コミット対象外（生成物） |
| `public/lens_data.json` | 実リンクが入る本番データ |

## 2. 鉄則（事故防止）

過去に実際に起きた事故を踏まえたルール。必ず守る。

1. **`--worklist` は最初の1回だけ。記入を始めたら二度と実行しない。**
   `--worklist` は毎回まっさらなCSVを新規生成して上書きするため、記入済みCSVが
   ある状態で再実行すると記入データが消える。
   （安全装置として、記入済みCSVがある場合は `--force` なしの再生成を中止する
   ガードが入っている。それでも意図的な `--force` 上書きには注意。）

2. **コミットは必ずファイルを名指しで add する。`git add .` / `git add -A` は使わない。**
   このリポジトリは価格自動更新やUI作業など、常に別の未コミット変更を抱えている。
   名指し add でないと無関係な変更を巻き込む。

3. **スキップ対象は空欄のまま残す。** 以下は ASIN化しない：
   - マウントが2つ以上書かれた兼用レンズ（例: `Sony E / Nikon Z`）
     → Amazon ではマウント別ASINで別商品。1リンクに統一できないため検索URLのまま残す。
   - 在庫切れ・中古のみ・Amazonに正規出品がないレンズ
     → 在庫なしページに飛ばすと検索URLより悪化する。
   - 純正がメインの戦場でないブランド（Canon RF Lなど）は無理に埋めない。
     Amazon在庫が厚い Sony E / Sigma / Tamron / Viltrox から優先する。

## 3. 初回のみ: worklist生成

未対応レンズの一覧（優先順位順）を生成する。**記入を始める前の1回だけ。**

```bash
node scripts/update-amazon-links.js --worklist
```

`audit-output/amazon-asin-worklist.csv` が生成される。recommend かつ売れ筋価格帯
（3万〜50万円）のレンズが先頭に来るようソートされている。

新しいレンズが追加された後に未対応分を洗い出したいときも、これで再生成する。
ただし記入途中のCSVがある場合は、先に「4. 取り込みと適用」で取り込んでから再生成すること
（または `--force` で意図的に上書き）。

## 4. 記入

`audit-output/amazon-asin-worklist.csv` を Numbers / Excel で開き、`asin` 列に
**確認済み商品ページのURLを丸ごと貼る**（10桁ASINだけでも可）。スクリプトが
`/dp/` または `/gp/product/` から10桁を自動抽出する。検索URL (`/s?k=`) を貼ると
警告でスキップされるので、必ず個別の商品ページまで開いてから貼ること。

貼る前に、そのページが目的のレンズ本体か確認する:

- 型番の世代（II型 / 無印、Z / 無印など。例: RF70-200mm の沈胴式 vs インナーズームZ版）
- マウント（RF/EF、E/A、Sony E/Nikon Z など）
- レンズ単品か（フィルターセット等の同梱品ではないか）

迷ったら空欄でスキップ。10件程度たまったら次へ。

> **Numbers で編集した場合の必須手順**
> Numbers ネイティブ形式 (`.numbers`) のままでは import できない。
> 「ファイル → 書き出す → CSV…」で **Unicode (UTF-8)** を選んで書き出し、
> `audit-output/amazon-asin-worklist.csv` に上書き保存してから取り込む。

## 5. 取り込みと適用（4ステップ）

```bash
# (1) CSVの記入を asin_map に取り込む（追記マージ・何度実行しても安全）
node scripts/update-amazon-links.js --import audit-output/amazon-asin-worklist.csv

# (2) 適用前に内容を目視確認（まだ lens_data.json は変わらない）
node scripts/update-amazon-links.js --dry-run

# (3) 本番適用（lens_data.json の該当 amazon 行のみを書き換え）
node scripts/update-amazon-links.js

# (4) 差分確認 → 名指し add → コミット
git diff public/lens_data.json
git add public/lens_data.json data/amazon_asin_map.json
git commit -m "data: ASIN links (Sony E lenses)"
```

- (2) の `--dry-run` で「`レンズ名 (search → dp/B0XXXXXXXX)`」が記入件数ぶん並ぶ。
  レンズ名とASINの対応に違和感がないか確認する。
- (4) で `lens_data.json` を add すると、価格自動更新ぶんが同じコミットに入ることが
  あるが、価格は常に最新が正しいので問題ない。どうしてもリンクだけのコミットに
  したい場合は `git add -p` で該当 hunk のみを選ぶ。

## 6. 進捗確認

```bash
node scripts/update-amazon-links.js --report
```

ASIN直リンクのカバレッジ（dp直リンク / 検索URL / asin_map登録件数）が表示される。

適用済みのレンズは次回 `--worklist` を再生成したとき自動で一覧から消えるため、
「どこまで終わったか」を手で管理する必要はない。

## 7. 将来の自動化（PA-API）

Amazon Product Advertising API (PA-API) を使えば ASIN収集も自動化できるが、利用には
承認済みアソシエイトアカウント＋一定の売上実績が必要。今回の直リンク化で売上が
積み上がれば資格を得られる可能性があるので、まず手動で主要レンズを埋めて実績を作る。
資格取得後、レンズ名検索 → ASIN取得 → `data/amazon_asin_map.json` への書き出しを
行う `--fetch-asin` モードを追加するのが自然な拡張。
