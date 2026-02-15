meta:
  title: Hierarchy test
  author: DEF
  text.direction: horizontal

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
    h: 30
    actor:
      id: a1000
      x: 40
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
      y: 10
      w: 40
      h: 18
      shape: oval
      tail: toActor(a1000)
      fontsize: 25px
      text: |
        階層入力の
        テスト
    object:
      id: o1000
      x: 60
      y: 20
      w: 30
      h: 60
      shape: square
      text: |
        NOTE
        メモメモ
    caption:
      id: c1000
      x: 3
      y: 50
      w: 20
      h: 30
      fontsize: 25px
      shape: square
      text: |
        NOTE
        メモメモ
    actor:
      id: a1010
      x: 40
      y: 90
      scale: 6
      pose: stand
      emotion: smile
      facing: left
      name: Taro
      attachments:
        - ref: as1000
  panel:
    id: 1010
    x: 5
    y: 36
    w: 90
    h: 30

asset:
  id: as1000
  w: 55
  h: 55
  dx: -31.5
  dy: -80.5
  s: 1.2
  rot: 0
  z: 1
  src: ./assets/hair1.svg
