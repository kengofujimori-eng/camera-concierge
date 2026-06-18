# Minimal feedback logging plan

## Purpose

Lens Navi 公開βで、AI相談品質改善に必要な最小証拠を集める。

この plan はフル analytics の導入ではない。外部送信、ユーザー行動追跡、相談文全文の収集は行わず、assistant 回答に対する明示的な feedback だけを localStorage に保存する。

## Scope

対象は `相談` ルートの assistant 回答のみ。

保存する feedback は以下。

- `よかった`
- `違和感あり`
- 違和感 category
- 短い任意メモ
- その時点の profile metadata

この pilot は、`post-beta-priority-decision.md` の E: AI相談品質改善を判断するための evidence collection として扱う。

## UI

assistant 回答の下に小さな feedback area を表示する。

- `よかった`
- `違和感あり`
- `違和感あり` 選択時だけ category selector と短い memo を表示

UI は既存の Lens Navi tone に合わせる。

- white / slate base
- thin border
- restrained shadow
- local violet accent only
- visually quiet

## Issue categories

- マウントが違う
- 用途に合わない
- 焦点距離が違う
- 高すぎる / 重すぎる
- 説明がわかりにくい
- 候補が足りない
- その他

## Storage

localStorage key:

```txt
lensNaviFeedbackLogs
```

最新50件だけを保持する。

## Record shape

実装上の record は概ね以下。

```ts
type ConsultationFeedbackRecord = {
  id: string
  timestamp: string
  source: 'consultation'
  type: 'positive' | 'issue'
  issueCategory?: string
  comment?: string
  selectedMountId?: string
  selectedMountLabel?: string
  cameraBody?: string
  hasCameraBody: boolean
  selectedBudgetId?: string
  selectedBudgetLabel?: string
  selectedFocalRange?: {
    minMm: number
    maxMm: number
  }
  selectedLensType?: string
  selectedLensTypeLabel?: string
  messageId?: string
  messageIndex: number
  assistantAnswerExcerpt?: string
}
```

`assistantAnswerExcerpt` は短い場合だけ保存し、長い回答全文は保存しない。

## What is intentionally not collected

- 相談文全文
- Dify response 全文
- warehouse data
- purchase link click
- 個人情報
- route analytics
- cross-session user identifier
- 外部送信される event

## Local inspection

開発・手動確認では browser console から確認する。

```js
JSON.parse(localStorage.getItem('lensNaviFeedbackLogs') ?? '[]')
```

この task では dashboard は作らない。

## Classification usage

`違和感あり` の category は、`docs/public-beta-feedback-classification.md` の recommendation quality issue / missing lens / wording / usability の初期切り分けに使う。

ただし category は最終判定ではない。必要に応じて、再現情報、相談条件、表示された候補、スクリーンショットを追加で確認する。

## Guardrails

- recommendation logic は変更しない。
- Dify API payload / prompt は変更しない。
- `public/lens_data.json` は変更しない。
- warehouse localStorage は変更しない。
- Scene Guide / Resolver / comparison hooks は変更しない。
- existing data-testid は削除・変更しない。
- analytics SDK は追加しない。
- local-only pilot として始める。

## Future options

この pilot で feedback が十分に集まらない場合だけ、最小 analytics / feedback collection の拡張を検討する。

拡張する場合も、最初は次のような明確な目的のある event に限定する。

- feedback submitted count
- issue category count
- route source

相談文や個人情報の収集は、別タスクで明示的に検討する。
