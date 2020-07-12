/**
 * Model for the game
 */

import { Vec2, Circle } from './gjk'
import { WindState } from './wind'
import { Basket } from './basket'
import * as levels from './levels'

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
  wonAt: null | number
}

export type State = {
  keys: Set<string>
  frame: number
  mouse: Vec2[]
  shootNow: boolean
  shot: Vec2[]
  level: Level
  lastTravel: Vec2[]
  lastTravelAt: number
  levels: Level[]
  clicked: boolean
}

const allLevels = Object.values(levels)

export const init = (): State => ({
  keys: new Set(),
  frame: 0,
  mouse: [],
  level: allLevels[0],
  levels: allLevels.slice(1),
  shootNow: false,
  shot: [],
  lastTravel: [],
  lastTravelAt: 0,
  clicked: false,
})
