/**
 * All the game logic
 */

import { State, init, Disc, Level } from './state'
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
  outsideBounds,
} from './gjk'
import { WindState, createWindState } from './wind'
import { WIND_MAX_FRAMES, H, W } from './constants'
import { easing } from 'ts-easing'
import { minInList, replaceAtIndex } from './utils'

export const travelPosition = (
  disc: Disc,
  frame: number,
): [number, number] | undefined => disc.travel[frame - disc.travelStart]

const newPathGivenReflection = (
  level: Level,
  frame: number,
  remainingPath: Vec2[],
  [cx, cy]: Vec2,
  velocity: Vec2,
  reflection: Vec2,
  bounceFactor: number,
  filterFn: (v: Vec2, i: number) => boolean = () => true,
): Disc => {
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
          cx + Math.cos(newAngle) * length * bounceFactor,
          cy + Math.sin(newAngle) * length * bounceFactor,
        ]
      },
    )
    .filter(filterFn)

  if (newPath.length === 0) {
    return {
      ...level.disc,
      center: [cx, cy],
      travel: [],
    }
  }

  return {
    ...level.disc,
    center: newPath[0],
    travel: newPath.slice(1),
    travelStart: frame,
  }
}

export const calculateDiscPosition = (state: State): Disc => {
  const level = state.levels[state.currentLevel]
  const disc = level.disc
  const nextTravelFrame = travelPosition(level.disc, state.frame)

  if (!nextTravelFrame) {
    return disc
  }

  const lastWVector: Vec2 =
    disc.wind.length > 0 ? disc.wind[disc.wind.length - 1] : [0, 0]

  const wVector = add(lastWVector, calculateWindVector(level.wind, state.frame))

  const newPosition = add(nextTravelFrame, wVector)

  const tree = minInList(level.trees, (tree) =>
    pointLineDistance(tree.center, disc.center, newPosition),
  )
  const combinedRadius = tree.radius + disc.radius

  const remainingPath = disc.travel.filter(
    (p, i) => state.frame - disc.travelStart <= i,
  )

  if (remainingPath.length === 0) {
    return {
      ...disc,
      travel: [],
    }
  }

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

    const velocity = aToB(level.disc.center, newPosition)
    const reflection = getReflection(level.disc.center, newPosition, tree)

    return newPathGivenReflection(
      level,
      state.frame,
      remainingPath,
      [cx, cy],
      velocity,
      reflection,
      0.5,
      (p, i) => magnitude(aToB(tree.center, p)) > combinedRadius && i % 2 === 0,
    )
  }

  if (outsideBounds(level.disc)) {
    return {
      ...level.disc,
      wind: [],
      travel: [],
      center: level.disc.lastShot,
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
  const currentLevelObject = state.levels[state.currentLevel]
  const { frame } = state
  const { wind } = currentLevelObject
  if (frame - wind.startFrame > WIND_MAX_FRAMES) {
    return {
      levels: replaceAtIndex(
        state.levels,
        {
          ...currentLevelObject,
          wind: createWindState(
            wind.endVector,
            [Math.random() * 2 - 1, Math.random() * 2 - 1],
            frame,
          ),
        },
        state.currentLevel,
      ),
    }
  }
  return {}
}

const updateFlyingDisc = (state: State): Partial<State> => {
  const currentLevel = state.levels[state.currentLevel]
  if (!travelPosition(currentLevel.disc, state.frame) && state.shootNow) {
    const [m, e] = getShot(state.mouse)

    if (e[0] === 0 && e[1] === 0) {
      return { ...state }
    }

    const travel = getTravel(state.levels[state.currentLevel].disc.center, m, e)

    return {
      shot: [m, e],
      lastTravel: travel,
      lastTravelAt: state.frame,
      levels: replaceAtIndex(
        state.levels,
        {
          ...currentLevel,
          disc: {
            ...currentLevel.disc,
            wind: [],
            travel,
            travelStart: state.frame,
            lastShot: currentLevel.disc.center,
          },
          nrShots: currentLevel.nrShots + 1,
        },
        state.currentLevel,
      ),
    }
  }

  return {
    levels: replaceAtIndex(
      state.levels,
      {
        ...currentLevel,
        disc: calculateDiscPosition(state),
      },
      state.currentLevel,
    ),
  }
}

const checkWinCondition = (state: State): Partial<State> => {
  const currentLevelObject = state.levels[state.currentLevel]
  const overlaps = overlap(currentLevelObject.basket, currentLevelObject.disc)
  if (overlaps && currentLevelObject.wonAt === null) {
    return {
      levels: replaceAtIndex(
        state.levels,
        {
          ...state.levels[state.currentLevel],
          disc: { ...currentLevelObject.disc, travel: [] },
          wonAt: state.frame,
        },
        state.currentLevel,
      ),
    }
  }
  return {}
}

export const update = (state: State): State => {
  if (state.keys.has('r')) {
    return init()
  }

  const level = state.levels[state.currentLevel]

  if (state.clicked && level.wonAt) {
    if (level.wonAt !== null) {
      if (!level) {
        return state
      }
      return {
        ...state,
        currentLevel: Math.min(state.currentLevel + 1, state.levels.length - 1),
      }
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
