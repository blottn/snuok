import { Vector } from './vector.js';
import { SimpleEntity } from './entity.js';

// Helper for Snuok constructor
function createPart(worldConfig, zIndex, imageName, pos, direction) {
    let sprite = new PIXI.Sprite(
        PIXI.loader.resources[imageName].texture
    );
    sprite.zIndex = zIndex;
    return new SimpleEntity(worldConfig, sprite, pos, direction);
}

export class Snuok {
    constructor (container, worldConfig, start, len, speed) { // not sure this needs to read the app state
        this.container = container;
        this.speed = speed;
        this.lerpProgress = 0;

	    this.direction = new Vector(1,0);
	    this.nextDirection = this.direction;

        this.head = createPart.bind({}, worldConfig, 100, "snuok_head_pink.png")
        this.body = createPart.bind({}, worldConfig, 50, "snuok_body.png")

        this.corners = {};
        this.parts = [
            this.head(start, this.direction)
        ];
        for (let i = 0; i < len ; i++) {
            let ent = this.body(this.parts[i].pos.left(), 
                                this.direction);
            this.parts.push(ent);
        }

        this.filters = [];
    }

    addTo(parent) {
    	this.parts.map((entity) => entity.addTo(parent))
    }

    shiftBy(offset) {
        this.parts.map((part) => {
            part.shiftBy(offset);
        });
    }

	draw(delta) {
        if (this.dead) {
            return;
        }
        let looped = this.updateLerp(delta);
        let lerpFactor = this.lerpProgress / this.speed;

        if (looped) {
            this.stateTick(lerpFactor)
        }

        this.parts.map((part) => part.draw(lerpFactor));

        return looped;
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
    }
    
    outOfBounds() {
        return this.parts[0].outOfBounds();
    }

    getHitBox() {
        return this.parts[0].getHitBox();
    }

    checkCollisions() {
        return this.checkCollides(this.getHitBox());
    }

    checkCollides(pos, startFrom=1) { // use startFrom=0 to also check if it overlaps the head

        return this.parts
            .slice(startFrom)
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
        let looped = this.lerpProgress > this.speed;
        while (this.lerpProgress > this.speed) {
            this.lerpProgress -= this.speed;
        }
        return looped;
    }

    turnDirection(newDirection) {
	    const err = 0.0001; // arbitrary error in case of float magic
	    if (this.direction.plus(newDirection).magnitude() >= err) { // not opposites
       		this.nextDirection = newDirection;
	    }
	}

    addCornerAt(position) {
        let corner = this.body(position, new Vector(0,0));
        corner.sprite.filters = this.filters;
        corner.addTo(this.container);
        this.corners[position.toString()] = {corner, ttl: this.parts.length};
    }

    addTailPiece() {
        let tail = this.body(this.parts[this.parts.length - 1].pos.clone(), new Vector(0, 0));
        tail.sprite.filters = this.filters;
        tail.addTo(this.container);
        this.parts.push(tail);

        // increase ttl on corners!
        for (let k in this.corners) {
            this.corners[k].ttl += 1;
        }
    }

    getPoints() {
        return this.parts.map((point) => point.pos.toString());
    }

    applyFilters(filters) {
        this.filters = filters;
        for (let i = 0; i < this.parts.length ; i++) {
            this.parts[i].sprite.filters = filters;
        }
        for (let k in this.corners) {
            this.corners[k].sprite.filters = filters;
        }
        return this.parts.map((part) => part.sprite.filters = filters);
    }
}

export class WrappedSnuok {
    constructor(container, worldConfig, start, len, speed) {
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
        this.dead = false;
        this.replicas = {
            centre: new Snuok(container, worldConfig, start, len, speed),
            left: new Snuok(container, worldConfig, start.plus(this.LEFT_OFFSET),
                            len, speed),
            right: new Snuok(container, worldConfig, start.plus(this.RIGHT_OFFSET),
                             len, speed),
            up: new Snuok(container, worldConfig, start.plus(this.UP_OFFSET),
                          len, speed),
            down: new Snuok(container, worldConfig, start.plus(this.DOWN_OFFSET),
                            len, speed),
            upRight: new Snuok(container, worldConfig, start.plus(this.UPRIGHT_OFFSET),
                               len, speed),
            upLeft: new Snuok(container, worldConfig, start.plus(this.UPLEFT_OFFSET),
                               len, speed),
            downRight: new Snuok(container, worldConfig, start.plus(this.DOWNRIGHT_OFFSET),
                               len, speed),
            downLeft: new Snuok(container, worldConfig, start.plus(this.DOWNLEFT_OFFSET),
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

    addTailPiece() {
        this.map(Snuok.prototype.addTailPiece, []);
    }

    draw(delta) {
        if (!this.dead) {
            let states = this.map(Snuok.prototype.draw, [delta])
            if (states[0]) {
                this.stateTick();
            }
            return states[0];
        }
        return undefined;
    }

    async stateTick() {
        this.checkWrap();
        let head = this.replicas.centre.getHitBox();
        let collision = this.map(Snuok.prototype.checkCollides, [head])
            .reduce((acc, next) => {
                if (acc) {
                    return acc;
                }
                return next;
            });

        if (collision) {
            this.dead = true;
            await window.ghostTyper.display("Uh-Oh! You died :/");
            await new Promise((r) => setTimeout(r, 500));
            await window.taunter.display("Had enough?");
            await new Promise((r) => setTimeout(r, 500));
            window.resign.display("Yeah :'(");
            window.retry.display("Hell naw!");
        }
    }

    checkCollides(point, startFrom=1) {
        return this.map(Snuok.prototype.checkCollides, [point, startFrom])
            .reduce((acc, cur) => acc || cur);
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

    addTo(parent) {
        this.map(Snuok.prototype.addTo, [parent]);
    }

    getPoints() {
        return this.map(Snuok.prototype.getPoints, []).flat();
    }

    applyFilters(filters) {
        return this.map(Snuok.prototype.applyFilters, [filters]);
    }
}
