# Document Lens Navi product roadmap

## Status

In progress.

## Goal

Lens Navi の今後のプロダクトロードマップを整理し、`/warehouse-gallery` を次期本番倉庫そのものではなく、所有レンズを愛でるギャラリーモードとして再定義する。

## Scope

- `docs/lens-navi-product-roadmap.md` を新規作成する。
- 必要最小限で `docs/active-mission.md` に現在地を反映する。
- コード、UI、localStorage、route、本番データ構造には触れない。

## Roadmap direction

優先順位は以下を基本線とする。

1. シーンガイド完成
2. AI深掘り完成
3. ギャラリー追加
4. カメラバッグ機能追加
5. AIカメラバッグアドバイザー化

`/warehouse-gallery` は `/warehouse` の即時置換ではなく、所有レンズを鑑賞するギャラリーモードとして扱う。

## Allowed files

- `docs/lens-navi-product-roadmap.md`
- `docs/active-mission.md`
- `docs/current-task.md`

## Do not touch

- `src/`
- UI implementation
- localStorage behavior or key names
- route structure
- production data structure
- API / Dify
- `public/lens_data.json`
- `public/lens_links.json`
- `public/price_history.json`
- `data/kakaku_id_map.json`

## Checks

- `git diff --check`
- `git diff --no-index --check /dev/null docs/lens-navi-product-roadmap.md` if the new doc is still untracked

## Not planned

- `npm run build`
- e2e
- commit
- push
