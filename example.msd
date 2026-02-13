meta:
  title: テスト
  author: DEF
  actor.name.visible: on
  text.direction: horizontal

page:
  id: p1
  size: B5
  margin: 5
  unit: percent

sfx:
  id: s1
  panel: 1
  x: 0
  y: -5
  text: はじめに
  scale: 1
  fontSize: 5
  rotate: 0
  stroke: #000000
  fill: #a0f0a0

panel:
  id: 1
  page: p1
  x: 0
  y: 0
  w: 100
  h: 30
  radius: 20

actor:
  id: a1
  panel: 1
  x: 10
  y: 90
  scale: 5
  pose: point
  emotion: neutral
  facing: right
  name: Hoge君
  attachments:
    - ref: as1

balloon:
  id: b1
  panel: 1
  x: 3
  y: 5
  w: 35
  h: 18
  z: 1
  shape: oval
  tail: toActor(a1)
  fontsize: 25px
  text: |
    この漫画は、左綴じ、横書きで
    作成されています(※1)。

balloon:
  id: b2
  panel: 1
  x: 28
  y: 20
  w: 20
  h: 28
  z: 1
  shape: oval
  tail: toActor(a1)
  fontsize: 25px
  text: |
    日本の大抵のマンガは、
    右綴じ、縦書きが
    基本なので通常とは
    **『逆』**です。

balloon:
  id: b3
  panel: 1
  x: 20
  y: 50
  w: 35
  h: 28
  z: 1
  shape: oval
  tail: toActor(a1)
  fontsize: 25px
  text: |
    右綴じ、左綴じとは
    表紙を上にして、
    右側が閉じられているなら右綴じ、
    左側が閉じられているなら左綴じです。

balloon:
  id: b4
  panel: 1
  x: 20
  y: 80
  w: 30
  h: 18
  z: 1
  shape: oval
  tail: toActor(a1)
  fontsize: 25px
  text: |
    科学系の解説マンガ
    を想定しているので
    左綴じ、横書きなのです。

caption:
  id: c1
  panel: 1
  x: 87
  y: 95
  w: 15
  h: 15
  style: rect
  fontSize: 8
  text: |
    ※1:
    DLCとしては綴じ方向の
    制限があるわけではなく
    また、縦書きも可能です。

object:
  id: o1
  panel: 1
  x: 57
  y: 15
  w: 10
  h: 30
  shape: square
  border: 2px
  fontsize: 20
  text.direction: vertical
  text: |
    国語の　　
    　　教科書

object:
  id: o2
  panel: 1
  x: 69
  y: 15
  w: 10
  h: 30
  shape: square
  border: 2px
  fontsize: 20
  text.direction: vertical
  text: 小説

object:
  id: o3
  panel: 1
  x: 81
  y: 15
  w: 10
  h: 30
  shape: square
  border: 2px
  fontsize: 20
  text: マンガ

object:
  id: o4
  panel: 1
  x: 66
  y: 15
  w: 1
  h: 30
  shape: square
  border: 2px
  fontsize: 20
  text.direction: vertical
  text: 閉じ位置

object:
  id: o5
  panel: 1
  x: 78
  y: 15
  w: 1
  h: 30
  shape: square
  border: 2px
  fontsize: 20
  text.direction: vertical
  text: 閉じ位置

object:
  id: o6
  panel: 1
  x: 90
  y: 15
  w: 1
  h: 30
  shape: square
  border: 2px
  fontsize: 20
  text.direction: vertical
  text: 閉じ位置

boxarrow:
  id: ba1
  panel: 1
  x: 66.5
  y: 11
  w: 2
  h: 5
  px: 0.45
  py: 0.35
  scale: 1
  rot: 90
  z: 1
  opacity: 1
  stroke: #000000
  fill: #a0f0a0

boxarrow:
  id: ba2
  panel: 1
  x: 78.5
  y: 11
  w: 2
  h: 5
  px: 0.45
  py: 0.35
  scale: 1
  rot: 90
  z: 1
  opacity: 1
  stroke: #000000
  fill: #a0f0a0

boxarrow:
  id: ba3
  panel: 1
  x: 90.5
  y: 11
  w: 2
  h: 5
  px: 0.45
  py: 0.35
  scale: 1
  rot: 90
  z: 1
  opacity: 1
  stroke: #000000
  fill: #a0f0a0

caption:
  id: c2
  panel: 1
  x: 57.5
  y: 3
  w: 15
  h: 15
  style: none
  fontSize: 10
  text: 右綴じ

caption:
  id: c3
  panel: 1
  x: 69.5
  y: 3
  w: 15
  h: 15
  style: none
  fontSize: 10
  text: 右綴じ

caption:
  id: c4
  panel: 1
  x: 81.5
  y: 3
  w: 15
  h: 15
  style: none
  fontSize: 10
  text: 右綴じ

object:
  id: o7
  panel: 1
  x: 57
  y: 55
  w: 10
  h: 30
  shape: square
  border: 2px
  fontsize: 15
  text.direction: horizontal
  text: |
    国語以外の
    　　教科書

object:
  id: o8
  panel: 1
  x: 69
  y: 55
  w: 10
  h: 30
  shape: square
  border: 2px
  fontsize: 20
  text: 雑誌

object:
  id: o9
  panel: 1
  x: 81
  y: 55
  w: 10
  h: 30
  shape: square
  border: 2px
  fontsize: 20
  text.direction: horizontal
  text: |
    外国の
    マンガ

object:
  id: o10
  panel: 1
  x: 57
  y: 55
  w: 1
  h: 30
  shape: square
  border: 2px
  fontsize: 20
  text.direction: vertical
  text: 閉じ位置

object:
  id: o11
  panel: 1
  x: 69
  y: 55
  w: 1
  h: 30
  shape: square
  border: 2px
  fontsize: 20
  text.direction: vertical
  text: 閉じ位置

object:
  id: o12
  panel: 1
  x: 81
  y: 55
  w: 1
  h: 30
  shape: square
  border: 2px
  fontsize: 20
  text.direction: vertical
  text: 閉じ位置

caption:
  id: c5
  panel: 1
  x: 51.5
  y: 92
  w: 15
  h: 15
  style: none
  fontSize: 10
  text: 左綴じ

caption:
  id: c6
  panel: 1
  x: 63.5
  y: 92
  w: 15
  h: 15
  style: none
  fontSize: 10
  text: 左綴じ

caption:
  id: c7
  panel: 1
  x: 75.5
  y: 92
  w: 15
  h: 15
  style: none
  fontSize: 10
  text: 左綴じ

boxarrow:
  id: ba4
  panel: 1
  x: 57.5
  y: 89
  w: 2
  h: 5
  px: 0.45
  py: 0.35
  scale: 1
  rot: -90
  z: 1
  opacity: 1
  stroke: #000000
  fill: #a0f0a0

boxarrow:
  id: ba5
  panel: 1
  x: 69.5
  y: 89
  w: 2
  h: 5
  px: 0.45
  py: 0.35
  scale: 1
  rot: -90
  z: 1
  opacity: 1
  stroke: #000000
  fill: #a0f0a0

boxarrow:
  id: ba6
  panel: 1
  x: 81.5
  y: 89
  w: 2
  h: 5
  px: 0.45
  py: 0.35
  scale: 1
  rot: -90
  z: 1
  opacity: 1
  stroke: #000000
  fill: #a0f0a0

balloon:
  id: b5
  panel: 1
  x: 93
  y: 20
  w: 10
  h: 40
  z: 1
  shape: oval
  tail: toPoint(90,35)
  fontsize: 25px
  text.direction: vertical
  text: |
    タイトルは横書きでも
    吹き出しは縦が多い。

panel:
  id: 2
  page: p1
  x: 0
  y: 31
  w: 60
  h: 20
  radius: 20

actor:
  id: a2
  panel: 2
  x: 10
  y: 260
  z: -1
  scale: 20
  pose: point
  emotion: neutral
  facing: right
  name: Hoge君
  attachments:
    - ref: as1

balloon:
  id: b6
  panel: 2
  x: 43
  y: 10
  w: 120
  h: 80
  z: 1
  shape: oval
  tail: toActor(a2)
  fontsize: 25px
  text: |
    $$
    \begin{aligned}
    左綴じだとペー&ジは左から右に進みます。 \\
    其の為、左から&右に進む横書きとの相性が良く、　\\
    特に数式との相&性が良いです。 \\
    \int_1^2\frac{1}{x^2}\,dx &=\Big\lbrack -\frac{1}{x}\Big\rbrack_1^2 \\
    &=-\frac{1}{2} + 1=\frac{1}{2}　\\
    みたいに文章に&入れ込むことが自然にできます。
    \end{aligned}
    $$

panel:
  id: 3
  page: p1
  x: 39
  y: 52
  w: 60
  h: 20
  radius: 20

actor:
  id: a3
  panel: 3
  x: 90
  y: 260
  z: -1
  scale: 20
  pose: point
  emotion: neutral
  facing: right
  name: Hoge君
  eye: down
  attachments:
    - ref: as1

balloon:
  id: b7
  panel: 3
  x: -63
  y: 10
  w: 120
  h: 80
  z: 1
  shape: oval
  tail: toActor(a3)
  fontsize: 30px
  text: |
    そして、
    マンガのコマを読む順は右綴じとは逆になります。
    最初のコマはページの左上で、基本現在のコマの
    右か下に接するコマにしか移動できなくて、
    すべてのコマを読める様に読んでいきます。
    例外は右隅、下隅まで到達した時には
    接する下の最左か、右の最上まで移動って感じです。
    以下に例を示します。

panel:
  id: 4
  page: p1
  x: 0
  y: 77
  w: 30
  h: 6
  radius: 2

caption:
  id: c8
  panel: 4
  x: -15
  y: -45
  w: 50
  h: 50
  style: none
  fontSize: 50px
  text: 例1

caption:
  id: c9
  panel: 4
  x: 0
  y: 0
  w: 15
  h: 50
  style: none
  fontSize: 40px
  text: ①

boxarrow:
  id: ba7
  panel: 4
  x: 25
  y: 110
  w: 10
  h: 30
  px: 0.55
  py: 0.35
  scale: 1
  rot: 90
  z: 1
  opacity: 1
  stroke: #000000
  fill: #30f0f0

panel:
  id: 5
  page: p1
  x: 0
  y: 84
  w: 12
  h: 4
  radius: 2

caption:
  id: c10
  panel: 5
  x: 10
  y: 0
  w: 15
  h: 50
  style: none
  fontSize: 40px
  text: ②

boxarrow:
  id: ba8
  panel: 5
  x: 63
  y: 110
  w: 25
  h: 50
  px: 0.55
  py: 0.35
  scale: 1
  rot: 90
  z: 1
  opacity: 1
  stroke: #000000
  fill: #30f0f0

panel:
  id: 6
  page: p1
  x: 0
  y: 89
  w: 12
  h: 4
  radius: 2

caption:
  id: c11
  panel: 6
  x: 10
  y: 0
  w: 15
  h: 50
  style: none
  fontSize: 40px
  text: ③

boxarrow:
  id: ba9
  panel: 6
  x: 104
  y: 50
  w: 25
  h: 50
  px: 0.55
  py: 0.35
  scale: 1
  rot: 0
  z: 1
  opacity: 1
  stroke: #000000
  fill: #30f0f0

panel:
  id: 7
  page: p1
  x: 13
  y: 84
  w: 17
  h: 9
  radius: 2

caption:
  id: c12
  panel: 7
  x: 10
  y: 0
  w: 5
  h: 50
  style: none
  fontSize: 40px
  text: ④

boxarrow:
  id: ba10
  panel: 7
  x: 50
  y: 105
  w: 17
  h: 25
  px: 0.55
  py: 0.35
  scale: 1
  rot: 90
  z: 1
  opacity: 1
  stroke: #000000
  fill: #30f0f0

panel:
  id: 8
  page: p1
  x: 0
  y: 94
  w: 30
  h: 6
  radius: 2

caption:
  id: c13
  panel: 8
  x: 4
  y: 0
  w: 5
  h: 50
  style: none
  fontSize: 40px
  text: ⑤

panel:
  id: 9
  page: p1
  x: 34
  y: 77
  w: 12
  h: 8
  radius: 2

caption:
  id: c14
  panel: 9
  x: 15
  y: -35
  w: 10
  h: 50
  style: none
  fontSize: 50px
  text: 例2

caption:
  id: c15
  panel: 9
  x: 10
  y: 0
  w: 15
  h: 50
  style: none
  fontSize: 40px
  text: ①

boxarrow:
  id: ba11
  panel: 9
  x: 105
  y: 50
  w: 25
  h: 25
  px: 0.55
  py: 0.35
  scale: 1
  rot: 0
  z: 1
  opacity: 1
  stroke: #000000
  fill: #30f0f0

panel:
  id: 10
  page: p1
  x: 47
  y: 77
  w: 17
  h: 8
  radius: 2

caption:
  id: c16
  panel: 10
  x: 4
  y: 0
  w: 15
  h: 50
  style: none
  fontSize: 40px
  text: ②

boxarrow:
  id: ba12
  panel: 10
  x: 25
  y: 105
  w: 20
  h: 25
  px: 0.55
  py: 0.35
  scale: 1
  rot: 90
  z: 1
  opacity: 1
  stroke: #000000
  fill: #30f0f0

panel:
  id: 11
  page: p1
  x: 34
  y: 86
  w: 20
  h: 7
  radius: 2

caption:
  id: c17
  panel: 11
  x: 4
  y: 0
  w: 15
  h: 50
  style: none
  fontSize: 40px
  text: ③

boxarrow:
  id: ba13
  panel: 11
  x: 102
  y: 55
  w: 15
  h: 25
  px: 0.55
  py: 0.35
  scale: 1
  rot: 0
  z: 1
  opacity: 1
  stroke: #000000
  fill: #30f0f0

panel:
  id: 12
  page: p1
  x: 55
  y: 86
  w: 9
  h: 7
  radius: 2

caption:
  id: c18
  panel: 12
  x: 15
  y: 0
  w: 5
  h: 50
  style: none
  fontSize: 40px
  text: ④

boxarrow:
  id: ba14
  panel: 12
  x: -70
  y: 110
  w: 150
  h: 25
  px: 0.9
  py: 0.35
  scale: 1
  rot: 170
  z: 1
  opacity: 1
  stroke: #000000
  fill: #30f0f0

panel:
  id: 13
  page: p1
  x: 34
  y: 94
  w: 10
  h: 6
  radius: 2

caption:
  id: c19
  panel: 13
  x: 14
  y: 0
  w: 5
  h: 50
  style: none
  fontSize: 40px
  text: ⑤

boxarrow:
  id: ba15
  panel: 13
  x: 102
  y: 60
  w: 35
  h: 35
  px: 0.55
  py: 0.35
  scale: 1
  rot: 0
  z: 1
  opacity: 1
  stroke: #000000
  fill: #30f0f0

panel:
  id: 14
  page: p1
  x: 45
  y: 94
  w: 19
  h: 6
  radius: 2

caption:
  id: c20
  panel: 14
  x: 7
  y: 0
  w: 5
  h: 50
  style: none
  fontSize: 40px
  text: ➅

panel:
  id: 15
  page: p1
  x: 68
  y: 77
  w: 12
  h: 6
  radius: 2

caption:
  id: c21
  panel: 15
  x: -3
  y: -45
  w: 50
  h: 50
  style: none
  fontSize: 50px
  text: 例3

caption:
  id: c22
  panel: 15
  x: 10
  y: 0
  w: 15
  h: 50
  style: none
  fontSize: 40px
  text: ①

boxarrow:
  id: ba16
  panel: 15
  x: 50
  y: 103
  w: 20
  h: 30
  px: 0.55
  py: 0.35
  scale: 1
  rot: 90
  z: 1
  opacity: 1
  stroke: #000000
  fill: #30f0f0

panel:
  id: 16
  page: p1
  x: 68
  y: 83.5
  w: 12
  h: 9
  radius: 2

caption:
  id: c23
  panel: 16
  x: 10
  y: 0
  w: 15
  h: 50
  style: none
  fontSize: 40px
  text: ②

boxarrow:
  id: ba17
  panel: 16
  x: 50
  y: 103
  w: 20
  h: 20
  px: 0.55
  py: 0.35
  scale: 1
  rot: 90
  z: 1
  opacity: 1
  stroke: #000000
  fill: #30f0f0

panel:
  id: 17
  page: p1
  x: 68
  y: 93
  w: 12
  h: 7
  radius: 2

caption:
  id: c24
  panel: 17
  x: 10
  y: 0
  w: 15
  h: 50
  style: none
  fontSize: 40px
  text: ③

boxarrow:
  id: ba18
  panel: 17
  x: 105
  y: -50
  w: 100
  h: 20
  px: 0.85
  py: 0.35
  scale: 1
  rot: -80
  z: 1
  opacity: 1
  stroke: #000000
  fill: #30f0f0

panel:
  id: 18
  page: p1
  x: 81
  y: 77
  w: 17
  h: 9
  radius: 2

caption:
  id: c25
  panel: 18
  x: 10
  y: 0
  w: 5
  h: 50
  style: none
  fontSize: 40px
  text: ④

boxarrow:
  id: ba19
  panel: 18
  x: 50
  y: 102
  w: 15
  h: 20
  px: 0.55
  py: 0.35
  scale: 1
  rot: 90
  z: 1
  opacity: 1
  stroke: #000000
  fill: #30f0f0

panel:
  id: 19
  page: p1
  x: 81
  y: 86.5
  w: 17
  h: 13.5
  radius: 2

caption:
  id: c26
  panel: 19
  x: 10
  y: 0
  w: 5
  h: 50
  style: none
  fontSize: 40px
  text: ⑤

page:
  id: p2
  size: B5
  margin: 5
  unit: percent

sfx:
  id: s2
  panel: 20
  x: 0
  y: -5
  text: 導入：何が目的?
  scale: 1
  fontSize: 5
  rotate: 0
  stroke: #000000
  fill: #a0f0a0

panel:
  id: 20
  page: p2
  x: 0
  y: 0
  w: 100
  h: 30
  radius: 20

panel:
  id: 21
  page: p2
  x: 0
  y: 31
  w: 60
  h: 23
  radius: 20

panel:
  id: 22
  page: p2
  x: 0
  y: 55
  w: 60
  h: 23
  radius: 20

panel:
  id: 23
  page: p2
  x: 0
  y: 79
  w: 60
  h: 23
  radius: 20

panel:
  id: 24
  page: p2
  x: 62
  y: 31
  w: 38
  h: 50
  radius: 20

panel:
  id: 25
  page: p2
  x: 62
  y: 82
  w: 38
  h: 20
  radius: 20

actor:
  id: a4
  panel: 20
  x: 20
  y: 90
  scale: 5
  pose: point
  emotion: neutral
  facing: right
  name: Hoge君
  attachments:
    - ref: as1

actor:
  id: a5
  panel: 20
  x: 50
  y: 90
  scale: 5
  pose: stand
  emotion: panic
  facing: left
  head.shape: circle
  name: Hige君
  attachments:
    - ref: as4

actor:
  id: a6
  panel: 20
  x: 98
  y: 180
  z: -1
  scale: 20
  pose: think
  emotion: smile
  facing: right
  eye: down
  name: Huge君
  attachments:
    - ref: as2
    - ref: as3

asset:
  id: as1
  w: 55
  h: 55
  dx: -26.5
  dy: -73.5
  s: 1
  rot: -10
  z: 1
  src: ./assets/hat.svg

asset:
  id: as2
  w: 55
  h: 55
  dx: -31.5
  dy: -80.5
  s: 1.2
  rot: 0
  z: 1
  src: ./assets/hair1.svg

asset:
  id: as3
  w: 55
  h: 55
  dx: -31.5
  dy: -80.5
  s: 1.2
  rot: 0
  z: -1
  src: ./assets/hair_back1.svg

asset:
  id: as4
  w: 85
  h: 55
  dx: -20
  dy: -58.5
  s: 0.4
  rot: 0
  z: 1
  src: ./assets/hair2.svg

balloon:
  id: b8
  panel: 20
  x: -5
  y: 5
  w: 35
  h: 18
  z: 1
  shape: oval
  tail: toActor(a4)
  fontsize: 25px
  text: |
    なぜマンガ用のDSL(※1)を作成したのか
    わかりますか?

balloon:
  id: b9
  panel: 20
  x: 40
  y: 15
  w: 35
  h: 20
  shape: oval
  tail: toActor(a5)
  fontsize: 25px
  text: |
    うーん。
    ネームが書きやすくなるから
    ですか?

balloon:
  id: b10
  panel: 20
  x: 60
  y: 70
  w: 20
  h: 20
  shape: thought
  tail: toActor(a6)
  fontsize: 25px
  text: おなかすいたなぁ

caption:
  id: c27
  panel: 20
  x: -3
  y: 75
  w: 17
  h: 18
  fontsize: 20px
  text: |
    ※1：DSL
    (Domain Specific language)
    特定のタスク向けに設計され
    たコンピュータ言語。

actor:
  id: a7
  panel: 21
  x: 20
  y: 290
  z: -1
  scale: 30
  pose: point
  emotion: neutral
  facing: right
  name: Hoge君
  attachments:
    - ref: as1

balloon:
  id: b11
  panel: 21
  x: 55
  y: 5
  w: 40
  h: 90
  shape: oval
  tail: toActor(a7)
  fontsize: 25px
  text: |
    まぁ、広い意味では
    そうかもしれませんが
    DSLで作成するより
    ペイントソフト使って
    直接書く方が
    楽じゃないですか?

actor:
  id: a8
  panel: 22
  x: 80
  y: 310
  z: -1
  scale: 30
  pose: point
  emotion: neutral
  facing: left
  attachments:
    - ref: as4
  name: Hige君

balloon:
  id: b12
  panel: 22
  x: 5
  y: 5
  w: 40
  h: 90
  shape: oval
  tail: toActor(a8)
  fontsize: 25px
  text: |
    たしかに
    保存のためにソフト使って
    デジタル化するのは
    いろいろ便利だけど
    わざわざDSLで書く意味って
    そんなにないかも
    直接書く方が楽だし、そもそも
    ネームなんだからそんなに
    時間かけるのも変だし。

actor:
  id: a9
  panel: 23
  x: 10
  y: 37
  z: -1
  scale: 3
  pose: neutral
  emotion: neutral
  facing: right
  name: Hoge君
  attachments:
    - ref: as1

actor:
  id: a10
  panel: 23
  x: 20
  y: 60
  z: -1
  scale: 3
  pose: neutral
  emotion: neutral
  facing: back
  name: Hige君
  attachments:
    - ref: as4

actor:
  id: a11
  panel: 23
  x: 50
  y: 150
  z: -1
  scale: 6
  pose: neutral
  emotion: smile
  facing: right
  name: Huge君
  attachments:
    - ref: as2
    - ref: as3

balloon:
  id: b13
  panel: 23
  x: 30
  y: 5
  w: 40
  h: 20
  z: 1
  shape: oval
  tail: toActor(a10)
  fontsize: 25px
  text: |
    じゃあ
    なぜこんな回りくどいことを?

balloon:
  id: b14
  panel: 23
  x: 35
  y: 25
  w: 45
  h: 38
  z: 1
  shape: oval
  tail: toActor(a9)
  fontsize: 25px
  text: |
    これは、LLM用なんです。
    要はDSLとしてLLMに出力してもらい
    ネームを作成しようと。

balloon:
  id: b15
  panel: 23
  x: 10
  y: 75
  w: 25
  h: 18
  z: 1
  shape: thought
  tail: toActor(a11)
  fontsize: 25px
  text: 確か冷蔵庫に...

object:
  id: o13
  panel: 23
  x: 80
  y: 80
  w: 10
  h: 20
  fontsize: 25
  text.direction: vertical
  text: 冷蔵庫

balloon:
  id: b16
  panel: 24
  x: 5
  y: 8
  w: 90
  h: 28
  z: 1
  shape: oval
  fontsize: 25px
  text: |
    つまり、LLMに直接ネームを(SVGとして)
    作成してもらうと修正がしにくい為、
    ある程度人間にも修正しやすい形
    の中間データとして出力する為の
    DSLを作成したってわけ。

object:
  id: o14
  panel: 24
  x: 47
  y: 35
  w: 10
  h: 20
  shape: none
  border: 2px
  fontsize: 65
  text: |
    　　　　LLM　　　　　　
    　　↗　↕　　　　　　
    人間 ↔ DSL→変換→SVG

balloon:
  id: b17
  panel: 24
  x: 5
  y: 58
  w: 90
  h: 28
  z: 1
  shape: oval
  fontsize: 25px
  text: |
    なるほどLLMとの共同作業の為の中間言語
    ってわけですね。確かにいくつかためれば
    テンプレートとして使いまわせるかも。
    ゆくゆくは実際の画像から逆にDSL変換も
    できれば構造的な解析&学習もできるように
    なるかもしれませんね。

actor:
  id: a12
  panel: 25
  x: 40
  y: 100
  z: -1
  scale: 7
  pose: neutral
  emotion: smile
  facing: right
  name: Huge君
  attachments:
    - ref: as2
    - ref: as3

object:
  id: o15
  panel: 25
  x: 15
  y: 60
  w: 10
  h: 10
  fontsize: 25
  text: ケーキ

balloon:
  id: b18
  panel: 25
  x: 67
  y: 20
  w: 40
  h: 40
  z: 1
  shape: thought
  tail: toActor(a12)
  fontsize: 25px
  text: |
    そう簡単に
    上手くいくかな...

caption:
  id: c28
  panel: 25
  x: 66
  y: 77
  w: 32
  h: 20
  fontsize: 60px
  text: つづく

page:
  id: p3
  size: B5
  margin: 5
  unit: percent

sfx:
  id: s3
  panel: 26
  x: 0
  y: -5
  text: そもそもマンガによる解説ッて有効なの?
  scale: 1
  fontSize: 5
  rotate: 0
  stroke: #000000
  fill: #a0f0a0

panel:
  id: 26
  page: p3
  x: 0
  y: 0
  w: 100
  h: 30
  radius: 20

caption:
  id: c29
  panel: 26
  x: 5
  y: 5
  w: 30
  h: 35
  z: 1
  style: box
  fontsize: 25px
  text: |
    
    ①記憶の仕組み　　　　　　　　　
    ②誰が話しているかが重要　　　　
    ③文章だけと絵付きの説明　　　　
    　・参照コスト（一次元と二次元）
    　・読解コスト
