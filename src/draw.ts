/**
 * Draw game state based on current state
 */

import { State } from './state'
import { Shape, centre, borders } from './gjk'
import { W, H, SEE_RADIUS, BACKGROUND_COLOR } from './constants'
import { calculateSightRadius } from './tower'

const drawShape = (
  context: CanvasRenderingContext2D,
  shape: Shape,
  style: 'fill' | 'stroke',
): void => {
  context.beginPath()

  if (shape.type === 'circle') {
    context.ellipse(
      shape.x,
      shape.y,
      shape.radius,
      shape.radius,
      0,
      0,
      2 * Math.PI,
      false,
    )
  } else if (shape.type === 'rect') {
    context.rect(shape.x, shape.y, shape.w, shape.h)
  } else if (shape.type === 'polygon') {
    context.moveTo(shape.points[0][0], shape.points[0][1])
    for (let i = 1; i < shape.points.length; i++) {
      context.lineTo(shape.points[i][0], shape.points[i][1])
    }
    context.lineTo(shape.points[0][0], shape.points[0][1])
  }

  if (style === 'fill') {
    context.fill()
  } else {
    context.stroke()
  }
}

const ground: Shape = {
  type: 'polygon',
  points: [
    [W / 2, 0],
    [W, H / 2],
    [W / 2, H],
    [0, H / 2],
  ],
}

// Screen is cleared before this function is called so this functions only concern is drawing the new state
export const draw = (context: CanvasRenderingContext2D, state: State): void => {
  context.strokeStyle = '#fff'

  context.fillStyle = '#7FD8BE'
  drawShape(context, ground, 'fill')

  state.towers
    .sort((a, b) => a.birthFrame - b.birthFrame)
    .forEach((tower) => {
      context.fillStyle = tower.p1 ? '#FCAB64' : '#3083DC'
      drawShape(context, calculateSightRadius(state.frame, tower), 'fill')
    })

  state.towers.forEach((tower) => {
    context.fillStyle = tower.p1 ? '#FFF' : '#404'
    drawShape(context, tower, 'fill')
  })

  context.fillStyle = BACKGROUND_COLOR
  borders.forEach((b) => drawShape(context, b, 'fill'))
}
