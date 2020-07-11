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
): Shape => {
  const FRAMES_UNTIL_FULL_GROWN = 60 * 12
  const lifeSpan = framesElapsed - tower.birthFrame
  const radiusPercentage = Math.min(
    Math.pow(lifeSpan / FRAMES_UNTIL_FULL_GROWN, 0.4),
    1,
  )
  const { x, y } = tower
  return { type: 'circle', x, y, radius: radiusPercentage * SEE_RADIUS }
}
