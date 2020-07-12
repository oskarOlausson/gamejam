/*
  We do all the mutability stuff here so we do not have to do it in our game code, so all interop with
  js events and stuff happens here.
*/

import { init, State } from './state'
import { update } from './update'
import { draw } from './draw'
import { W, H, BACKGROUND_COLOR } from './constants'
import { getMousePositionInElement } from './utils'
import { Vec2 } from './gjk'

const game = (): void => {
  document.body.style.backgroundColor = BACKGROUND_COLOR
  const container = document.getElementById('wrapper')
  if (!container) {
    throw new Error('Could not find wrapper')
  }
  container.style.width = W + 'px'
  container.style.height = H + 'px'

  const canvas = document.getElementById('canvas') as HTMLCanvasElement
  if (!canvas) {
    throw new Error('No canvas found')
  }
  canvas.width = W
  canvas.height = H
  const context = canvas.getContext('2d') as CanvasRenderingContext2D

  // key to timestamp
  const allKeys = new Map<string, boolean>()

  function onKeyDown(this: Window, ev: KeyboardEvent) {
    allKeys.set(ev.key, true)
  }

  function onKeyUp(this: Window, ev: KeyboardEvent) {
    allKeys.set(ev.key, false)
  }

  const ms: Vec2[] = []
  let mouseIsDown = false
  let clicked = false

  function onMouseDown(this: Window) {
    mouseIsDown = true
  }

  function onMouseMove(this: Window, ev: MouseEvent) {
    if (mouseIsDown) {
      ms.push(getMousePositionInElement(canvas, ev))
    }
  }

  function onTouchMove(this: Window, ev: TouchEvent) {
    if (mouseIsDown) {
      const touch = ev.touches.item(0)
      if (touch) {
        ms.push(getMousePositionInElement(canvas, touch))
      }
    }
  }

  function onMouseUp(this: Window) {
    mouseIsDown = false
    clicked = true
  }

  window.addEventListener('keydown', onKeyDown)
  window.addEventListener('keyup', onKeyUp)
  window.addEventListener('mousedown', onMouseDown)
  window.addEventListener('mouseup', onMouseUp)
  window.addEventListener('mouseout', onMouseUp)
  window.addEventListener('mousemove', onMouseMove)

  window.addEventListener('touchstart', onMouseDown)
  window.addEventListener('touchmove', onTouchMove)
  window.addEventListener('touchend', onMouseUp)

  // actual loop, uses request animation frame to run 60fps
  const loop = (state: State) => () => {
    const currentKeys = new Set<string>()
    allKeys.forEach((isDown, key) => {
      if (isDown) {
        currentKeys.add(key)
      }
    })

    const shootNow = !mouseIsDown && ms.length > 0

    const newState = update({
      ...state,
      keys: currentKeys,
      mouse: [...ms],
      shootNow,
      clicked,
    })

    if (shootNow) {
      while (ms.length > 0) {
        ms.pop()
      }
    }

    clicked = false

    context.clearRect(0, 0, W, H)
    draw(context, state)

    window.requestAnimationFrame(
      loop({ ...newState, frame: newState.frame + 1 }),
    )
  }

  window.requestAnimationFrame(loop(init()))
}

game()
