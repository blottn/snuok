export class Vector {
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
