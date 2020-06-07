import { SimpleEntity } from './entity.js';
import { Vector } from './vector.js';
import { SlideFilter } from './filter.js';

export class World {
    constructor(container, worldConfig, snuok, seed) {
        this.container = container;
        this.worldConfig = worldConfig;
        this.filters = [];
        this.snuok = snuok;
        this.snuok.addTo(container);

        this.seed = seed;
        if (this.seed == undefined) {
            this.seed = Math.floor(Math.random() * 1000000);     
        }

        this.apple = this.createApple();
    }

    random() {
        let x = Math.sin(this.seed++) * 1000000;
        return x - Math.floor(x);
    }

    createApple() {
        let possibilities = [];
        for (let i = 0; i < this.worldConfig.MAP_WIDTH ; i++) {
            for (let j = 0; j < this.worldConfig.MAP_HEIGHT ; j++) {
                possibilities.push(`${i}.${j}`);
            }
        }
        let consumedPoints = this.snuok.getPoints();
        
        possibilities = possibilities.filter(x => {
            return !this.snuok.getPoints().includes(x)
        });
        
        let choice = Math.floor(this.random() * possibilities.length);
        let pos = possibilities[choice].split('.').map((x) => {
            return parseInt(x);
        });
        return new Apple(this.container, this.worldConfig, new Vector(pos[0], pos[1]));
    }

    update(delta) {
        // TODO improve this... the snake should not be the controller of state ticks
        let stateTick = this.snuok.update(delta);
        if (stateTick) {
            if (this.snuok.checkCollides(this.apple.getHitBox(), 0)) {
                this.snuok.addTailPiece();
                this.apple.apply(this);
                this.apple.destroy();
                this.apple = this.createApple();
            }
            this.apple.stateTick();
        }
    }

    addFilter(filter, timeout) {
        this.filters.push(filter);
        setTimeout(() => {
            this.filters = this.filters.filter(f => f != filter);
            this.container.filters = this.filters;
        }, timeout);
        this.container.filters = this.filters;
    }
}

export class Apple extends SimpleEntity {
    constructor(container, worldConfig, position) {
        let sprite = new PIXI.Sprite(
            PIXI.loader.resources["apple.png"].texture
        );
        super(worldConfig, sprite, position, new Vector(0,0));
        this.addTo(container);
    }

    stateTick() {}

    // Apply the effect
    apply(world) {
        world.addFilter(new SlideFilter(), 5000);
    }
}
