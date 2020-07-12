/**
 * Model for the game
 */

import { W, H } from './constants'
import { Vec2, Circle } from './gjk'
import { WindState, createWindState } from './wind'

export type Disc = Circle & {
  travel: Vec2[]
  travelStart: number
}

export type State = {
  keys: Set<string>
  frame: number
  mouse: Vec2[]
  disc: Disc
  shootNow: boolean
  trees: Circle[]
  shot: Vec2[]
  wind: WindState
}

export const init = (): State => ({
  keys: new Set(),
  frame: 0,
  mouse: [],
  disc: {
    center: [W / 2, H - 50],
    travel: [],
    travelStart: 0,
    radius: 20,
  },
  shootNow: false,
  shot: [],
  trees: [
    {
      center: [W / 2, H / 2],
      radius: 20,
    },
  ],
  wind: createWindState(
    [Math.random() * 2 - 1, Math.random() * 2 - 1],
    [Math.random() * 2 - 1, Math.random() * 2 - 1],
    0,
  ),
})
