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
  towers: Array<Tower>
  frame: number
  click: [number, number] | null
}

export const init = (): State => ({
  keys: new Set(),
  towers: [tower(W / 2, 50, 0)],
  frame: 0,
  click: null
})
