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
  overlap,
} from './gjk'
import { WindState, createWindState } from './wind'
import { WIND_MAX_FRAMES } from './constants'
import { easing } from 'ts-easing'
import { minInList } from './utils'

export const travelPosition = (
  disc: Disc,
  frame: number,
): [number, number] | undefined => disc.travel[frame - disc.travelStart]

export const calculateDiscPosition = (state: State): Disc => {
  const disc = state.level.disc
  const nextTravelFrame = travelPosition(state.level.disc, state.frame)

  if (!nextTravelFrame) {
    return disc
  }

  const lastWVector: Vec2 =
    disc.wind.length > 0 ? disc.wind[disc.wind.length - 1] : [0, 0]

  const wVector = add(
    lastWVector,
    calculateWindVector(state.level.wind, state.frame),
  )

  const newPosition = add(nextTravelFrame, wVector)

  const tree = minInList(state.level.trees, (tree) =>
    pointLineDistance(tree.center, disc.center, newPosition),
  )
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

    const velocity = aToB(state.level.disc.center, newPosition)
    const reflection = getReflection(state.level.disc.center, newPosition, tree)

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

  return {
    ...disc,
    center: newPosition,
    wind: [...disc.wind, wVector],
  }
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

export const updateWind = (state: State): Partial<State> => {
  const {
    level: { wind },
    frame,
  } = state
  if (frame - wind.startFrame > WIND_MAX_FRAMES) {
    return {
      level: {
        ...state.level,
        wind: createWindState(
          wind.endVector,
          [Math.random() * 2 - 1, Math.random() * 2 - 1],
          frame,
        ),
      },
    }
  }
  return {}
}

const updateFlyingDisc = (state: State): Partial<State> => {
  if (!travelPosition(state.level.disc, state.frame) && state.shootNow) {
    const [m, e] = getShot(state.mouse)

    if (e[0] === 0 && e[1] === 0) {
      return { ...state }
    }

    const travel = getTravel(state.level.disc.center, m, e)

    return {
      shot: [m, e],
      lastTravel: travel,
      lastTravelAt: state.frame,
      level: {
        ...state.level,
        disc: {
          ...state.level.disc,
          wind: [],
          travel,
          travelStart: state.frame,
        },
        nrShots: state.level.nrShots + 1,
      },
    }
  }

  return {
    level: {
      ...state.level,
      disc: calculateDiscPosition(state),
    },
  }
}

const checkWinCondition = (state: State): Partial<State> => {
  const overlaps = overlap(state.level.basket, state.level.disc)
  if (overlaps && state.level.wonAt === null) {
    return {
      level: {
        ...state.level,
        disc: { ...state.level.disc, travel: [] },
        wonAt: state.frame,
      },
    }
  }
  return {}
}

export const update = (state: State): State => {
  if (state.keys.has('r')) {
    return init()
  }

  if (state.clicked && state.level.wonAt) {
    if (state.level.wonAt !== null) {
      const [level, ...levels] = state.levels
      if (!level) {
        return state
      }
      return { ...state, level, levels: levels }
    }
  }
  return [checkWinCondition, updateWind, updateFlyingDisc].reduce(
    (acc, stateUpdater) => ({
      ...acc,
      ...stateUpdater(acc),
    }),
    state,
  )
}
