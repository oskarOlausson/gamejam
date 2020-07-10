/**
 * Model for the game
 */


import {W, H} from "./contants";
import {Rect, Shape} from "./gjk";

export type State = {
  keys: Set<string>,
  player: Rect,
  gems: Shape[]
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
      x: 30,
      y: 30, 
      radius: 30
    },
    {
      type: "polygon",
      points: [
        [400, 400], 
        [410, 420],
        [300, 403]
      ]
    }
  ]
});