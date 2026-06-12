# Scene Guide public beta review

## Purpose

Scene Guide Visual Polish Phase 後の `/scene-playbooks` を公開β前に確認し、その正式結果を記録する。

この review は、Scene Guide が「読むガイド」から、撮影条件を選び、必要な焦点距離とレンズ条件を理解し、相談や将来の Deep Review 比較へ進む UI になった現在地を確認するものである。

## Current implementation summary

- `/scene-playbooks` に chooser と主要4シーンの interactive guide を実装済み。
- 家族写真 / 発表会 / 運動会 / 旅行・おでかけの4シーンすべてが条件選択に対応済み。
- 4シーンすべてに consultation handoff を実装済み。
- 各シーンで本命 / 次点 / 安全策、焦点距離レール、Lens Condition Resolver pilot、Deep Review comparison hooks pilot を表示する。
- Scene Guide から相談画面へは `sessionStorage` の `lensNaviSceneGuideHandoff` を使って構造化した条件を渡す。
- 相談画面では引き継ぎカードを表示し、自動送信せず、ユーザー確認後に入力欄へ反映する。
- VisualNote、scene specific icons、condition icons、発表会 / 運動会の DistanceVisualization pilot、FocalLengthRail role badges、mobile readability pass を実装済み。
- API / Dify / warehouse / lens data / recommendation logic には接続・変更していない。

## Manual review scope

以下を確認した。

- PC でのページ上部、chooser、4シーンカード、フィルター、detail 表示。
- 主要4シーンの interactive flow と結果更新。
- Visual Polish Phase で追加した VisualNote、icons、DistanceVisualization、FocalLengthRail role badges。
- Scene Guide から相談画面への consultation handoff。
- API / Dify / warehouse / lens data、handoff key、既存 data-testid への副作用。
- `npm run build`。

e2e は今回の確認対象外とした。390px 実機相当の最終確認は、非ブロッカーとして残す。

## PC review result

- `/scene-playbooks` の PC 表示に大きな崩れはない。
- 初期状態で4シーンが表示される。
- chooser 選択時は対象カードだけが表示される。
- `すべてのガイドを見る` で4シーン一覧へ復帰できる。
- detail 展開時に横幅、余白、情報密度の大きな破綻や横はみ出しはない。
- chooser、condition controls、result area、consultation CTA は操作可能な状態を維持している。

## Mobile review status

- mobile readability pass により、condition controls、VisualNote、DistanceVisualization、FocalLengthRail、Lens Condition Card、comparison hooks、consultation CTA の縦密度は整理されている。
- responsive layout、wrap、横はみ出し防止の実装に大きな問題は確認されていない。
- role badges や chips はモバイルで読める密度に抑えられている。
- ただし、今回の確認環境では 390px 実機相当 viewport の厳密な最終確認は完了していないため、非ブロッカーとして残す。

## Four-scene result

### 家族写真

- `室内で撮る` / `屋外で撮る` の切り替えが動作する。
- 条件変更に応じて本命 / 次点、Lens Condition Resolver、comparison hooks が更新される。
- 室内では 35mm / 50mm、屋外では 85mm / 135mm を中心とする判断が読み取れる。
- consultation handoff を end-to-end で確認済み。

### 発表会

- 座席位置 / 会場サイズ / 狙いの interactive flow が動作する。
- 条件に応じて本命 / 次点 / 安全策、Resolver、comparison hooks が表示される。
- DistanceVisualization により、舞台と前方席 / 中央席 / 後方席の距離理解を補助できている。
- consultation CTA の表示を確認済み。

### 運動会

- 会場の広さ / 子どもまでの距離 / 動きの速さの interactive flow が動作する。
- 条件に応じて本命 / 次点 / 安全策、Resolver、comparison hooks が表示される。
- DistanceVisualization により、近い競技 / 校庭中央 / 遠い競技と望遠域の関係を理解しやすい。
- consultation CTA の表示を確認済み。

### 旅行・おでかけ

- 荷物の優先 / 撮るもの / レンズ交換の interactive flow が動作する。
- 条件に応じて本命 / 次点 / 安全策、Resolver、comparison hooks が表示される。
- 6項目の焦点距離レールと role badges が表示される。
- consultation CTA の表示を確認済み。

## Consultation handoff result

- 4シーンすべてに `この条件で相談する` CTA が表示される。
- 家族写真では consultation handoff を end-to-end で確認した。
- CTA から `/` へ遷移し、相談画面に引き継ぎカードが表示される。
- handoff 後に自動送信されない。
- `この内容で相談する` から generated prompt を入力欄へ反映できる。
- `lensNaviSceneGuideHandoff` key は Scene Guide と `ChatInterface` で一致している。
- 発表会 / 運動会 / 旅行は CTA 表示を確認済み。全条件組み合わせを含む通し確認は非ブロッカーとして残す。

## Visual polish evaluation

- VisualNote は控えめで、補足・注意が過剰な警告表示になっていない。
- scene icons / condition icons は装飾過多にならず、意味補助として機能している。
- DistanceVisualization は発表会 / 運動会で、距離と焦点距離の関係を理解する助けになっている。
- FocalLengthRail の `本命` / `次点` / `安全策` badges は読み取りやすい。
- Visual Polish Phase により、条件選択後の結果を文章だけでなく位置、濃淡、chip、図解で追いやすくなった。

## Side-effect check

- API / Dify への不要な変更や呼び出し変更はない。
- warehouse / lens data / `public/lens_data.json` への今回の変更はない。
- warehouse localStorage と consultation handoff の sessionStorage 仕様は変更していない。
- `lensNaviSceneGuideHandoff` key の既存 handoff は維持されている。
- 既存 data-testid に問題は確認されていない。
- recommendation logic、Resolver logic、comparison hooks logic、consultation handoff logic は変更していない。

## Build result

- `npm run build`: 成功。
- e2e: 今回は実行していない。
- Manual Review 実施時の作業ツリーは clean だった。

## Public beta judgment

**判定: 公開β blocker なし。**

理由:

- 主要4シーンで条件選択型の体験が成立している。
- 条件変更に応じて、本命 / 次点 / 安全策 / Resolver / comparison hooks が更新される。
- 4シーンすべてから相談へ進む CTA が成立している。
- 家族写真の handoff は、相談画面への遷移、引き継ぎカード表示、入力欄への反映、自動送信なしまで確認済み。
- Visual Polish Phase の各要素は、既存ロジックを変えずに判断の理解を助けている。
- 既存の API / Dify / warehouse / lens data / navigation に副作用は確認されていない。
- build が成功している。

## Known non-blocking items

- 390px 実機相当での最終確認。
- 発表会 / 運動会 / 旅行の全条件組み合わせと、全 consultation handoff の通し確認。
- Deep Review comparison hooks は引き続き placeholder。
- Lens Condition Resolver は引き続き pilot で、stable ID / lens data に未接続。
- 家族写真の距離図解と旅行の軽さ / 重さ図解は、公開β後の必要性を見て判断する。
- detail は多くの判断情報を扱うため、モバイルでは一定の縦長が残る。

## Final conclusion

Scene Guide は公開βへ進める。

主要4シーンの interactive flow、consultation handoff、Lens Condition Resolver pilot、Deep Review comparison hooks pilot、Visual Polish Phase の価値は成立している。

公開β後は軽運用確認を優先し、非ブロッカーの UI 改善や stable ID / Resolver data connection / Deep Review comparison format は、利用状況と必要性を見ながら小さく進める。
