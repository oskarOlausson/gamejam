/**
 * All the game logic
 */

import { State, init, Disc } from './state'
import { getTravel, getShot } from './travel'
import {
  getReflection,
  aToB,
  pointLineDistance,
  multiply,
  normalize,
  add,
  Vec2,
  magnitude,
} from './gjk'
import { W, H } from './constants'
import { WindState, createWindState } from './wind'
import { WIND_MAX_FRAMES } from './constants'
import { easing } from 'ts-easing'

const travelPosition = (
  disc: Disc,
  frame: number,
): [number, number] | undefined => disc.travel[frame - disc.travelStart]

export const calculateDiscPosition = (state: State): Disc => {
  const disc = state.disc
  const nextTravelFrame = travelPosition(state.disc, state.frame)

  if (!nextTravelFrame) {
    return disc
  }

  const newPosition = add(
    nextTravelFrame,
    calculateWindVector(state.wind, state.frame, disc.travelStart),
  )

  const tree = state.trees[0]
  const combinedRadius = tree.radius + disc.radius

  if (
    pointLineDistance(tree.center, disc.center, newPosition) < combinedRadius
  ) {
    const offset = multiply(
      normalize(aToB(tree.center, disc.center)),
      tree.radius + disc.radius,
    )
    const [cx, cy] = add(tree.center, offset)

    const remainingPath = disc.travel.filter(
      (p, i) => state.frame - disc.travelStart <= i,
    )

    if (remainingPath.length === 0) {
      return {
        ...disc,
        travel: [],
      }
    }

    const velocity = aToB(state.disc.center, newPosition)
    const reflection = getReflection(state.disc.center, newPosition, tree)

    const angleDiff =
      Math.atan2(reflection[1], reflection[0]) -
      Math.atan2(velocity[1], velocity[0])

    const filtered: Vec2[] = remainingPath
      .map(([x, y]): Vec2 => [x - cx, y - cy])
      .filter((p): p is Vec2 => p[0] !== 0 || p[1] !== 0)

    const newPath = filtered
      .map(
        ([x, y]): Vec2 => {
          const newAngle = Math.atan2(y, x) + angleDiff
          const length = magnitude([x, y])

          return [
            cx + Math.cos(newAngle) * length * 0.5,
            cy + Math.sin(newAngle) * length * 0.5,
          ]
        },
      )
      .filter((p) => magnitude(aToB(tree.center, p)) > combinedRadius)
      .filter((p, i) => i % 2 === 0)

    if (newPath.length === 0) {
      return {
        ...disc,
        center: [cx, cy],
        travel: [],
      }
    }

    return {
      ...disc,
      center: newPath[0],
      travel: newPath.slice(1),
      travelStart: state.frame,
    }
  }

  return { ...disc, center: newPosition || disc.center }
}

export const calculateWindVector = (
  wind: WindState,
  thrownAt: number,
  frame: number,
): Vec2 => {
  const { startVector, endVector, startFrame } = wind
  const easingFunction = easing.linear
  const t = Math.min((frame - startFrame) / WIND_MAX_FRAMES, 1)
  const newX =
    startVector[0] - (startVector[0] - endVector[0]) * easingFunction(t)
  const newY =
    startVector[1] - (startVector[1] - endVector[1]) * easingFunction(t)
  return multiply([newX, newY], frame - thrownAt)
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

  if (!travelPosition(state.disc, state.frame) && state.keys.has('d')) {
    const m: Vec2 = [W / 2 + 15, H / 2]
    const e: Vec2 = [W / 2 + 30, 0]

    return {
      ...state,
      shot: [m, e],
      disc: {
        ...state.disc,
        travel: getTravel(state.disc.center, m, e),
        travelStart: state.frame,
      },
    }
  }

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
        travel: getTravel(state.disc.center, m, e),
        travelStart: state.frame,
      },
      wind,
    }
  }

  return {
    ...state,
    disc: calculateDiscPosition(state),
    wind,
  }
}
