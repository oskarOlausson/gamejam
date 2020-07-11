/**
 * Draw game state based on current state
 */

import { State } from './state'
import { Shape, centre, support, borders, diff } from './gjk'
import { W, H, SEE_RADIUS, BACKGROUND_COLOR } from './constants'

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

const drawPoint = (context: CanvasRenderingContext2D, [x, y]: [number, number]): void => {
  context.save()
  context.fillStyle = "#0ff"
  context.fillRect(x-2, y-2, 4, 4)
  context.restore()
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
export const draw = (
  context: CanvasRenderingContext2D,
  fowContext: CanvasRenderingContext2D,
  state: State,
): void => {
  context.strokeStyle = '#fff'

  context.fillStyle = '#0f0'
  drawShape(context, ground, 'fill')

  context.fillStyle = '#ff0'
  state.gems.forEach((gem) => {
    drawShape(context, gem, 'fill')
  })

  context.fillStyle = '#fff'
  drawShape(context, state.player, 'fill')

  drawPoint(context, support(state.player, [-1, -1]))
  drawPoint(context, support(state.player, [1, -1]))
  drawPoint(context, support(state.player, [-1, 1]))
  drawPoint(context, support(state.player, [1, 1]))

  fowContext.save()
  fowContext.fillStyle = BACKGROUND_COLOR
  fowContext.fillRect(0, 0, W, H)

  fowContext.fillStyle = '#111'
  drawShape(fowContext, ground, 'fill')

  fowContext.globalCompositeOperation = 'destination-out'

  drawShape(
    fowContext,
    {
      type: 'circle',
      x: centre(state.player)[0],
      y: centre(state.player)[1],
      radius: SEE_RADIUS,
    },
    'fill',
  )

  state.gems
    .filter((gem) => gem.seen)
    .forEach((gem) => {
      const [x, y] = centre(gem)
      drawShape(
        fowContext,
        {
          type: 'circle',
          x,
          y,
          radius: SEE_RADIUS,
        },
        'fill',
      )
    })

  fowContext.restore()
}
