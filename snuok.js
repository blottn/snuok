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
app.stage.sortableChildren = true;

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
	snuok = new Snuok(app, 15) // time to reach a destination
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


	plus(v) {
		return new Vector(v.x + this.x, v.y + this.y);
	}
	
	magnitude() {
		return Math.abs(Math.sqrt((this.x*this.x) + (this.y*this.y)));
	}
    
    clone() {
        return new Vector(this.x, this.y);
    }

    equals(v) {
        return this.x == v.x && this.y == v.y;
    }

    toString() {
        return `${this.x}.${this.y}`;
    }

    static fromString(input) {
        let [xtxt, yTxt] = string.split('.');
        return new Vector(
            Integer.parseInt(xTxt),
            Integer.parseInt(yTxt)
        );
    }
}

class EventEmitter {
    constructor() {
        this.events = {};
    }

    addListener(evt, key, listener) {
        if (!this.events[evt]) {
            this.events[evt] = {};
        }

        this.events[evt][key] = listener;
    }

    fire(evt, data) {
        for (let key in this.events[evt]) {
            this.events[evt][key](data);
            delete this.events[evt][key];
        }
    }
}

// Simplifies translation between world position and sprite position
class Entity extends EventEmitter {
    constructor(worldPos, sprite, dest) {
        super();
        this.worldPos = worldPos;
        this.dest = dest;
        this.sprite = sprite;

        this.lerpProgress = 0;

        this.setWorldPos(worldPos);
        this.spriteAt(worldPos);
    }

    setWorldPos(newPos) {
        this.worldPos.x = newPos.x;
        this.worldPos.y = newPos.y;
        this.worldPos.wrap();
    }

    spriteAt(pos) { // called by draw loop
        pos.wrap();
        this.sprite.x = pos.x * BLOCK;
        this.sprite.y = pos.y * BLOCK;
    }

    setDest(dest) {
        this.dest.x = dest.x;
        this.dest.y = dest.y;
    }

    applyDirection(direction) {
        this.dest = this.worldPos.plus(direction);
    }

    addTo(app) {
        app.stage.addChild(this.sprite);
    }

    update(next) {
        this.setWorldPos(this.dest);
        this.setDest(next);
    }

    draw(lerpFactor) {
        let deltaX = (this.dest.x - this.worldPos.x) * lerpFactor;
        let deltaY = (this.dest.y - this.worldPos.y) * lerpFactor;
        let newPos = new Vector(this.worldPos.x + deltaX,
                                this.worldPos.y + deltaY);
        
        this.spriteAt(newPos);
    }

    collides(position) {
        return position.equals(this.worldPos);
    }

    destroy() {
        this.sprite.destroy();
    }
}

function createPart(zIndex, imageName, pos, dest) {
    let sprite = new PIXI.Sprite(
        PIXI.loader.resources[imageName].texture
    );
    sprite.zIndex = zIndex;
    return new Entity(pos, sprite, dest);
}

class Snuok extends EventEmitter {
    constructor (app, speed) { // not sure this needs to read the app state
        super();
        this.app = app;
        this.speed = speed;
        this.lerpProgress = 0;


	    this.direction = new Vector(1,0);
	    this.nextDirection = this.direction;

	    this.UP = this.turnDirection.bind(this, new Vector(0,-1))
	    this.DOWN = this.turnDirection.bind(this, new Vector(0,1))
	    this.LEFT = this.turnDirection.bind(this, new Vector(-1,0))
	    this.RIGHT = this.turnDirection.bind(this, new Vector(1,0))

        this.head = createPart.bind({}, 100, "snuok_head_pink.png")
        this.body = createPart.bind({}, 50, "snuok_body.png")

        let start = new Vector(10,10);
        
        this.corners = {};
        this.parts = [
            this.head(start, start.plus(this.direction))
        ];
        for (let i = 0; i < 8 ; i++) {
            let ent = this.body(this.parts[i].worldPos.left(), 
                                this.parts[i].worldPos.clone());
            this.parts.push(ent);
        }

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
        if (this.dead) {
            return;
        }
        let updateState = this.updateLerp(delta);
        let lerpFactor = this.lerpProgress / this.speed;

        if (updateState) {
            // update positions and destinations
            for (let i = this.parts.length - 1; i > 0 ; i--) {
                if (i == 1 && this.parts[1].worldPos.x == 18) {
                    console.log(this.parts[1]);
                }
                this.parts[i].update(this.parts[i - 1].dest);
            }

            // update position and destination of head
            if (!this.direction.equals(this.nextDirection)) {
                this.addCornerAt(this.parts[0].dest);
		        this.direction = this.nextDirection;
            }
            this.parts[0].setWorldPos(this.parts[0].dest);
            this.parts[0].applyDirection(this.direction);
            
            // check if there's a tail corner to be deleted
            let tail = this.parts[this.parts.length - 1];
            let tailPos = tail.worldPos.toString();
            if (this.corners[tailPos]) {
                this.corners[tailPos].destroy();
                delete this.corners[tailPos];
            }

            // check for collisions
            let collided = this.checkCollisions();
            if (collided) {
                this.dead = true;
                window.ghostTyper.display("Uh-Oh! You died :/");
            }
        }

        // do draw
        this.parts.map((part) => part.draw(lerpFactor));
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

    addCornerAt(position) {
        let corner = this.body(position, position);
        corner.addTo(this.app);
        this.corners[position.toString()] = corner;
    }
}


