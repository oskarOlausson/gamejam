/**
 * Model for the game
 */

import { W, H } from './constants'
import { Shape, Circle } from './gjk'

type Gem = Shape & {
  seen: boolean
}

export type State = {
  keys: Set<string>
  player: Circle,
  gems: Gem[]
}

export const init = (): State => ({
  keys: new Set(),
  player: {
    type: 'circle',
    x: W / 2,
    y: H / 2,
    radius: 20,
  },
  gems: [],
})
