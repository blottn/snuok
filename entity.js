class Lerper {
    constructor(pos, dest) {
        this.pos = pos;
        this.dest = dest;
    }

    lerp(factor) {
        let deltaX = (this.dest.x - this.pos.x) * factor;
        let deltaY = (this.dest.y - this.pos.y) * factor;

        return new Vector(this.pos.x + deltaX,
                          this.pos.y + deltaY);
    }
    
    update(next) {
        let oldDest = this.dest.clone();
        this.setPos(this.dest);
        this.setDest(next);
        return oldDest;
    }

    shiftBy(offset) {
        this.pos = this.pos.plus(offset);
        this.dest = this.dest.plus(offset);
    }

    setPos(pos) {
        this.pos.x = pos.x;
        this.pos.y = pos.y;
    }

    setDest(dest) {
        this.dest.x = dest.x;
        this.dest.y = dest.y;
    }

}

class DirectionLerper extends Lerper {
    constructor(pos, direction) {
        super(pos, pos.plus(direction));
        this.direction = direction;
    }

    setDirection(direction) {
        this.direction = direction;
        this.dest = this.pos.plus(direction);
    }
}

class SimpleEntity extends DirectionLerper {
    constructor(worldConfig, sprite, start, direction) {
        super(start, direction);
        this.sprite = sprite;
        this.worldConfig = worldConfig;
        this.draw(0);
    }
    
    outOfBounds() {
        return this.dest.x >= this.worldConfig.MAP_WIDTH ||
               this.dest.x < 0 ||
               this.dest.y >= this.worldConfig.MAP_HEIGHT ||
               this.dest.y < 0;
    }

    getWrappingVector() {
        let dX = 0;
        let dY = 0;

        if (this.dest.x >= this.worldConfig.MAP_WIDTH)
            dX = -this.worldConfig.MAP_WIDTH;
        if (this.dest.x < 0)
            dX = this.worldConfig.MAP_WIDTH;
        if (this.dest.y >= this.worldConfig.MAP_HEIGHT)
            dY = -this.worldConfig.MAP_HEIGHT;
        if (this.dest.y < 0)
            dY = this.worldConfig.MAP_HEIGHT;
        return new Vector(dX, dY);
    }

    collides(point) {
        return this.pos.equals(point);
    }

    draw(lerpFactor) {
        let coords = this.lerp(lerpFactor);
        this.drawAt(coords);
    }
    
    drawAt(coords) {
        this.spriteAt(this.sprite, coords);
    }

    spriteAt(sprite, coords) {
        sprite.x = coords.x * this.worldConfig.BLOCK;
        sprite.y = coords.y * this.worldConfig.BLOCK;
    }

    addTo(container) {
        container.addChild(this.sprite);
    }

    destroy() {
        this.sprite.destroy();
    }
}

class WrappableEntity extends SimpleEntity {
    constructor(worldConfig, sprite, start, direction) {
        super(worldConfig, sprite, start, direction);
        this.replicas = {
            'left': PIXI.Sprite.from(sprite.texture),
            'right': PIXI.Sprite.from(sprite.texture),
            'up': PIXI.Sprite.from(sprite.texture),
            'down': PIXI.Sprite.from(sprite.texture),
        };
        this.LEFT_OFFSET = new Vector(-worldConfig.MAP_WIDTH,0);
        this.RIGHT_OFFSET = new Vector(worldConfig.MAP_WIDTH,0);
        this.UP_OFFSET = new Vector(0, -worldConfig.MAP_HEIGHT);
        this.DOWN_OFFSET = new Vector(0, worldConfig.MAP_HEIGHT);
    }

    update(next) {
        let adjuster = new Vector(0,0);
        if (this.outOfBounds()) {
            adjuster = this.getWrappingVector();
        }
        let out = super.update(next);
        this.pos = this.pos.plus(adjuster);
        this.dest = this.dest.plus(adjuster);
        return out;
    }

    drawAt(coords) {
        super.drawAt(coords);
        super.spriteAt(this.replicas['left'],
                       coords.plus(this.LEFT_OFFSET));
        super.spriteAt(this.replicas['right'],
                       coords.plus(this.RIGHT_OFFSET));
        super.spriteAt(this.replicas['up'],
                       coords.plus(this.UP_OFFSET));
        super.spriteAt(this.replicas['down'],
                       coords.plus(this.DOWN_OFFSET));
    }

    addTo(container) {
        super.addTo(container);
        container.addChild(this.replicas['left']);
        container.addChild(this.replicas['right']);
        container.addChild(this.replicas['up']);
        container.addChild(this.replicas['down']);
    }

    destroy() {
        super.destroy();
        this.replicas['left'].destroy();
        this.replicas['right'].destroy();
        this.replicas['up'].destroy();
        this.replicas['down'].destroy();
    }
}

