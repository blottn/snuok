const WIDTH = 480;
const HEIGHT = 480;

let app = new PIXI.Application({
    width: 480,
    height: 480,
    antialias: true,
    transparent: false,
    resolution: 1,
});

app.renderer.backgroundColor = "0xf4f4f4";

$(document).ready(() => {
    $(".root")[0].appendChild(app.view);
    let typistElement = $("#typistElement")[0]
    let typer = new Typist(typistElement, {
        letterInterval: 60,
        textInterval:   3000,
    });

        
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
	snuok = new Snuok(app)
	snuok.bindKeys({
		'w': snuok.UP,
		's': snuok.DOWN,
		'a': snuok.LEFT,
		'd': snuok.RIGHT,
	})
	snuok.addToStage(app)

	let world = {
		"SNUOK": snuok,
	};
	app.ticker.add(step.bind({}, world))
}

const UPDATE_PERIOD = 2;
let sinceLastUpdate = 0;
function step(world, delta) {
	sinceLastUpdate += delta;
	if (sinceLastUpdate > UPDATE_PERIOD) {
		snuok.update();
		sinceLastUpdate = 0;
	}
}

function Vector(x,y) {
	this.BLOCK = 24;
    this.x = x;
    this.y = y;
    
    this.left = function() {
        return new Vector(this.x - this.BLOCK, this.y);
    }

    this.right = function() {
        return new Vector(this.x + this.BLOCK, this.y);
    }

    this.up = function() {
        return new Vector(this.x, this.y - this.BLOCK);
    }

    this.down = function() {
        return new Vector(this.x, this.y + this.BLOCK);
    }
	
	this.plus = function(v) {
		return new Vector(v.x + this.x, v.y + this.y);
	}
	
	this.magnitude = function() {
		return Math.abs(Math.sqrt((this.x*this.x) + (this.y*this.y)));
	}

	this.push = function(sprite) {
		sprite.x += this.x * this.BLOCK;
        if (sprite.x > WIDTH - this.BLOCK) {
            sprite.x = 0;
        }
        if (sprite.x < 0) {
            sprite.x += WIDTH;
        }

		sprite.y += this.y * this.BLOCK;
        if (sprite.y > HEIGHT - this.BLOCK) {
            sprite.y = 0;
        }
        if (sprite.y < 0) {
            sprite.y += HEIGHT;
        }
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

function Snuok(app) {
	this.UP_DIR
	this.UP = function() {this.setDirection(new Vector(0,-1))}.bind(this);
	this.DOWN = function() {this.setDirection(new Vector(0,1))}.bind(this);
	this.LEFT = function() {this.setDirection(new Vector(-1,0))}.bind(this);
	this.RIGHT = function() {this.setDirection(new Vector(1,0))}.bind(this);

    this.app = app;
	this.direction = new Vector(1,0);
	this.nextDirection = this.direction;
	this.setDirection = function(newDirection) {
		const err = 0.0001; // arbitrary error in case of float magic
		if (this.direction.plus(newDirection).magnitude() >= err) { // not opposites
			this.nextDirection = newDirection;
		}
	}

    let start = new Vector(0,0);
    let head = createSprite.bind({}, "snuok_head_pink.png")
    let body = createSprite.bind({}, "snuok_body.png")

    this.parts = [
        head(start),
        body(start.left()),
        body(start.left().left()),
        body(start.left().left().left()),
        body(start.left().left().left().left()),
        body(start.left().left().left().left().left()),
    ];

	this.addToStage = function(app) {
		this.parts.map((sprite) => {
			app.stage.addChild(sprite);
		});
	}

	this.bindKeys = function(bindings) {
		$(window).keypress((evt) => {
			if (bindings[evt.key]) {
				bindings[evt.key]();
			}
		})
	}

	this.update = function() {
		for (let i = this.parts.length - 1; i > 0; i-- ) {
			this.parts[i].position.copyFrom(this.parts[i - 1].position);
		}

		// execute direction update
		this.direction = this.nextDirection;
		// move head
		this.direction.push(this.parts[0]);
	}
}

