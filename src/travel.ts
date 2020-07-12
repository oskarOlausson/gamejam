import { Vec2, add, multiply, distanceSquared } from './gjk'

function pointLineDistanceSquared(p: Vec2, v: Vec2, w: Vec2) {
  const l2 = distanceSquared(v, w)
  if (l2 == 0) return distanceSquared(p, v)
  const t = ((p[0] - v[0]) * (w[0] - v[0]) + (p[1] - v[1]) * (w[1] - v[1])) / l2
  const nt = Math.max(0, Math.min(1, t))
  return distanceSquared(p, [
    v[0] + nt * (w[0] - v[0]),
    v[0] + nt * (w[1] - v[1]),
  ])
}

export const getShot = (mouse: Vec2[]): [Vec2, Vec2] => {
  const v = mouse[0]
  const w = mouse[mouse.length - 1]

  const m = mouse
    .map((p): [Vec2, number] => [p, pointLineDistanceSquared(p, v, w)])
    .sort((a, b) => b[1] - a[1])[0][0]

  return [m, w]
}

export const bezier = (start: Vec2, middle: Vec2, end: Vec2, t: number): Vec2 =>
  add(
    multiply(start, (1 - t) * (1 - t)),
    multiply(middle, 2 * t * (1 - t)),
    multiply(end, t * t),
  )

export const getTravel = (start: Vec2, middle: Vec2, end: Vec2): Vec2[] => {
  const indices: number[] = []

  for (
    let i = 0;
    i < 1;
    i += 1 / (0.2 * Math.sqrt(distanceSquared(start, end)))
  ) {
    indices.push(Math.pow(i, 0.6))
  }

  indices.push(1)

  return indices
    .map((i) => i / indices[indices.length - 1])
    .map((i) => bezier(start, middle, end, i))
}
