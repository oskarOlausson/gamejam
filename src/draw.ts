/**
 * Draw game state based on current state
 */

import { State } from './state'
import { W, H } from './constants'
import { Circle, Vec2 } from './gjk'

const drawShape = (
  context: CanvasRenderingContext2D,
  shape: Circle,
  style: 'fill' | 'stroke',
): void => {
  if (shape.radius <= 0) {
    return
  }

  context.beginPath()

  context.ellipse(
    shape.center[0],
    shape.center[1],
    shape.radius,
    shape.radius,
    0,
    0,
    2 * Math.PI,
    false,
  )

  if (style === 'fill') {
    context.fill()
  } else {
    context.stroke()
  }
}

const drawBackground = (context: CanvasRenderingContext2D): void => {
  context.save()
  context.fillStyle = '#0e3'

  context.beginPath()

  context.moveTo(0, H / 2)
  context.lineTo(W / 2, 0)
  context.lineTo(W, H / 2)
  context.lineTo(W / 2, H)
  context.lineTo(0, H / 2)

  context.fill()

  context.restore()
}

const drawDot = (context: CanvasRenderingContext2D, [x, y]: Vec2): void => {
  context.save()
  context.beginPath()
  context.fillStyle = '#000'
  context.ellipse(x, y, 2, 2, 0, 0, 2 * Math.PI)
  context.fill()
  context.restore()
}

// Screen is cleared before this function is called so this functions only concern is drawing the new state
export const draw = (context: CanvasRenderingContext2D, state: State): void => {
  drawBackground(context)

  context.fillStyle = '#000'
  drawShape(
    context,
    {
      ...state.disc,
      radius: state.disc.radius,
      center: state.disc.center,
    },
    'fill',
  )

  state.shot.forEach((s) => drawDot(context, s))
}
