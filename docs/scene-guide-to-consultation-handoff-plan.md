# Scene Guide to consultation handoff plan

## Purpose

Scene Guide の選択結果を、相談画面へ自然に引き継ぐための設計メモ。

Lens Navi の理想導線は以下。

Scene Guide で撮影条件を選ぶ
↓
必要なレンズ条件が生成される
↓
「この条件で相談する」
↓
相談画面に条件付きプロンプトが入る
↓
AIが具体的な候補レンズを推薦 / 比較する

Scene Guide は「記事」ではなく、撮影条件をレンズ条件へ変換する UI として扱う。

## Current state

- `/scene-playbooks` は実装済み
- 家族写真ガイドは interactive decision flow 対応済み
- 発表会 / 運動会は detail 対応済み
- 旅行・おでかけは card-only
- Scene Guide はまだ相談、倉庫、Deep Review、Dify/API と未接続
- `relatedLensIds` は stable_id 未導入のため空配列

## Goal

Scene Guide で選んだ条件を、相談へ渡せる形式に変換する。

最初の目的は、レンズ検索を直接実行することではなく、相談画面に適切な文脈を渡すこと。

## Handoff data model

Scene Guide の選択結果は、レンズ名ではなく条件プロファイルとして保存する。

候補型:

type SceneGuideHandoff = {
  sceneId: string
  sceneLabel: string
  selectedConditions: {
    key: string
    label: string
    value: string
  }[]
  derivedLensConditions: {
    focalRangeLabel: string
    focalMin?: number
    focalMax?: number
    lensType: 'bright-prime' | 'telephoto-zoom' | 'standard-zoom' | 'flexible'
    priorities: string[]
    cautions: string[]
  }
  candidateRoles: {
    role: 'main' | 'safe' | 'conditional'
    label: string
    reason: string
  }[]
  generatedPrompt: string
}

## Example: family indoor

Input:

sceneId: family-photography  
condition: 室内で撮る  
additional: 子どもが近づいてくる

Derived conditions:

focalRange: 35-50mm  
lensType: bright-prime

priorities:
- close distance
- group photos
- indoor usability
- lightweight

Generated prompt:

室内の家族写真で、子どもが近づいてくる場面が多いです。35〜50mmの明るい単焦点を中心に、複数人でも失敗しにくい候補を教えてください。

## Example: recital center seat

Input:

sceneId: recital-stage  
seat: 中央席  
venue: 小ホール  
framing: 表情を切り出したい  
shooting: 写真メイン

Derived conditions:

focalRange: 100-150mm  
lensType: bright-prime

priorities:
- reach
- subject isolation
- low light

cautions:
- 85mm may be short
- 70-200mm is safer if seat is uncertain

Generated prompt:

発表会で中央席・小ホールから子どもの表情を切り出したいです。135mm前後の明るい単焦点を中心に、85mmでは足りるか、70-200mmの方が安全かも含めて比較してください。

## Example: sports day wide field

Input:

sceneId: sports-day  
venue: 広い校庭  
distance: 遠い  
motion: 速い

Derived conditions:

focalRange: 200mm+  
lensType: telephoto-zoom

priorities:
- reach
- AF tracking
- shutter speed
- carry weight

Generated prompt:

運動会で広い校庭の子どもを撮ります。200mm以上の望遠ズームを中心に、AF・重量・一日持ち歩きやすさも含めて候補を出してください。

## Handoff method options

### Option A: URL query

Example:

`/?scene=recital-stage&seat=center&venue=small-hall&framing=expression`

Pros:
- shareable
- browser navigation friendly
- no storage dependency

Cons:
- query can become long
- Japanese labels need encoding
- sensitive to schema changes

### Option B: sessionStorage

Example:

`sessionStorage.setItem('lensNaviSceneGuideHandoff', JSON.stringify(handoff))`

Pros:
- can store structured data
- avoids long URLs
- easy for single-session handoff

Cons:
- not shareable
- expires per session
- needs careful fallback

### Option C: localStorage

Pros:
- persistent
- can remember last Scene Guide result

Cons:
- might conflict with warehouse persistence
- needs migration policy
- more durable than necessary

### Recommended first implementation

Use `sessionStorage` for the first implementation.

Reason:
- Scene Guide -> Consultation is a short handoff
- structured data is easier than query strings
- avoids modifying existing localStorage formats
- lower risk before public beta

## Consultation page behavior

When consultation page loads:

1. Check sessionStorage for `lensNaviSceneGuideHandoff`
2. If present, show a small prefilled context card
3. Put generated prompt into input, or show a CTA:
   - この条件で相談を始める
4. After user sends or dismisses, clear the sessionStorage item

## UI proposal

Scene Guide result area:

この条件で相談する

Subtext:

選んだ撮影条件をもとに、具体的なレンズ候補をAIに相談します。

Consultation page prefill card:

シーンガイドから引き継ぎました

発表会 / 中央席 / 小ホール / 表情を切り出す  
候補条件: 100〜150mm / 明るい単焦点 / 70-200mmも比較

## Guardrails

- Scene Guide should not directly recommend exact lens names unless resolver data is ready
- Do not modify warehouse localStorage format
- Do not connect to Dify until prompt behavior is clear
- Do not auto-send consultation; user should confirm
- Keep user editable
- Generated prompt should be transparent and readable

## Implementation phases

### Phase 1: docs only

Define handoff structure and prompt generation.

### Phase 2: family handoff prototype

Implement only for family-photography.

### Phase 3: recital and sports-day handoff

Add generated prompts for interactive scenes.

### Phase 4: resolver integration

Use lens condition resolver to add mount-specific candidates.

### Phase 5: Deep Review comparison

After consultation result, offer AI deep comparison between final candidates.

## Suggested next task after Codex resumes

Plan scene guide to consultation handoff implementation

or, if implementation is preferred:

Implement family scene guide consultation handoff
