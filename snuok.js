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
	snuok = new WrappedSnuok(app, new Vector(18,0), len, lerp_time);
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

	let world = new World(snuok);

	app.ticker.add(step.bind({}, world))
}

function step(world, delta) {
    world.update(delta);
}

// Helper for Snuok constructor
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

	update(delta) {
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
        
        for (let k in this.corners) {
            this.corners[k].ttl -= 1;
            if (this.corners[k].ttl <= 0) {
                this.corners[k].corner.destroy();
                delete this.corners[k];
            }
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
        return this.checkCollides(this.getHitBox());
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
        this.corners[position.toString()] = {corner, ttl: this.parts.length};
    }
}

class WrappedSnuok {
    constructor(app, start, len, speed) {
        this.LEFT_OFFSET = new Vector(-worldConfig.MAP_WIDTH, 0);
        this.RIGHT_OFFSET = new Vector(worldConfig.MAP_WIDTH, 0);
        this.UP_OFFSET = new Vector(0, -worldConfig.MAP_HEIGHT);
        this.DOWN_OFFSET = new Vector(0, worldConfig.MAP_HEIGHT);

        this.UPLEFT_OFFSET = this.UP_OFFSET.plus(this.LEFT_OFFSET);
        this.UPRIGHT_OFFSET = this.UP_OFFSET.plus(this.RIGHT_OFFSET);
        this.DOWNLEFT_OFFSET = this.DOWN_OFFSET.plus(this.LEFT_OFFSET);
        this.DOWNRIGHT_OFFSET = this.DOWN_OFFSET.plus(this.RIGHT_OFFSET);

        this.UP = this.up.bind(this);
        this.DOWN = this.down.bind(this);
        this.LEFT = this.left.bind(this);
        this.RIGHT = this.right.bind(this);

        this.replicas = {
            centre: new Snuok(app, start, len, speed),
            left: new Snuok(app, start.plus(this.LEFT_OFFSET), len, speed),
            right: new Snuok(app, start.plus(this.RIGHT_OFFSET), len, speed),
            up: new Snuok(app, start.plus(this.UP_OFFSET), len, speed),
            down: new Snuok(app, start.plus(this.DOWN_OFFSET), len, speed),
            upRight: new Snuok(app, start.plus(this.UPRIGHT_OFFSET),
                               len, speed),
            upLeft: new Snuok(app, start.plus(this.UPLEFT_OFFSET),
                               len, speed),
            downRight: new Snuok(app, start.plus(this.DOWNRIGHT_OFFSET),
                               len, speed),
            downLeft: new Snuok(app, start.plus(this.DOWNLEFT_OFFSET),
                               len, speed),
        };
    }

    map(func, args) {
        return Object.values(this.replicas)
            .map((s) => func.apply(s, args));
    }

    turnDirection(newDirection) {
        this.map(Snuok.prototype.turnDirection, [newDirection]);
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

    update(delta) {
        let states = this.map(Snuok.prototype.update, [delta])
        if (states[0]) {
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
                this.rotate('left', 'centre', 'right', wrapper);
                this.rotate('upLeft', 'up', 'upRight', wrapper);
                this.rotate('downLeft', 'down', 'downRight', wrapper);
            }
            if (wrapper.x < 0) {
                this.rotate('right', 'centre', 'left', wrapper);
                this.rotate('upRight', 'up', 'upLeft', wrapper);
                this.rotate('downRight', 'down', 'downLeft', wrapper);
            }
            if (wrapper.y < 0) { // out bottom
                this.rotate('down', 'centre', 'up', wrapper);
                this.rotate('downLeft', 'left', 'upLeft', wrapper);
                this.rotate('downRight', 'right', 'upRight', wrapper);
            }
            if (wrapper.y > 0) {
                this.rotate('up', 'centre', 'down', wrapper);
                this.rotate('upLeft', 'left', 'downLeft', wrapper);
                this.rotate('upRight', 'right', 'downRight', wrapper);
            }
        }
    }

    rotate(outer, centre, inner, wrapper) {
        let temp = this.replicas[centre];
        this.replicas[centre] = this.replicas[inner];
        this.replicas[inner] = this.replicas[outer];

        this.replicas[inner] = this.replicas[outer];
        this.replicas[outer] = temp;
        this.replicas[inner].shiftBy(wrapper);
        this.replicas[inner].shiftBy(wrapper);
        this.replicas[inner].shiftBy(wrapper);
    }

    addToStage(app) {
        this.map(Snuok.prototype.addToStage, [app]);
    }
}


