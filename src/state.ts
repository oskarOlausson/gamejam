/**
 * Model for the game
 */


import {W, H} from "./constants";
import {Rect, Shape} from "./gjk";

type Gem = Shape & {
  seen: boolean
}

export type State = {
  keys: Set<string>,
  player: Rect,
  gems: Gem[]
}

export const init = (): State => ({
  keys: new Set(),
  player: {
    type: "rect",
    x: W/2, 
    y: H/2,
    w: 20, 
    h: 20
  },
  gems: [
    {
      type: "circle",
      x: W/2,
      y: 50, 
      radius: 30,
      seen: false
    },
    {
      type: "polygon",
      points: [
        [0, 0], 
        [40, 20],
        [0, 20]
      ].map(([x, y]) => [x + W/2 - 10, y + H - 60]),
      seen: false
    }
  ]
});