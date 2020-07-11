/**
 * All the game logic
 */

import { State, init } from './state'
import { tower } from './tower'

export const update = (state: State): State => {
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
