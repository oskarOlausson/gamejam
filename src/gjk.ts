export type Vec2 = [number, number]
export type Circle = {
  center: Vec2
  radius: number
}

export const aToB = (a: Vec2, b: Vec2): Vec2 => [b[0] - a[0], b[1] - a[1]]

export const minus = (a: Vec2, b: Vec2): Vec2 => [a[0] - b[0], a[1] - b[1]]

export const distanceSquared = ([x, y]: Vec2, [ox, oy]: Vec2): number =>
  (ox - x) * (ox - x) + (oy - y) * (oy - y)

export const overlap = (c0: Circle, c1: Circle): boolean =>
  distanceSquared(c0.center, c1.center) < c0.radius + c1.radius

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

export const collision = (
  disc: Circle,
  discVelocity: Vec2,
  other: Circle,
): Vec2 => {
  const [nx, ny] = normalize(aToB(other.center, disc.center))
  const scalar = 2 * dot(discVelocity, [nx, ny])
  return aToB([scalar * nx, scalar * ny], discVelocity)
}

export const perpClockWise = ([dx, dy]: Vec2): Vec2 => normalize([-dy, dx])

export const perpCounterClockWise = ([dx, dy]: Vec2): Vec2 =>
  normalize([dy, -dx])

export const multiply = ([x, y]: Vec2, scalar: number): Vec2 => [
  x * scalar,
  y * scalar,
]
