import { Level } from '../state'
import { createWindState } from '../wind'
import { W, H } from '../constants'

export const longShot: Level = {
  trees: [
    { center: [60, 60], radius: 20 },
    { center: [W - 30, H - 30], radius: 20 },
  ],
  nrShots: 0,
  par: 1,
  wind: createWindState(
    [Math.random() * 2 - 1, Math.random() * 2 - 1],
    [Math.random() * 2 - 1, Math.random() * 2 - 1],
    0,
  ),
  basket: {
    center: [W - 40, 80],
    radius: 30,
  },
  wonAt: null,
  disc: {
    wind: [],
    center: [40, H - 80],
    travel: [],
    travelStart: 0,
    radius: 20,
    lastShot: [40, H - 80],
  },
}
