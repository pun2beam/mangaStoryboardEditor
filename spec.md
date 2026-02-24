# MangaStoryboardDSL 仕様書（ドラフト v0.1）

## 1. 目的

マンガ制作工程のうち、**ネーム（コマ割り・台詞・演出）**をテキストで記述し、**SVGとして即時プレビュー**するためのDSLを定義する。
完全な作画は扱わず、**棒人間（簡易キャラクタ）**と簡易アイコン／吹き出し／効果音／キャプションで“状況が伝わる”ことを目的とする。
webアプリとして作成し左ペインにDSLを入力し、そのDSLに基づいた描画を右ペインにする。

---

## 2. ファイル形式

* 文字コード: UTF-8
* 改行: LF/CRLFどちらも許容
* 拡張子: `.msd`（例）※任意。実装側で選べるようにする
* コメント: 行頭 `#` から行末まで

---

## 3. 構文（ブロック構文）

本DSLは「**ブロック**」の列で構成される。

### 3.1 ブロック基本形

```
<blockType>:
  key:value
  key:value
```

* `<blockType>` は識別子（例: `page`, `panel`, `actor`, `balloon`）
* `:` の後に改行し、**2スペース以上**のインデントで `key:value`
* ブロック間は空行があってもよい

### 3.1.1 階層構文（実装対応）

実装ではフラット構文に加えて、親子関係をインデントで表す**階層構文**にも対応する。

* `page` の下に `panel` をネスト可能
* `panel` の下に `actor/object/boxarrow/balloon/caption/sfx/asset` をネスト可能
* 親参照キー（`panel.page`、`actor.panel` など）は省略可能で、その場合は親ブロックの `id` を自動補完する

例:

```msd
page:
  id:p1
  size:B5
  panel:
    id:1
    w:100
    h:30
    actor:
      id:a1
      x:20
      y:80
```

### 3.2 値の型

* number: `12`, `3.14`, `-1`
* string: `abc`, `こんにちは`（コロン `:` を含む場合はクォート推奨）
* quoted string: `"a:b"` または `'a:b'`
* bool: `true` / `false`
* multiline string:

  ```
  text: |
    1行目
    2行目
  ```

### 3.3 IDと参照

* 多くのブロックは `id` を持てる（必須/任意は後述）
* 参照は `page:<id>` `panel:<id>` `actor:<id>` 等の「ID参照」または単に `panel: 3` のように型が自明なら単純参照でも可（実装で統一）
* **未定義ID参照はエラー**

---

## 4. 座標系と単位

### 4.1 基本座標

* 既定は **ページ座標**（左上が原点）
* x右方向+, y下方向+
* `x,y,w,h` は **ページの内側（margin除外）を100×100とする百分率**を既定単位とする

  * 例: `x:0, y:0, w:100, h:50` は上半分
* オプションで `unit:px` をページに指定した場合はピクセル指定（数値をpxとみなす）
* `page.unit:percent` のとき、座標・サイズの `%` 解釈は `meta.layout.percent.reference` に従う

  * `page-inner`（既定/互換）: そのページの内側領域（margin除外）を基準に `%` を解釈
  * `base-size`: `meta.layout.base.width/height`（または `layout.base.size`）を基準に `%` を解釈し、**最終描画時に各ページ実寸へ投影**する

### 4.2 Z順（重なり）

SVG描画順は原則：

1. `panel`（枠）
2. `asset`（下絵画像）
3. `actor`（棒人間）
4. `balloon/caption/sfx`（文字・吹き出し）
   ただし各ブロックは `z`（整数、既定0）を持て、`z`昇順でソートして描画する（同値はファイル登場順）。

---

## 5. ブロック定義

### 5.1 `meta`（任意）

作品全体のメタ情報。

* `title`（任意）
* `author`（任意）
* `version`（任意）
* `actor.name.visible`（任意、`on`/`off`。`on` の場合、`actor.name` をキャラクターの上部に表示）
* `actor.stroke`（任意、色。棒人間の線色の既定値。既定: `black`）
* `actor.strokeWidth`（任意、数値。棒人間の線の太さの既定値。既定: `2`）
* `actor.outline`（任意、`on`/`off`。棒人間の縁取り表示の既定値。既定: `on`）
* `actor.outerOutline`（任意、`on`/`off`。棒人間シルエットの外側縁取り表示の既定値。既定: `off`）
* `actor.outerOutlineWidth`（任意、数値。`actor.outerOutline:on` 時に使う追加外縁の太さ。既定: `2`）
* `actor.jointMaskRadius`（任意、数値。関節補正用マスク円半径の既定値。既定: `Math.max(0.5, actor.strokeWidth * 0.6)`。degree=1 の末端点は対象外）
* `text.direction`（任意、`horizontal`/`vertical`。既定: `horizontal`。全体の文字方向）
* `base.panel.direction`（任意、`right.bottom`/`left.bottom`。panel自動配置の既定方向。既定: `right.bottom`）
* `base.panel.margin`（任意、数値。panel自動配置時のコマ間余白。既定: `0`）

#### `layout.*` 名前空間

`meta` 直下にレイアウト制御用の `layout.*` キー群を定義する。

| キー | 必須 | 許容値 / 型 | 既定値 | 互換挙動 |
|---|---|---|---|---|
| `layout.page.mode` | 任意 | `fixed` / `auto-extend` / `auto-append` | `fixed` | 未指定時は `fixed` として扱い、従来どおり `page` と `panel.page` を必須にする。`auto-extend`/`auto-append` の場合のみ `page` / `panel.page` 省略を許可する。 |
| `layout.page.persistGenerated` | 任意 | `true` / `false`（bool） | `false` | 未指定時は `false` として扱い、レイアウト処理で自動生成された page（例: `auto-p1`）は stringify 時にDSLへ書き戻さない。 |
| `layout.page.gap` | 任意 | 数値（0以上） | `1` | 未指定時は `1` として扱い、従来のページ間隔を維持する。 |
| `layout.base.width` | 任意 | 数値（正） | なし | `layout.base.height` と片方のみ指定された場合はエラー。 |
| `layout.base.height` | 任意 | 数値（正） | なし | `layout.base.width` と片方のみ指定された場合はエラー。 |
| `layout.base.size` | 任意 | `B5` / `A4` など既知サイズ名 | なし（ただし `layout.percent.reference:base-size` で基準不足時は `B5` にフォールバック） | 既知サイズでなければエラー。 |
| `layout.percent.reference` | 任意 | `page-inner` / `base-size` | `page-inner` | 未指定時は `page-inner` として既存互換。 |

補足:

* 自動生成 page ID は `auto-p1`, `auto-p2`, ... の連番を使用し、既存 ID と衝突する場合は空き番号が見つかるまで再試行する。
* `base.panel.direction` と `base.panel.margin` は `layout.*` と同様に正規化され、全レイアウト処理で共通設定として利用される。

例:

```
meta:
  title: テスト漫画
  author: DEF
  version: 0.1
```

---

### 5.2 `page`（条件付き必須、複数可）

ページ設定。既定では最低1つ必要。`meta.layout.page.mode` が `auto-extend` または `auto-append` の場合は省略可能（実装は仮想ベースページを自動生成）とする。

必須:

* `id`（一意）
* `size`（例: `B5`, `A4`, `custom`）
  任意:
* `width`, `height`（`size:custom` の場合は必須）
* `margin`（既定: 5）※百分率単位時は「内側領域を作るための割合」
* `bleed`（既定: 0）
* `unit`（`percent`/`px`、既定: `percent`）
* `bg`（背景色、既定: `white`）
* `stroke`（ページ枠線色、既定: `#c9ced6`）
* `strokeWidth`（ページ枠線幅、既定: `2`）

例:

```
page:
  id:p1
  size:B5
  margin:5
  unit:percent
```

---

### 5.3 `panel`（必須、複数可）

コマ枠（矩形）。
必須:

* `id`
* `w,h`

条件付き必須:

* `page`（参照）
  * `meta.layout.page.mode` 未指定時は必須（既存DSL互換）
  * `meta.layout.page.mode` が `auto-extend` / `auto-append` の場合は任意（省略時はレイアウトエンジンが自動採番した page に割り当てる）

任意:

* `x,y`（省略可。省略時は自動配置対象として扱う）
* `next`（任意、`left`/`right`/`bottom`。このpanelの次に続くpanelの自動配置方向ヒント）
* `radius`（角丸、既定0）
* `stroke`（枠線色、既定`black`）
* `strokeWidth`（既定1）
* `fill`（既定`none`）
* `gutter`（コマ間余白のヒント。描画には使わない/使ってもよい）

配置優先ルール:

* `x,y` 明示 > 直前panelの `next` 明示 > `meta.base.panel.direction` 既定。
* `meta.base.panel.direction: right.bottom` のとき `panel.next:left` は指定不可、`left.bottom` のとき `panel.next:right` は指定不可。
* `next` は小文字化して解釈し、許容値以外はエラー。
* 「1つ前のpanelの `next` が次panelに適用される」ロジックは同一 `page` 内でのみ有効。

互換性ルール:

* 既存DSL互換のため、`x,y` が指定されている場合はその値を優先し、従来どおり明示位置として扱う。
* `x,y` のいずれかが欠ける場合のみ自動配置対象とする。
* `panel.page` 省略時（`meta.layout.page.mode: auto-extend/auto-append` のみ許可）は、レイアウトエンジンが `page` を自動採番して割り当てる。`page` ブロックが存在しない場合は仮想ベースページを `auto-page-1` として生成し、未指定panelはこのページに割り当てる。

例:

```
panel:
  id:1
  page:p1
  x:0
  y:0
  w:60
  h:60
```

---

### 5.4 `actor`（任意）

棒人間（簡易キャラクタ）をコマ内に配置。

必須:

* `id`

任意:
* `panel`（参照。指定時はコマ内へ表示。未指定時はテンプレートとして単体表示しない）
* `extends`（任意、継承元 `actor` の `id`）
  * 既定では `panel` は継承しない（子で明示指定した場合のみ設定される）
  * 互換モードとして `meta.actor.inheritPanel:on` で `panel` 継承を有効化可能（既定 `off`）
* `x,y`（足元の基準点を推奨）
* `scale`（既定1.0）
* `stroke`（任意、色。棒人間の線色。未指定時は `meta.actor.stroke`、さらに未指定なら `black`）
* `strokeWidth`（任意、数値。棒人間の線の太さ。未指定時は `meta.actor.strokeWidth`、さらに未指定なら `2`）
* `outline`（任意、`on`/`off`。棒人間の縁取り表示。未指定時は `meta.actor.outline`、さらに未指定なら `on`）
* `outerOutline`（任意、`on`/`off`。棒人間シルエットの外側縁取り表示。未指定時は `meta.actor.outerOutline`、さらに未指定なら `off`）
* `outerOutlineWidth`（任意、数値。`outerOutline:on` 時の追加外縁太さ。未指定時は `meta.actor.outerOutlineWidth`、さらに未指定なら `2`）
* `jointMaskRadius`（任意、数値。関節補正用マスク円半径。未指定時は `meta.actor.jointMaskRadius`、さらに未指定なら `Math.max(0.5, strokeWidth * 0.6)`。degree=1 の末端点は endpoint-cap で描画）
* `rot`（度。足元基準で回転。既定0）
* `facing`（`left`/`right`/`back`、既定`right`）
* `pose`（既定`stand`）
* `pose.points`（任意、12点×`x,y` を1文字列で指定。指定時は `pose` より優先）
* `pose.points.z`（任意、12値を `head,lh,rh,le,re,neck,waist,groin,lk,rk,lf,rf` 順で指定。`pose.points` の各部位線分のz順に使用）
* `pose.points.outlineWidth`（任意、12値を `head,lh,rh,le,re,neck,waist,groin,lk,rk,lf,rf` 順で指定。部位ごとの縁取り太さ（`strokeWidth` に加算）に使用。`0` で縁取りなし）
* `emotion`（既定`neutral`）
* `eye`（`right`/`left`/`up`/`down`/`cry`/`close`/`wink`、既定`right`）
* `head.shape`（`circle`/`square`/`none`、既定`circle`）
* `name`（任意、デバッグ用）
* `lookAt`（`actor:<id>` または `point(x,y)`、任意）
* `attachments`（任意、**asset参照専用**の配列。`asset`の`id`を`ref`で参照し、`dx`,`dy`,`s`,`rot`,`anchorRot`,`z`,`flipX`で相対配置。`asset`側の同名設定がある場合は `attachments` 側を優先）
* `appendages`（任意、配列。`appendage` の `id` を `ref` で参照し、必要に応じて `anchor`,`chains`,`digits`,`flipX`,`z`,`rotAnchor`,`s`,`stroke`,`jointMaskRadius`,`endpointCap` などを上書き）
  * `id`（任意。継承マージ用キー。未指定時は `ref` をキーに扱う）
  * `ref`（任意。トップレベル `appendage.id` を参照）
  * `id` または `ref` のどちらか一方は必須
  * `anchor`（必須。既存ジョイント名: `head,lh,rh,le,re,neck,waist,groin,lk,rk,lf,rf`）
  * `flipX`（任意、左右反転）
  * `z`（任意、数値または点列ごとの数値列。単一数値は appendage 全体の前後順。数値列は `|` 区切りで `chains`→`digits` 順にグループ対応し、各グループ要素数は対応点列の点数と一致させる。各線分の z は終点側の値を使用）
  * `rotAnchor`（任意、`anchor` を中心にした回転角。既定 `0°`）
  * `s`（任意、`actor.scale` に掛ける追加倍率。既定 `1`）
  * `stroke`（任意、色。未指定時は `actor.stroke` を使用）
  * `outlineWidth`（任意。単一数値または点列ごとの数値列。単一数値は appendage 全体の縁取り太さ（`strokeWidth` への加算値）。数値列は `|` 区切りで `chains`→`digits` 順にグループ対応し、各グループ要素数は対応点列の点数と一致させる。各線分の縁取り太さは終点側の値を使用。未指定時は `2`、`0` で縁取りなし）
  * `jointMaskRadius`（任意、数値。appendage の関節補正用マスク円半径。未指定時は `Math.max(0.5, 線幅 * 0.6)`。内部点のみ対象で末端点は endpoint-cap で描画）
  * `chains` または `digits`（いずれか必須）
    * 既存: `chains: "x1,y1 x2,y2 | ..."` のグループ指定（各グループ2点以上）
    * 新形式: `chains[N].name`, `chains[N].points`（`name` は任意。未指定可）
  * 点群座標系は `anchor` 原点のローカル座標（`x,y`）として解釈する
  * 変換順序は `local points` → `scale`（`actor.scale * s`）→ `flipX` → `rot`（+`rotAnchor`）→ actor 座標系への平行移動
  * `z` は actor 内の `pose.points.z` 線分および `attachments[].z` と同一ソート軸で扱う
* `style`（後述 styleRef）

#### pose（プリセット）

実装UI補足:

* エディタ右ペインの `Pose編集` UI を ON にして actor を選択すると、12点のジョイントハンドル（`head,lh,rh,le,re,neck,waist,groin,lk,rk,lf,rf`）が表示される。
* ハンドルをドラッグして確定（pointerup）すると、その actor の `pose.points` が `24` 値文字列として自動生成・更新され、DSL に書き戻される。

実装必須プリセット（v0.1）:

* `stand`, `run`, `sit`, `point`, `think`, `surprise`

#### pose.points（明示座標）

`actor` ごとに関節点を直接指定するためのオプション。

* 形式は **24個の数値（12点の `x,y`）をカンマ区切りで並べた1つの文字列**
* 点の順序は次で固定:
  `head,lh,rh,le,re,neck,waist,groin,lk,rk,lf,rf`
  * `head`: 頭の中心（頭描画座標と首への接続起点に使用）
  * `lh/rh`: 左手・右手
  * `le/re`: 左肘・右肘
  * `neck`: 首
  * `waist`: 腰
  * `groin`: 股
  * `lk/rk`: 左膝・右膝
  * `lf/rf`: 左足・右足
* 優先順位は `pose.points` > `pose`。
* `pose.points.z` を指定した場合、`pose.points` 由来の各部位線分（腕・胴・脚）を `pose.points.z` の値で前後ソートして描画する。
* `neck-head` 線分は `pose.points.z` の `head` 値で前後関係を指定する。
* `actor.attachments[].z` は `pose.points.z` と同一の actor 内 z ソートに統合される。
* `actor.appendages[].z` も `pose.points.z` と同一の actor 内 z ソートに統合される。
* 実装では `attachments`（asset参照）と `appendages`（可変点列）を別パスで処理し、レンダリング時の z ソートでのみ統合する。
  * `pose.points` 指定時は、`pose` プリセット値が同時にあっても `pose.points` を採用する。
  * `pose.points` 未指定時は既存どおり `pose` プリセットで描画する（既定 `stand`）。

#### 互換性

* 既存の `pose` プリセット（`stand` / `run` / `sit` / `point` / `think` / `surprise`）は、`pose.points` を使わない限りそのまま利用できる。
* `pose.points` は明示指定時のみ有効で、未指定時は常に `pose` プリセットの挙動を維持する。
* `pose` と `pose.points` を同時指定した場合のみ、`pose.points` が上書きとして適用される。

#### 将来拡張方針

* 単位指定の拡張（例: 新しい単位系や変換ルール）は、ポーズ表現とは独立した別機能として設計・導入する。
* GUI での関節点編集（ポーズエディタ）は DSL 仕様本体とは分離した別機能として扱い、互換性を壊さない段階的導入を行う。

#### emotion（プリセット）

実装必須（v0.1）:

* `neutral`, `angry`, `sad`, `panic`, `smile`, `none`

例:

```
actor:
  id:a1
  panel:1
  x:20
  y:55
  scale:1.0
  facing:right
  pose:run
  emotion:panic
  name:主人公
```

---

### 5.5 `balloon`（任意）

吹き出し。

`x,y` を省略した場合は、同一パネル内で他要素と重ならない位置に自動配置を試みる。

必須:

* `id`
* `panel`
* `w,h`
* `text`
  任意:
* `shape`（`oval`/`box`/`thought`、既定`oval`）
* `tail`（`none`/`toActor(<id>)`/`toPoint(x,y)`、既定`none`）
* `fontSize`（既定: `4`。`12px` / `4%` / `4` のように指定可能。単位省略時はpageの`unit`を使用）
* `emphasisFontSize`（任意。`**強調**` で囲んだ文字列に適用するサイズ。`12px` / `4%` / `4` を指定可能）
* `padding`（既定: 2）
* `align`（`left`/`center`/`right`、既定`center`）
* `lineHeight`（既定: 1.2）
* `text.direction`（任意、`horizontal`/`vertical`。指定時はmetaより優先）
* `maxCharsPerLine`（既定: 0=自動。簡易折返し用）

例:

```
balloon:
  id:b1
  panel:1
  x:5
  y:5
  w:35
  h:18
  tail:toActor(a1)
  fontSize:12px
  text: |
    ヤバい！
    遅刻だ！
```

---

### 5.6 `caption`（任意）

ナレーション枠／モノローグ枠。

`x,y` を省略した場合は、同一パネル内で他要素と重ならない位置に自動配置を試みる。

必須:

* `id`
* `panel`
* `w,h`
* `text`
  任意:
* `style`（`box`/`none`、既定`box`）
* `fontSize`, `padding`, `align`, `lineHeight`（既定はballoon準拠）
* `valign`（`top`/`center`/`bottom`、既定`top`）
* `emphasisFontSize`（任意。`**強調**` で囲んだ文字列に適用するサイズ）
* `text.direction`（任意、`horizontal`/`vertical`。指定時はmetaより優先）

補足:

* `text` 内で `**...**` で囲った部分は強調として描画する。
* `emphasisFontSize` 未指定時は通常文字サイズの約 `1.35` 倍で描画する。

---

### 5.7 `sfx`（任意）

効果音テキスト（ドーン等）。

`x,y` を省略した場合は、同一パネル内で他要素と重ならない位置に自動配置を試みる。

必須:

* `id`
* `panel`
* `text`
  任意:
* `scale`（既定1.0）
* `strokeWidth`（任意、数値。棒人間の線の太さ。未指定時は `meta.actor.strokeWidth`、さらに未指定なら `2`）
* `rot`（度、既定0）
* `fontSize`（既定: 8）
* `fontWeight`（任意、既定: 700）
* `stroke`（文字縁取り色、任意）
* `strokeWidth`（文字縁取り幅、既定: 1）
* `fill`（既定`black`）
* `text.direction`（任意、`horizontal`/`vertical`。指定時はmetaより優先）

---

### 5.8 `object`（任意）

配置オブジェクト（ラベル付き図形）。

`x,y` を省略した場合は、同一パネル内で他要素と重ならない位置に自動配置を試みる。

必須:

* `id`
* `panel`
* `text`
  任意:
* `w,h`（既定: 10）
* `shape`（`rect`/`circle`/`oval`/`none`、既定`rect`）
* `border`（既定: 1）
* `fontSize`, `padding`, `align`, `lineHeight`
* `text.direction`（任意、`horizontal`/`vertical`。指定時はmetaより優先）

---

### 5.9 `boxarrow`（任意）

箱＋矢印形状のポリゴン。

必須:

* `id`
* `panel`
* `x,y`
  任意:
* `w,h`（既定: 100）
* `px`（`0..1`、既定: 0.5）
* `py`（`0..1`、既定: 0.3）
* `scale`（既定: 1）
* `rot`（度、既定: 0）
* `z`（既定: 0）
* `opacity`（`0..1`、既定: 1）
* `stroke`（既定: `#000000`）
* `fill`（既定: `#a0f0a0`）

形状は `(0,0)` 中心の以下 7 点ポリゴンを使い、`scale`→平行移動(`x,y`)の順で適用。

* `(-w/2, py*h-h/2)`
* `(px*w-w/2, py*h-h/2)`
* `(px*w-w/2, -h/2)`
* `(0, w/2)`
* `(px*w-w/2, +h/2)`
* `(px*w-w/2, -py*h+h/2)`
* `(-w/2, -py*h+h/2)`

---

### 5.10 `asset`（任意）

下絵画像や参考画像を貼る（棒人間を将来置き換える用途）。

必須:

* `id`
* `w,h`
* `src`（URLまたは相対パス。ブラウザ実装なら相対はpublic配下想定）
  任意:
* `panel,x,y`（指定時は従来どおりコマ内へ単体表示。`panel`なしは単体表示しない）
* `dx,dy`（actor基準の相対座標。attachments側で未指定の場合の既定値）
* `anchor`（任意。`dx,dy` の基準点。`head,lh,rh,le,re,neck,waist,groin,lk,rk,lf,rf` から指定。既定 `head`）
* `anchorRot`（任意。`asset.anchor` の位置を中心にした追加回転角（度）。既定0）
* `s`（actor.scaleに掛ける追加倍率、既定1）
* `rot`（回転角、既定0）
* `z`（actor内相対レイヤ。`pose.points.z` の線分と同じ z 軸で前後ソート）
* `flipX`（左右反転フラグ、既定false）
* `dragBasis`（任意。Pose編集で attachment をドラッグしたときの `dx,dy` 基準。`top-left`（既定）/`center`）
* `opacity`（既定1.0）
* `clipToPanel`（既定true、単体表示時のみ有効）

---

### 5.11 `style`（任意）

複数要素に共通するスタイル定義。
必須:

* `id`
  任意:
* `stroke`, `strokeWidth`, `fill`, `fontFamily`, `fontWeight`, `fontSize`

各要素は `styleRef:<id>` を持てる（未定義ならエラー）。

---

### 5.12 `appendage`（任意）

`actor.appendages[].ref` から参照できる再利用可能な可変点列パーツ定義。

必須:

* `id`
* `anchor`（`head,lh,rh,le,re,neck,waist,groin,lk,rk,lf,rf`）
* `chains` または `digits` のいずれか

任意:

* `chains`（文字列形式: `"x1,y1 x2,y2 | ..."`、または `chains[N].points` 形式）
* `digits`（文字列形式: `"x1,y1 x2,y2 | ..."`、または `digits[N].points` 形式）
* `flipX`（左右反転）
* `z`（数値または `|` 区切り点列ごとの数値列）
* `rotAnchor`（`anchor` 基準の回転角。既定 `0`）
* `s`（`actor.scale` に掛ける追加倍率。既定 `1`）
* `stroke`（線色。未指定時は参照先 actor の `stroke`）
* `strokeWidth`（線幅。未指定時は参照先 actor の `strokeWidth`）
* `outlineWidth`（単一数値または `|` 区切り数値列。未指定時 `2`、`0` で縁取りなし）
* `jointMaskRadius`（関節補正マスク半径。未指定時 `Math.max(0.5, 線幅 * 0.6)`）

補足:

* `actor.appendages[]` 側で同名キーを指定した場合は、`appendage` 定義より `actor.appendages[]` の値を優先する。

---

## 6. バリデーション規則（v0.1）

実装は最低限これを満たす。

* `meta.layout.page.mode` が未指定時、`page` は1つ以上必須（既存DSL互換）
* `meta.layout.page.mode` が `auto-extend` または `auto-append` の場合、`page` は省略可能（仮想ベースページを自動生成）
* 各 `id` は同一型内で一意（推奨: 全体で一意でもよい）
* `panel` は参照先 `page` が存在する
* `object/boxarrow/balloon/caption/sfx` は参照先 `panel` が存在する
* `actor` は `panel` を持つ場合のみ参照先 `panel` が存在する
* `asset` は `panel` を持つ場合のみ参照先 `panel` が存在する
* `appendage` の各 `id` は一意である
* `appendage` は各要素に `id`,`anchor` があり、`chains` または `digits` のいずれかを持つ
* `actor.attachments[].ref` の参照先 `asset` が存在する
* `actor.appendages[]` 指定時、各要素は `id` または `ref` のいずれかを持ち、`ref` 指定時は参照先 `appendage` が存在する
* `actor.appendages[]` は `ref` 展開後に `anchor` と `chains` または `digits` のいずれかを満たす
* `actor.appendages[].anchor` は既存ジョイント集合（`head,lh,rh,le,re,neck,waist,groin,lk,rk,lf,rf`）に含まれること
* 既存 `chains`/`digits` 文字列形式では、各点列グループが2点以上であること
* `actor.appendages[].chains` / `digits` の数値列は `x,y` ペア（偶数個）であること
* `chains[N].name`/`chains[N].points` 形式を指定した場合、`chains[N].points` は点列として解釈される
* `actor.appendages[].rotAnchor` 未指定時は `0°` を既定値とする
* `appendage.s` / `actor.appendages[].s` 未指定時は `1` を使用する
* `actor.stroke` 未指定時は `meta.actor.stroke`（さらに未指定なら `black`）を使用する
* `actor.appendages[].stroke` 未指定時は `actor.stroke` を使用する
* `appendage.strokeWidth` / `actor.appendages[].strokeWidth` 未指定時は `actor.strokeWidth` を使用する
* `actor.appendages[].outlineWidth` は単一数値または `|` 区切りの数値列グループを受け付ける（数値列時は `chains`→`digits` 順でグループ数を一致させ、各グループ要素数は対応点列の点数と一致）
* `actor.appendages[].endpointCap` / `appendage.endpointCap` は `round` または `square` を受け付ける（未指定時 `round`）
* `actor.appendages[].z` は単一数値または `|` 区切りの数値列グループを受け付ける（数値列時は `chains`→`digits` 順でグループ数を一致させ、各グループ要素数は対応点列の点数と一致）
* appendage の終端（接続数1）は endpoint-cap で丸め、関節補正が必要な場合のみ内部点（接続数2以上）をマスク対象とする
* `appendage.jointMaskRadius` / `actor.appendages[].jointMaskRadius` は正の数値のみ有効（未指定時は `Math.max(0.5, 線幅 * 0.6)`）
* `actor.appendages[].outlineWidth` 未指定時は `2` を使用し、`0` 以下は縁取りなしとして扱う
* `actor.outline` 未指定時は `meta.actor.outline`（さらに未指定なら `on`）を使用する
* `actor.extends` の参照先 `actor` が存在し、循環継承しない
* `actor` 継承時、既定では `panel` は継承しない（`meta.actor.inheritPanel:on` 時のみ継承）
* `actor` 継承時、`x,y` は継承しない（子で明示指定または自動配置で決定）
* `w,h` は数値で、`w,h > 0`
* `panel` の `x,y` は任意。`x,y` の両方が指定される場合はその値を優先し、いずれか欠ける場合は自動配置対象として扱う
* 自動配置アルゴリズムの衝突回避対象は、**同一 `page` にすでに存在する `panel`** のみとする（他ページのpanelは対象外）
* 自動配置時の衝突判定は軸平行矩形（AABB）の交差判定 `a.x < b.x+b.w && a.x+a.w > b.x && a.y < b.y+b.h && a.y+a.h > b.y` を用いる
* AABB判定において、辺や頂点がちょうど接するだけ（`a.x+a.w == b.x` 等）は **重なりなし** とする
* 自動配置時の `y.base` 探索は、`unit:px` は1px刻み、`unit:percent` は0.01刻み（小数第2位まで許容）で下方向へ探索する
* `unit:percent` の場合、原則 `0..100` を推奨（範囲外は許容するが警告）
* `meta.layout.percent.reference` は `page-inner` / `base-size` のいずれか
* `meta.layout.percent.reference: base-size` で `layout.base.*` 未指定時は `layout.base.size:B5` とみなす
* `meta.layout.base.width` と `meta.layout.base.height` は同時指定（正数）
* `tail:toActor(a1)` の参照先が存在する
* `pose`/`emotion` が未対応値の場合、既定にフォールバック（か警告）
* `actor.pose.points` 指定時、値は 24 個の数値（12点×`x,y`）であること
* `actor.pose.points` と `actor.pose` が同時指定された場合、`pose.points` を優先する
* `actor.pose.points.z` 指定時、値は 12 個の数値（`head,lh,rh,le,re,neck,waist,groin,lk,rk,lf,rf`）であること
* `actor.pose.points.outlineWidth` 指定時、値は 12 個の数値（`head,lh,rh,le,re,neck,waist,groin,lk,rk,lf,rf`）であること
* `actor.pose.points` 未指定時は既存どおり `pose` プリセットで描画する

---

## 7. レンダリング規則（SVG）

### 7.1 panel

* `<rect>` で描画
* `fill:none` が既定
* `radius` は `rx/ry`

### 7.2 actor（棒人間）

* 頭: circle
* 胴: line
* 腕脚: line（poseプリセットごとに相対座標テンプレを定義）
* `scale` は全体に適用
* `facing` は `left` で左右反転（x方向スケール -1）、`right` は通常向き、`back` は後ろ向き（目・口は描画しない）
* `emotion` は顔の記号（目・口の形）を切替（最小は口線だけで良い）

### 7.3 balloon/caption

* `shape:oval` は `<ellipse>` or `path`
* `shape:box` は `<rect>`
* `thought` は雲形（簡易で可：丸を複数重ねる、または楕円＋小円2個）
* `tail` は `toActor` の場合、対象actorの頭または胴中心へ向けて線/三角形を生成

### 7.4 テキスト

* SVGの `<text>` は自動折返しが弱いので、実装側で改行位置を計算し `<tspan>` を並べる（簡易折返しで良い） ([MDNウェブドキュメント][2])
* `balloon` / `caption` では、`**強調**` による強調サイズ変更に加え、`$...$`（インライン）および `$$...$$`（ディスプレイ）を数式トークンとして扱い、MathJaxが利用可能な場合はSVGとして描画する

### 7.5 複数ページの配置

`buildPageLayouts(scene)` は `meta.layout.page.mode`（`fixed` / `auto-extend` / `auto-append`）に従ってページ境界を確定する。未指定時は `fixed` と同等に扱う。

* `fixed`
  * 各ページのフレーム高は `page.height`（サイズ定義）で固定。
  * panelがページ下端を超えてもページ境界は拡張しない。
* `auto-extend`
  * 各ページについて panel の最下端（`maxPanelBottom`）を計測し、ページ確定高を `max(frame.h, maxPanelBottom + innerBottomPadding)` とする。
  * `innerBottomPadding` はページの下マージン相当（`frame.h - (inner.y - frame.y + inner.h)`）。
  * `renderPageFrames` にはこの可変フレーム高を渡して描画する。
* `auto-append`
  * panel配置中、次panelの下端が現在ページ下端を超える時点で新規ページを自動生成する。
  * 以降のpanelは新規ページのローカル座標系（そのページの `inner`）で再配置し、必要に応じて同様に追加ページを連鎖生成する。

ページ間の縦オフセットは、従来の `offsetY = maxY + 1` ではなく「確定ページ高 + ギャップ」で決定する。

* `offsetY(next) = offsetY(current) + confirmedPageHeight + gap`
* `gap` は `meta.layout.page.gap` で指定し、既定値は `1`。

---

## 8. 例（1ページ・3コマ・棒人間）

```
meta:
  title: テスト
  author: DEF

page:
  id:p1
  size:B5
  margin:5
  unit:percent

panel:
  id:1
  page:p1
  x:0
  y:0
  w:60
  h:60

panel:
  id:2
  page:p1
  x:62
  y:0
  w:38
  h:35

panel:
  id:3
  page:p1
  x:62
  y:37
  w:38
  h:23

actor:
  id:a1
  panel:1
  x:20
  y:55
  pose:run
  emotion:panic
  facing:right
  name:主人公

actor:
  id:a2
  panel:1
  x:50
  y:55
  pose:stand
  emotion:angry
  facing:left
  name:先生

balloon:
  id:b1
  panel:1
  x:5
  y:5
  w:35
  h:18
  tail:toActor(a1)
  fontSize:4%
  text: |
    ヤバい！
    遅刻だ！

caption:
  id:c1
  panel:2
  x:5
  y:5
  w:30
  h:10
  text: 翌朝

sfx:
  id:s1
  panel:3
  x:10
  y:15
  rot:-15
  text: ドーン
```

---
### 9. 画面要件
### 9.1. レイアウト
画面は左右2ペイン

左：textarea（DSL入力）
右：SVGプレビュー領域（スクロール可能）
ペイン比率：初期 40% : 60%（真ん中をドラッグアンドドロップで変更可能）
左ペイン上部に「IDを振り直し」ボタンを配置し、全ブロックIDを `1000, 1010, 1020...` 形式で再採番する（参照IDも同時更新）

### 9.2.リアルタイム更新
入力変更から 200ms程度のデバウンス後に再パース・再描画

パースエラー時：

右ペインは前回の成功描画を保持（またはエラー表示に切替：どちらか採用。推奨：前回保持＋上部にエラー帯）
エラー内容（行番号・原因）を左下などに表示

### 9.3.右ペイン操作（優先度：中）
ズーム（Ctrl+ホイール）・パン（ドラッグ）をサポート（SVGをviewBoxで制御）
「SVGとして保存」ボタン（SVG文字列ダウンロード）

## 10. 互換性・バージョニング

* `meta.version` または `specVersion`（追加してもよい）で仕様バージョンを明示
* v0.1 は「ネーム＋棒人間」まで。将来拡張（カメラ、コマ変形、多角形コマ、キャラの関節自由度等）を想定

---

## 11. Codexに渡す実装タスク（最小）

1. パーサ（ブロック＋key:value＋`|`複数行）
2. AST（page/panel/actor/balloon/caption/sfx/asset/style）
3. バリデーション
4. SVGレンダラ（panel→actor→balloon/caption/sfx）
5. HTMLプレビュー（textarea＋SVG表示）


[1]: https://github.com/pun2beam/timelineSVGEditor/blob/main/spec.md "timelineSVGEditor/spec.md at main · pun2beam/timelineSVGEditor · GitHub"
[2]: https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/text?utm_source=chatgpt.com "<text> - SVG - MDN Web Docs - Mozilla"
