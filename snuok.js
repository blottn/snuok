const MAP_WIDTH = 20;
const MAP_HEIGHT = 20;
const BLOCK = 24;
const WIDTH = MAP_WIDTH * BLOCK;
const HEIGHT = MAP_HEIGHT * BLOCK;


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
	snuok = new Snuok(35) // time to reach a destination
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
	snuok.update(world, delta);
}

class Vector {
    constructor(x,y) {
        this.x = x;
        this.y = y;
    }
    
    left() {
        return new Vector(this.x - 1, this.y);
    }

    right() {
        return new Vector(this.x + 1, this.y);
    }

    up() {
        return new Vector(this.x, this.y - 1);
    }

    down() {
        return new Vector(this.x, this.y + 1);
    }
	
	plus(v) {
		return new Vector(v.x + this.x, v.y + this.y);
	}
	
	magnitude() {
		return Math.abs(Math.sqrt((this.x*this.x) + (this.y*this.y)));
	}
    
    wrap() {
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

    clone() {
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
    constructor(worldPos, sprite, dest) {
        this.worldPos = worldPos;
        this.dest = dest;
        this.sprite = sprite;

        this.lerpProgress = 0;

        this.setWorldPos(worldPos);
        this.spriteAt(worldPos);
    }

    setWorldPos(newPos) {
        this.worldPos = newPos;
        this.worldPos.wrap();
    }

    spriteAt(pos) { // called by draw loop
        this.sprite.x = pos.x * BLOCK;
        this.sprite.y = pos.y * BLOCK;
    }

    setDest(dest) {
        this.dest = dest;
    }

    applyDirection(direction) {
        this.dest = this.worldPos.plus(direction);
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

    draw(lerpFactor) {
        let deltaX = (this.dest.x - this.worldPos.x) * lerpFactor;
        let deltaY = (this.dest.y - this.worldPos.y) * lerpFactor;
        let newPos = new Vector(this.worldPos.x + deltaX, this.worldPos.y + deltaY);
        this.spriteAt(newPos);
    }

    collides(position) {
        return position.x == this.worldPos.x &&
            position.y == this.worldPos.y;
    }
}

function createPart(imageName, pos, dest) {
    let sprite = new PIXI.Sprite(
        PIXI.loader.resources[imageName].texture
    );
    return new Entity(pos, sprite, dest);
}

class Snuok {
    constructor (speed) { // not sure this needs to read the app state
	    this.UP = this.turnDirection.bind(this, new Vector(0,-1))
	    this.DOWN = this.turnDirection.bind(this, new Vector(0,1))
	    this.LEFT = this.turnDirection.bind(this, new Vector(-1,0))
	    this.RIGHT = this.turnDirection.bind(this, new Vector(1,0))

        this.speed = speed;
        this.lerpProgress = 0;

	    this.direction = new Vector(1,0);

        let start = new Vector(10,10);
        let head = createPart.bind({}, "snuok_head_pink.png")
        let body = createPart.bind({}, "snuok_body.png")


	    this.nextDirection = this.direction;
        this.parts = []

        this.parts = [
            head(start, start.plus(this.direction)),
            body(start.left(), start),
            body(start.left().left(), start.left()),
            body(start.left().left().left(), start.left().left()),
            body(start.left().left().left().left(), start.left().left().left()),
            body(start.left().left().left().left().left(), start.left().left().left().left()),
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

	update(world, delta) {
        let updateState = this.updateLerp(delta);
        let lerpFactor = this.lerpProgress / this.speed;
        if (updateState) {
            for (let i = this.parts.length - 1; i > 0 ; i--) {
                this.parts[i].setWorldPos(this.parts[i - 1].worldPos.clone());
                this.parts[i].setDest(this.parts[i - 1].dest.clone());
            }
		    this.direction = this.nextDirection;
            this.parts[0].setWorldPos(this.parts[0].dest);
            this.parts[0].applyDirection(this.direction);
            let collided = this.checkCollisions();
            if (collided) {
                window.ghostTyper.display("Uh-Oh! You died :/");
            }
        }

        // do draw
        this.parts.map((part) => part.draw(lerpFactor));

		// execute direction update
        let collided = this.checkCollisions();

	}
    
    checkCollisions() {
        // check for death
        let newHeadPos = this.parts[0].dest.clone().wrap();
        return this.parts
            .slice(1)
            .reduce((collided, part) => collided || part.collides(newHeadPos) ? part : undefined,
                   undefined);
    }

    updateLerp(delta) {
        this.lerpProgress += delta;
        let moveToNext = this.lerpProgress > this.speed;
        while (this.lerpProgress > this.speed) {
            this.lerpProgress -= this.speed;
        }
        return moveToNext;
    }

    turnDirection(newDirection) {
	    const err = 0.0001; // arbitrary error in case of float magic
	    if (this.direction.plus(newDirection).magnitude() >= err) { // not opposites
		    this.nextDirection = newDirection;
	    }
	}
}

