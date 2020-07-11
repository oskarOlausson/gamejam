/**
 * All the game logic
 */

import { State, init } from './state'
import { overlaps, Rect, centre, Circle, Polygon, shapeInBoard } from './gjk'
import { W, H, SEE_RADIUS } from './constants'

const atPos = (shape: Circle, x: number, y: number): Circle => ({ ...shape, x, y })

const updatePlayer = (player: Circle, dx: number, dy: number): Circle => {
  const playerDx = atPos(player, player.x + dx, player.y)
  const playerDy = atPos(player, player.x, player.y + dy)
  const playerDelta = atPos(player, player.x + dx, player.y + dy)

  return [playerDelta, playerDx, playerDy].find((p) => shapeInBoard(p)) || player
}

export const update = (state: State): State => {
  const speed = 5

  const dx =
    (state.keys.has('a') ? -speed : 0) + (state.keys.has('d') ? speed : 0)
  const dy =
    (state.keys.has('w') ? -speed : 0) + (state.keys.has('s') ? speed : 0)

  if (state.keys.has('r')) {
    return init()
  }

  const playerSees: Circle = {
    type: 'circle',
    x: state.player.x,
    y: state.player.y,
    radius: SEE_RADIUS,
  }

  return {
    ...state,
    player: updatePlayer(state.player, dx, dy),
    gems: state.gems
      .filter((gem) => !overlaps(gem, state.player))
      .map((gem) => ({ ...gem, seen: gem.seen || overlaps(gem, playerSees) })),
  }
}
