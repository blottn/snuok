const MAP_WIDTH = 20;
const MAP_HEIGHT = 20;
const BLOCK = 24;
const WIDTH = MAP_WIDTH * BLOCK;
const HEIGHT = MAP_HEIGHT * BLOCK;
let UPDATE_PERIOD = 100;


let app = new PIXI.Application({
    width: WIDTH,
    height: HEIGHT,
    antialias: true,
    transparent: false,
    resolution: 1,
});

app.renderer.backgroundColor = "0xf4f4f4";

$(document).ready(() => {
    $(".root")[0].appendChild(app.view);
    let typingElement = $("#ghost-anchor")[0]
    window.ghostTyper = new Ghost(typingElement);
})


// load sprites!
PIXI.loader
  .add([
	  "wall.png",
	  "snuok_body.png",
	  "snuok_head_pink.png",
	  "snuok_head_orange.png",
  ])
  .load(setup);

function setup() {
	snuok = new Snuok(2)
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
	snuok.addToStage(app)

	let world = {
		"SNUOK": snuok,
	};
	app.ticker.add(step.bind({}, world))
}

let sinceLastUpdate = 0;

function step(world, delta) {
	sinceLastUpdate += delta;
	if (sinceLastUpdate > UPDATE_PERIOD) {
		snuok.update(world);
		sinceLastUpdate = 0;
	}
}

function Vector(x,y) {
    this.x = x;
    this.y = y;
    
    this.left = function() {
        return new Vector(this.x - 1, this.y);
    }

    this.right = function() {
        return new Vector(this.x + 1, this.y);
    }

    this.up = function() {
        return new Vector(this.x, this.y - 1);
    }

    this.down = function() {
        return new Vector(this.x, this.y + 1);
    }
	
	this.plus = function(v) {
		return new Vector(v.x + this.x, v.y + this.y);
	}
	
	this.magnitude = function() {
		return Math.abs(Math.sqrt((this.x*this.x) + (this.y*this.y)));
	}
    
    this.wrap = function() {
        if (this.x >= MAP_WIDTH)
            this.x -= MAP_WIDTH;
        if (this.x < 0)
            this.x += MAP_WIDTH;

        if (this.y >= MAP_HEIGHT)
            this.y -= MAP_HEIGHT;
        if (this.y < 0)
            this.y += MAP_HEIGHT;
        return this;
    }

	this.push = function(sprite) {
		sprite.x += this.x * BLOCK;
        if (sprite.x > WIDTH - BLOCK) {
            sprite.x = 0;
        }
        if (sprite.x < 0) {
            sprite.x += WIDTH;
        }

		sprite.y += this.y * BLOCK;
        if (sprite.y > HEIGHT - BLOCK) {
            sprite.y = 0;
        }
        if (sprite.y < 0) {
            sprite.y += HEIGHT;
        }
	}

    this.clone = function() {
        return new Vector(this.x, this.y);
    }
}

function createSprite(imageName, pos) {
	let sprite = new PIXI.Sprite(
		PIXI.loader.resources[imageName].texture
	);
	sprite.x = pos.x;
	sprite.y = pos.y;
	return sprite;
}

// Simplifies translation between world position and sprite position
class Entity {
    constructor(worldPos, sprite) {
        this.worldPos = worldPos;
        this.sprite = sprite;

        this.setWorldPos(worldPos);
    }

    setWorldPos(newPos) {
        this.worldPos = newPos;
        this.worldPos.wrap();

        this.sprite.x = this.worldPos.x * BLOCK;
        this.sprite.y = this.worldPos.y * BLOCK;
    }

    moveTo(entity) {
        this.setWorldPos(entity.worldPos.clone());
    }

    moveBy(offset) {
        this.setWorldPos(this.worldPos.plus(offset));
    }

    addTo(app) {
        app.stage.addChild(this.sprite);
    }

    collides(position) {
        return position.x == this.worldPos.x &&
            position.y == this.worldPos.y;
    }
}

function createPart(imageName, pos) {
    let sprite = new PIXI.Sprite(
        PIXI.loader.resources[imageName].texture
    );
    return new Entity(pos, sprite);
}

class Snuok {
    constructor (speed) { // not sure this needs to read the app state
	    this.UP = this.turnDirection.bind(this, new Vector(0,-1))
	    this.DOWN = this.turnDirection.bind(this, new Vector(0,1))
	    this.LEFT = this.turnDirection.bind(this, new Vector(-1,0))
	    this.RIGHT = this.turnDirection.bind(this, new Vector(1,0))

        this.speed = speed;
	    this.direction = new Vector(1,0);

        let start = new Vector(10,10);
        let head = createPart.bind({}, "snuok_head_pink.png")
        let body = createPart.bind({}, "snuok_body.png")


	    this.nextDirection = this.direction;
        this.parts = []

        this.parts = [
            head(start),
            body(start.left()),
            body(start.left().left()),
            body(start.left().left().left()),
            body(start.left().left().left().left()),
            body(start.left().left().left().left().left()),
        ];
    }

    addToStage(app) {
    	this.parts.map((entity) => entity.addTo(app))
    }

    bindKeys(bindings) {
    	$(window).keydown((evt) => {
    		if (bindings[evt.key]) {
    			bindings[evt.key]();
    		}
            if (bindings[evt.keyCode]) {
                bindings[evt.keyCode]();
            }
    	})
    }

	update(world) {
    
        if (this.state === "dead") {
            return
        }
		for (let i = this.parts.length - 1; i > 0; i-- ) {
		    this.parts[i].moveTo(this.parts[i - 1]);
		}

		// execute direction update
		this.direction = this.nextDirection;
        let collided = this.checkCollisions();
        if (collided) {
            window.ghostTyper.display("Uh-Oh! You died :/");
        }
		// move head
	    this.parts[0].moveBy(this.direction);
	}
    
    checkCollisions() {
        // check for death
        let newHeadPos = this.parts[0].worldPos.plus(this.direction)
            .wrap();
        return this.parts
            .slice(1)
            .reduce((collided, part) => collided || part.collides(newHeadPos) ? part : undefined,
                   undefined);
    }

    turnDirection(newDirection) {
	    const err = 0.0001; // arbitrary error in case of float magic
	    if (this.direction.plus(newDirection).magnitude() >= err) { // not opposites
		    this.nextDirection = newDirection;
	    }
	}
}

