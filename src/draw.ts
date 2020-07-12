/**
 * Draw game state based on current state
 */

import { State, Disc, Level } from './state'
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
  const [vx, vy] = multiply(calculateWindVector(windState, frame), 60)

  const animationLength = 200
  const index = frame % animationLength
  const t = Math.max(0, index / animationLength - 0.2)

  let seed = index
  const random = (): number => {
    const r = Math.sin(seed++) * 10000
    return Math.abs(r - Math.floor(r))
  }

  for (let i = 0; i < 30; i++) {
    const x = random() * W
    const y = random() * H
    let myT = t + i / 30
    if (myT > 1) {
      myT = 0
    }

    const goal: Vec2 = [x + vx, y + vy]

    const alpha = 2 * Math.min(Math.abs(myT), Math.abs(1 - myT))
    context.strokeStyle = 'rgba(255, 255, 255, ' + alpha + ')'
    context.lineCap = 'round'
    context.lineWidth = magnitude([vx, vy]) / 10
    context.beginPath()
    const [fx, fy] = lerp([x, y], goal, myT / 2)
    context.moveTo(fx, fy)
    const [tx, ty] = lerp([x, y], goal, myT)
    context.lineTo(tx, ty)
    context.stroke()
  }

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
    if (state.levels[state.levels.length - 1].wonAt !== null) {
      context.fillText('You won the game', W / 2, 100, W)
    } else {
      context.fillText('Click to go to next level', W / 2, 100, W)
    }

    const score = state.levels
      .filter((a) => a.wonAt !== null)
      .map((a) => a.nrShots - a.par)
      .reduce((a, b) => a + b, 0)

    const fn = (str: string) => {
      context.fillText(str, W / 2, 200, W)
    }

    if (score > 0) {
      fn(score + ' over par')
    } else if (score === 0) {
      fn(score + ' over/under par')
    } else {
      fn(-score + ' under par')
    }
  }

  context.restore()
}

const drawWinCondition = (ctx: CanvasRenderingContext2D, state: State) => {
  const level = state.levels[state.currentLevel] as Level | undefined
  if (!level) return
  const wonAt = level?.wonAt
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
          center: level.basket.center,
          radius: level.basket.radius + (1 - t) * (i / numberOfRings) * 300,
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
    ctx.restore()
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
  const level = state.levels[state.currentLevel]
  context.save()
  const travel = level.disc.travel
  if (
    (level.wonAt !== null && state.frame - level.wonAt < RING_ANIMATION_TIME) ||
    (state.frame - level.disc.travelStart < 8 &&
      travel.length > 2 &&
      magnitude(aToB(travel[0], travel[1])) > 10)
  ) {
    context.translate(Math.random() * 5, Math.random() * 5)
  }
  drawBackground(context)

  drawTopBasket(context, level.basket)
  drawShot(
    context,
    level.disc,
    state.lastTravel,
    state.lastTravelAt,
    state.frame,
  )
  drawDisc(context, level.disc)
  drawBottomBasket(context, level.basket)

  context.fillStyle = '#182'
  level.trees.forEach((t) => {
    drawShape(context, t, 'fill')
  })

  drawWindIndicator(context, level.wind, state.frame)

  drawWinCondition(context, state)
  context.restore()
}
