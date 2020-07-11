/**
 * Model for the game
 */

import { W, H } from './constants'
import { Rect, Shape } from './gjk'
import { Tower, tower } from './tower'

type Gem = Shape & {
  seen: boolean
}

export type State = {
  keys: Set<string>
  gems: Gem[]
  towers: Array<Tower>
  frame: number
  click: [number, number] | null
}

export const init = (): State => ({
  keys: new Set(),
  gems: [
    {
      type: 'circle',
      x: W / 2,
      y: 50,
      radius: 30,
      seen: false,
    },
    {
      type: 'polygon',
      points: [
        [0, 0],
        [40, 20],
        [0, 20],
      ].map(([x, y]) => [x + W / 2 - 10, y + H - 60]),
      seen: false,
    },
  ],
  towers: [tower(W / 2, 50, 0)],
  frame: 0,
  click: null,
})
