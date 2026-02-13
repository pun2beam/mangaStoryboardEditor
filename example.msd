meta:
  title: テスト
  author: DEF
  actor.name.visible: on
  text.direction: horizontal

page:
  id:p0
  size:B5
  margin:5
  unit:percent

sfx:
  id:1
  panel:01
  x:0
  y:-5
  text:はじめに
  scale:1
  fontSize:5
  rotate:0
  stroke:#000000
  fill:#a0f0a0

panel:
  id:01
  page:p0
  x:0
  y:0
  w:100
  h:30
  radius:20


actor:
  id:a0.1
  panel:01
  x:10
  y:90
  scale:5
  pose:point
  emotion:neutral
  facing:right
  name:Hoge君
  attachments:
    - ref:hat1

balloon:
  id:b1
  panel:01
  x:3
  y:5
  w:35
  h:18
  z:1
  shape:oval
  tail:toActor(a0.1)
  fontsize:25px
  text: |
    この漫画は、左綴じ、横書きで
    作成されています。

balloon:
  id:b2
  panel:01
  x:28
  y:20
  w:20
  h:28
  z:1
  shape:oval
  tail:toActor(a0.1)
  fontsize:25px
  text: |
    日本の大抵のマンガは、
    右綴じ、縦書きが
    基本なので通常とは
    **『逆』**です。

balloon:
  id:b3
  panel:01
  x:20
  y:50
  w:35
  h:28
  z:1
  shape:oval
  tail:toActor(a0.1)
  fontsize:25px
  text: |
    右綴じ、左綴じとは
    表紙を上にして、
    右側が閉じられているなら右綴じ、
    左側が閉じられているなら左綴じです。

balloon:
  id:b3
  panel:01
  x:20
  y:80
  w:30
  h:18
  z:1
  shape:oval
  tail:toActor(a0.1)
  fontsize:25px
  text: |
    科学系の解説マンガ
    を想定しているので
    左綴じ、横書きなのです(※1)。

caption:
  id:c0.0
  panel:01
  x:87
  y:95
  w:15
  h:15
  style:rect
  fontSize:8
  text:|
    ※1:
    DLCとしては綴じ方向の
    制限があるわけではなく
    縦書きも可能です。

object:
  id:o0.1
  panel:01
  x:57
  y:15
  w:10
  h:30
  shape:square
  border:2px
  fontsize:20
  text.direction:vertical
  text:|
    国語の　　
    　　教科書
　　
object:
  id:o0.2
  panel:01
  x:69
  y:15
  w:10
  h:30
  shape:square
  border:2px
  fontsize:20
  text.direction:vertical
  text:|
    小説

object:
  id:o0.3
  panel:01
  x:81
  y:15
  w:10
  h:30
  shape:square
  border:2px
  fontsize:20
  text:|
    マンガ

object:
  id:o0.4
  panel:01
  x:66
  y:15
  w:1
  h:30
  shape:square
  border:2px
  fontsize:20
  text.direction:vertical
  text:閉じ位置

object:
  id:o0.5
  panel:01
  x:78
  y:15
  w:1
  h:30
  shape:square
  border:2px
  fontsize:20
  text.direction:vertical
  text:閉じ位置

object:
  id:o0.6
  panel:01
  x:90
  y:15
  w:1
  h:30
  shape:square
  border:2px
  fontsize:20
  text.direction:vertical
  text:閉じ位置

boxarrow:
  id:ba1
  panel:01
  x:66.5
  y:11
  w:2
  h:5
  px:0.45
  py:0.35
  scale:1
  rot:90
  z:1
  opacity:1
  stroke:#000000
  fill:#a0f0a0

boxarrow:
  id:ba2
  panel:01
  x:78.5
  y:11
  w:2
  h:5
  px:0.45
  py:0.35
  scale:1
  rot:90
  z:1
  opacity:1
  stroke:#000000
  fill:#a0f0a0

boxarrow:
  id:ba3
  panel:01
  x:90.5
  y:11
  w:2
  h:5
  px:0.45
  py:0.35
  scale:1
  rot:90
  z:1
  opacity:1
  stroke:#000000
  fill:#a0f0a0

caption:
  id:c0.1
  panel:01
  x:57.5
  y:3
  w:15
  h:15
  style:none
  fontSize:10
  text:右綴じ

caption:
  id:c0.2
  panel:01
  x:69.5
  y:3
  w:15
  h:15
  style:none
  fontSize:10
  text:右綴じ

caption:
  id:c0.3
  panel:01
  x:81.5
  y:3
  w:15
  h:15
  style:none
  fontSize:10
  text:右綴じ

object:
  id:o0.7
  panel:01
  x:57
  y:55
  w:10
  h:30
  shape:square
  border:2px
  fontsize:15
  text.direction:horizontal
  text:|
    国語以外の
    　　教科書
　　
object:
  id:o0.8
  panel:01
  x:69
  y:55
  w:10
  h:30
  shape:square
  border:2px
  fontsize:20
  text:|
    雑誌

object:
  id:o0.9
  panel:01
  x:81
  y:55
  w:10
  h:30
  shape:square
  border:2px
  fontsize:20
  text.direction:horizontal
  text:|
    外国の
    マンガ

object:
  id:o0.10
  panel:01
  x:57
  y:55
  w:1
  h:30
  shape:square
  border:2px
  fontsize:20
  text.direction:vertical
  text:閉じ位置

object:
  id:o0.11
  panel:01
  x:69
  y:55
  w:1
  h:30
  shape:square
  border:2px
  fontsize:20
  text.direction:vertical
  text:閉じ位置

object:
  id:o0.12
  panel:01
  x:81
  y:55
  w:1
  h:30
  shape:square
  border:2px
  fontsize:20
  text.direction:vertical
  text:閉じ位置

caption:
  id:c0.4
  panel:01
  x:51.5
  y:92
  w:15
  h:15
  style:none
  fontSize:10
  text:左綴じ

caption:
  id:c0.5
  panel:01
  x:63.5
  y:92
  w:15
  h:15
  style:none
  fontSize:10
  text:左綴じ

caption:
  id:c0.6
  panel:01
  x:75.5
  y:92
  w:15
  h:15
  style:none
  fontSize:10
  text:左綴じ

boxarrow:
  id:ba1
  panel:01
  x:57.5
  y:89
  w:2
  h:5
  px:0.45
  py:0.35
  scale:1
  rot:-90
  z:1
  opacity:1
  stroke:#000000
  fill:#a0f0a0

boxarrow:
  id:ba2
  panel:01
  x:69.5
  y:89
  w:2
  h:5
  px:0.45
  py:0.35
  scale:1
  rot:-90
  z:1
  opacity:1
  stroke:#000000
  fill:#a0f0a0

boxarrow:
  id:ba3
  panel:01
  x:81.5
  y:89
  w:2
  h:5
  px:0.45
  py:0.35
  scale:1
  rot:-90
  z:1
  opacity:1
  stroke:#000000
  fill:#a0f0a0

balloon:
  id:b1
  panel:01
  x:93
  y:20
  w:10
  h:40
  z:1
  shape:oval
  tail:toPoint(90,35)
  fontsize:25px
  text.direction:vertical
  text: |
    タイトルは横書きでも
    吹き出しは縦が多い。

panel:
  id:02
  page:p0
  x:0
  y:31
  w:60
  h:20
  radius:20

actor:
  id:a0.2
  panel:02
  x:10
  y:260
  z:-1
  scale:20
  pose:point
  emotion:neutral
  facing:right
  name:Hoge君
  attachments:
    - ref:hat1

balloon:
  id:b1
  panel:02
  x:43
  y:10
  w:120
  h:80
  z:1
  shape:oval
  tail:toActor(a0.2)
  fontsize:35px
  text: |
    $$
    \begin{aligned}
    縦書きは数式を&書くのには不便なんです。 \\
    \int_1^2\frac{1}{x^2}\,dx &=\Big\lbrack -\frac{1}{x}\Big\rbrack_1^2 \\
    &=-\frac{1}{2} + 1=\frac{1}{2}　\\
    みたい&なことが難しいんです。
    \end{aligned}
    $$

panel:
  id:03
  page:p0
  x:39
  y:52
  w:60
  h:20
  radius:20

actor:
  id:a0.3
  panel:03
  x:90
  y:260
  z:-1
  scale:20
  pose:point
  emotion:neutral
  facing:right
  name:Hoge君
  eye:down
  attachments:
    - ref:hat1

balloon:
  id:b0.6
  panel:03
  x:-63
  y:10
  w:120
  h:80
  z:1
  shape:oval
  tail:toActor(a0.3)
  fontsize:35px
  text: |
    マンガのコマを読む順は右綴じとは逆になります。
    最初のコマはページの左上で、基本現在のコマの
    右か下に接するコマにしか移動できなくて、
    すべてのコマを読める様に読んでいきます。
    例外は右隅、下隅まで到達した時には
    接する下の最左、右の最上まで移動って感じです。
    以下に例を示します。

panel:
  id:04
  page:p0
  x:0
  y:77
  w:30
  h:6
  radius:2

caption:
  id:c0.20
  panel:04
  x:-15
  y:-45
  w:50
  h:50
  style:none
  fontSize:50px
  text:例1

caption:
  id:c0.21
  panel:04
  x:0
  y:0
  w:15
  h:50
  style:none
  fontSize:40px
  text:①

boxarrow:
  id:ba1
  panel:04
  x:25
  y:110
  w:10
  h:30
  px:0.55
  py:0.35
  scale:1
  rot:90
  z:1
  opacity:1
  stroke:#000000
  fill:#30f0f0

panel:
  id:05
  page:p0
  x:0
  y:84
  w:12
  h:4
  radius:2

caption:
  id:c0.21
  panel:05
  x:10
  y:0
  w:15
  h:50
  style:none
  fontSize:40px
  text:②

boxarrow:
  id:ba1
  panel:05
  x:63
  y:110
  w:25
  h:50
  px:0.55
  py:0.35
  scale:1
  rot:90
  z:1
  opacity:1
  stroke:#000000
  fill:#30f0f0

panel:
  id:06
  page:p0
  x:0
  y:89
  w:12
  h:4
  radius:2

caption:
  id:c0.21
  panel:06
  x:10
  y:0
  w:15
  h:50
  style:none
  fontSize:40px
  text:③

boxarrow:
  id:ba1
  panel:06
  x:104
  y:50
  w:25
  h:50
  px:0.55
  py:0.35
  scale:1
  rot:0
  z:1
  opacity:1
  stroke:#000000
  fill:#30f0f0

panel:
  id:07
  page:p0
  x:13
  y:84
  w:17
  h:9
  radius:2

caption:
  id:c0.21
  panel:07
  x:10
  y:0
  w:5
  h:50
  style:none
  fontSize:40px
  text:④

boxarrow:
  id:ba1
  panel:07
  x:50
  y:105
  w:17
  h:25
  px:0.55
  py:0.35
  scale:1
  rot:90
  z:1
  opacity:1
  stroke:#000000
  fill:#30f0f0

panel:
  id:08
  page:p0
  x:0
  y:94
  w:30
  h:6
  radius:2

caption:
  id:c0.21
  panel:08
  x:4
  y:0
  w:5
  h:50
  style:none
  fontSize:40px
  text:⑤


panel:
  id:09
  page:p0
  x:34
  y:77
  w:12
  h:8
  radius:2

caption:
  id:c0.20
  panel:09
  x:15
  y:-35
  w:10
  h:50
  style:none
  fontSize:50px
  text:例2

caption:
  id:c0.21
  panel:09
  x:10
  y:0
  w:15
  h:50
  style:none
  fontSize:40px
  text:①

boxarrow:
  id:ba1
  panel:09
  x:105
  y:50
  w:25
  h:25
  px:0.55
  py:0.35
  scale:1
  rot:0
  z:1
  opacity:1
  stroke:#000000
  fill:#30f0f0

panel:
  id:0.10
  page:p0
  x:47
  y:77
  w:17
  h:8
  radius:2

caption:
  id:c0.21
  panel:0.10
  x:4
  y:0
  w:15
  h:50
  style:none
  fontSize:40px
  text:②

boxarrow:
  id:ba1
  panel:0.10
  x:25
  y:105
  w:20
  h:25
  px:0.55
  py:0.35
  scale:1
  rot:90
  z:1
  opacity:1
  stroke:#000000
  fill:#30f0f0

panel:
  id:0.11
  page:p0
  x:34
  y:86
  w:20
  h:7
  radius:2

caption:
  id:c0.21
  panel:0.11
  x:4
  y:0
  w:15
  h:50
  style:none
  fontSize:40px
  text:③

boxarrow:
  id:ba1
  panel:0.11
  x:102
  y:55
  w:15
  h:25
  px:0.55
  py:0.35
  scale:1
  rot:0
  z:1
  opacity:1
  stroke:#000000
  fill:#30f0f0

panel:
  id:0.12
  page:p0
  x:55
  y:86
  w:9
  h:7
  radius:2

caption:
  id:c0.21
  panel:0.12
  x:15
  y:0
  w:5
  h:50
  style:none
  fontSize:40px
  text:④

boxarrow:
  id:ba1
  panel:0.12
  x:-70
  y:110
  w:150
  h:25
  px:0.90
  py:0.35
  scale:1
  rot:170
  z:1
  opacity:1
  stroke:#000000
  fill:#30f0f0

panel:
  id:0.13
  page:p0
  x:34
  y:94
  w:10
  h:6
  radius:2

caption:
  id:c0.22
  panel:0.13
  x:14
  y:0
  w:5
  h:50
  style:none
  fontSize:40px
  text:⑤

boxarrow:
  id:ba1
  panel:0.13
  x:102
  y:60
  w:35
  h:35
  px:0.55
  py:0.35
  scale:1
  rot:0
  z:1
  opacity:1
  stroke:#000000
  fill:#30f0f0

panel:
  id:0.14
  page:p0
  x:45
  y:94
  w:19
  h:6
  radius:2

caption:
  id:c0.21
  panel:0.14
  x:7
  y:0
  w:5
  h:50
  style:none
  fontSize:40px
  text:➅

panel:
  id:0.15
  page:p0
  x:68
  y:77
  w:12
  h:6
  radius:2

caption:
  id:c0.20
  panel:0.15
  x:-3
  y:-45
  w:50
  h:50
  style:none
  fontSize:50px
  text:例3

caption:
  id:c0.21
  panel:0.15
  x:10
  y:0
  w:15
  h:50
  style:none
  fontSize:40px
  text:①

boxarrow:
  id:ba1
  panel:0.15
  x:50
  y:103
  w:20
  h:30
  px:0.55
  py:0.35
  scale:1
  rot:90
  z:1
  opacity:1
  stroke:#000000
  fill:#30f0f0

panel:
  id:0.16
  page:p0
  x:68
  y:83.5
  w:12
  h:9
  radius:2

caption:
  id:c0.21
  panel:0.16
  x:10
  y:0
  w:15
  h:50
  style:none
  fontSize:40px
  text:②

boxarrow:
  id:ba1
  panel:0.16
  x:50
  y:103
  w:20
  h:20
  px:0.55
  py:0.35
  scale:1
  rot:90
  z:1
  opacity:1
  stroke:#000000
  fill:#30f0f0

panel:
  id:0.17
  page:p0
  x:68
  y:93
  w:12
  h:7
  radius:2

caption:
  id:c0.21
  panel:0.17
  x:10
  y:0
  w:15
  h:50
  style:none
  fontSize:40px
  text:③

boxarrow:
  id:ba1
  panel:0.17
  x:105
  y:-50
  w:100
  h:20
  px:0.85
  py:0.35
  scale:1
  rot:-80
  z:1
  opacity:1
  stroke:#000000
  fill:#30f0f0

panel:
  id:0.18
  page:p0
  x:81
  y:77
  w:17
  h:9
  radius:2

caption:
  id:c0.21
  panel:0.18
  x:10
  y:0
  w:5
  h:50
  style:none
  fontSize:40px
  text:④

boxarrow:
  id:ba1
  panel:0.18
  x:50
  y:102
  w:15
  h:20
  px:0.55
  py:0.35
  scale:1
  rot:90
  z:1
  opacity:1
  stroke:#000000
  fill:#30f0f0

panel:
  id:0.19
  page:p0
  x:81
  y:86.5
  w:17
  h:13.5
  radius:2

caption:
  id:c0.21
  panel:0.19
  x:10
  y:0
  w:5
  h:50
  style:none
  fontSize:40px
  text:⑤


page:
  id:p1
  size:B5
  margin:5
  unit:percent

sfx:
  id:1
  panel:11
  x:0
  y:-5
  text:導入：何が目的?
  scale:1
  fontSize:5
  rotate:0
  stroke:#000000
  fill:#a0f0a0

panel:
  id:11
  page:p1
  x:0
  y:0
  w:100
  h:30
  radius:20

panel:
  id:12
  page:p1
  x:0
  y:31
  w:60
  h:23
  radius:20

panel:
  id:13
  page:p1
  x:0
  y:55
  w:60
  h:23
  radius:20

panel:
  id:14
  page:p1
  x:0
  y:79
  w:60
  h:23
  radius:20

panel:
  id:15
  page:p1
  x:62
  y:31
  w:38
  h:50
  radius:20

panel:
  id:16
  page:p1
  x:62
  y:82
  w:38
  h:20
  radius:20

actor:
  id:a1
  panel:11
  x:20
  y:90
  scale:5
  pose:point
  emotion:neutral
  facing:right
  name:Hoge君
  attachments:
    - ref:hat1

actor:
  id:a2
  panel:11
  x:50
  y:90
  scale:5
  pose:stand
  emotion:panic
  facing:left
  head.shape:circle
  name:Hige君
  attachments:
    - ref:hair2

actor:
  id:a3
  panel:11
  x:98
  y:180
  z:-1
  scale:20
  pose:think
  emotion:smile
  facing:right
  eye:down
  name:Huge君
  attachments:
    - ref:hair1
    - ref:hair_back1

asset:
  id:hat1
  w:55
  h:55
  dx:-26.5
  dy:-73.5
  s:1.0
  rot:-10
  z:1
  src:./assets/hat.svg

asset:
  id:hair1
  w:55
  h:55
  dx:-31.5
  dy:-80.5
  s:1.2
  rot:0
  z:1
  src:./assets/hair1.svg

asset:
  id:hair_back1
  w:55
  h:55
  dx:-31.5
  dy:-80.5
  s:1.2
  rot:0
  z:-1
  src:./assets/hair_back1.svg

asset:
  id:hair2
  w:85
  h:55
  dx:-20
  dy:-58.5
  s:0.4
  rot:0
  z:1
  src:./assets/hair2.svg

balloon:
  id:b1
  panel:11
  x:-5
  y:5
  w:35
  h:18
  z:1
  shape:oval
  tail:toActor(a1)
  fontsize:25px
  text: |
    なぜマンガ用のDSL(※1)を作成したのか
    わかりますか?

balloon:
  id:b2
  panel:11
  x:40
  y:15
  w:35
  h:20
  shape:oval
  tail:toActor(a2)
  fontsize:25px
  text: |
    うーん。
    ネームが書きやすくなるから
    ですか?

balloon:
  id:b3
  panel:11
  x:60
  y:70
  w:20
  h:20
  shape:thought 
  tail:toActor(a3)
  fontsize:25px
  text: |
    おなかすいたなぁ

caption:
  id:c1
  panel:11
  x:-3
  y:75
  w:17
  h:18
  fontsize:20px
  text: |
    ※1：DSL
    (Domain Specific language)
    特定のタスク向けに設計され
    たコンピュータ言語。

actor:
  id:a4
  panel:12
  x:20
  y:290
  z:-1
  scale:30
  pose:point
  emotion:neutral
  facing:right
  name:Hoge君
  attachments:
    - ref:hat1

balloon:
  id:b4
  panel:12
  x:55
  y:5
  w:40
  h:90
  shape:oval
  tail:toActor(a4)
  fontsize:25px
  text: |
    まぁ、広い意味では
    そうかもしれませんが
    DSLで作成するより
    ペイントソフト使って
    直接書く方が
    楽じゃないですか?

actor:
  id:a5
  panel:13
  x:80
  y:310
  z:-1
  scale:30
  pose:point
  emotion:neutral
  facing:left
  attachments:
    - ref:hair2
  name:Hige君

balloon:
  id:b5
  panel:13
  x:5
  y:5
  w:40
  h:90
  shape:oval
  tail:toActor(a5)
  fontsize:25px
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
  id:a6
  panel:14
  x:10
  y:37
  z:-1
  scale:3
  pose:neutral
  emotion:neutral
  facing:right
  name:Hoge君
  attachments:
    - ref:hat1

actor:
  id:a7
  panel:14
  x:20
  y:60
  z:-1
  scale:3
  pose:neutral
  emotion:neutral
  facing:back
  name:Hige君
  attachments:
    - ref:hair2

actor:
  id:a8
  panel:14
  x:50
  y:150
  z:-1
  scale:6
  pose:neutral
  emotion:smile
  facing:right
  name:Huge君
  attachments:
    - ref:hair1
    - ref:hair_back1

balloon:
  id:b6
  panel:14
  x:30
  y:5
  w:40
  h:20
  z:1
  shape:oval
  tail:toActor(a7)
  fontsize:25px
  text: |
    じゃあ
    なぜこんな回りくどいことを?

balloon:
  id:b7
  panel:14
  x:35
  y:25
  w:45
  h:38
  z:1
  shape:oval
  tail:toActor(a6)
  fontsize:25px
  text: |
    これは、LLM用なんです。
    要はDSLとしてLLMに出力してもらい
    ネームを作成しようと。

balloon:
  id:b7
  panel:14
  x:10
  y:75
  w:25
  h:18
  z:1
  shape:thought 
  tail:toActor(a8)
  fontsize:25px
  text: |
    確か冷蔵庫に...

object:
  id:o1
  panel:14
  x:80
  y:80
  w:10
  h:20
  fontsize:25
  text.direction: vertical
  text:冷蔵庫

balloon:
  id:b7
  panel:15
  x:5
  y:8
  w:90
  h:28
  z:1
  shape:oval
  fontsize:25px
  text: |
    つまり、LLMに直接ネームを(SVGとして)
    作成してもらうと修正がしにくい為、
    ある程度人間にも修正しやすい形
    の中間データとして出力する為の
    DSLを作成したってわけ。

object:
  id:o2
  panel:15
  x:47
  y:35
  w:10
  h:20
  shape:none
  border:2px
  fontsize:65
  text:|
    　　　　LLM　　　　　　
    　　↗　↕　　　　　　
    人間 ↔ DSL→変換→SVG


balloon:
  id:b8
  panel:15
  x:5
  y:58
  w:90
  h:28
  z:1
  shape:oval
  fontsize:25px
  text: |
    なるほどLLMとの共同作業の為の中間言語
    ってわけですね。確かにいくつかためれば
    テンプレートとして使いまわせるかも。
    ゆくゆくは実際の画像から逆にDSL変換も
    できれば構造的な解析&学習もできるように
    なるかもしれませんね。

actor:
  id:a9
  panel:16
  x:40
  y:100
  z:-1
  scale:7
  pose:neutral
  emotion:smile
  facing:right
  name:Huge君
  attachments:
    - ref:hair1
    - ref:hair_back1

object:
  id:o3
  panel:16
  x:15
  y:60
  w:10
  h:10
  fontsize:25
  text:ケーキ

balloon:
  id:b9
  panel:16
  x:67
  y:20
  w:40
  h:40
  z:1
  shape:thought 
  tail:toActor(a9)
  fontsize:25px
  text: |
    そう簡単に
    上手くいくかな...

caption:
  id:c2
  panel:16
  x:66
  y:77
  w:32
  h:20
  fontsize:60px
  text: |
    つづく

page:
  id:p2
  size:B5
  margin:5
  unit:percent

sfx:
  id:20
  panel:20
  x:0
  y:-5
  text:そもそもマンガによる解説ッて有効なの?
  scale:1
  fontSize:5
  rotate:0
  stroke:#000000
  fill:#a0f0a0

panel:
  id:20
  page:p2
  x:0
  y:0
  w:100
  h:30
  radius:20

caption:
  id:b8
  panel:20
  x:5
  y:5
  w:30
  h:35
  z:1
  style:box
  fontsize:25px
  text: |
    
    ①記憶の仕組み　　　　　　　　　
    ②誰が話しているかが重要　　　　
    ③文章だけと絵付きの説明　　　　
    　・参照コスト（一次元と二次元）
    　・読解コスト　　　　　　　　　
