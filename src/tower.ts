import { SEE_RADIUS } from './constants'
import { Shape, Circle } from './gjk'

export type Tower = Circle & {
  birthFrame: number
}

export const tower = (x: number, y: number, birthFrame: number): Tower => ({
  type: 'circle',
  x,
  y,
  birthFrame,
  radius: 5,
})

export const calculateSightRadius = (
  framesElapsed: number,
  tower: Tower,
): number => {
  const FRAMES_UNTIL_FULL_GROWN = 60 * 10
  const lifeSpan = framesElapsed - tower.birthFrame
  const radiusPercentage = Math.min(1, lifeSpan / FRAMES_UNTIL_FULL_GROWN)
  return radiusPercentage * SEE_RADIUS
}
