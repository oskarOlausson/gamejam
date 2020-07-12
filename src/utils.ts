import { Vec2 } from './gjk'

export const getMousePositionInElement = (
  canvas: Element,
  event: { clientX: number; clientY: number },
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

export const minInList = <T>(xs: T[], minFn: (x: T) => number): T => {
  if (xs.length === 0) {
    throw Error('No path, can´t give you max')
  }
  let currentMaxItem = xs[0]
  let currentMax = minFn(currentMaxItem)

  for (let i = 1; i < xs.length; i++) {
    const newMax = minFn(xs[i])
    if (newMax < currentMax) {
      currentMaxItem = xs[i]
      currentMax = minFn(xs[i])
    }
  }

  return currentMaxItem
}
