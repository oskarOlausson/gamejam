/**
 * All the game logic
 */

import { State, init, Disc } from './state'
import { getTravel, getShot } from './travel'
import { WindState, createWindState } from './wind'
import { DISC_MAX_FRAMES, WIND_MAX_FRAMES } from './constants'
import { Vec2 } from './gjk'
import { easing } from 'ts-easing'

const travelPosition = (
  disc: Disc,
  frame: number,
): [number, number] | undefined => disc.travel[frame - disc.travelStart]

export const calculateDiscPosition = (
  disc: Disc,
  frame: number,
  wind: WindState,
): Disc => {
  const position = travelPosition(disc, frame)
  if (!position) {
    return disc
  }
  const [x, y] = position
  const [windX, windY] = calculateWindVector(wind, frame)

  const windCoefficient = frame - disc.travelStart
  const positionAfterWind = [
    x + windX * windCoefficient,
    y + windY * windCoefficient,
  ] as Vec2

  return { ...disc, center: positionAfterWind }
}

export const calculateWindVector = (wind: WindState, frame: number): Vec2 => {
  const { startVector, endVector, startFrame } = wind
  const easingFunction = easing.linear
  const t = Math.min((frame - startFrame) / WIND_MAX_FRAMES, 1)
  const newX =
    startVector[0] - (startVector[0] - endVector[0]) * easingFunction(t)
  const newY =
    startVector[1] - (startVector[1] - endVector[1]) * easingFunction(t)
  return [newX, newY]
}

export const updateWind = (
  windState: WindState,
  currentFrame: number,
): WindState => {
  if (currentFrame - windState.startFrame > WIND_MAX_FRAMES) {
    return createWindState(
      windState.endVector,
      [Math.random() * 2 - 1, Math.random() * 2 - 1],
      currentFrame,
    )
  }
  return windState
}

export const update = (state: State): State => {
  if (state.keys.has('r')) {
    return init()
  }
  const wind = updateWind(state.wind, state.frame)

  if (!travelPosition(state.disc, state.frame) && state.shootNow) {
    const [m, e] = getShot(state.mouse)

    if (e[0] === 0 && e[1] === 0) {
      return { ...state, wind }
    }

    return {
      ...state,
      shot: [m, e],
      disc: {
        ...state.disc,
        travel: getTravel(state.disc.center, m, e, 1 / DISC_MAX_FRAMES),
        travelStart: state.frame,
      },
      wind,
    }
  }

  return {
    ...state,
    disc: calculateDiscPosition(state.disc, state.frame, state.wind),
    wind,
  }
}
