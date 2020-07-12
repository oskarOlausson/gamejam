import { Level } from '../state'
import { createWindState } from '../wind'
import { W, H } from '../constants'
import { Circle } from '../gjk'

const makeSpial = (): Circle[] => {
  return [...Array(10)].map((_, i) => {
    const a = (Math.PI * 2 * i) / 10
    const r = 60 + (120 * i) / 10

    const x = Math.cos(a) * r
    const y = Math.sin(a) * r

    return {
      center: [x + W / 2, y + H / 2],
      radius: 20,
    }
  })
}

export const spiral: Level = {
  trees: makeSpial(),
  nrShots: 0,
  par: 3,
  wind: createWindState(
    [Math.random() * 2 - 1, Math.random() * 2 - 1],
    [Math.random() * 2 - 1, Math.random() * 2 - 1],
    0,
  ),
  basket: {
    center: [W / 2, H / 2],
    radius: 30,
  },
  wonAt: null,
  disc: {
    wind: [],
    center: [30, H - 30],
    travel: [],
    travelStart: 0,
    radius: 20,
    lastShot: [30, H - 30],
  },
}
