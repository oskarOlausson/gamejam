import { Level } from '../state'
import { createWindState } from '../wind'
import { W, H } from '../constants'
import { Circle } from '../gjk'

const createTreeCurve = (): Array<Circle> =>
  Array.from(new Array(10)).map((_, i) => ({
    center: [W / 2 - 20 + 3 * i * i, H / 4 + i * 50],
    radius: 20,
  }))

export const wavyWoods: Level = {
  trees: [...createTreeCurve()],
  nrShots: 0,
  par: 4,
  wind: createWindState(
    [Math.random() * 2 - 1, Math.random() * 2 - 1],
    [Math.random() * 2 - 1, Math.random() * 2 - 1],
    0,
  ),
  basket: {
    center: [W / 2, 80],
    radius: 30,
  },
  wonAt: null,
  disc: {
    wind: [],
    center: [W / 2 + 50, H - 80],
    travel: [],
    travelStart: 0,
    radius: 20,
    lastShot: [W / 2, H - 50],
  },
}
