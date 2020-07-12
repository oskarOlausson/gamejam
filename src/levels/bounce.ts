import { Level } from '../state'
import { createWindState } from '../wind'
import { W, H } from '../constants'
import { Circle } from '../gjk'

const createTreeCurve = (): Array<Circle> =>
  Array.from(new Array(5)).map((_, i) => ({
    center: [W / 2, H / 4 + 250 + i * 50],
    radius: 20,
  }))

export const bounce: Level = {
  trees: [
    ...createTreeCurve(),
    {
      center: [W / 2, 230],
      radius: 40,
    },
  ],
  nrShots: 0,
  par: 3,
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
    center: [W * 0.2, H * 0.75],
    travel: [],
    travelStart: 0,
    radius: 20,
    lastShot: [W * 0.2, H * 0.75],
  },
}
