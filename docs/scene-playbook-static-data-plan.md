# Scene Playbook static data plan

## 1. Purpose

Scene Playbook を UI に出す前に、まず `src/data/scenePlaybooks.ts` のような静的データとしてどの最小項目を持つべきか整理する。

この docs は実装前のデータ設計メモであり、まだコード追加はしない。

目的は、家族写真・発表会・運動会の3本を、カード表示できる最小データに変換する準備をすること。長文の攻略本文をそのまま UI に移すのではなく、Lens Navi の「撮影判断ナビ」として最初に見せるべきカード情報を先に固定する。

## 2. Current source docs

| Source doc | Provides for static data plan |
| --- | --- |
| `docs/scene-playbook-format.md` | Scene Playbook の基本思想、撮影制約、動きとシャッター、単焦点とズーム、動画判断、TypeScript 型候補。 |
| `docs/scene-playbook-family-photography.md` | `family-photography` のカード候補。35mm / 50mm / 85mm / 135mm の役割、家族写真で失敗しにくい距離感とF値判断。 |
| `docs/scene-playbook-recital-stage.md` | `recital-stage` のカード候補。座席固定、暗所、距離制約、85mm / 135mm / 70-200mm / 200mm以上の役割。 |
| `docs/scene-playbook-sports-day.md` | `sports-day` のカード候補。屋外イベント、動体、距離変化、70-200mm / 100-400mm / 85mm / 135mm の役割。 |
| `docs/scene-playbook-implementation-plan.md` | Scene Playbook を `lens_data.json` に混ぜず、別データ構造として扱う方針。`relatedLensIds` による将来接続案。 |
| `docs/scene-playbook-ui-minimum-fields.md` | 初期 UI に必要な minimum fields。特に `ScenePlaybookCard` を card only の基準にする。 |
| `docs/scene-playbook-warehouse-ui-connection.md` | warehouse / Deep Review UI との接続前提。まず静的 card list を作り、warehouse 連携は後段で関連リンクとして試す方針。 |

Deep Review 系 docs は、Scene Playbook の判断根拠として参照する。ただし静的データでは、Deep Review 本文やレビュー根拠をそのまま持たず、カード表示に必要な短い判断情報だけを持つ。

静的データ化しても、Scene Playbook の基本思想は変えない。スコアリングやランキングではなく、撮影条件ごとの「失敗しにくい選び方」を短く表示するためのデータとして扱う。

## 3. Static data scope

最初の静的データは card only から始める。

### 初期スコープ

* 3件のみ
  * `family-photography`
  * `recital-stage`
  * `sports-day`
* Card 表示に必要な minimum fields のみ
* 長文 detail はまだ持たない
* `docs/scene-playbook-ui-minimum-fields.md` の `ScenePlaybookCard` を基準にする
* `lens_data.json` には混ぜない
* localStorage には保存しない
* API / Dify には接続しない

### 初期スコープ外

* 詳細本文すべて
* sources
* Future checks
* Deep Review 本文
* Buying Comparison 本文
* scene page routing
* warehouse card への自動接続
* chat flow への接続

## 4. Proposed file

将来の候補:

```txt
src/data/scenePlaybooks.ts
```

ただし、この docs では作成しない。

役割:

* Scene Playbook card 用の静的データを持つ
* UI 初期モックに使う
* `lens_data.json` とは別管理にする
* `relatedLensIds` で既存レンズとの関係を表現する
* 未登録レンズは `relatedLensIds` に入れず、代表焦点距離や lens role label として扱う

現状メモ:

* この repo では `src/data` ディレクトリはまだ存在しない。
* 現行のレンズDBは `public/lens_data.json` にある。
* 次フェーズで `src/data/scenePlaybooks.ts` を作る場合、既存の `public/lens_data.json` とは別系統の UI 用静的データとして扱う。

## 5. Minimum type candidate

Card only の最小型候補:

```ts
type ScenePlaybookCard = {
  id: string
  title: string
  shortTitle: string
  sceneType: 'family' | 'recital' | 'sports-day' | 'travel' | 'portrait' | 'video'
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
  status: 'manual-draft' | 'verified' | 'ai-assisted' | 'not-ready'
}
```

補足:

* `id` は Scene Playbook 側の安定ID。
* `relatedLensIds` は既存 lens data と照合できる場合のみ入れる。
* 未登録レンズは `mainLensRoles.label` や `representativeFocalRanges` に入れる。
* `status` は当面 `manual-draft`。
* card only なので、長文 detail は含めない。

## 6. Lens id matching policy

`relatedLensIds` には、既存 `lens_data.json` に存在するIDだけを入れる。

ただし、現時点の確認では `public/lens_data.json` の主要レコードに明示的な `id` フィールドは見当たらない。warehouse の localStorage item には `id: number` があるが、これは保存時のローカルIDであり、レンズDBの安定IDではない。

このため、次フェーズで `relatedLensIds` を使う前に、以下のどれを正とするか決める必要がある。

* `lens_data.json` に将来 `id` を追加する
* `model_code` / `product_code` を参照IDとして扱う
* `name` から生成した slug を Scene Playbook 側だけで使う
* まずは `relatedLensIds` を空にして、カード表示だけを先に検証する

初期方針:

* 存在しないレンズを仮IDで大量に入れない。
* 未登録のレンズやカテゴリは、まず `mainLensRoles.label` で表現する。
* IDが不明な場合は docs に「要確認」と残す。
* 将来 lens data 側に安定IDが用意されたら、`relatedLensIds` に移す。

未登録またはID未確定のまま label で扱う候補:

* 70-200mm F2.8
* 70-200mm F4
* 100-400mm
* 35mm系
* 望遠ズーム

既存 `public/lens_data.json` で確認できた名前 / コード候補:

| Lens name | Observed code field | Scene Playbook use | ID status |
| --- | --- | --- | --- |
| `FE 50mm F1.4 GM` | `model_code: SEL50F14GM` | family-photography | 安定 `id` は要確認 |
| `FE 85mm F1.4 GM II` | `model_code: SEL85F14GM2` | family / recital / sports-day | 安定 `id` は要確認 |
| `FE 135mm F1.8 GM` | `model_code: SEL135F18GM` | family / recital / sports-day | 安定 `id` は要確認 |
| `FE 70-200mm F2.8 GM OSS II` | `model_code: SEL70200GM2` | recital / sports-day | 安定 `id` は要確認 |
| `FE 70-200mm F4 Macro G OSS II` | `model_code: SEL70200G2` | recital / sports-day | 安定 `id` は要確認 |
| `FE 100-400mm F4.5-5.6 GM OSS` | official URL / product name confirmed | sports-day | 安定 `id` と code field は要確認 |

したがって、初期データ案では `relatedLensIds` は空にしておく。UI card list は `relatedLensIds` が空でも表示できる前提にする。

## 7. Initial data candidates

以下は `src/data/scenePlaybooks.ts` を将来作る場合の card only 候補。現時点では docs 上の設計メモであり、コードにはしない。

### family-photography

```ts
{
  id: 'family-photography',
  title: '家族写真攻略',
  shortTitle: '家族写真',
  sceneType: 'family',
  headline: '家族写真の本命は50mm。屋外で子供を切り出すなら85mm、広い場所なら135mmも候補。',
  primaryUse: ['室内', '屋外', '子供', '日常記録'],
  keyDecisions: ['室内か屋外か', '子供が動くか', '複数人を撮るか', '背景を残すか'],
  representativeFocalRanges: ['35mm', '50mm', '85mm', '135mm'],
  mainLensRoles: [
    { label: '35mm系', role: '室内・複数人・生活感' },
    { label: '50mm', role: '家族写真の中心' },
    { label: '85mm', role: '屋外で子供をきれいに切り出す' },
    { label: '135mm', role: '広い場所やイベントで遠くの表情を狙う' }
  ],
  primaryCaution: 'ボケ量より、距離感と歩留まりを優先する。',
  relatedLensIds: [],
  status: 'manual-draft'
}
```

`FE 50mm F1.4 GM`、`FE 85mm F1.4 GM II`、`FE 135mm F1.8 GM` は `public/lens_data.json` に名前としては存在する。ただし安定 `id` は未確定のため、初期案では `relatedLensIds` に入れない。

### recital-stage

```ts
{
  id: 'recital-stage',
  title: '発表会攻略',
  shortTitle: '発表会',
  sceneType: 'recital',
  headline: '発表会は明るさだけでなく、届くことと構図変更できることが重要。',
  primaryUse: ['発表会', 'ステージ', '小ホール', '体育館'],
  keyDecisions: ['座席距離', '会場サイズ', '暗さ', '全身か表情か'],
  representativeFocalRanges: ['85mm', '135mm', '70-200mm', '200mm+'],
  mainLensRoles: [
    { label: '85mm', role: '前方席・小会場向き' },
    { label: '135mm', role: '中距離から出演者を切り出す' },
    { label: '70-200mm', role: '席が読めない発表会の安全策' },
    { label: '200mm以上', role: '後方席・大きな会場向き' }
  ],
  primaryCaution: '席が読めない場合は、単焦点よりズームが安全。',
  relatedLensIds: [],
  status: 'manual-draft'
}
```

`FE 85mm F1.4 GM II`、`FE 135mm F1.8 GM`、`FE 70-200mm F2.8 GM OSS II`、`FE 70-200mm F4 Macro G OSS II` は候補として存在する。ただし安定 `id` は未確定のため、初期案では `relatedLensIds` に入れない。

### sports-day

```ts
{
  id: 'sports-day',
  title: '運動会攻略',
  shortTitle: '運動会',
  sceneType: 'sports-day',
  headline: '運動会はボケ量より、届く・追える・ブレない・一日持てることが重要。',
  primaryUse: ['運動会', '屋外イベント', '子供', '動体'],
  keyDecisions: ['校庭の広さ', '競技距離', '子供の動き', '重量'],
  representativeFocalRanges: ['70-200mm', '100-400mm', '85mm', '135mm'],
  mainLensRoles: [
    { label: '70-200mm', role: '運動会全体の安全策' },
    { label: '100-400mm', role: '広い校庭や遠距離向き' },
    { label: '85mm', role: '近い競技や待機中の表情' },
    { label: '135mm', role: '少し離れた表情の切り出し' }
  ],
  primaryCaution: '単焦点は追加表現レンズ。運動会全体の主力はズームが安全。',
  relatedLensIds: [],
  status: 'manual-draft'
}
```

`FE 70-200mm F2.8 GM OSS II`、`FE 70-200mm F4 Macro G OSS II`、`FE 100-400mm F4.5-5.6 GM OSS` は候補として存在する。ただし安定 `id` は未確定のため、初期案では `relatedLensIds` に入れない。

## 8. Handling missing lenses

70-200mm / 100-400mm / 35mm系など、Scene Playbook に登場するが既存 lens data との安定ID接続が未確定な候補は、以下の方針で扱う。

* 既存 lens data に安定IDがない場合、無理に仮IDを作らない。
* まずは `mainLensRoles.label` として表示する。
* `relatedLensIds` は空または既存IDのみ。
* UI では `relatedLensIds` がなくてもカード表示できるようにする。
* warehouse 接続時は `relatedLensIds` があるものだけ関連リンク対象にする。
* 未登録レンズを追加するか、既存レンズに安定IDを付けるかは別フェーズで検討する。

この扱いにしておくと、Scene Playbook の card list は先に検証できる。レンズDB整備と warehouse 連携は後から進められる。

## 9. Card only vs detail data

最初は card only を推奨する。

理由:

* 3本の docs は長文で、初期 UI にすべて入れると重い。
* まずは Scene Playbook の存在と導線を検証したい。
* warehouse への接続前に、カードの情報量を確認したい。
* 詳細パネルは後で追加できる。
* Deep Review と同じく、最初から全情報を出さない方がよい。

将来追加する候補:

* `ScenePlaybookDetailMinimum`
* `commonFailures`
* `focalLengthGuide`
* `lensRoles`
* `recommendedPatterns`
* `lensNaviConclusion`

detail data を追加する場合も、Markdown 本文をそのまま構造化するのではなく、UI で読む順番に合わせて分解する。

## 10. Where static data should not be connected yet

初期 static data は、以下にはまだ接続しない。

* warehouse localStorage には接続しない。
* saved lens data には混ぜない。
* `lens_data.json` には混ぜない。
* Dify / API には接続しない。
* chat flow には接続しない。
* route / page はまだ作らない。
* e2e にもまだ追加しない。

## 11. Validation before implementation

次に `src/data/scenePlaybooks.ts` を作る前に確認すべきこと:

* 既存 lens id の命名規則。
* 50GM / 85GM II / 135GM の id が何か。
* 70-200mm / 100-400mm が lens data に存在するか。
* warehouse に保存される lens object に id が含まれるか。
* `LensCard` で `relatedLensIds` を使えるか。
* `relatedLensIds` がなくても card list は表示できるか。
* TypeScript の import パス。
* build / lint 影響。

今回の読取メモ:

* `src/data/lens_data.json` は存在しない。
* 現行DBは `public/lens_data.json`。
* `public/lens_data.json` には `FE 50mm F1.4 GM`、`FE 85mm F1.4 GM II`、`FE 135mm F1.8 GM`、`FE 70-200mm F2.8 GM OSS II`、`FE 70-200mm F4 Macro G OSS II`、`FE 100-400mm F4.5-5.6 GM OSS` が名前として確認できた。
* warehouse の保存 item は `id: number`、`name`、`type`、`tag`、`pros`、`cons`、`advice`、`aiComment`、`focalMin`、`focalMax` を持つ。これはレンズDBの安定IDではない。
* そのため、初期 static data の `relatedLensIds` は空で始め、ID方針が決まってから接続するのが安全。

## 12. Recommended next steps

1. `scene-playbook-static-data-plan.md` を作成
2. 既存 `lens_data.json` の id を確認
3. `src/data/scenePlaybooks.ts` を card only で追加
4. まだ UI には接続しない
5. build / lint を確認
6. 次フェーズで静的カード表示 UI を検討
7. その後 warehouse 関連リンク化を検討

## 13. Do not implement yet

この段階では以下を実装しない。

* `src/data/scenePlaybooks.ts` はまだ作らない
* UIはまだ触らない
* warehouse page はまだ触らない
* Deep Review panel はまだ触らない
* Dify / API はまだ触らない
* `lens_data.json` はまだ触らない
* localStorage形式はまだ触らない
* scene page routing はまだ作らない
* 既存推薦ロジックはまだ触らない
