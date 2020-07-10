/*
  We do all the mutability stuff here so we do not have to do it in our game code, so all interop with
  js events and stuff happens here.
*/


import { init } from "./state";
import {update} from "./update";
import {draw} from "./draw";
import {W, H} from "./contants";


const game = (): void => {
  const canvas = document.getElementById("canvas") as HTMLCanvasElement;
  if (!canvas) {
    window.alert("No canvas found");
  }
  canvas.width = W;
  canvas.height = H;
  const context = canvas.getContext("2d");
  
  // key to timestamp
  const allKeys = new Map<string, boolean>();
  
  function onKeyDown(this: Window, ev: KeyboardEvent) {
    allKeys.set(ev.key, true);
  }

  function onKeyUp(this: Window, ev: KeyboardEvent) {
    allKeys.set(ev.key, false);
  }
  
  window.addEventListener("keydown", onKeyDown);
  window.addEventListener("keyup", onKeyUp);

  let lastTime = 0;
  let state = init();
  
  // actual loop, uses request animation frame to run 60fps
  function loop() {
    const currentKeys = new Set<string>();
    allKeys.forEach((isDown, key) => {
        if (isDown) {
          currentKeys.add(key);
        }
    });

    lastTime = new Date().getTime();
  
    state = update({...state, keys: currentKeys});

    // doing some clean up work to make the draw function more stateless
    context.fillStyle = "#000";
    context.strokeStyle = "#000";
    context.save(),
    context.fillRect(0, 0, W, H);
    draw(context, {...state});
    context.restore();

    window.requestAnimationFrame(loop);
  }
  
  window.requestAnimationFrame(loop);
}


game();