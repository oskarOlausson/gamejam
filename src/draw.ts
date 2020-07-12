/**
 * Draw game state based on current state
 */

import { State, Disc } from './state'
import { W, H } from './constants'
import { Circle, Vec2, pointLineDistance } from './gjk'
import { WindState } from './wind'
import { calculateWindVector } from './update'

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

const imageUrl = '/assets/images/grass.jpg'
const backgroundImg = document.createElement('img')
backgroundImg.src = imageUrl

const drawBackground = (context: CanvasRenderingContext2D): void => {
  context.save()
  context.drawImage(backgroundImg, 0, 0)
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

const drawWindIndicator = (
  context: CanvasRenderingContext2D,
  windState: WindState,
  frame: number,
) => {
  context.save()
  const [x, y] = calculateWindVector(windState, frame, frame - 1)
  const offsetX = 100
  const offsetY = 100
  context.strokeStyle = '5px #000'
  context.beginPath()
  context.moveTo(offsetX, offsetY)
  context.lineTo(offsetX + x * 20, offsetY + y * 20)
  context.stroke()
  context.beginPath()
  context.arc(offsetX, offsetY, 20, 0, 2 * Math.PI)
  context.stroke()
  context.restore()
}

const drawDisc = (ctx: CanvasRenderingContext2D, disc: Disc) => {
  const center = disc.center
  const discColor = '#3498DB'
  const discColorDark = '#2471A3'

  ctx.save()

  const outerDisc: Circle = { center, radius: disc.radius }
  const innerDisc: Circle = { center, radius: disc.radius * 0.7 }
  const innermostDisc: Circle = { center, radius: disc.radius * 0.6 }

  ctx.fillStyle = discColor
  drawShape(ctx, outerDisc, 'fill')
  ctx.fillStyle = discColorDark
  drawShape(ctx, innerDisc, 'fill')
  ctx.fillStyle = discColor
  drawShape(ctx, innermostDisc, 'fill')

  ctx.restore()
}

// Screen is cleared before this function is called so this functions only concern is drawing the new state
export const draw = (context: CanvasRenderingContext2D, state: State): void => {
  drawBackground(context)

  drawDisc(context, state.disc)
  drawWindIndicator(context, state.wind, state.frame)

  state.shot.forEach((s) => drawDot(context, s))

  context.fillStyle = '#182'
  state.trees.forEach((t) => {
    drawShape(context, t, 'fill')
  })
}
