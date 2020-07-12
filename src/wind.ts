import { Vec2 } from './gjk'

export type WindState = {
  startVector: Vec2
  endVector: Vec2
  startFrame: number
}

export const createWindState = (
  startVector: Vec2,
  endVector: Vec2,
  startFrame: number,
): WindState => ({
  startVector,
  endVector,
  startFrame,
})
