/*
  Colllision system for convex polygons
*/
import { W, H } from './constants'

type Point = [number, number]
type Point3d = [number, number, number]
export type Shape = Circle | Rect | Polygon

export type Rect = {
  type: 'rect'
  x: number
  y: number
  w: number
  h: number
}

export type Circle = {
  type: 'circle'
  x: number
  y: number
  radius: number
}

export type Polygon = {
  type: 'polygon'
  points: Point[]
}

export const borders: Shape[] = [
  {
    type: 'polygon',
    points: [
      [0, 0],
      [W / 2, 0],
      [0, H / 2],
    ],
  },
  {
    type: 'polygon',
    points: [
      [W / 2, 0],
      [W, 0],
      [W, H / 2],
    ],
  },
  {
    type: 'polygon',
    points: [
      [W, H / 2],
      [W, H],
      [W / 2, H],
    ],
  },
  {
    type: 'polygon',
    points: [
      [W / 2, H],
      [0, H],
      [0, H / 2],
    ],
  },
]

export const centre = (shape: Shape): Point => {
  if (shape.type === 'circle') {
    return [shape.x, shape.y]
  } else if (shape.type === 'rect') {
    return [shape.x + shape.w / 2, shape.y + shape.h / 2]
  } else if (shape.type === 'polygon') {
    if (shape.points.length < 3) {
      throw Error(
        'Need at least 3 points in a polygon, you had ' + shape.points.length,
      )
    }
    const [sx, sy] = shape.points.reduce(([px, py], [cx, cy]) => [
      px + cx,
      py + cy,
    ])

    return [sx / shape.points.length, sy / shape.points.length]
  }
  throw new Error(`unknown shape type: ${shape}`)
}

export const support = (shape: Shape, [dx, dy]: Point): Point => {
  if (shape.type === 'circle') {
    const dRadians = Math.atan2(dy, dx)
    return [
      shape.x + shape.radius * Math.cos(dRadians),
      shape.y + shape.radius * Math.sin(dRadians),
    ]
  } else if (shape.type === 'rect') {
    const px = shape.x + (dx > 0 ? shape.w : 0)
    const py = shape.y + (dy > 0 ? shape.h : 0)

    if (dx === 0 && shape.x < 0 && shape.x + shape.w > 0) {
      return [0, py]
    } else if (dy === 0 && shape.y < 0 && shape.y + shape.h > 0) {
      return [px, 0]
    }

    return [px, py]
  } else if (shape.type === 'polygon') {
    const d: Point = [dx, dy]

    const sorted = shape.points
      .map((point): [Point, number] => [point, dot(point, d)])
      .sort((a, b) => b[1] - a[1])

    return sorted[0][0]
  }
  throw new Error(`Unknown shape type: ${shape}`)
}

export const diff = (p1: Point, p2: Point): Point => {
  return [p1[0] - p2[0], p1[1] - p2[1]]
}

const as3d = (p: Point): Point3d => [p[0], p[1], 0]

const dot = (p1: Point, p2: Point): number => p1[0] * p2[0] + p1[1] * p2[1]

const cross = (v1: Point3d, v2: Point3d): Point3d => {
  return [
    v1[1] * v2[2] - v1[2] * v2[1],
    v1[2] * v2[0] - v1[0] * v2[2],
    v1[0] * v2[1] - v1[1] * v2[0],
  ]
}

const tripleProduct = (p1: Point, p2: Point, p3: Point): Point => {
  const result = cross(cross(as3d(p1), as3d(p2)), as3d(p3))
  return [result[0], result[1]]
}

//returns false if it failed
const addSupport = (
  shapeA: Shape,
  shapeB: Shape,
  vertices: Point[],
  direction: Point,
): boolean => {
  const newVertex: Point = diff(
    support(shapeA, direction),
    support(shapeB, diff([0, 0], direction)),
  )
  vertices.push(newVertex)
  return dot(direction, newVertex) >= 0
}

const evolveSimplex = (
  shapeA: Shape,
  shapeB: Shape,
  vertices: Point[],
): boolean | null => {
  let direction: Point = [0, 0]
  switch (vertices.length) {
    case 0:
      {
        direction = diff(centre(shapeB), centre(shapeA))
      }
      break
    case 1:
      {
        // flip the direction
        direction = diff([0, 0], direction)
      }
      break
    case 2:
      {
        const b = vertices[1]
        const c = vertices[0]

        // line cb is the line formed by the first two vertices
        const cb = diff(b, c)

        // use the triple-cross-product to calculate a direction perpendicular to line cb
        // in the direction of the origin
        direction = tripleProduct(cb, diff([0, 0], c), cb)
      }
      break
    case 3:
      {
        // calculate if the simplex contains the origin
        const a = vertices[2]
        const b = vertices[1]
        const c = vertices[0]

        const a0 = diff([0, 0], a) // v2 to the origin
        const ab = diff(b, a) // v2 to v1
        const ac = diff(c, a) // v2 to v0

        const abPerp = tripleProduct(ac, ab, ab)
        const acPerp = tripleProduct(ab, ac, ac)

        if (dot(abPerp, a0) > 0) {
          // the origin is outside line ab
          // get rid of c and add a new support in the direction of abPerp
          const index = vertices.indexOf(c)
          if (index !== -1) vertices.splice(index, 1)
          direction = abPerp
        } else if (dot(acPerp, a0) > 0) {
          // the origin is outside line ac
          // get rid of b and add a new support in the direction of acPerp
          const index = vertices.indexOf(b)
          if (index !== -1) vertices.splice(index, 1)
          direction = acPerp
        } else {
          // the origin is inside both ab and ac,
          // so it must be inside the triangle!
          return true
        }
      }
      break

    default:
      throw "Can't have simplex with ${vertices.length} verts!"
  }

  const successful = addSupport(shapeA, shapeB, vertices, direction)

  if (!successful) {
    return false
  } else {
    return null
  }
}

export const overlaps = (shapeA: Shape, shapeB: Shape): boolean => {
  const vertices: Point[] = [] // this is mutated by evolveSimplex and its subfunctions

  // do the actual test
  let result: boolean | null = null
  while (result === null) {
    result = evolveSimplex(shapeA, shapeB, vertices)
  }

  return result
}

export const shapeInBoard = (shape: Shape) =>
  pointInBoard(support(shape, [-1, -1])) &&
  pointInBoard(support(shape, [1, -1])) &&
  pointInBoard(support(shape, [-1, 1])) &&
  pointInBoard(support(shape, [1, 1]))

const pointInBoard = ([x, y]: Point): boolean =>
  Math.abs(y - H / 2) < Math.min(x, W - x)
