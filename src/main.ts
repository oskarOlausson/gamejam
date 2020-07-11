/*
  We do all the mutability stuff here so we do not have to do it in our game code, so all interop with
  js events and stuff happens here.
*/

import { init, State } from './state'
import { update } from './update'
import { draw } from './draw'
import { W, H, BACKGROUND_COLOR } from './constants'

const prepareCanvas = (id: string): CanvasRenderingContext2D => {
  const canvas = document.getElementById(id) as HTMLCanvasElement
  if (!canvas) {
    window.alert('No canvas found')
  }
  canvas.width = W
  canvas.height = H
  return canvas.getContext('2d')
}

const game = (): void => {
  document.body.style.backgroundColor = BACKGROUND_COLOR
  const container = document.getElementById('wrapper')
  container.style.width = W + 'px'
  container.style.height = H + 'px'

  const context = prepareCanvas('canvas')
  const fowContext = prepareCanvas('fow')

  // key to timestamp
  const allKeys = new Map<string, boolean>()

  function onKeyDown(this: Window, ev: KeyboardEvent) {
    allKeys.set(ev.key, true)
  }

  function onKeyUp(this: Window, ev: KeyboardEvent) {
    allKeys.set(ev.key, false)
  }

  window.addEventListener('keydown', onKeyDown)
  window.addEventListener('keyup', onKeyUp)

  // actual loop, uses request animation frame to run 60fps
  const loop = (state: State) => () => {
    const currentKeys = new Set<string>()
    allKeys.forEach((isDown, key) => {
      if (isDown) {
        currentKeys.add(key)
      }
    })

    const newState = update({ ...state, keys: currentKeys })

    context.clearRect(0, 0, W, H)
    fowContext.clearRect(0, 0, W, H)
    draw(context, fowContext, state)

    window.requestAnimationFrame(
      loop({ ...newState, frame: newState.frame + 1 }),
    )
  }

  window.requestAnimationFrame(loop(init()))
}

game()
