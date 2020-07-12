/**
 * Draw game state based on current state
 */

import { State, Disc } from './state'
import {
  Circle,
  Vec2,
  perpClockWise,
  perpCounterClockWise,
  multiply,
  lerp,
  aToB,
  add,
  distanceSquared,
} from './gjk'
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

const drawWinCondition = (ctx: CanvasRenderingContext2D) => {
  ctx.save()
  ctx.font = '30px Comic Sans MS'
  ctx.fillStyle = '#FFC0CB'
  ctx.fillText('You did win, congrats.', 40, 200)
  ctx.save()
}

const drawShot = (
  ctx: CanvasRenderingContext2D,
  disc: Disc,
  shot: Vec2[],
  shotAt: number,
  frame: number,
) => {
  if (shot.length < 2) {
    return
  }
  ctx.save()

  const alpha = Math.max(0, 1.3 - (frame - shotAt) / 60)

  ctx.beginPath()

  const start = shot[0]
  const end = shot[shot.length - 1]
  const nEnd = shot[shot.length - 2]

  if (Math.sqrt(distanceSquared(start, end)) < 120) {
    return
  }

  const lastDirection = aToB(nEnd, end)

  const left = multiply(perpCounterClockWise(lastDirection), disc.radius)
  const right = multiply(perpClockWise(lastDirection), disc.radius)

  const gradient = ctx.createLinearGradient(start[0], start[1], end[0], end[1])
  gradient.addColorStop(0, 'rgba(245, 233, 99,' + alpha + ')')
  gradient.addColorStop(1, 'rgba(216, 30, 91, ' + alpha + ')')

  ctx.fillStyle = gradient

  ctx.moveTo(start[0], start[1])

  const nrPoints = shot.length

  shot.slice(1).forEach((pos, i) => {
    const [x, y] = add(pos, lerp([0, 0], left, i / nrPoints))
    ctx.lineTo(x, y)
  })

  shot
    .slice(1)
    .reverse()
    .forEach((pos, i) => {
      const [x, y] = add(pos, lerp([0, 0], right, 1 - i / nrPoints))
      ctx.lineTo(x, y)
    })

  ctx.lineTo(start[0], start[1])

  ctx.fill()
  ctx.restore()
}

// Screen is cleared before this function is called so this functions only concern is drawing the new state
export const draw = (context: CanvasRenderingContext2D, state: State): void => {
  drawBackground(context)

  drawTopBasket(context, state.level.basket)
  drawShot(
    context,
    state.level.disc,
    state.lastTravel,
    state.lastTravelAt,
    state.frame,
  )
  drawDisc(context, state.level.disc)
  drawBottomBasket(context, state.level.basket)
  drawWindIndicator(context, state.level.wind, state.frame)

  if (state.level.youHaveWon) drawWinCondition(context)

  context.fillStyle = '#182'
  state.level.trees.forEach((t) => {
    drawShape(context, t, 'fill')
  })
}
