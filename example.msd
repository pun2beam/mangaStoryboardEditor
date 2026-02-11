meta:
  title: テスト
  author: DEF
  actor.name.visible: on

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
  x:40
  y:31
  w:60
  h:23
  radius:20

panel:
  id:3
  page:p1
  x:40
  y:55
  w:60
  h:23
  radius:20

panel:
  id:4
  page:p1
  x:40
  y:79
  w:60
  h:23
  radius:20

panel:
  id:5
  page:p1
  x:0
  y:31
  w:38
  h:35
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
  name:博士

actor:
  id:a2
  panel:1
  x:50
  y:55
  y:90
  scale:5
  pose:stand
  emotion:panic
  facing:left
  name:助手A

actor:
  id:a3
  panel:1
  x:98
  y:165
  z:-1
  scale:20
  pose:think
  emotion:smile
  facing:right
  eye:down
  name:助手B

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
    なぜマンガ用のDSLを作成したのか
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
  x:65
  y:65
  w:20
  h:20
  shape:thought 
  tail:toPoint(88,65)
  fontsize:25px
  text: |
    おなかすいたなぁ

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
  name:先生

balloon:
  id:b4
  panel:2
  x:55
  y:5
  w:40
  h:90
  shape:oval
  tail:toPoint(50,55)
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
  name:助手A

balloon:
  id:b5
  panel:3
  x:5
  y:5
  w:40
  h:90
  shape:oval
  tail:toPoint(50,55)
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
  y:30
  z:-1
  scale:3
  pose:neutral
  emotion:neutral
  facing:right
  name:先生

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
  name:助手A

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

caption:
  id:c1
  panel:5
  x:5
  y:5
  w:30
  h:10
  fontsize:25px
  text: |
    翌朝
