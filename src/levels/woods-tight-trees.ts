import { Level } from '../state'
import { createWindState } from '../wind'
import { W, H } from '../constants'
import { Circle } from '../gjk'

const createTreeCurve = (): Array<Circle> =>
  Array.from(new Array(10)).map((_, i) => ({
    center: [W / 2 - 100, H / 4 + i * 50],
    radius: 20,
  }))

export const theWoodsTightTrees: Level = {
  trees: [
    ...createTreeCurve(),
    ...createTreeCurve().map((x) => ({
      ...x,
      center: [x.center[0] + 180, x.center[1]] as [number, number],
    })),
  ],
  wind: createWindState(
    [Math.random() * 2 - 1, Math.random() * 2 - 1],
    [Math.random() * 2 - 1, Math.random() * 2 - 1],
    0,
  ),
  basket: {
    center: [W / 2 + 50, 100],
    radius: 30,
  },
  wonAt: null,
  disc: {
    wind: [],
    center: [W / 2, H - 50],
    travel: [],
    travelStart: 0,
    radius: 20,
  },
}
