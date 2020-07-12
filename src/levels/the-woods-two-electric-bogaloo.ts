import { Level } from '../state'
import { createWindState } from '../wind'
import { W, H } from '../constants'

export const theWoodsTwoElectricBogaloo: Level = {
  trees: [
    {
      center: [W / 2 - 10, H / 2],
      radius: 20,
    },
    {
      center: [W / 2 + 10, H / 2],
      radius: 20,
    },
  ],
  wind: createWindState(
    [Math.random() * 2 - 1, Math.random() * 2 - 1],
    [Math.random() * 2 - 1, Math.random() * 2 - 1],
    0,
  ),
  basket: {
    center: [W / 2, 0 + 50],
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
  nrShots: 1,
  par: 3,
}
