meta:
  title: Hierarchy test
  author: DEF

page:
  id: p1000
  size: B5
  margin: 5
  unit: percent
  panel:
    id: 1000
    x: 5
    y: 5
    w: 90
    h: 90
    actor:
      id: a1000
      x: 50
      y: 90
      scale: 6
      pose: stand
      emotion: smile
      facing: left
      name: Taro
      attachments:
        - ref: as1000
    balloon:
      id: b1000
      x: 12
      y: 15
      w: 40
      h: 18
      shape: oval
      tail: toActor(a1000)
      fontsize: 20
      text: |
        階層入力の
        ラウンドトリップ
    object:
      id: o1000
      x: 60
      y: 20
      w: 30
      h: 40
      shape: square
      text: NOTE
    asset:
      id: as1000
      kind: prop
      key: hat
      x: 0
      y: -15
      scale: 1
