# Scene Guide / Resolver / Comparison review

## Purpose

Scene Guide が「撮影条件を選ぶ UI」から「レンズ条件と比較導線を作る判断ナビ」へ進んだ現在地を記録する。

この docs は、Deep Review 実装や `stable_id` 接続に進む前の統合レビューである。

## Current architecture

```txt
Scene Guide
  ↓
Condition selection
  ↓
Focal length result
  ↓
Lens Condition Resolver pilot
  ↓
Consultation handoff
  ↓
Deep Review comparison hooks pilot
```

- Scene Guide: 撮影シーンを主語にして、ユーザーが撮影条件を選ぶ。
- Condition selection: 距離、会場、動き、荷物など、シーンごとの主要条件を絞る。
- Focal length result: 主候補 / 次点 / 安全策として、必要な焦点距離の役割を示す。
- Lens Condition Resolver pilot: 主候補と選択条件を、焦点距離 / レンズタイプ / 優先要素 / 注意点へ変換する。
- Consultation handoff: 選択条件を structured context として相談画面へ渡す。
- Deep Review comparison hooks pilot: 将来 Deep Review で比較する候補テーマを提示する。

現時点では、Resolver と comparison hooks は Scene Guide 内の決定的なルールで動く pilot である。DB、`stable_id`、具体レンズ、Deep Review route にはまだ接続していない。

## Implemented scope

### 1. Four interactive scene guides

#### 家族写真

- 条件: 室内 / 屋外
- 焦点距離: 35mm / 50mm / 85mm / 135mm
- 焦点距離レール、主候補、次点を表示
- 相談 handoff 対応済み

#### 発表会

- 条件: 座席位置 / 会場サイズ / 狙い
- 焦点距離: 85mm / 135mm / 70-200mm / 200mm以上
- 焦点距離レール、主候補、次点、安全策を表示
- 相談 handoff 対応済み

#### 運動会

- 条件: 会場の広さ / 子どもまでの距離 / 動き
- 焦点距離: 85-135mm / 70-200mm / 100-400mm / 200mm以上
- 焦点距離レール、主候補、次点、安全策を表示
- 相談 handoff 対応済み

#### 旅行・おでかけ

- 条件: 荷物 / 撮るもの / レンズ交換
- 焦点距離・タイプ: 20-70mm / 24-70mm / 35mm / 50mm / 85mm / 便利ズーム
- 焦点距離レール、主候補、次点、安全策を表示
- 相談 handoff 対応済み

### 2. Consultation handoff

- 4シーンすべて対応済み。
- `sessionStorage` の `lensNaviSceneGuideHandoff` を使用する。
- Scene Guide の選択条件、レンズ条件、候補役割、相談文を structured context として渡す。
- `ChatInterface` では引き継ぎカードを表示する。
- 自動送信は行わず、ユーザーが確認して入力欄へ反映する。
- API / Dify は変更していない。

### 3. Lens Condition Resolver pilot

- 4シーンすべてに「レンズ条件」カードを表示する。
- 主候補と選択条件から以下を導出する。
  - 焦点距離
  - レンズタイプ
  - 優先要素
  - 注意点
- 具体レンズ名や商品名はまだ出さない。
- DB、`stable_id`、`public/lens_data.json` には接続していない。
- 黒箱スコアではなく、読みやすい決定的ルールとして実装している。

### 4. Deep Review comparison hooks pilot

- 4シーンすべてに「比較して深掘り」を表示する。
- 主候補 / 次点 / 安全策から、重複しない比較テーマを最大2件生成する。
- 現在候補だけではテーマが不足する場合は、シーン別の自然な比較テーマを補う。
- 表示例:
  - 85mm と 135mm
  - 135mm と 70-200mm
  - 70-200mm と 100-400mm
  - 20-70mm と 24-70mm
- 現時点では placeholder で、実遷移は行わない。
- Deep Review API、route、Dify、`stable_id` には接続していない。

## Product significance

Lens Navi は、単なる「おすすめレンズ AI」ではなくなりつつある。

現在の価値は以下の流れにある。

```txt
撮影シーンを選ぶ
  ↓
条件を選ぶ
  ↓
必要な焦点距離を理解する
  ↓
レンズ条件へ変換する
  ↓
AI相談へ渡す
  ↓
将来は Deep Review で比較する
```

ユーザーは「85mm が欲しい」のではなく、「この撮影条件では、なぜ 85mm が自然なのか」を理解したい。

Scene Guide + Resolver + Comparison hooks は、レンズ名を先に出すのではなく、撮影条件、必要条件、候補の役割、最後の比較という順番で納得を作る基盤である。

## Public beta judgment

**判定: 公開βブロッカーなし。**

理由:

- 4シーンの条件選択型体験が成立している。
- 4シーンすべて相談へ接続できる。
- Resolver pilot により、単なる焦点距離表示からレンズ条件表示へ進化した。
- Comparison hooks により、Deep Review との将来接続位置が明確になった。
- API / Dify / Warehouse / `public/lens_data.json` への副作用はない。
- 直近の `npm run build` は成功している。

## Known non-blocking issues

- まだ文字量はやや多い。
- アイコン、図解、ビジュアル表現は不足している。
- 黄色系の補足表示は少し野暮ったく見える。
- Comparison hooks は placeholder で、実遷移しない。
- Resolver は pilot で、DB / `stable_id` / lens data に未接続。
- 具体レンズ名はまだ出ない。
- Deep Review はまだ本実装ではない。
- E2E は Playwright Chromium 未インストールの既知環境課題がある。
- `npm run db:check` の既存 warning は別課題として扱う。

## Next recommended roadmap

### 1. Visual polish for Scene Guide notes and icons

- 補足表示を muted note / info chip に変更する。
- 撮影条件に小さなアイコンを追加する。
- 焦点距離レールの距離感・被写体サイズ表現を強化する。

### 2. Stable ID pilot

- Sony FE の主要レンズだけから optional `stable_id` を導入する。
- 最初の候補:
  - 85mm F1.4 GM II
  - 135mm F1.8 GM
  - 70-200mm F2.8 GM II
  - 70-200mm F4 G II
  - 20-70mm F4 G
  - 24-70mm F2.8 GM II

### 3. Resolver data connection pilot

- Scene Guide result から Sony FE の具体候補を役割別に出す。
- 最初は発表会または旅行の1シーンに絞る。
- 本命 / 安全策 / 条件付きとして表現し、ランキングにはしない。

### 4. Deep Review comparison page / panel design

- 85mm vs 135mm
- 135mm vs 70-200mm
- 20-70mm vs 24-70mm
- 70-200mm vs 100-400mm

### 5. Deep Review comparison generation

- 最初は static comparison data でもよい。
- Dify / API 接続は、比較フォーマットとデータ接続を確認した後に検討する。

## Recommended next task

最短でデータ接続へ進むなら:

- `Plan stable ID pilot for Sony FE lenses`

UI を整えるなら:

- `Polish Scene Guide visual notes and icons`

Deep Review へ寄せるなら:

- `Plan Deep Review comparison format`

## Guardrails

- いきなり全マウント対応しない。
- いきなり全レンズDBへ接続しない。
- Deep Review API 接続を急がない。
- まず Sony FE / 主要レンズ / 発表会または旅行で pilot する。
- 「絶対のおすすめ」ではなく「条件別に自然な候補」として表現する。
- スコア / ランキング / 点数表現は避ける。
- Warehouse の既存保存形式、API / Dify、`public/lens_data.json` は、専用タスクまで変更しない。
