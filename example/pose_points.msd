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
  scale: 5
  pose: run
  pose.points: "-0.6,-0.6,1,-1,-0.5,-1,0.5,-1,0.1,-1.7,-0.1,-1,0,-0.8,-0.4,-0.5,0.4,-0.5,-0.5,0,0.5,0"
  emotion: smile
  facing: right
  name: pose.points優先
