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
