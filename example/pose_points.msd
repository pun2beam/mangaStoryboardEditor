meta:
  title: pose.points サンプル
  author: DEF

page:
  id: p1
  size: B5
  margin: 5
  unit: percent

panel:
  id: 1
  page: p1
  x: 0
  y: 0
  w: 100
  h: 100

actor:
  id: a1
  panel: 1
  x: 50
  y: 80
  scale: 1.2
  pose: run
  pose.points: "-6,-36,6,-36,-4,-26,4,-26,0,-22,0,-8,0,4,-3,18,3,18,-3,32,3,32"
  emotion: smile
  facing: right
  name: pose.points優先
