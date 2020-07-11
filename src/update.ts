/**
 * All the game logic
 */

import { State, init } from './state'
import { overlaps, Rect, centre, Circle, Polygon, shapeInBoard } from './gjk'
import { W, H, SEE_RADIUS } from './constants'
import { tower } from './tower'

export const update = (state: State): State => {
  const speed = 5

  const dx =
    (state.keys.has('a') ? -speed : 0) + (state.keys.has('d') ? speed : 0)
  const dy =
    (state.keys.has('w') ? -speed : 0) + (state.keys.has('s') ? speed : 0)

  if (state.keys.has('r')) {
    return init()
  }

  const newState = {
    ...state
  }

  return { ...newState, ...handleClick(newState) }
}

const handleClick = (state: State): Partial<State> => {
  if (state.click) {
    const newTower = tower(state.click[0], state.click[1], state.frame)
    return { towers: [...state.towers, newTower] }
  } else {
    return {}
  }
}
