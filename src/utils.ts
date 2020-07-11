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
