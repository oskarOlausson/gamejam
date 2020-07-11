/*
  We do all the mutability stuff here so we do not have to do it in our game code, so all interop with
  js events and stuff happens here.
*/

import { init, State } from './state'
import { update } from './update'
import { draw } from './draw'
import { W, H, BACKGROUND_COLOR } from './constants'
import { getMousePositionInElement } from './utils'

const prepareCanvas = (id: string): CanvasRenderingContext2D => {
  const canvas = document.getElementById(id) as HTMLCanvasElement
  if (!canvas) {
    throw new Error('No canvas found')
  }
  canvas.width = W
  canvas.height = H
  const context = canvas.getContext('2d')
  if (!context) throw new Error(`No rendering context for canvas #${id}`)
  return context
}

const game = (): void => {
  document.body.style.backgroundColor = BACKGROUND_COLOR
  const container = document.getElementById('wrapper')
  if (!container) {
    throw new Error('Could not find wrapper')
  }
  container.style.width = W + 'px'
  container.style.height = H + 'px'
  let queuedClick: [number, number] | null = null

  const getQueuedClick = () => {
    const bufferedClick = queuedClick
    queuedClick = null
    return bufferedClick
  }

  const context = prepareCanvas('canvas')

  // key to timestamp
  const allKeys = new Map<string, boolean>()

  function onKeyDown(this: Window, ev: KeyboardEvent) {
    allKeys.set(ev.key, true)
  }

  function onKeyUp(this: Window, ev: KeyboardEvent) {
    allKeys.set(ev.key, false)
  }

  function onClick(this: Window, event: MouseEvent) {
    const canvas = document.querySelector('#canvas')
    if (!canvas) {
      throw new Error(`Couldn't find canvas element.`)
    }
    queuedClick = getMousePositionInElement(canvas, event)
  }

  window.addEventListener('keydown', onKeyDown)
  window.addEventListener('keyup', onKeyUp)
  window.addEventListener('click', onClick)

  // actual loop, uses request animation frame to run 60fps
  const loop = (state: State) => () => {
    const currentKeys = new Set<string>()
    allKeys.forEach((isDown, key) => {
      if (isDown) {
        currentKeys.add(key)
      }
    })

    const click = getQueuedClick()

    const newState = update({
      ...state,
      keys: currentKeys,
      click,
    })

    context.clearRect(0, 0, W, H)
    draw(context, state)

    window.requestAnimationFrame(
      loop({ ...newState, frame: newState.frame + 1 }),
    )
  }

  window.requestAnimationFrame(loop(init()))
}

game()
