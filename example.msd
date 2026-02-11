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
  x:0
  y:31
  w:38
  h:35
  radius:20

panel:
  id:3
  page:p1
  x:40
  y:31
  w:60
  h:23
  radius:20

actor:
  id:a1
  panel:1
  x:20
  y:90
  scale:5
  pose:run
  emotion:panic
  facing:right
  name:主人公

actor:
  id:a2
  panel:1
  x:50
  y:55
  y:90
  scale:5
  pose:stand
  emotion:angry
  facing:left
  name:先生

actor:
  id:a3
  panel:1
  x:98
  y:170
  z:-1
  scale:20
  pose:think
  emotion:smile
  facing:right
  eye:down
  name:人

balloon:
  id:b1
  panel:1
  x:-5
  y:5
  w:35
  h:18
  z:1
  shape:thought 
  tail:toActor(a1)
  fontsize:25px
  text: |
    
    なぜマンガ用のDSLが必要なのか
    わかりますか！


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
    ネームが書きやすくなるから?
    

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

caption:
  id:c1
  panel:2
  x:5
  y:5
  w:30
  h:10
  text: 翌朝
