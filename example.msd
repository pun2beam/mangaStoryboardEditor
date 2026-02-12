meta:
  title: テスト
  author: DEF
  actor.name.visible: on
  text.direction: horizontal

sfx:
  id:1
  panel:1
  x:0
  y:-5
  text:導入：何が目的?
  text.direction: vertical
  scale:1
  fontSize:5
  rotate:0
  stroke:#000000
  fill:#a0f0a0

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
  w:100
  h:30
  radius:20

panel:
  id:2
  page:p1
  x:0
  y:31
  w:60
  h:23
  radius:20

panel:
  id:3
  page:p1
  x:0
  y:55
  w:60
  h:23
  radius:20

panel:
  id:4
  page:p1
  x:0
  y:79
  w:60
  h:23
  radius:20

panel:
  id:5
  page:p1
  x:62
  y:31
  w:38
  h:50
  radius:20

panel:
  id:6
  page:p1
  x:62
  y:82
  w:38
  h:20
  radius:20

actor:
  id:a1
  panel:1
  x:20
  y:90
  scale:5
  pose:point
  emotion:neutral
  facing:right
  name:Hoge君

actor:
  id:a2
  panel:1
  x:50
  y:90
  scale:5
  pose:stand
  emotion:panic
  facing:left
  name:Hige君

actor:
  id:a3
  panel:1
  x:98
  y:180
  z:-1
  scale:20
  pose:think
  emotion:smile
  facing:right
  eye:down
  name:Huge君

balloon:
  id:b1
  panel:1
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
  panel:1
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
  panel:1
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
  panel:1
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
  panel:2
  x:20
  y:290
  z:-1
  scale:30
  pose:point
  emotion:neutral
  facing:right
  name:Hoge君

balloon:
  id:b4
  panel:2
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
  panel:3
  x:80
  y:310
  z:-1
  scale:30
  pose:point
  emotion:neutral
  facing:left
  name:Hige君

balloon:
  id:b5
  panel:3
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
  panel:4
  x:10
  y:37
  z:-1
  scale:3
  pose:neutral
  emotion:neutral
  facing:right
  name:Hoge君

actor:
  id:a7
  panel:4
  x:20
  y:60
  z:-1
  scale:3
  pose:neutral
  emotion:neutral
  facing:back
  name:Hige君

actor:
  id:a8
  panel:4
  x:50
  y:150
  z:-1
  scale:6
  pose:neutral
  emotion:smile
  facing:right
  name:Huge君

balloon:
  id:b6
  panel:4
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
  panel:4
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
  panel:4
  x:10
  y:75
  w:25
  h:18
  z:1
  shape:thought 
  tail:toActor(a8)
  fontsize:25px
  text.direction: vertical
  text: |
    確か冷蔵庫に...

object:
  id:o1
  panel:4
  x:80
  y:80
  w:10
  h:20
  fontsize:25
  text.direction: vertical
  text:冷蔵庫

balloon:
  id:b7
  panel:5
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
  panel:5
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
  panel:5
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
  panel:6
  x:40
  y:100
  z:-1
  scale:7
  pose:neutral
  emotion:smile
  facing:right
  name:Huge君

object:
  id:o3
  panel:6
  x:15
  y:60
  w:10
  h:10
  fontsize:25
  text:ケーキ

balloon:
  id:b9
  panel:6
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
  panel:6
  x:66
  y:77
  w:32
  h:20
  fontsize:60px
  text.direction: vertical
  text: |
    つづく
