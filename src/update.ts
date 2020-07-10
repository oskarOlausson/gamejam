/**
 * All the game logic
 */


import {State, init} from "./state";
import {overlaps, Rect} from "./gjk";
import {W, H} from "./contants";

const atPos = (shape: Rect, x: number, y: number): Rect => ({...shape, x, y});

export const update = (state: State): State => {
  const speed = 5;

  const x = (state.player.x + (state.keys.has("a") ? -speed : 0) + (state.keys.has("d") ? speed : 0) + W) % W;
  const y = (state.player.y + (state.keys.has("w") ? -speed : 0) + (state.keys.has("s") ? speed : 0) + H) % H;

  if (state.keys.has("r")) {
    return init();
  }

  return {
    ...state,
    player: atPos(state.player, x, y),
    gems: state.gems.filter((gem) => !overlaps(gem, state.player))
  };
}