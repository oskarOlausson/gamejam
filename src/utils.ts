import { Vec2 } from './gjk'

export const getMousePositionInElement = (
  canvas: Element,
  event: MouseEvent,
): Vec2 => {
  const rect = canvas.getBoundingClientRect()
  const x = event.clientX - rect.left
  const y = event.clientY - rect.top
  return [x, y]
}

export const maxInList = <T>(xs: T[], maxFn: (x: T) => number): T => {
  if (xs.length === 0) {
    throw Error('No path, can´t give you max')
  }
  let currentMaxItem = xs[0]
  let currentMax = maxFn(currentMaxItem)

  for (let i = 1; i < xs.length; i++) {
    const newMax = maxFn(xs[i])
    if (newMax > currentMax) {
      currentMaxItem = xs[i]
      currentMax = maxFn(xs[i])
    }
  }

  return currentMaxItem
}
