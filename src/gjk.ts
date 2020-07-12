import { W, H } from './constants'

export type Vec2 = [number, number]
export type Circle = {
  center: Vec2
  radius: number
}

export const lerp = ([x, y]: Vec2, [x2, y2]: Vec2, t: number): Vec2 => {
  return [x * (1 - t) + x2 * t, y * (1 - t) + y2 * t]
}

export const aToB = (a: Vec2, b: Vec2): Vec2 => [b[0] - a[0], b[1] - a[1]]

export const minus = (a: Vec2, b: Vec2): Vec2 => [a[0] - b[0], a[1] - b[1]]

export const distanceSquared = ([x, y]: Vec2, [ox, oy]: Vec2): number =>
  (ox - x) * (ox - x) + (oy - y) * (oy - y)

export const overlap = (c0: Circle, c1: Circle): boolean =>
  Math.sqrt(distanceSquared(c0.center, c1.center)) < c0.radius + c1.radius

export const normalize = ([x, y]: Vec2): Vec2 => {
  const magnitude = Math.pow(x * x + y * y, 0.5)
  if (magnitude === 0) {
    throw Error('Vector was [0, 0], cannot normalize')
  }
  return [x / magnitude, y / magnitude]
}

export const dot = ([ax, ay]: Vec2, [bx, by]: Vec2): number => ax * bx + ay * by

export const add = (...ps: Vec2[]): Vec2 =>
  ps.reduce(([ax, ay], [bx, by]) => [ax + bx, ay + by])

export const getReflection = (from: Vec2, to: Vec2, other: Circle): Vec2 => {
  const closest: Vec2 = closestPointToLine(other.center, from, to)

  const normal = normalize(aToB(other.center, closest))
  const velocity = minus([0, 0], aToB(from, to))

  const scalar = (2 * dot(velocity, normal)) / dot(normal, normal)

  return minus(multiply(normal, scalar), velocity)
}

export const perpClockWise = ([dx, dy]: Vec2): Vec2 => normalize([-dy, dx])

export const perpCounterClockWise = ([dx, dy]: Vec2): Vec2 =>
  normalize([dy, -dx])

export const multiply = ([x, y]: Vec2, scalar: number): Vec2 => [
  x * scalar,
  y * scalar,
]

export const closestPointToLine = (p: Vec2, v: Vec2, w: Vec2): Vec2 => {
  const l2 = distanceSquared(v, w)
  if (l2 === 0) return v
  const t = Math.max(
    0,
    Math.min(
      1,
      ((p[0] - v[0]) * (w[0] - v[0]) + (p[1] - v[1]) * (w[1] - v[1])) / l2,
    ),
  )
  return [v[0] + t * (w[0] - v[0]), v[1] + t * (w[1] - v[1])]
}

export const magnitude = (p: Vec2): number =>
  Math.sqrt(distanceSquared([0, 0], p))

export const pointLineDistance = (p: Vec2, v: Vec2, w: Vec2): number =>
  magnitude(aToB(p, closestPointToLine(p, v, w)))

export const outsideBounds = (circle: Circle): boolean => {
  if (circle.center[0] < 0) {
    return true
  }
  if (circle.center[0] > W) {
    return true
  }
  if (circle.center[1] < 0) {
    return true
  }
  if (circle.center[1] > H) {
    return true
  }

  return false
}
