meta:
  base.panel.direction:right.bottom
  base.panel.margin:1.5
  layout.percent.reference:base-size
  layout.base.size:B5
  # base-size を基準に % を解釈し、拡張ページでは実ページ寸法へ投影されるため見た目比率を維持できる

page:
  id: p1020
  size: B5
  margin: 5
  unit: percent


panel: 
  id: 1260
  page: p1020
  w: 100
  h: 20
  radius: 20

  caption:
    id:1
    x:5
    y:5
    w:20
    h:20
    fontSize:50px
    text: あ

panel: 
  id: 1270
  page: p1020
  w: 30
  h: 30
  radius: 20

  caption:
    id:1
    x:5
    y:5
    w:20
    h:20
    fontSize:50px
    text: い

panel:
  id: 1280
  page: p1020
  w: 30
  h: 30
  radius: 20
  next:bottom

  caption:
    id:1
    x:5
    y:5
    w:20
    h:20
    fontSize:50px
    text: う

panel:
  id: 1290
  page: p1020
  w: 30
  h: 30
  radius: 20

  caption:
    id:1
    x:5
    y:5
    w:20
    h:20
    fontSize:50px
    text: え

panel:
  id: 1300
  page: p1020
  w: 30
  h: 30
  radius: 20

  caption:
    id:1
    x:5
    y:5
    w:20
    h:20
    fontSize:50px
    text: お

panel:
  id: 1310
  page: p1020
  w: 37
  h: 61.55
  radius: 20

  caption:
    id:1
    x:5
    y:5
    w:20
    h:20
    fontSize:50px
    text: か

panel:
  id: 1320
  page: p1020
  w: 100
  h: 15
  radius: 20

  caption:
    id:1
    x:5
    y:5
    w:20
    h:20
    fontSize:50px
    text: き
