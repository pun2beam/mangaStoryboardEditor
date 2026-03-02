meta:
  title: appendage ref duplicate drag repro
  actor.name.visible: off
  actor.strokeWidth: 8

appendage:
  id: ap-finger-shared
  anchor: rh
  chains: 0,0 1.8,-2.2 3.4,-3.4

actor:
  id: a-base-appendage
  x: 50
  y: 84
  scale: 5
  pose: point
  appendages:
    - ref: ap-finger-shared
      anchor: rh
      chains: 0,0 2.1,-2.1 4.1,-2.6
    - ref: ap-finger-shared
      anchor: rh
      chains: 0,0 2.0,-1.0 3.8,-0.6

panel:
  id: 9100
  w: 100
  h: 100
  actor:
    id: a-child-dup-ref
    extends: a-base-appendage
    x: 52
    y: 84
