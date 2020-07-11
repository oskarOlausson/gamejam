/**
 * All the game logic
 */

import { State, init, Disc } from './state'
import { getTravel, getShot } from './travel'

const discPosition = (
  disc: Disc,
  frame: number,
): [number, number] | undefined => disc.travel[frame - disc.travelStart]

export const calculateDiscPosition = (disc: Disc, frame: number): Disc => {
  const position = discPosition(disc, frame)
  if (!position) {
    return disc
  }
  return { ...disc, center: position }
}

export const update = (state: State): State => {
  if (state.keys.has('r')) {
    return init()
  }

  if (!discPosition(state.disc, state.frame) && state.shootNow) {
    const [m, e] = getShot(state.mouse)

    if (e[0] === 0 && e[1] === 0) {
      return state
    }

    return {
      ...state,
      shot: [m, e],
      disc: {
        ...state.disc,
        travel: getTravel(state.disc.center, m, e, 1 / 180),
        travelStart: state.frame,
      },
    }
  }

  return { ...state, disc: calculateDiscPosition(state.disc, state.frame) }
}
