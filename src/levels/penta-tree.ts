import { Level } from '../state'
import { createWindState } from '../wind'
import { W, H } from '../constants'

export const pentaTree: Level = {
  trees: [
    {
      center: [W - 70, H - 150],
      radius: 20,
    },
    {
      center: [W - 70, 150],
      radius: 20,
    },
    {
      center: [W / 2, H / 2],
      radius: 20,
    },
    {
      center: [70, H - 150],
      radius: 20,
    },
    {
      center: [70, 150],
      radius: 20,
    },
  ],
  wind: createWindState(
    [Math.random() * 2 - 1, Math.random() * 2 - 1],
    [Math.random() * 2 - 1, Math.random() * 2 - 1],
    0,
  ),
  basket: {
    center: [W - 40, 70],
    radius: 30,
  },
  wonAt: null,
  disc: {
    wind: [],
    center: [40, H - 50],
    travel: [],
    travelStart: 0,
    radius: 20,
    lastShot: [40, H - 50],
  },
  nrShots: 0,
  par: 3,
}
