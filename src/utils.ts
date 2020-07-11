export const getMousePositionInElement = (
  canvas: Element,
  event: MouseEvent,
) => {
  const rect = canvas.getBoundingClientRect()
  const x = event.clientX - rect.left
  const y = event.clientY - rect.top
  return [x, y] as [number, number]
}
