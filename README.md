# Manga Storyboard Editor

テキストベースの DSL（MangaStoryboardDSL）で、マンガのネーム（コマ割り・人物・吹き出し・効果音など）を記述し、SVG で即時プレビューできるエディタです。

## デモ（GitHub Pages）

実際に動作する環境はこちらです。  
https://pun2beam.github.io//mangaStoryboardEditor/

## 主な機能

- 左ペインで DSL を編集、右ペインで SVG プレビューをリアルタイム表示
- フラット構文・階層構文の両方に対応
- `page` / `panel` / `actor` / `balloon` / `caption` / `sfx` / `object` / `asset` などを描画
- MathJax による数式レンダリング（吹き出し・注釈等のテキスト内）
- SVG 出力（「SVGとして保存」ボタン）
- ID の振り直し（「IDを振り直し」ボタン）

## 依存ライブラリ

本プロジェクトはビルドツール不要の構成で、主にブラウザ標準 API と以下のライブラリを利用します。

- **MathJax v3**（リポジトリ内 `es5/` に同梱、`index.html` から `./es5/tex-svg.js` を読み込み）

## 使い方

1. デモページを開く（またはローカルで `index.html` を開く）
2. 左の DSL エリアにシナリオを入力
3. 右側でプレビューを確認
4. 必要なら「SVGとして保存」で書き出し

サンプル DSL は `example/readme.msd` などを参照してください。

## DSL 仕様

詳細仕様は `spec.md` を参照してください。以下は最小例です。

```msd
meta:
  title: サンプル

page:
  id: p1
  size: B5
  panel:
    id: 1
    w: 100
    h: 100
    actor:
      id: a1
      x: 50
      y: 80
      pose: stand

    actor:
      id: a2
      x: 70
      y: 82
      pose: run
      pose.points: "0,-18,-6,-16,6,-14,-3,-8,4,-7,0,-10,0,0,0,8,-2,16,3,17,-3,24,5,24"
    balloon:
      id: b1
      x: 10
      y: 10
      w: 40
      h: 20
      text: こんにちは！

    sfx:
      id: s1
      x: 70
      y: 25
      text: ドーン
      fontWeight: 900
      stroke: white
      strokeWidth: 2
```

補足:
- `pose.points` は指定した `actor` に対してのみ `pose` プリセットを上書きします。未指定の `actor` は既存の `pose` プリセットをそのまま利用します。
- `pose.points` は24値（12点）で指定し、先頭の `head(x,y)` を頭の位置と首への接続起点として使います。
- `asset` に `anchor` を指定すると、`dx`,`dy` の基準点を `head,lh,rh,le,re,neck,waist,groin,lk,rk,lf,rf` のいずれかに変更できます（既定: `head`）。
- 将来の単位指定拡張や GUI でのポーズ編集は、DSLコアとは分離した別機能として段階的に導入する方針です。

## ローカルでの動作確認

静的ファイルのみで構成されています。任意の簡易 HTTP サーバーで起動できます。

例（Python）:

```bash
python3 -m http.server 8000
```

その後、ブラウザで `http://localhost:8000/` を開いてください。

## ファイル構成（主要）

- `index.html` : アプリ本体
- `app.js` : DSL の解析・検証・SVG 描画ロジック
- `styles.css` : レイアウト・UI スタイル
- `spec.md` : MangaStoryboardDSL 仕様書
- `example/*.msd` : DSL サンプル
