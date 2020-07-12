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
  magnitude,
} from './gjk'
import { WindState } from './wind'
import { calculateWindVector } from './update'
import { Basket } from './basket'
import {
  RING_ANIMATION_TIME,
  MENU_ANIMATION_TIME,
  W,
  BACKGROUND_COLOR,
  H,
} from './constants'

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
  const ptrn = context.createPattern(backgroundImg, 'repeat') // Create a pattern with this image, and set it to "repeat".
  if (ptrn) context.fillStyle = ptrn
  context.fillRect(0, 0, W, H) // context.fillRect(x, y, width, height);
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
  const center: Vec2 = [0, 0]
  const discColor = '#3498DB'
  const discColorDark = '#2471A3'

  ctx.save()

  ctx.translate(disc.center[0], disc.center[1])

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

const drawMenu = (
  context: CanvasRenderingContext2D,
  state: State,
  timeSinceOpen: number,
): void => {
  const size = 20
  context.save()
  context.fillStyle = BACKGROUND_COLOR

  for (let x = size / 2; x < W; x += size) {
    for (let y = size / 2; y < H; y += size) {
      const t = Math.max(
        0,
        (timeSinceOpen - x / size - y / size) / MENU_ANIMATION_TIME,
      )

      const off = (size * t) / 2
      const currentSize = size * t

      context.fillRect(x - off, y - off, currentSize, currentSize)
    }
  }

  if (timeSinceOpen > MENU_ANIMATION_TIME) {
    context.fillStyle = '#fff'
    context.textAlign = 'center'
    context.font = '30px Comic Sans MS'
    context.fillStyle = '#FFC0CB'
    context.fillText('Click to go to next level', W / 2, 100, W)
    context.fillText('5 over par', W / 2, 200, W)
  }

  context.restore()
}

const drawWinCondition = (ctx: CanvasRenderingContext2D, state: State) => {
  const wonAt = state.level.wonAt
  if (wonAt === null) {
    return
  }

  ctx.save()

  if (state.frame - wonAt < RING_ANIMATION_TIME) {
    const t = Math.max(0, 1 - (state.frame - wonAt) / RING_ANIMATION_TIME)

    ctx.strokeStyle = 'rgba(255, 255, 255, ' + t + ')'

    const numberOfRings = 10

    for (let i = 1; i <= numberOfRings; i++) {
      drawShape(
        ctx,
        {
          center: state.level.basket.center,
          radius:
            state.level.basket.radius + (1 - t) * (i / numberOfRings) * 300,
        },
        'stroke',
      )
    }
  } else if (state.frame - RING_ANIMATION_TIME - wonAt > 0) {
    drawMenu(ctx, state, state.frame - RING_ANIMATION_TIME - wonAt)
  }

  ctx.restore()
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
  context.save()
  const travel = state.level.disc.travel
  if (
    (state.level.wonAt !== null &&
      state.frame - state.level.wonAt < RING_ANIMATION_TIME) ||
    (state.frame - state.level.disc.travelStart < 8 &&
      travel.length > 2 &&
      magnitude(aToB(travel[0], travel[1])) > 10)
  ) {
    context.translate(Math.random() * 5, Math.random() * 5)
  }
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

  context.fillStyle = '#182'
  state.level.trees.forEach((t) => {
    drawShape(context, t, 'fill')
  })

  drawWinCondition(context, state)
  context.restore()
}
