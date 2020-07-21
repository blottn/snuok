import { Ticker } from './ticker.js';
import { WrappedSnuok } from './snuok.js';
import { Vector } from './vector.js';
import { World } from './world.js';
import { SlideFilter } from './filter.js';

const MAP_WIDTH = 20;
const MAP_HEIGHT = 20;
const BLOCK = 24;
const WIDTH = MAP_WIDTH * BLOCK;
const HEIGHT = MAP_HEIGHT * BLOCK;

let worldConfig = {MAP_WIDTH, MAP_HEIGHT, BLOCK};

PIXI.settings.WRAP_MODE = PIXI.WRAP_MODES.REPEAT;

let app = new PIXI.Application({
    width: WIDTH,
    height: HEIGHT,
    antialias: true,
    transparent: false,
    resolution: 1,
});

app.renderer.backgroundColor = "0xf4f4f4";
app.stage.sortableChildren = true;

$(document).ready(() => {
    $("#root-center")[0].appendChild(app.view);
    let typingElement = $("#ghost-anchor")[0]
    window.ghostTyper = new Ghost(typingElement);
    let scoreElement = $("#score")[0];
    window.scoreTicker = new Ticker(scoreElement);
})


// load sprites!
PIXI.loader
  .add([
      "apple.png",
	  "wall.png",
	  "snuok_body.png",
	  "snuok_head_pink.png",
	  "snuok_head_orange.png",
  ])
  .load(setup);

function setup() {
    let len = 18;
    let lerp_time = 13;
    /*let instructions = [
        'up',
        'wait',
        'wait',
        'left',
        'down',
        'wait',
        'wait',
        'right'
    ];*/
    let snuok = new WrappedSnuok(app.stage, worldConfig, new Vector(18,0), len, lerp_time);
	snuok.bindKeys({
	    'w': snuok.UP,
	    's': snuok.DOWN,
	    'a': snuok.LEFT,
	    'd': snuok.RIGHT,
        37 : snuok.LEFT,
        38 : snuok.UP,
        39 : snuok.RIGHT,
        40 : snuok.DOWN,
	})

	let world = new World(app.stage, worldConfig, snuok);
	app.ticker.add(step.bind({}, world))
}

function step(world, delta) {
    world.draw(delta);
}


