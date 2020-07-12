/**
 * Model for the game
 */

import { W, H } from './constants'
import { Vec2, Circle } from './gjk'
import { WindState, createWindState } from './wind'
import { Basket } from './basket'

export type Disc = Circle & {
  travel: Vec2[]
  travelStart: number
  wind: Vec2[]
}

export type Level = {
  disc: Disc
  basket: Basket
  wind: WindState
  trees: Circle[]
  youHaveWon: boolean
}

export type State = {
  keys: Set<string>
  frame: number
  mouse: Vec2[]
  shootNow: boolean
  shot: Vec2[]
  level: Level
}

export const init = (): State => ({
  keys: new Set(),
  frame: 0,
  mouse: [],
  level: {
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
    basket: {
      center: [W / 2, 0 + 50],
      radius: 30,
    },
    youHaveWon: false,
    disc: {
      center: [W / 2, H - 50],
      travel: [],
      travelStart: 0,
      radius: 20,
      wind: [],
    },
  },
  shootNow: false,
  shot: [],
})
