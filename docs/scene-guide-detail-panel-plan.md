# Scene Guide detail panel plan

## 1. Purpose

Scene Guide detail panel は、card-only では伝えきれない撮影判断を、シーンごとの詳細として読めるようにするための設計候補である。

現在の `/scene-playbooks` は、chooser intro と4枚のカードで「どのガイドを見るか」を選びやすくする入口になっている。次の段階では、カードを開いたあとに、失敗しやすい条件、まず考えるべき判断、焦点距離、レンズの役割、Lens Navi としての結論を読めるようにしたい。

Deep Review とは主語を分ける。

| Content | 主語 | 問い |
| --- | --- | --- |
| Deep Review | レンズ | このレンズをどう使うか |
| Scene Guide detail | 撮影シーン | この撮影シーンでどう選ぶか |

Scene Guide detail はレンズの優劣やランキングではなく、「この撮影条件なら何を優先すると失敗しにくいか」を整理する。

## 2. Current state

現在の状態:

- `/scene-playbooks` は card list + chooser intro。
- `ScenePlaybookCard.tsx` は表示専用。
- `src/data/scenePlaybooks.ts` は card-only data。
- Scene Guide card は4件。
  - 家族写真ガイド
  - 発表会ガイド
  - 運動会ガイド
  - 旅行・おでかけガイド
- detail field はまだ持っていない。
- stable_id 未導入のため `relatedLensIds` はまだ使わない。
- warehouse / Deep Review / chat / API / Dify / localStorage とは未接続。

この段階では、detail panel を UI 実装する前に、どの表示方式と最小データ構造が安全かを決める。

## 3. Detail display options

### Option A: inline expand

カードの下、またはカード一覧内で選択されたカードの近くに詳細を展開する。

メリット:

- 実装が比較的小さい。
- dedicated route や routing 設計を増やさずに試せる。
- public beta 前でも影響範囲を小さくできる。
- 既存 `/scene-playbooks` の流れを保ちやすい。

注意:

- モバイルではページが長くなりやすい。
- 複数カードを開ける仕様にすると、一覧の見通しが悪くなる。
- card と detail の境界が曖昧にならないよう、見出しと余白が必要。

### Option B: side panel / drawer

画面右側、またはモバイルでは下部から detail を表示する。

メリット:

- Lens Navi の product UI と相性がよい。
- 一覧を残したまま詳細を読める。
- 将来 warehouse や Deep Review panel の UI とパターンを共有しやすい。

注意:

- 実装はやや重い。
- focus trap、閉じる操作、スクロール制御、モバイル挙動の確認が必要。
- 長文 detail では drawer 内スクロールが読みにくくなる可能性がある。

### Option C: dedicated route `/scene-playbooks/[id]`

シーンごとに専用ページを作る。

メリット:

- SEO / OGP / 共有に向く。
- 長文を読みやすいページ構造にできる。
- 将来 Scene Guide が主要コンテンツになった時に拡張しやすい。

注意:

- public beta 前には少し大きい。
- routing、metadata、not-found、静的生成、導線設計が必要。
- card-only から detail data への移行を先に固める必要がある。

### Option D: modal

カードクリックで modal を開いて detail を表示する。

メリット:

- 実装しやすい。
- 一覧から離れずに確認できる。
- 初期検証としては小さく作れる。

注意:

- 長文読み物には向きにくい。
- モバイルで高さが厳しい。
- deep link や共有には向かない。

### Recommendation

現時点の推奨は、public beta 前は Option A の inline expand。

理由:

- 既存 `/scene-playbooks` に小さく追加できる。
- card-only data から optional detail data への移行を検証しやすい。
- dedicated route や warehouse / chat 連携を急がずに済む。
- Scene Guide の主語を保ったまま、撮影判断を段階的に深くできる。

beta 後、Scene Guide が読まれることを確認できたら、Option C の dedicated route を検討する。

## 4. Minimum detail fields

`docs/scene-playbook-ui-minimum-fields.md` を踏まえ、初期 detail panel では以下を最小候補にする。

### First display

最初に出す候補:

- `oneLineVerdict`
- `commonFailures`
- `firstQuestions`
- `focalLengthGuide`
- `lensRoles`
- `lensNaviConclusion`

このセットは、ユーザーが「この撮影でどう選ぶか」をすぐ読める最小構成である。F値や動画などを最初から全部出すよりも、失敗条件と判断軸を先に置く。

### Deferred or collapsed

折りたたみ、または後回し候補:

- `apertureGuide`
- `motionAndShutter`
- `sceneConstraints`
- `distanceGuide`
- `primeVsZoom`
- `videoConsiderations`
- `futureChecks`
- `sources`

これらは重要だが、最初の detail panel では情報量が増えすぎる。テーマごとに必要な項目だけを段階追加する。

## 5. Data structure proposal

既存 `ScenePlaybookCard` は壊さず、detail は optional にする案が安全。

候補:

```ts
type ScenePlaybookDetail = {
  oneLineVerdict: string
  commonFailures: string[]
  firstQuestions: string[]
  focalLengthGuide: {
    label: string
    guidance: string
  }[]
  lensRoles: {
    label: string
    bestFor: string
    caution: string
  }[]
  lensNaviConclusion: string
}
```

`ScenePlaybookCard` の将来拡張候補:

```ts
type ScenePlaybookCard = {
  id: string
  title: string
  shortTitle: string
  sceneType: ScenePlaybookType
  headline: string
  primaryUse: string[]
  keyDecisions: string[]
  representativeFocalRanges: string[]
  mainLensRoles: {
    label: string
    role: string
  }[]
  primaryCaution: string
  relatedLensIds: string[]
  status: ScenePlaybookStatus
  detail?: ScenePlaybookDetail
}
```

方針:

- 既存 `ScenePlaybookCard` を破壊しない。
- `detail` は optional から始める。
- まずは1件だけ、家族写真ガイドに detail data を追加して検証する案が安全。
- 4件すべてに detail を一度に入れる必要はない。
- `relatedLensIds` は stable_id 導入後に使う。
- stable_id 未導入の間は、関連レンズ名やカテゴリは detail 本文または `lensRoles.label` で扱う。

## 6. UI behavior proposal

カードの `撮影判断を見る` をクリックしたときに detail を開く。

実装案:

- `ScenePlaybooksPage` 側で `openGuideId` のような page state を持つ。
- `ScenePlaybookCard` に `onOpen?: (id: string) => void` を渡す。
- 既存の表示専用 card としての使い方を壊さないため、`onOpen` は optional にする。
- detail は card grid の下、または選択カードの直後に inline expand として表示する。

### One open vs multiple open

1つだけ開く案:

- ページが長くなりにくい。
- 現在どのシーンを読んでいるか分かりやすい。
- public beta 前の実装として安全。

複数開ける案:

- 比較読みができる。
- ただしモバイルでは長くなりやすい。
- 開閉状態が複雑になりやすい。

初期推奨は、1つだけ開く案。

### Mobile considerations

モバイルで縦長になりすぎない工夫:

- 最初に `oneLineVerdict` と `commonFailures` を出す。
- `focalLengthGuide` と `lensRoles` は短いカード状にする。
- 長い項目は折りたたみ候補に回す。
- close control を detail 上部と下部のどちらかに置く。
- 開いている detail へスクロールしやすい余白を確保する。

追加 data-testid 候補:

- `scene-guide-detail`
- `scene-guide-detail-${id}`
- `scene-guide-detail-close-${id}`

既存 data-testid は変更しない。

## 7. Visual direction

Scene Guide detail の見た目は、現在の Lens Navi UI 方針に合わせる。

- 白 / slate ベース。
- 薄い border。
- 控えめな shadow。
- blue-violet to magenta は局所アクセント。
- 大きな gradient fill、派手な glow、noisy neon は避ける。
- card 内にさらに重い card を入れすぎない。

Deep Review と似すぎないよう、Scene Guide detail では以下を前面に出す。

- 撮影条件
- 失敗しやすいこと
- まず考える判断軸
- 焦点距離と構図変更
- 歩留まり

Deep Review のように、解像、ボケ、収差、AF、レビュー根拠を主役にしない。

## 8. Implementation phases

### Phase 1: Docs only

現在のフェーズ。

- detail panel 方針を docs 化する。
- display option、minimum fields、data structure、UI behavior を決める。
- UI / data / routing はまだ触らない。

### Phase 2: Optional detail field

- `scenePlaybooks.ts` に optional `detail` field を追加する。
- まず1件、家族写真ガイドだけ detail data を入れる。
- `ScenePlaybookCard` の `onOpen` を使うか、page 側で展開するかを小さく検証する。
- `relatedLensIds` はまだ使わない。

### Phase 3: Inline expand UI

- 4件すべてに detail data を追加する。
- inline expand UI を安定化する。
- `scene-guide-detail-${id}` などの data-testid を追加する。
- モバイルで長くなりすぎないことを確認する。

### Phase 4: Dedicated route or connections

- dedicated route `/scene-playbooks/[id]` を検討する。
- warehouse / Deep Review / chat との導線を検討する。
- stable_id 導入後に `relatedLensIds` を使った関連表示を検討する。
- Dify / API 連携は最後に回す。

## 9. Guardrails

- public beta 前なので大きく壊さない。
- API / Dify / localStorage / `public/lens_data.json` は触らない。
- stable_id 未導入のまま関連レンズ接続を無理に進めない。
- `relatedLensIds` に仮IDを入れない。
- スコア、ランキング、点数表現は禁止。
- Scene Guide と Deep Review の主語を混ぜない。
- 既存の `scene-playbook-page`、`scene-guide-chooser`、`scene-playbook-grid`、card 系 data-testid を壊さない。
- まずは docs と optional data で小さく進める。
