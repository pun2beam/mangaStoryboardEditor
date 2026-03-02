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
  actor.strokeWidth: 3

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
      strokeWidth: 5
      pose.points: "0,-18,-6,-16,6,-14,-3,-8,4,-7,0,-10,0,0,0,8,-2,16,3,17,-3,24,5,24"
      pose.points.z: "0,1,1,1,1,0,0,0,0,0,0,0"
      pose.points.outlineWidth: "0,2,2,2,2,2,2,2,2,2,4,4"
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
- 棒人間の線色は `meta.actor.stroke`（全体既定）と `actor.stroke`（個別上書き）で指定できます（既定: `black`）。
- 棒人間の線の太さは `meta.actor.strokeWidth`（全体既定）と `actor.strokeWidth`（個別上書き）で指定できます。
- 棒人間の縁取りは `meta.actor.outline`（全体既定）と `actor.outline`（個別上書き）で `on/off` 指定できます（既定: `on`）。
- 関節補正用マスク円の半径は `meta.actor.jointMaskRadius`（全体既定）と `actor.jointMaskRadius`（個別上書き）で指定できます（既定: `Math.max(0.5, strokeWidth * 0.6)`）。末端点（degree=1）は joint mask の対象外で、endpoint-cap 側で丸めます。
- `pose.points` は24値（12点）で指定し、先頭の `head(x,y)` を頭の位置と首への接続起点として使います。
- `pose.points.z` は12値（`head,lh,rh,le,re,neck,waist,groin,lk,rk,lf,rf` 順）で指定できます。`pose.points` の各部位線分の前後関係に使われます。`neck-head` 線分は `head` の値を使って前後関係を指定できます。
- `pose.points.outlineWidth` は12値（`head,lh,rh,le,re,neck,waist,groin,lk,rk,lf,rf` 順）で指定できます。各部位線分の縁取り太さ（`strokeWidth` への加算値）を個別指定します。`0` で縁取りなしになります。
- `actor.attachments[].z` も同じ actor 内の描画順ソートに含まれます（`pose.points.z` の線分と同じ z 軸で前後関係を決定）。
- 右ペインの `Pose編集` を ON にして actor を選択するとジョイントハンドルが表示され、ドラッグで `pose.points`（24値文字列）が自動生成・更新されます。
- `asset` に `anchor` を指定すると、`dx`,`dy` の基準点を `head,lh,rh,le,re,neck,waist,groin,lk,rk,lf,rf` のいずれかに変更できます（既定: `head`）。
- `asset.anchorRot` で `asset.anchor` の位置を中心にした追加回転を指定できます（度数法、既定: `0`）。`asset.rot`（画像中心回転）と併用できます。
- `Pose編集` で attachment ハンドルをドラッグすると `actor.attachments[].dx`,`dy` が更新されます。既定のドラッグ基準点は画像左上（描画式: `x = anchorX + dx * actor.scale`, `y = anchorY + dy * actor.scale`）で、`asset.dragBasis: center` の場合は画像中心基準（`width/2`,`height/2` を差し引いて逆算）になります。
- `asset.flipX`（既定: `false`）で左右反転できます。`actor.attachments[].flipX` を指定した場合はそちらが優先されます。
- `actor.appendages[]` は `ref` でトップレベル `appendage` 定義（`id`）を参照できます。参照先の設定を継承しつつ、指定したプロパティだけ上書きできます。
- `actor.appendages[].strokeWidth`（および参照元 `appendage.strokeWidth`）で appendage ごとの線幅を指定できます。未指定時は `actor.strokeWidth` を使います。
- `actor.appendages[].s`（および参照元 `appendage.s`）で appendage ごとの追加拡大率を指定できます（既定: `1`、実効倍率: `actor.scale * s`）。
- `actor.appendages[].outlineWidth` で appendage の縁取り太さを指定できます。単一数値（従来どおり）に加えて、`|` 区切りで各点列グループごとの数値列（例: `0,0,0,1 | 0,0,1`）も指定できます。数値列形式では各グループの要素数を対応する点列の点数と一致させ、各線分の縁取り太さは「終点側の値」を使います。未指定時は `2`、`0` で縁取りなしになります。
- `actor.appendages[].jointMaskRadius`（および参照元 `appendage.jointMaskRadius`）で appendage の関節補正マスク半径を指定できます（既定: `Math.max(0.5, 線幅 * 0.6)`、対象は内部点のみ）。
- `actor.appendages[].endpointCap`（および参照元 `appendage.endpointCap`）で端点形状を `round` / `square` から選択できます（既定: `round`）。始点・終点の両方に適用され、`outline` / `outerOutline` も同じ端点形状で描画されます。
- 将来の単位指定拡張や GUI でのポーズ編集は、DSLコアとは分離した別機能として段階的に導入する方針です。

asset 単体の最小例（asset側で左右反転）:

```msd
asset:
  id: asFlipBase
  panel: 1
  x: 20
  y: 20
  w: 24
  h: 24
  src: ./img/prop.png
  flipX: true
```

attachment 上書きの最小例（asset側 `flipX` を attachments 側で上書き）:

```msd
asset:
  id: asHand
  w: 10
  h: 6
  src: ./img/hand.png
  flipX: false

actor:
  id: a1
  panel: 1
  x: 50
  y: 80
  attachments:
    - ref: asHand
      flipX: true
```

appendage `ref` の最小例（トップレベル定義を actor から参照）:

```msd
appendage:
  id: apHandBase
  anchor: rh
  chains: 0,0 2,-2 | 0,0 2,-3 | 0,0 1,-3 | 0,0 0,-3 | 0,0 -1,-2
  strokeWidth: 6

actor:
  id: a1
  panel: 1
  x: 50
  y: 80
  appendages:
    - id: handAlt
      ref: apHandBase
      anchor: lh
      flipX: true
      stroke: #ef4444
```

## appendages 重複 `ref` ドラッグの再現・確認手順

`extends` + `actor.appendages`（同一 `ref` を複数持つ）での再現サンプルとして、`example/appendage_ref_duplicate_drag_repro.msd` を追加しています。

1. エディタを開き、`example/appendage_ref_duplicate_drag_repro.msd` を読み込む。
2. `Hand詳細編集` を ON にする。
3. `a-child-dup-ref` を選択し、同じ appendage の同一点ハンドル（`appendage-chain-point`）を連続でドラッグする。
4. 左ペインに出力される `actor: id: a-child-dup-ref` の `appendages` を確認し、**要素数が増えていない**ことを確認する。

補助チェック（静的比較）:

```bash
node tools/compare_appendages.js before.msd after.msd a-child-dup-ref
```

- `before.count` と `after.count` が一致すること。
- `+keys` に `id` / `ref` / `anchor` 以外の暗黙生成キーが出ないこと。

失敗時に優先確認する箇所:

- `setupObjectDrag` の `appendage-chain-point` 終了処理（ドラッグ後に `block.props.appendages` を更新・再利用する分岐）。
- `resolveActorAppendages` による参照解決後データで `ref` が期待どおり伝搬しているか（編集対象の識別キー `id` または `ref+anchor` が維持されているか）。


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
