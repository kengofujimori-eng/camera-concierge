# Scene Guide visual polish review

## Purpose

Scene Guide Visual Polish Phase で実施した UI 改善と、次フェーズへ持ち越す課題を記録する。

この phase では、Scene Guide の判断ロジックを変えず、既存の interactive result を「読む」より「見て触って分かる」形へ近づけた。

## Implemented scope

### 1. VisualNote / info chips

- amber を常用していた補足・注意枠を、white / slate ベースの `VisualNote` へ置き換えた。
- card-level の注意、decision result の補足、family decision flow の補足、Lens Condition Card の注意表示を揃えた。
- 小さなラベル chip と 1〜2行の本文で、警告感と読み物感を抑えた。
- 注意文の意味や条件分岐は変更していない。

### 2. Scene specific icons

- 既存依存の `lucide-react` を使い、scene chooser の4シーンへ小さなアイコンを追加した。
- condition fieldset に、location / seat / venue / goal / distance / motion / load / subject / exchange に対応する意味補助アイコンを追加した。
- 家族写真の室内 / 屋外選択では、選択状態と条件に応じてアイコンを切り替える。
- emoji や新しい icon package は追加していない。

### 3. DistanceVisualization pilot

- `DistanceVisualization` / `DistanceMap` を追加した。
- 発表会では、舞台から前方席 / 中央席 / 後方席までの位置感と、85mm / 135mm / 200mm+ の関係を表示する。
- 運動会では、近い / 中くらい / 遠い距離と、85-135mm / 70-200mm / 100-400mm の関係を表示する。
- 選択中の座席・距離、本命、次点、安全策を compact に見せる。
- 表示は既存 `selectedConditions` と result を読むだけで、result logic は変更していない。

### 4. FocalLengthRail role badges

- 既存 `FocalLengthRail` の dots と rail data を維持したまま、`本命` / `次点` / `安全策` badge を追加した。
- 同じ焦点距離が複数の役割を持つ場合も併記できる。
- inactive item を控えめにし、重要な位置を見つけやすくした。
- 旅行・おでかけの6項目 rail は、モバイルで2列になるよう調整した。

### 5. Mobile readability pass

- `/scene-playbooks` のページ上部、chooser、カード概要、展開 detail のモバイル余白を軽くした。
- condition controls、DistanceVisualization、FocalLengthRail、LensConditionCard、ComparisonHooksCard、consultation CTA の縦密度を調整した。
- 長い補足は既存意味を維持したまま line clamp と leading を調整した。
- CTA の押しやすさと PC 表示の余白は維持した。

## Public beta impact

Visual Polish Phase により、Scene Guide は文章中心の判断ガイドから、条件・距離・焦点距離・候補の役割を視覚的に追いやすい UI へ進んだ。

特に以下が公開βで理解しやすくなった。

- シーン chooser と条件選択の意味を、文字と小さなアイコンで把握できる。
- 発表会の座席距離と運動会の競技距離を、焦点距離の前に図解で確認できる。
- focal length rail 上で、本命 / 次点 / 安全策の違いが分かる。
- 補足・注意表示が落ち着き、重要な判断要素へ視線を戻しやすい。
- モバイルで detail を開いた際の縦密度が軽くなった。

この phase は新しい推薦機能を追加するものではないが、既存の Scene Guide / Resolver / consultation handoff / comparison hooks を公開βで理解しやすくする効果がある。

## What was intentionally not changed

以下は Visual Polish Phase の対象外として維持した。

- Lens Condition Resolver logic
- Deep Review comparison hook logic
- consultation handoff schema と sessionStorage key
- API / Dify
- `public/lens_data.json`
- warehouse localStorage
- recommendation logic
- Scene Guide の条件分岐と result generation
- Deep Review route への実遷移
- stable ID 接続
- 既存 data-testid

## Known remaining issues

- 家族写真の室内 / 屋外距離を示す専用図解は未追加。
- 旅行・おでかけの軽さ / 重さ / 便利さを示す専用図解は未追加。
- `DistanceVisualization` は発表会 / 運動会のみの pilot。
- Deep Review comparison hooks は placeholder で、実遷移しない。
- Lens Condition Resolver は pilot で、lens data / stable ID に未接続。
- モバイルの詳細表示は改善したが、条件と結果をすべて表示するため一定の縦長は残る。
- アイコンは意味補助に限定しており、被写体サイズや画角の図解は未実装。

## Recommended next steps

1. Public beta manual review
   - 相談 / シーンガイド / 倉庫の3導線を、PC とモバイルで改めて確認する。
   - Scene Guide 4シーンの条件選択、相談 handoff、横はみ出しを確認する。
2. Family / travel visualization small pass if needed
   - manual review で理解しにくさが残る場合だけ、家族写真の距離図解と旅行の tradeoff 図解を小さく追加する。
3. Stable ID pilot
   - Sony FE の主要レンズを最小セットとして、安定した関連付けを検討する。
4. Resolver data connection pilot
   - Scene Guide のレンズ条件を、具体レンズ名へ進む前段として小さく接続する。
5. Deep Review comparison format
   - comparison hooks から進む静的比較 format / panel を設計する。

## Guardrails

- visual polish のために推薦ロジックを変更しない。
- Resolver / comparison hooks / consultation handoff の意味を UI 都合で変えない。
- いきなり全シーンの図解を増やさず、manual review で必要性を確認する。
- 具体レンズ接続は stable ID 方針を確認してから進める。
- API / Dify / warehouse / lens data への接続を UI polish と混ぜない。
- Scene Guide と Deep Review の主語を混ぜない。
- スコア、ランキング、点数表現を追加しない。
- 既存 data-testid と public route `/scene-playbooks` を維持する。

