import { Level } from '../state'
import { createWindState } from '../wind'
import { W, H } from '../constants'
import { Circle, Vec2 } from '../gjk'

const createTreeCurve = (): Circle[] =>
  Array.from(new Array(7)).map((_, i) => ({
    center: [W * 0.3, H / 4 + 150 + i * 50],
    radius: 20,
  }))

const other = (): Circle[] =>
  [
    [300, 300],
    [245, 250],
    [210, 310],
  ].map((p: Vec2) => ({
    center: p,
    radius: 10,
  }))

export const bounce2: Level = {
  trees: [
    ...createTreeCurve(),
    ...other(),
    {
      center: [20, 200],
      radius: 35,
    },
    {
      center: [W / 2, 40],
      radius: 35,
    },
  ],
  nrShots: 0,
  par: 4,
  wind: createWindState(
    [Math.random() * 2 - 1, Math.random() * 2 - 1],
    [Math.random() * 2 - 1, Math.random() * 2 - 1],
    0,
  ),
  basket: {
    center: [W * 0.8, H * 0.75],
    radius: 30,
  },
  wonAt: null,
  disc: {
    wind: [],
    center: [W * 0.1, H * 0.75],
    travel: [],
    travelStart: 0,
    radius: 20,
    lastShot: [W * 0.1, H * 0.75],
  },
}
