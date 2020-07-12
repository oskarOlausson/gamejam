/**
 * Draw game state based on current state
 */

import { State, Disc } from './state'
import { Circle, Vec2 } from './gjk'
import { WindState } from './wind'
import { calculateWindVector } from './update'
import { Basket } from './basket'

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
  const [x, y] = calculateWindVector(windState, frame)
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

const drawTopBasket = (ctx: CanvasRenderingContext2D, basket: Basket) => {
  const basketColor = '#212F3C'

  ctx.save()
  ctx.fillStyle = basketColor
  drawShape(ctx, basket, 'fill')

  ctx.restore()
}

const drawBottomBasket = (ctx: CanvasRenderingContext2D, basket: Basket) => {
  const { center, radius } = basket
  const basketColorDark = '#85929E'

  ctx.save()

  ctx.fillStyle = basketColorDark
  drawShape(ctx, { radius: radius * 0.8, center }, 'fill')

  ctx.restore()
}

const drawWinCondition = (ctx: CanvasRenderingContext2D, state: State) => {
  ctx.save()
  ctx.font = '30px Comic Sans MS'
  ctx.fillStyle = '#FFC0CB'
  if (state.level.youHaveWon && state.levels.length > 0) {
    ctx.fillText('You did get it, congrats,', 40, 200)
    ctx.fillText('press ur "n"-key to go to next level.', 40, 250)
  } else if (state.level.youHaveWon && state.levels.length === 0) {
    ctx.fillText('You did win the whole game, congrats...', 40, 200)
    ctx.fillText('Take a break.', 40, 250)
  }
  ctx.save()
}

// Screen is cleared before this function is called so this functions only concern is drawing the new state
export const draw = (context: CanvasRenderingContext2D, state: State): void => {
  drawBackground(context)

  drawTopBasket(context, state.level.basket)
  drawDisc(context, state.level.disc)
  drawBottomBasket(context, state.level.basket)
  drawWindIndicator(context, state.level.wind, state.frame)

  drawWinCondition(context, state)

  context.fillStyle = '#182'
  state.level.trees.forEach((t) => {
    drawShape(context, t, 'fill')
  })
}
