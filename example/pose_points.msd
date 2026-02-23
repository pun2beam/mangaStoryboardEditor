meta:
  title: pose.points サンプル
  author: DEF
  layout.page.mode: fixed
  layout.percent.reference: page-inner
  layout.page.persistGenerated: false

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
  x: 27.07
  y: 78.18
  scale: 5
  pose: run
  pose.points: 0,-2.2,-0.6,-0.6,1,-1,-0.5,-1,0.5,-1,0,-1.6,-0.1,-1,0,-0.8,-0.4,-0.5,0.4,-0.5,-0.5,0,0.5,0
  pose.points.z: 0,1,1,1,1,0,0,0,0,0,0,0
  pose.points.outlineWidth: 0,2,2,2,2,2,2,2,2,2,4,4
  emotion: smile
  facing: right
  name: pose.points優先
  rot: 0
