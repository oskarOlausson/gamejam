/**
 * Model for the game
 */

import { W, H } from './constants'
import { Tower, tower } from './tower'

export type State = {
  keys: Set<string>
  towers: Array<Tower>
  frame: number
  click: [number, number] | null
  p1: boolean
}

export const init = (): State => ({
  keys: new Set(),
  towers: [tower(W / 2, 50, 0, false), tower(W / 2, H - 50, 0, true)],
  frame: 0,
  click: null,
  p1: true,
})
