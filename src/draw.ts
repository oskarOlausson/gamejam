/**
 * Draw game state based on current state
 */


import {State} from "./state";
import {Shape} from "./gjk";


const drawShape = (context: CanvasRenderingContext2D, shape: Shape, style: "fill" | "stroke"): void => {
  context.beginPath();

  if (shape.type === "circle") {
    context.ellipse(shape.x, shape.y, shape.radius, shape.radius, 0, 0, 2 * Math.PI, false);
  } else if (shape.type === "rect") {
      context.rect(shape.x, shape.y, shape.w, shape.h);
  } else if (shape.type === "polygon") {
    context.moveTo(shape.points[0][0], shape.points[0][1]);
    for (let i = 1; i < shape.points.length; i++) {
      context.lineTo(shape.points[i][0], shape.points[i][1]);
    }
    context.lineTo(shape.points[0][0], shape.points[0][1]);
  }

  if (style === "fill") {
    context.fill();
  } else {
    context.stroke();
  }
}

// Screen is cleared before this function is called so this functions only concern is drawing the new state
export const draw = (context: CanvasRenderingContext2D, state: State): void => {
  context.strokeStyle = "#fff";

  context.fillStyle = "#ff0";
  state.gems.forEach((gem) => {
    drawShape(context, gem, "fill");
  })

  context.fillStyle = "#fff";
  drawShape(context, state.player, "fill");
}