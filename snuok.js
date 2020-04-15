const MAP_WIDTH = 20;
const MAP_HEIGHT = 20;
const BLOCK = 24;
const WIDTH = MAP_WIDTH * BLOCK;
const HEIGHT = MAP_HEIGHT * BLOCK;

let worldConfig = {MAP_WIDTH, MAP_HEIGHT, BLOCK};

/*const filterCode = `void main(void) {
   gl_FragColor = vec4(0.0, 1.0, 0.0, 1.0);
}`;

let coloredFilter = new PIXI.Filter(null, filterCode); Keeping this cause im bad at remembering stuff*/


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
    let len = 4;
    let lerp_time = 15;
	snuok = new WrapperSnuok(app, new Vector(10,10), len, lerp_time) // time to reach a destination
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

    outOfBounds() {
        return this.x >= MAP_WIDTH ||
            this.x < 0 ||
            this.y >= MAP_HEIGHT ||
            this.y < 0;
    }

    getWrappingVector() {
        let dX = 0;
        let dY = 0;

        if (this.x >= MAP_WIDTH)
            dX = -MAP_WIDTH;
        if (this.x < 0)
            dX = MAP_WIDTH;
        if (this.y >= MAP_HEIGHT)
            dY = -MAP_HEIGHT;
        if (this.y < 0)
            dY = MAP_HEIGHT;
        return new Vector(dX, dY);
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
		return new Vector(this.x + v.x, this.y + v.y);
	}

    minus(v) {
        return new Vector(this.x - v.x, this.y - v.y);
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

// Simplifies translation between world position and sprite position
class Entity {
    constructor(worldPos, sprite, dest) {
        this.worldPos = worldPos;
        this.dest = dest;

        this.sprites = {}
        this.sprites['centre'] = sprite;
        this.sprites['up'] = PIXI.Sprite.from(sprite.texture);
        this.sprites['down'] = PIXI.Sprite.from(sprite.texture);
        this.sprites['left'] = PIXI.Sprite.from(sprite.texture);
        this.sprites['right'] = PIXI.Sprite.from(sprite.texture);

        this.lerpProgress = 0;

        this.setWorldPos(worldPos);
        this.spriteAt(worldPos);
    }

    setWorldPos(newPos) {
        this.worldPos.x = newPos.x;
        this.worldPos.y = newPos.y;
    }

    spriteAt(pos) { // called by draw loop
        this.setSpritePos(this.sprites['centre'], pos);
        this.setSpritePos(this.sprites['left'],
                     pos.minus(new Vector(MAP_WIDTH, 0)));
        this.setSpritePos(this.sprites['right'],
                     pos.plus(new Vector(MAP_WIDTH, 0)));
        this.setSpritePos(this.sprites['up'],
                     pos.minus(new Vector(0, MAP_HEIGHT)));
        this.setSpritePos(this.sprites['down'],
                     pos.plus(new Vector(0, MAP_HEIGHT)));
    }

    setSpritePos(sprite, pos) {
        this.setSpritePosRaw(sprite, pos.x * BLOCK, pos.y * BLOCK);
    }

    setSpritePosRaw(sprite, x, y) {
        sprite.x = x;
        sprite.y = y;
    }

    setDest(dest) {
        this.dest.x = dest.x;
        this.dest.y = dest.y;
    }

    applyDirection(direction) {
        this.dest = this.worldPos.plus(direction);
    }

    addTo(app) {
        app.stage.addChild(this.sprites['centre']);
        app.stage.addChild(this.sprites['up']);
        app.stage.addChild(this.sprites['down']);
        app.stage.addChild(this.sprites['left']);
        app.stage.addChild(this.sprites['right']);
    }

    replace(nextDest) {
        let wrapper = nextDest.getWrappingVector();

        let oldSprite = this.sprite;
        let replacementSprite = new PIXI.Sprite(
            oldSprite.texture
        );
        replacementSprite.zIndex = oldSprite.zIndex;
        replacementSprite.x = oldSprite.x + wrapper.x * BLOCK;
        replacementSprite.y = oldSprite.y + wrapper.y * BLOCK;
        this.sprite.parent.addChild(replacementSprite);
        this.sprite = replacementSprite;
        oldSprite.destroy();
    }

    update(next) {
        this.setWorldPos(this.dest);
        this.setDest(next);
        return this.worldPos.clone();
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
        Object.values(this.sprites, (sprite) => sprite.destroy());
    }
}

function createPart(zIndex, imageName, pos, direction) {
    let sprite = new PIXI.Sprite(
        PIXI.loader.resources[imageName].texture
    );
    sprite.zIndex = zIndex;
    return new SimpleEntity(worldConfig, sprite, pos, direction);
}

class Snuok {
    constructor (app, start, len, speed) { // not sure this needs to read the app state
        this.app = app;
        this.speed = speed;
        this.lerpProgress = 0;

	    this.direction = new Vector(1,0);
	    this.nextDirection = this.direction;

        this.head = createPart.bind({}, 100, "snuok_head_pink.png")
        this.body = createPart.bind({}, 50, "snuok_body.png")

        this.corners = {};
        this.parts = [
            this.head(start, this.direction)
        ];
        for (let i = 0; i < len ; i++) {
            let ent = this.body(this.parts[i].pos.left(), 
                                this.direction);
            this.parts.push(ent);
        }
    }

    addToStage(app) {
    	this.parts.map((entity) => entity.addTo(app.stage))
    }

    

    shiftBy(offset) {
        this.parts.map((part) => {
            part.shiftBy(offset);
        });
    }

	update(world, delta) {
        if (this.dead) {
            return;
        }
        let updateState = this.updateLerp(delta);
        let lerpFactor = this.lerpProgress / this.speed;

        if (updateState) {
            this.stateTick(lerpFactor)
        }

        this.parts.map((part) => part.draw(lerpFactor));

        return updateState;
	}

    stateTick(lerpFactor) {
        // update positions and destinations 
        let next = this.parts[0].dest;
        for (let i = 1; i < this.parts.length ; i++) {
            next = this.parts[i].update(next);
        }

        // update position and destination of head
        if (!this.direction.equals(this.nextDirection)) {
            this.addCornerAt(this.parts[0].dest);
            this.direction = this.nextDirection;
        }

        this.parts[0].update(
            this.parts[0].dest.plus(this.direction)
        );
        
        // check if there's a tail corner to be deleted
        let tail = this.parts[this.parts.length - 1];
        let tailPos = tail.pos.toString();
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
    
    outOfBounds() {
        return this.parts[0].outOfBounds();
    }

    getHitBox() {
        return this.parts[0].dest.clone();
    }

    checkCollisions() {
        let newHeadPos = this.getHitBox();
       // let newHeadPos = this.parts[0].dest.clone().wrap();
        return this.checkCollides(newHeadPos);
    }

    checkCollides(pos) {
        return this.parts
            .slice(1) // ignore head
            .reduce((collided, part) => {
                if (collided) {
                    return collided;
                }
                if (part.collides(pos)) {
                    return part;
                }
                return undefined;
        }, undefined);
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
        let corner = this.body(position, new Vector(0,0));
        corner.addTo(this.app.stage);
        this.corners[position.toString()] = corner;
    }
}

class WrapperSnuok {
    constructor(app, start, len, speed) {
        this.LEFT_OFFSET = new Vector(-worldConfig.MAP_WIDTH, 0);
        this.RIGHT_OFFSET = new Vector(worldConfig.MAP_WIDTH, 0);
        this.UP_OFFSET = new Vector(0, -worldConfig.MAP_HEIGHT);
        this.DOWN_OFFSET = new Vector(0, worldConfig.MAP_HEIGHT);

        this.UP = this.up.bind(this);
        this.DOWN = this.down.bind(this);
        this.LEFT = this.left.bind(this);
        this.RIGHT = this.right.bind(this);

        this.replicas = {
            centre: new Snuok(app, start, len, speed),
            left: new Snuok(app, start.plus(this.LEFT_OFFSET), len, speed),
            right: new Snuok(app, start.plus(this.RIGHT_OFFSET), len, speed),
            up: new Snuok(app, start.plus(this.UP_OFFSET), len, speed),
            down: new Snuok(app, start.plus(this.DOWN_OFFSET), len, speed)
        };
    }

    turnDirection(newDirection) {
        this.replicas.centre.turnDirection(newDirection);
        this.replicas.left.turnDirection(newDirection);
        this.replicas.right.turnDirection(newDirection);
        this.replicas.up.turnDirection(newDirection);
        this.replicas.down.turnDirection(newDirection);
	}

    up() {this.turnDirection(new Vector(0, -1));}
    down() {this.turnDirection(new Vector(0, 1));}
    left() {this.turnDirection(new Vector(-1, 0));}
    right() {this.turnDirection(new Vector(1, 0));}

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
        let updateState = this.replicas.centre.update(world, delta);
        this.replicas.left.update(world, delta);
        this.replicas.right.update(world, delta);
        this.replicas.up.update(world, delta);
        this.replicas.down.update(world, delta);
        if (updateState) {
            this.stateTick();
        }
    }

    stateTick() {
        this.checkWrap();
    }

    checkWrap() {
        if (this.replicas.centre.outOfBounds()) {
            let wrapper = this.replicas.centre.parts[0].getWrappingVector();
            if (wrapper.x > 0) { // out left
                let temp = this.replicas.centre;
                this.replicas.centre = this.replicas.right;
                this.replicas.right = this.replicas.left;
                this.replicas.left = temp;
                this.replicas.right.shiftBy(wrapper);
                this.replicas.right.shiftBy(wrapper);
                this.replicas.right.shiftBy(wrapper);

                this.replicas.up.shiftBy(wrapper);
                this.replicas.down.shiftBy(wrapper);
            }
            if (wrapper.x < 0) {
                let temp = this.replicas.centre;
                this.replicas.centre = this.replicas.left;
                this.replicas.left = this.replicas.right;
                this.replicas.right = temp;
                this.replicas.left.shiftBy(wrapper);
                this.replicas.left.shiftBy(wrapper);
                this.replicas.left.shiftBy(wrapper);

                this.replicas.up.shiftBy(wrapper);
                this.replicas.down.shiftBy(wrapper);
            }
            if (wrapper.y < 0) { // out bottom
                let temp = this.replicas.centre;
                this.replicas.centre = this.replicas.up;
                this.replicas.up = this.replicas.down;
                this.replicas.down = temp;
                this.replicas.up.shiftBy(wrapper);
                this.replicas.up.shiftBy(wrapper);
                this.replicas.up.shiftBy(wrapper);

                this.replicas.left.shiftBy(wrapper);
                this.replicas.right.shiftBy(wrapper);
            }
            if (wrapper.y > 0) {
                let temp = this.replicas.centre;
                this.replicas.centre = this.replicas.down;
                this.replicas.down = this.replicas.up;
                this.replicas.up = temp;
                this.replicas.down.shiftBy(wrapper);
                this.replicas.down.shiftBy(wrapper);
                this.replicas.down.shiftBy(wrapper);

                this.replicas.left.shiftBy(wrapper);
                this.replicas.right.shiftBy(wrapper);
            }
        }
    }

    checkCollisions() {
        let hitBox = this.getHitBox();
        return this.replicas.centre.checkCollides(hitBox) ||
            this.replicas.left.checkCollides(hitBox) ||
            this.replicas.right.checkCollides(hitBox) ||
            this.replicas.up.checkCollides(hitBox) ||
            this.replicas.down.checkCollides(hitBox);
    }

    addToStage(app) {
    	this.replicas.centre.addToStage(app);
        this.replicas.left.addToStage(app);
        this.replicas.right.addToStage(app);
        this.replicas.up.addToStage(app);
        this.replicas.down.addToStage(app);
    }
}
