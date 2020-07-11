import { SEE_RADIUS } from './constants'

export type Tower = {
  x: number
  y: number
  birthFrame: number
}

export const tower = (x: number, y: number, birthFrame: number): Tower => ({
  x,
  y,
  birthFrame,
})

export const calculateSightRadius = (
  framesElapsed: number,
  tower: Tower,
): number => {
  const FRAMES_UNTIL_FULL_GROWN = 60 * 10
  const lifeSpan = framesElapsed - tower.birthFrame
  const radiusPercentage = Math.min(1, FRAMES_UNTIL_FULL_GROWN / lifeSpan)
  return radiusPercentage * SEE_RADIUS
}
