import { Level } from './state'
import { Circle } from './gjk'
import { W, H } from './constants'

export const treeAdder = (level: Level): Level => {
  const nrWidthTrees = 10
  const nrHeightTrees = 20
  const topTrees: Array<Circle> = Array.from(new Array(nrWidthTrees)).map(
    (x, i) => ({
      center: [(i / nrWidthTrees) * W + 20, 0],
      radius: 20,
    }),
  )
  const bottomTrees: Array<Circle> = Array.from(new Array(nrWidthTrees)).map(
    (x, i) => ({
      center: [(i / nrWidthTrees) * W + 20, H - 10],
      radius: 20,
    }),
  )
  const leftTrees: Array<Circle> = Array.from(new Array(nrHeightTrees)).map(
    (x, i) => ({
      center: [10, (i / nrHeightTrees) * H],
      radius: 20,
    }),
  )
  const rightTrees: Array<Circle> = Array.from(new Array(nrHeightTrees)).map(
    (x, i) => ({
      center: [W - 10, (i / nrHeightTrees) * H],
      radius: 20,
    }),
  )
  return {
    ...level,
    trees: [
      ...level.trees,
      ...topTrees,
      ...leftTrees,
      ...rightTrees,
      ...bottomTrees,
    ],
  }
}
