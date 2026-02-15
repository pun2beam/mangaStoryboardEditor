meta:
  title: テスト
  author: DEF
  actor.name.visible: on
  text.direction: horizontal
  base.panel.direction:right.bottom
  base.panel.margin:1.5

page:
  id: p1000
  size: B5
  margin: 5
  unit: percent

sfx:
  id: s1000
  panel: 1000
  x: 0
  y: -5
  text: はじめに
  scale: 1
  fontSize: 5
  rotate: 0
  stroke: #000000
  fill: #a0f0a0

panel:
  id: 1000
  page: p1000
  x: 0
  y: 0
  w: 100
  h: 30
  radius: 20

actor:
  id: a1000
  panel: 1000
  x: 10
  y: 90
  scale: 5
  pose: point
  emotion: neutral
  facing: right
  name: Hoge君
  attachments:
    - ref: as1000

balloon:
  id: b1000
  panel: 1000
  x: 3
  y: 5
  w: 35
  h: 18
  z: 1
  shape: oval
  tail: toActor(a1000)
  fontsize: 25px
  text: |
    この漫画は、左綴じ、横書きで
    作成されています(※1)。

balloon:
  id: b1010
  panel: 1000
  x: 28
  y: 20
  w: 20
  h: 28
  z: 1
  shape: oval
  tail: toActor(a1000)
  fontsize: 25px
  text: |
    日本の大抵のマンガは、
    右綴じ、縦書きが
    基本なので通常とは
    **『逆』**です。

balloon:
  id: b1020
  panel: 1000
  x: 20
  y: 50
  w: 35
  h: 28
  z: 1
  shape: oval
  tail: toActor(a1000)
  fontsize: 25px
  text: |
    右綴じ、左綴じとは
    表紙を上にして、
    右側が閉じられているなら右綴じ、
    左側が閉じられているなら左綴じです。

balloon:
  id: b1030
  panel: 1000
  x: 20
  y: 80
  w: 30
  h: 18
  z: 1
  shape: oval
  tail: toActor(a1000)
  fontsize: 25px
  text: |
    科学系の解説マンガ
    を想定しているので
    左綴じ、横書きなのです。

caption:
  id: c1000
  panel: 1000
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
  id: o1000
  panel: 1000
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
  id: o1010
  panel: 1000
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
  id: o1020
  panel: 1000
  x: 81
  y: 15
  w: 10
  h: 30
  shape: square
  border: 2px
  fontsize: 20
  text: マンガ

object:
  id: o1030
  panel: 1000
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
  id: o1040
  panel: 1000
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
  id: o1050
  panel: 1000
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
  id: ba1000
  panel: 1000
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
  id: ba1010
  panel: 1000
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
  id: ba1020
  panel: 1000
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
  id: c1010
  panel: 1000
  x: 57.5
  y: 3
  w: 15
  h: 15
  style: none
  fontSize: 10
  text: 右綴じ

caption:
  id: c1020
  panel: 1000
  x: 69.5
  y: 3
  w: 15
  h: 15
  style: none
  fontSize: 10
  text: 右綴じ

caption:
  id: c1030
  panel: 1000
  x: 81.5
  y: 3
  w: 15
  h: 15
  style: none
  fontSize: 10
  text: 右綴じ

object:
  id: o1060
  panel: 1000
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
  id: o1070
  panel: 1000
  x: 69
  y: 55
  w: 10
  h: 30
  shape: square
  border: 2px
  fontsize: 20
  text: 雑誌

object:
  id: o1080
  panel: 1000
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
  id: o1090
  panel: 1000
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
  id: o1100
  panel: 1000
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
  id: o1110
  panel: 1000
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
  id: c1040
  panel: 1000
  x: 51.5
  y: 92
  w: 15
  h: 15
  style: none
  fontSize: 10
  text: 左綴じ

caption:
  id: c1050
  panel: 1000
  x: 63.5
  y: 92
  w: 15
  h: 15
  style: none
  fontSize: 10
  text: 左綴じ

caption:
  id: c1060
  panel: 1000
  x: 75.5
  y: 92
  w: 15
  h: 15
  style: none
  fontSize: 10
  text: 左綴じ

boxarrow:
  id: ba1030
  panel: 1000
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
  id: ba1040
  panel: 1000
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
  id: ba1050
  panel: 1000
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
  id: b1040
  panel: 1000
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
  id: 1010
  page: p1000
  x: 0
  y: 31
  w: 60
  h: 20
  radius: 20

actor:
  id: a1010
  panel: 1010
  x: 10
  y: 260
  z: -1
  scale: 20
  pose: point
  emotion: neutral
  facing: right
  name: Hoge君
  attachments:
    - ref: as1000

balloon:
  id: b1050
  panel: 1010
  x: 43
  y: 10
  w: 120
  h: 80
  z: 1
  shape: oval
  tail: toActor(a1010)
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
  id: 1020
  page: p1000
  x: 39
  y: 52
  w: 60
  h: 20
  radius: 20

actor:
  id: a1020
  panel: 1020
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
    - ref: as1000

balloon:
  id: b1060
  panel: 1020
  x: -63
  y: 10
  w: 120
  h: 80
  z: 1
  shape: oval
  tail: toActor(a1020)
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
  id: 1030
  page: p1000
  x: 0
  y: 77
  w: 30
  h: 6
  radius: 2

caption:
  id: c1070
  panel: 1030
  x: -15
  y: -45
  w: 50
  h: 50
  style: none
  fontSize: 50px
  text: 例1

caption:
  id: c1080
  panel: 1030
  x: 0
  y: 0
  w: 15
  h: 50
  style: none
  fontSize: 40px
  text: ①

boxarrow:
  id: ba1060
  panel: 1030
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
  id: 1040
  page: p1000
  x: 0
  y: 84
  w: 12
  h: 4
  radius: 2

caption:
  id: c1090
  panel: 1040
  x: 10
  y: 0
  w: 15
  h: 50
  style: none
  fontSize: 40px
  text: ②

boxarrow:
  id: ba1070
  panel: 1040
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
  id: 1050
  page: p1000
  x: 0
  y: 89
  w: 12
  h: 4
  radius: 2

caption:
  id: c1100
  panel: 1050
  x: 10
  y: 0
  w: 15
  h: 50
  style: none
  fontSize: 40px
  text: ③

boxarrow:
  id: ba1080
  panel: 1050
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
  id: 1060
  page: p1000
  x: 13
  y: 84
  w: 17
  h: 9
  radius: 2

caption:
  id: c1110
  panel: 1060
  x: 10
  y: 0
  w: 5
  h: 50
  style: none
  fontSize: 40px
  text: ④

boxarrow:
  id: ba1090
  panel: 1060
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
  id: 1070
  page: p1000
  x: 0
  y: 94
  w: 30
  h: 6
  radius: 2

caption:
  id: c1120
  panel: 1070
  x: 4
  y: 0
  w: 5
  h: 50
  style: none
  fontSize: 40px
  text: ⑤

panel:
  id: 1080
  page: p1000
  x: 34
  y: 77
  w: 12
  h: 8
  radius: 2

caption:
  id: c1130
  panel: 1080
  x: 15
  y: -35
  w: 10
  h: 50
  style: none
  fontSize: 50px
  text: 例2

caption:
  id: c1140
  panel: 1080
  x: 10
  y: 0
  w: 15
  h: 50
  style: none
  fontSize: 40px
  text: ①

boxarrow:
  id: ba1100
  panel: 1080
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
  id: 1090
  page: p1000
  x: 47
  y: 77
  w: 17
  h: 8
  radius: 2

caption:
  id: c1150
  panel: 1090
  x: 4
  y: 0
  w: 15
  h: 50
  style: none
  fontSize: 40px
  text: ②

boxarrow:
  id: ba1110
  panel: 1090
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
  id: 1100
  page: p1000
  x: 34
  y: 86
  w: 20
  h: 7
  radius: 2

caption:
  id: c1160
  panel: 1100
  x: 4
  y: 0
  w: 15
  h: 50
  style: none
  fontSize: 40px
  text: ③

boxarrow:
  id: ba1120
  panel: 1100
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
  id: 1110
  page: p1000
  x: 55
  y: 86
  w: 9
  h: 7
  radius: 2

caption:
  id: c1170
  panel: 1110
  x: 15
  y: 0
  w: 5
  h: 50
  style: none
  fontSize: 40px
  text: ④

boxarrow:
  id: ba1130
  panel: 1110
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
  id: 1120
  page: p1000
  x: 34
  y: 94
  w: 10
  h: 6
  radius: 2

caption:
  id: c1180
  panel: 1120
  x: 14
  y: 0
  w: 5
  h: 50
  style: none
  fontSize: 40px
  text: ⑤

boxarrow:
  id: ba1140
  panel: 1120
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
  id: 1130
  page: p1000
  x: 45
  y: 94
  w: 19
  h: 6
  radius: 2

caption:
  id: c1190
  panel: 1130
  x: 7
  y: 0
  w: 5
  h: 50
  style: none
  fontSize: 40px
  text: ➅

panel:
  id: 1140
  page: p1000
  x: 68
  y: 77
  w: 12
  h: 6
  radius: 2

caption:
  id: c1200
  panel: 1140
  x: -3
  y: -45
  w: 50
  h: 50
  style: none
  fontSize: 50px
  text: 例3

caption:
  id: c1210
  panel: 1140
  x: 10
  y: 0
  w: 15
  h: 50
  style: none
  fontSize: 40px
  text: ①

boxarrow:
  id: ba1150
  panel: 1140
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
  id: 1150
  page: p1000
  x: 68
  y: 83.5
  w: 12
  h: 9
  radius: 2

caption:
  id: c1220
  panel: 1150
  x: 10
  y: 0
  w: 15
  h: 50
  style: none
  fontSize: 40px
  text: ②

boxarrow:
  id: ba1160
  panel: 1150
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
  id: 1160
  page: p1000
  x: 68
  y: 93
  w: 12
  h: 7
  radius: 2

caption:
  id: c1230
  panel: 1160
  x: 10
  y: 0
  w: 15
  h: 50
  style: none
  fontSize: 40px
  text: ③

boxarrow:
  id: ba1170
  panel: 1160
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
  id: 1170
  page: p1000
  x: 81
  y: 77
  w: 17
  h: 9
  radius: 2

caption:
  id: c1240
  panel: 1170
  x: 10
  y: 0
  w: 5
  h: 50
  style: none
  fontSize: 40px
  text: ④

boxarrow:
  id: ba1180
  panel: 1170
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
  id: 1180
  page: p1000
  x: 81
  y: 86.5
  w: 17
  h: 13.5
  radius: 2

caption:
  id: c1250
  panel: 1180
  x: 10
  y: 0
  w: 5
  h: 50
  style: none
  fontSize: 40px
  text: ⑤

page:
  id: p1010
  size: B5
  margin: 5
  unit: percent

sfx:
  id: s1010
  panel: 1190
  x: 0
  y: -5
  text: 導入：何が目的?
  scale: 1
  fontSize: 5
  rotate: 0
  stroke: #000000
  fill: #a0f0a0

panel:
  id: 1190
  page: p1010
  x: 0
  y: 0
  w: 100
  h: 30
  radius: 20

panel:
  id: 1200
  page: p1010
  x: 0
  y: 31
  w: 60
  h: 23
  radius: 20

panel:
  id: 1210
  page: p1010
  x: 0
  y: 55
  w: 60
  h: 23
  radius: 20

panel:
  id: 1220
  page: p1010
  x: 0
  y: 79
  w: 60
  h: 23
  radius: 20

panel:
  id: 1230
  page: p1010
  x: 62
  y: 31
  w: 38
  h: 50
  radius: 20

panel:
  id: 1240
  page: p1010
  x: 62
  y: 82
  w: 38
  h: 20
  radius: 20

actor:
  id: a1030
  panel: 1190
  x: 20
  y: 90
  scale: 5
  pose: point
  emotion: neutral
  facing: right
  name: Hoge君
  attachments:
    - ref: as1000

actor:
  id: a1040
  panel: 1190
  x: 50
  y: 90
  scale: 5
  pose: stand
  emotion: panic
  facing: left
  head.shape: circle
  name: Hige君
  attachments:
    - ref: as1030

actor:
  id: a1050
  panel: 1190
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
    - ref: as1010
    - ref: as1020

asset:
  id: as1000
  w: 55
  h: 55
  dx: -26.5
  dy: -73.5
  s: 1
  rot: -10
  z: 1
  src: ./assets/hat.svg

asset:
  id: as1010
  w: 55
  h: 55
  dx: -31.5
  dy: -80.5
  s: 1.2
  rot: 0
  z: 1
  src: ./assets/hair1.svg

asset:
  id: as1020
  w: 55
  h: 55
  dx: -31.5
  dy: -80.5
  s: 1.2
  rot: 0
  z: -1
  src: ./assets/hair_back1.svg

asset:
  id: as1030
  w: 85
  h: 55
  dx: -20
  dy: -58.5
  s: 0.4
  rot: 0
  z: 1
  src: ./assets/hair2.svg

balloon:
  id: b1070
  panel: 1190
  x: -5
  y: 5
  w: 35
  h: 18
  z: 1
  shape: oval
  tail: toActor(a1030)
  fontsize: 25px
  text: |
    なぜマンガ用のDSL(※1)を作成したのか
    わかりますか?

balloon:
  id: b1080
  panel: 1190
  x: 40
  y: 15
  w: 35
  h: 20
  shape: oval
  tail: toActor(a1040)
  fontsize: 25px
  text: |
    うーん。
    ネームが書きやすくなるから
    ですか?

balloon:
  id: b1090
  panel: 1190
  x: 60
  y: 70
  w: 20
  h: 20
  shape: thought
  tail: toActor(a1050)
  fontsize: 25px
  text: おなかすいたなぁ

caption:
  id: c1260
  panel: 1190
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
  id: a1060
  panel: 1200
  x: 20
  y: 290
  z: -1
  scale: 30
  pose: point
  emotion: neutral
  facing: right
  name: Hoge君
  attachments:
    - ref: as1000

balloon:
  id: b1100
  panel: 1200
  x: 55
  y: 5
  w: 40
  h: 90
  shape: oval
  tail: toActor(a1060)
  fontsize: 25px
  text: |
    まぁ、広い意味では
    そうかもしれませんが
    DSLで作成するより
    ペイントソフト使って
    直接書く方が
    楽じゃないですか?

actor:
  id: a1070
  panel: 1210
  x: 80
  y: 310
  z: -1
  scale: 30
  pose: point
  emotion: neutral
  facing: left
  attachments:
    - ref: as1030
  name: Hige君

balloon:
  id: b1110
  panel: 1210
  x: 5
  y: 5
  w: 40
  h: 90
  shape: oval
  tail: toActor(a1070)
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
  id: a1080
  panel: 1220
  x: 10
  y: 37
  z: -1
  scale: 3
  pose: neutral
  emotion: neutral
  facing: right
  name: Hoge君
  attachments:
    - ref: as1000

actor:
  id: a1090
  panel: 1220
  x: 20
  y: 60
  z: -1
  scale: 3
  pose: neutral
  emotion: neutral
  facing: back
  name: Hige君
  attachments:
    - ref: as1030

actor:
  id: a1100
  panel: 1220
  x: 50
  y: 150
  z: -1
  scale: 6
  pose: neutral
  emotion: smile
  facing: right
  name: Huge君
  attachments:
    - ref: as1010
    - ref: as1020

balloon:
  id: b1120
  panel: 1220
  x: 30
  y: 5
  w: 40
  h: 20
  z: 1
  shape: oval
  tail: toActor(a1090)
  fontsize: 25px
  text: |
    じゃあ
    なぜこんな回りくどいことを?

balloon:
  id: b1130
  panel: 1220
  x: 35
  y: 25
  w: 45
  h: 38
  z: 1
  shape: oval
  tail: toActor(a1080)
  fontsize: 25px
  text: |
    これは、LLM用なんです。
    要はDSLとしてLLMに出力してもらい
    ネームを作成しようと。

balloon:
  id: b1140
  panel: 1220
  x: 10
  y: 75
  w: 25
  h: 18
  z: 1
  shape: thought
  tail: toActor(a1100)
  fontsize: 25px
  text: 確か冷蔵庫に...

object:
  id: o1120
  panel: 1220
  x: 80
  y: 80
  w: 10
  h: 20
  fontsize: 25
  text.direction: vertical
  text: 冷蔵庫

balloon:
  id: b1150
  panel: 1230
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
  id: o1130
  panel: 1230
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
  id: b1160
  panel: 1230
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
  id: a1110
  panel: 1240
  x: 40
  y: 100
  z: -1
  scale: 7
  pose: neutral
  emotion: smile
  facing: right
  name: Huge君
  attachments:
    - ref: as1010
    - ref: as1020

object:
  id: o1140
  panel: 1240
  x: 15
  y: 60
  w: 10
  h: 10
  fontsize: 25
  text: ケーキ

balloon:
  id: b1170
  panel: 1240
  x: 67
  y: 20
  w: 40
  h: 40
  z: 1
  shape: thought
  tail: toActor(a1110)
  fontsize: 25px
  text: |
    そう簡単に
    いくかな...

caption:
  id: c1270
  panel: 1240
  x: 66
  y: 77
  w: 32
  h: 20
  fontsize: 60px
  text: つづく

page:
  id: p1020
  size: B5
  margin: 5
  unit: percent


panel:
  id: 1249
  page: p1020
  w: 38
  h: 30
  radius: 20

  sfx:
    id: s1020
    x: 0
    y: -5
    text: そもそもマンガによる解説ッて有効なの?
    scale: 1
    fontSize: 10
    rotate: 0
    stroke: #000000
    fill: #a0f0a0

  actor:
    id: a1095
    x: 20
    y: 100
    z: -1
    scale: 5
    pose: neutral
    emotion: neutral
    facing: right
    name: Hige君
    attachments:
      - ref: as1030

  balloon:
    id: b1170
    x: -4
    y: 4
    w: 70
    h: 20
    z: 1
    shape: oval
    tail: toActor(a1095)
    fontsize: 25px
    text: |
      そもそもマンガによる
      解説ッて有効なんですか?

  actor:
    id: a1096
    x: 70
    y: 120
    z: -1
    scale: 6
    pose: point
    emotion: neutral
    facing: right
    name: Hoge君
    attachments:
      - ref: as1000

  balloon:
    id: b1171
    x: 35
    y: 30
    w: 80
    h: 20
    z: 2
    shape: oval
    tail: toActor(a1096)
    fontsize: 25px
    text: |
      私はいくつかの点で
      有効であると考えているよ
panel:
  id:1250
  page:p1020
  w:60
  h:30
  radius: 20

  object:
    id:o1
    x:67
    y:6
    w:50
    h:90
    z:^11
    shape:rect
    text:黒板

  object:
    id:o1
    x:70
    y:9
    w:20
    h:20
    z:1
    fontsize:60px
    shape:oval
    text:記憶

  object:
    id:o1
    x:70
    y:30
    w:20
    h:20
    z:1
    fontsize:60px
    shape:oval
    text:理解

  object:
    id:o1
    x:70
    y:51
    w:20
    h:20
    z:1
    fontsize:60px
    shape:oval
    text:推論

  object:
    id:o1
    x:70
    y:72
    w:20
    h:20
    z:1
    fontsize:60px
    shape:oval
    text:動機


  balloon:
    id: b1171
    x: 3
    y: 3
    w: 30
    h: 10
    z: 1
    shape: oval
    tail: toActor(a1096)
    fontsize: 25px
    text: |
      マンガは

  balloon:
    id: b1171
    x: 3
    y: 15
    w: 60
    h: 10
    z: 1
    shape: oval
    tail: toActor(a1096)
    fontsize: 25px
    text: |
      記憶に残りやすく

  balloon:
    id: b1171
    x: 3
    y: 36
    w: 60
    h: 10
    z: 1
    shape: oval
    tail: toActor(a1096)
    fontsize: 25px
    text: |
      理解しやすく

  balloon:
    id: b1171
    x: 3
    y: 57
    w: 60
    h: 10
    z: 1
    shape: oval
    tail: toActor(a1096)
    fontsize: 25px
    text: |
      推論を助け

  balloon:
    id: b1171
    x: 3
    y: 78
    w: 60
    h: 10
    z: 1
    shape: oval
    tail: toActor(a1096)
    fontsize: 25px
    text: |
      読み始めやすい

  balloon:
    id: b1171
    x: 15
    y: 93
    w: 50
    h: 10
    z: 1
    shape: oval
    tail: toActor(a1096)
    fontsize: 25px
    text: |
      つまり、学習に**有利な形式**なんだ。

panel:
  id:1260
  page:p1020
  w:100
  h:1
  strokeWidth:0

  sfx:
    id: s1020
    x: 0
    y: 140
    text: １. 記憶に残る理由
    scale: 1
    fontSize: 4
    rotate: 0
    stroke: #000000
    fill: #a0f0a0

panel:
  id:1270
  page:p1020
  w:38
  h:30
  radius: 20
  gutter:10


  balloon:
    id: b1171
    x: 0
    y: 0
    w: 50
    h: 10
    z: 1
    shape: oval
    tail: toActor(a1096)
    fontsize: 25px
    text: まず記憶の話から。

  balloon:
    id: b1171
    x: 0
    y: 10
    w: 60
    h: 30
    z: 1
    shape: oval
    tail: toActor(a1096)
    fontsize: 25px
    text:|
      人は語られた内容の評価を
      内容それ自体だけではなく
      語った人自体でも評価する。

panel:
  id:1280
  page:p1020
  w:60
  h:30
  radius: 20
  gutter:10

  balloon:
    id: b1171
    x: 0
    y: 0
    w: 70
    h: 20
    z: 1
    shape: oval
    tail: toActor(a1096)
    fontsize: 25px
    text:|
      マンガは先生役や解説役を置ける。
      それが理解の枠組みを作る。

  balloon:
    id: b1171
    x: 40
    y: 20
    w: 60
    h: 20
    z: 1
    shape: oval
    tail: toActor(a1095)
    fontsize: 25px
    text:|
      誰が話しているかで
      内容の重みが変わるんですね。

  balloon:
    id: b1171
    x: 10
    y: 40
    w: 60
    h: 20
    z: 1
    shape: oval
    tail: toActor(a1095)
    fontsize: 25px
    text:|
      そう、
      そして評価された内容を
      無意識下で整理する。

  balloon:
    id: b1171
    x: 10
    y: 60
    w: 60
    h: 20
    z: 1
    shape: oval
    tail: toActor(a1095)
    fontsize: 25px
    text:|
      そもそも学習前は内容自体を
      判断する知識がないから
      外枠で判断するしかない


panel:
  id:1290
  page:p1020
  w:60
  h:30
  radius: 20
  gutter:10

  balloon:
    id: b1171
    x: 0
    y: 0
    w: 70
    h: 20
    z: 1
    shape: oval
    tail: toActor(a1095)
    fontsize: 25px
    text:|
      さらにマンガには文字だけの情報より
      記憶のトリガーの提供が多い。

  balloon:
    id: b1171
    x: 0
    y: 20
    w: 60
    h: 30
    z: 1
    shape: oval
    tail: toActor(a1095)
    fontsize: 25px
    text:|
      匂いが記憶のトリガーになるって話しは
      よく知られた話だが、基本的に
      たいていのものは記憶のトリガーになる。
      絵やコマ割りの位置、内容に関係ないギャグ
      だってトリガーになる。


panel:
  id:1300
  page:p1020
  w:38
  h:30
  radius: 20
  gutter:10

  balloon:
    id: b1171
    x: 40
    y: 50
    w: 60
    h: 20
    z: 1
    shape: oval
    tail: toActor(a1096)
    fontsize: 25px
    text:|
      あー、なんとなくわかります
      教科書に書いた落書きページに
      公式が書かれていたのは覚えているけど
      肝心の公式は覚えてないとかですね。


  balloon:
    id: b1171
    x: 0
    y: 70
    w: 60
    h: 20
    z: 1
    shape: oval
    tail: toActor(a1095)
    fontsize: 25px
    text:|
      う、、まぁ
      覚えてないとあまり意味はないのだけれど、
      そんな記憶でも捜すのには便利だよね。。。

page:
  id: p1030
  size: B5
  margin: 5
  unit: percent

panel:
  id:1310
  page:p1030
  w:100
  h:1
  strokeWidth:0

  sfx:
    id: s1020
    x: 0
    y: 140
    text: ２. 理解コストが低い理由
    scale: 1
    fontSize: 4
    rotate: 0
    stroke: #000000
    fill: #a0f0a0

panel:
  id:1320
  page:p1030
  w:30
  h:30
  radius: 20
  gutter:10

  balloon:
    id: b1171
    x: 0
    y: 0
    w: 70
    h: 20
    z: 1
    shape: oval^
    fontsize: 25px
    text:|
      次に理解の負担。。

  balloon:
    id: b1171
    x: 40
    y: 20
    w: 60
    h: 20
    z: 1
    shape: oval^
    fontsize: 25px
    text:|
      文章は順番にしか情報を出せない。。

panel:
  id:1330
  page:p1030
  w:30
  h:30
  radius: 20
  gutter:10

  balloon:
    id: b1171
    x: 10
    y: 40
    w: 60
    h: 20
    z: 1
    shape: oval^
    fontsize: 25px
    text:|
      マンガは情報を
      同時に提示できる。。

  balloon:
    id: b1171
    x: 10
    y: 60
    w: 60
    h: 20
    z: 1
    shape: oval^
    fontsize: 25px
    text:|
      だから因果関係を
      一瞬で理解できる。


panel:
  id:1340
  page:p1030
  w:30
  h:30
  radius: 20
  gutter:10

  balloon:
    id: b1171
    x: 10
    y: 10
    w: 60
    h: 20
    z: 1
    shape: oval^
    fontsize: 25px
    text:|
      さらに視線移動だけで
      補足にアクセスできる。

  balloon:
    id: b1171
    x: 10
    y: 30
    w: 80
    h: 30
    z: 1
    shape: oval^
    fontsize: 25px
    text:|
       あれですよね、文章で図5参照
      みたいなのって
      図5を捜すのまではいいけど

  balloon:
    id: b1171
    x: 10
    y: 60
    w: 80
    h: 20
    z: 1
    shape: oval^
    fontsize: 25px
    text:|
      図5を見た後元の文章どこだっけ
      って迷子になりますよね。


panel:
  id:1350
  page:p1030
  w:100
  h:1
  strokeWidth:0

  sfx:
    id: s1020
    x: 0
    y: 140
    text: ３. 推論を助ける理由
    scale: 1
    fontSize: 4
    rotate: 0
    stroke: #000000
    fill: #a0f0a0

panel:
  id:1360
  page:p1030
  w:30
  h:30
  radius: 20
  gutter:10

  balloon:
    id: b1171
    x: 0
    y: 0
    w: 70
    h: 20
    z: 1
    shape: oval^
    fontsize: 25px
    text:|
      理解には推論が必要だ。

  balloon:
    id: b1171
    x: 40
    y: 20
    w: 60
    h: 20
    z: 1
    shape: oval^
    fontsize: 25px
    text:|
      文章は頭の中で図を作る必要がある。

panel:
  id:1370
  page:p1030
  w:30
  h:30
  radius: 20
  gutter:10

  balloon:
    id: b1171
    x: 10
    y: 10
    w: 60
    h: 20
    z: 1
    shape: oval^
    fontsize: 25px
    text:|
      マンガは図が既にある。

  balloon:
    id: b1171
    x: 10
    y: 40
    w: 60
    h: 20
    z: 1
    shape: oval^
    fontsize: 25px
    text:|
      つまり推論の負担を
      外部化できる。


  balloon:
    id: b1171
    x: 10
    y: 60
    w: 60
    h: 20
    z: 1
    shape: oval^
    fontsize: 25px
    text:|
      頭の中の作業を
      減らせるんですね。



page:
  id: p1040
  size: B5
  margin: 5
  unit: percent

panel:
  id:1410
  page:p1040
  w:100
  h:1
  strokeWidth:0

  sfx:
    id: s1020
    x: 0
    y: 140
    text: ４. 読み始めやすい理由
    scale: 1
    fontSize: 4
    rotate: 0
    stroke: #000000
    fill: #a0f0a0

panel:
  id:1420
  page:p1040
  w:30
  h:30
  radius: 20
  gutter:10

  balloon:
    id: b1171
    x: 10
    y: 10
    w: 60
    h: 20
    z: 1
    shape: oval^
    fontsize: 25px
    text:|
      最後は入口の広さ。

  balloon:
    id: b1171
    x: 10
    y: 30
    w: 80
    h: 30
    z: 1
    shape: oval^
    fontsize: 25px
    text:|
       人は難しそうな文章を避ける。

panel:
  id:1430
  page:p1040
  w:30
  h:30
  radius: 20
  gutter:10

  balloon:
    id: b1171
    x: 10
    y: 10
    w: 60
    h: 20
    z: 1
    shape: oval^
    fontsize: 25px
    text:|
      マンガは理解できそうに見える。

  balloon:
    id: b1171
    x: 10
    y: 30
    w: 80
    h: 30
    z: 1
    shape: oval^
    fontsize: 25px
    text:|
       それだけで読者が増える。
