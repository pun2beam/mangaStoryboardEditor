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

balloon:
  id:b1
  panel:1
  x:5
  y:5
  w:35
  h:18
  shape:thought 
  tail:toActor(a1)
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
