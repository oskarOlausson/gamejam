/**
 * All the game logic
 */

import { State, init } from './state'
import { tower, calculateSightRadius, Tower } from './tower'
import { overlaps } from './gjk'

export const update = (state: State): State => {
  if (state.keys.has('r')) {
    return init()
  }

  const newState = {
    ...state,
  }

  return { ...newState, ...handleClick(newState) }
}

const handleClick = (state: State): Partial<State> => {
  if (state.click) {
    const clickIsWithinSight = (
      click: [number, number],
      towers: Array<Tower>,
    ): boolean =>
      towers.some((tower) =>
        overlaps(calculateSightRadius(state.frame, tower), {
          type: 'circle',
          x: click[0],
          y: click[1],
          radius: 5,
        }),
      )

    if (clickIsWithinSight(state.click, state.towers)) {
      const newTower = tower(state.click[0], state.click[1], state.frame)
      return { towers: [...state.towers, newTower] }
    }
  }
  return {}
}
