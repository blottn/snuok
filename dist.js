/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./index.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./entity.js":
/*!*******************!*\
  !*** ./entity.js ***!
  \*******************/
/*! exports provided: Lerper, DirectionLerper, SimpleEntity */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"Lerper\", function() { return Lerper; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"DirectionLerper\", function() { return DirectionLerper; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"SimpleEntity\", function() { return SimpleEntity; });\n/* harmony import */ var _vector_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./vector.js */ \"./vector.js\");\n\n\nclass Lerper {\n    constructor(pos, dest) {\n        this.pos = pos;\n        this.dest = dest;\n    }\n\n    lerp(factor) {\n        let deltaX = (this.dest.x - this.pos.x) * factor;\n        let deltaY = (this.dest.y - this.pos.y) * factor;\n\n        return new _vector_js__WEBPACK_IMPORTED_MODULE_0__[\"Vector\"](this.pos.x + deltaX,\n                          this.pos.y + deltaY);\n    }\n    \n    update(next) {\n        let oldDest = this.dest.clone();\n        this.setPos(this.dest);\n        this.setDest(next);\n        return oldDest;\n    }\n\n    shiftBy(offset) {\n        this.pos = this.pos.plus(offset);\n        this.dest = this.dest.plus(offset);\n    }\n\n    setPos(pos) {\n        this.pos.x = pos.x;\n        this.pos.y = pos.y;\n    }\n\n    setDest(dest) {\n        this.dest.x = dest.x;\n        this.dest.y = dest.y;\n    }\n\n}\n\nclass DirectionLerper extends Lerper {\n    constructor(pos, direction) {\n        super(pos, pos.plus(direction));\n        this.direction = direction;\n    }\n\n    setDirection(direction) {\n        this.direction = direction;\n        this.dest = this.pos.plus(direction);\n    }\n}\n\nclass SimpleEntity extends DirectionLerper {\n    constructor(worldConfig, sprite, start, direction) {\n        super(start, direction);\n        this.sprite = sprite;\n        this.worldConfig = worldConfig;\n        this.draw(0);\n    }\n    \n    outOfBounds() {\n        return this.dest.x >= this.worldConfig.MAP_WIDTH ||\n               this.dest.x < 0 ||\n               this.dest.y >= this.worldConfig.MAP_HEIGHT ||\n               this.dest.y < 0;\n    }\n\n    getWrappingVector() {\n        let dX = 0;\n        let dY = 0;\n\n        if (this.dest.x >= this.worldConfig.MAP_WIDTH)\n            dX = -this.worldConfig.MAP_WIDTH;\n        if (this.dest.x < 0)\n            dX = this.worldConfig.MAP_WIDTH;\n        if (this.dest.y >= this.worldConfig.MAP_HEIGHT)\n            dY = -this.worldConfig.MAP_HEIGHT;\n        if (this.dest.y < 0)\n            dY = this.worldConfig.MAP_HEIGHT;\n        return new _vector_js__WEBPACK_IMPORTED_MODULE_0__[\"Vector\"](dX, dY);\n    }\n\n    getHitBox() {\n        return this.dest.clone();\n    }\n\n    collides(point) {\n        return this.pos.equals(point);\n    }\n\n    draw(lerpFactor) {\n        let coords = this.lerp(lerpFactor);\n        this.drawAt(coords);\n    }\n    \n    drawAt(coords) {\n        this.spriteAt(this.sprite, coords);\n    }\n\n    spriteAt(sprite, coords) {\n        sprite.x = coords.x * this.worldConfig.BLOCK;\n        sprite.y = coords.y * this.worldConfig.BLOCK;\n    }\n\n    addTo(container) {\n        container.addChild(this.sprite);\n    }\n\n    destroy() {\n        this.sprite.destroy();\n    }\n}\n\n\n//# sourceURL=webpack:///./entity.js?");

/***/ }),

/***/ "./filter.js":
/*!*******************!*\
  !*** ./filter.js ***!
  \*******************/
/*! exports provided: LerpFilter, YoyoFilter, SlideFilter, GradientFilter */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"LerpFilter\", function() { return LerpFilter; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"YoyoFilter\", function() { return YoyoFilter; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"SlideFilter\", function() { return SlideFilter; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"GradientFilter\", function() { return GradientFilter; });\nclass LerpFilter extends PIXI.Filter {\n    constructor(totalLerpTime, vertex, fragment, uniforms = {}) {\n        super(vertex, fragment, {lerp: 0, ...uniforms});\n        PIXI.Ticker.shared.add((delta) => {\n            if (this.uniforms.lerp < 1)\n                this.uniforms.lerp += delta / totalLerpTime;\n            if (this.uniforms.lerp > 1)\n                this.uniforms.lerp = 1;\n        });\n    }\n}\n\nclass YoyoFilter extends PIXI.Filter {\n    constructor(totalLerpTime, cb, vertex, fragment, uniforms = {}) {\n        super(vertex, fragment, {lerp: 0, ...uniforms});\n        this.progress = 0;\n        PIXI.Ticker.shared.add((delta) => {\n            this.progress += delta;\n            if (this.progress > totalLerpTime) {\n                cb(this);\n                this.progress = totalLerpTime;\n            }\n            this.uniforms.lerp = Math.sin((this.progress / totalLerpTime) * Math.PI);\n        });\n    };\n}\n\nfunction slideFragmentShader(phaseScale, heightScale) {\n    let phaseString = phaseScale.toFixed(2);\n    let heightString = heightScale.toFixed(2);\n    return `\nvarying vec2 vTextureCoord;\nuniform float lerp;\nuniform float phase;\nuniform sampler2D uSampler;\n\nvoid main(void){\n    vec2 sampleCoord = vTextureCoord;\n    sampleCoord.y = sampleCoord.y + lerp * sin(phase + (sampleCoord.x * 6.283) * ${phaseString}) / ${heightString} ;\n    gl_FragColor = texture2D(uSampler, sampleCoord);\n}\n`\n}\n\nclass SlideFilter extends YoyoFilter {\n    constructor(cb, phaseScale = 1.0, heightScale = 8.0) {\n        super(500, cb ,undefined, slideFragmentShader(phaseScale, heightScale), {phase: Math.random() * Math.PI * 2 })\n    }\n}\n\nfunction gradientFragmentShader() {\n    return `\nvarying vec2 vTextureCoord;\nuniform float lerp;\nuniform sampler2D uSampler;\n\nvoid main(void){\n    vec4 sampledColor = texture2D(uSampler, vTextureCoord);\n    vec4 outputColor = vec4(0.0);\n    outputColor.w = sampledColor.w;\n    outputColor.x = sampledColor.x * sin(lerp * 6.283) + sampledColor.y * sin(lerp* 6.283 + 2.073) + sampledColor.z * sin(lerp * 6.283 + 4.21);\n    outputColor.y = sampledColor.x * sin(lerp * 6.283 + 2.073) + sampledColor.y * sin(lerp* 6.283 + 4.21) + sampledColor.z * sin(lerp * 6.283);\n    outputColor.z = sampledColor.x * sin(lerp * 6.283 + 4.21) + sampledColor.y * sin(lerp* 6.283) + sampledColor.z * sin(lerp * 6.283 + 2.07);\n    gl_FragColor = outputColor;\n\n}\n`;\n}\nclass GradientFilter extends YoyoFilter {\n    constructor(cb) {\n        super(500, cb, undefined, gradientFragmentShader(), {});\n    }\n}\n\n\n//# sourceURL=webpack:///./filter.js?");

/***/ }),

/***/ "./index.js":
/*!******************!*\
  !*** ./index.js ***!
  \******************/
/*! no exports provided */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _snuok_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./snuok.js */ \"./snuok.js\");\n/* harmony import */ var _vector_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./vector.js */ \"./vector.js\");\n/* harmony import */ var _world_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./world.js */ \"./world.js\");\n/* harmony import */ var _filter_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./filter.js */ \"./filter.js\");\n\n\n\n\n\nconst MAP_WIDTH = 20;\nconst MAP_HEIGHT = 20;\nconst BLOCK = 24;\nconst WIDTH = MAP_WIDTH * BLOCK;\nconst HEIGHT = MAP_HEIGHT * BLOCK;\n\nlet worldConfig = {MAP_WIDTH, MAP_HEIGHT, BLOCK};\n\nPIXI.settings.WRAP_MODE = PIXI.WRAP_MODES.REPEAT;\n\nlet app = new PIXI.Application({\n    width: WIDTH,\n    height: HEIGHT,\n    antialias: true,\n    transparent: false,\n    resolution: 1,\n});\n\napp.renderer.backgroundColor = \"0xf4f4f4\";\napp.stage.sortableChildren = true;\n\n$(document).ready(() => {\n    $(\"#root-center\")[0].appendChild(app.view);\n    let typingElement = $(\"#ghost-anchor\")[0]\n    window.ghostTyper = new Ghost(typingElement);\n})\n\n\n// load sprites!\nPIXI.loader\n  .add([\n      \"apple.png\",\n\t  \"wall.png\",\n\t  \"snuok_body.png\",\n\t  \"snuok_head_pink.png\",\n\t  \"snuok_head_orange.png\",\n  ])\n  .load(setup);\n\nfunction setup() {\n    let len = 18;\n    let lerp_time = 13;\n    /*let instructions = [\n        'up',\n        'wait',\n        'wait',\n        'left',\n        'down',\n        'wait',\n        'wait',\n        'right'\n    ];*/\n    let snuok = new _snuok_js__WEBPACK_IMPORTED_MODULE_0__[\"WrappedSnuok\"](app.stage, worldConfig, new _vector_js__WEBPACK_IMPORTED_MODULE_1__[\"Vector\"](18,0), len, lerp_time);\n\tsnuok.bindKeys({\n\t    'w': snuok.UP,\n\t    's': snuok.DOWN,\n\t    'a': snuok.LEFT,\n\t    'd': snuok.RIGHT,\n        37 : snuok.LEFT,\n        38 : snuok.UP,\n        39 : snuok.RIGHT,\n        40 : snuok.DOWN,\n\t})\n\n\tlet world = new _world_js__WEBPACK_IMPORTED_MODULE_2__[\"World\"](app.stage, worldConfig, snuok);\n\tapp.ticker.add(step.bind({}, world))\n}\n\nfunction step(world, delta) {\n\n    world.update(delta);\n}\n\n\n\n\n//# sourceURL=webpack:///./index.js?");

/***/ }),

/***/ "./snuok.js":
/*!******************!*\
  !*** ./snuok.js ***!
  \******************/
/*! exports provided: Snuok, WrappedSnuok */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"Snuok\", function() { return Snuok; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"WrappedSnuok\", function() { return WrappedSnuok; });\n/* harmony import */ var _vector_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./vector.js */ \"./vector.js\");\n/* harmony import */ var _entity_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./entity.js */ \"./entity.js\");\n/* harmony import */ var _filter_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./filter.js */ \"./filter.js\");\n\n\n\n\n// Helper for Snuok constructor\nfunction createPart(worldConfig, zIndex, imageName, pos, direction) {\n    let sprite = new PIXI.Sprite(\n        PIXI.loader.resources[imageName].texture\n    );\n    sprite.zIndex = zIndex;\n    return new _entity_js__WEBPACK_IMPORTED_MODULE_1__[\"SimpleEntity\"](worldConfig, sprite, pos, direction);\n}\n\nclass Snuok {\n    constructor (container, worldConfig, start, len, speed) { // not sure this needs to read the app state\n        this.container = container;\n        this.speed = speed;\n        this.lerpProgress = 0;\n\n\t    this.direction = new _vector_js__WEBPACK_IMPORTED_MODULE_0__[\"Vector\"](1,0);\n\t    this.nextDirection = this.direction;\n\n        this.head = createPart.bind({}, worldConfig, 100, \"snuok_head_pink.png\")\n        this.body = createPart.bind({}, worldConfig, 50, \"snuok_body.png\")\n\n        this.corners = {};\n        this.parts = [\n            this.head(start, this.direction)\n        ];\n        for (let i = 0; i < len ; i++) {\n            let ent = this.body(this.parts[i].pos.left(), \n                                this.direction);\n            this.parts.push(ent);\n        }\n\n        this.filters = [];\n    }\n\n    addTo(parent) {\n    \tthis.parts.map((entity) => entity.addTo(parent))\n    }\n\n    shiftBy(offset) {\n        this.parts.map((part) => {\n            part.shiftBy(offset);\n        });\n    }\n\n\tupdate(delta) {\n        if (this.dead) {\n            return;\n        }\n        let updateState = this.updateLerp(delta);\n        let lerpFactor = this.lerpProgress / this.speed;\n\n        if (updateState) {\n            this.stateTick(lerpFactor)\n        }\n\n        this.parts.map((part) => part.draw(lerpFactor));\n\n        return updateState;\n\t}\n\n    stateTick(lerpFactor) {\n        // update positions and destinations \n        let next = this.parts[0].dest;\n        for (let i = 1; i < this.parts.length ; i++) {\n            next = this.parts[i].update(next);\n        }\n\n        // update position and destination of head\n        if (!this.direction.equals(this.nextDirection)) {\n            this.addCornerAt(this.parts[0].dest);\n            this.direction = this.nextDirection;\n        }\n\n        this.parts[0].update(\n            this.parts[0].dest.plus(this.direction)\n        );\n        \n        for (let k in this.corners) {\n            this.corners[k].ttl -= 1;\n            if (this.corners[k].ttl <= 0) {\n                this.corners[k].corner.destroy();\n                delete this.corners[k];\n            }\n        }\n    }\n    \n    outOfBounds() {\n        return this.parts[0].outOfBounds();\n    }\n\n    getHitBox() {\n        return this.parts[0].getHitBox();\n    }\n\n    checkCollisions() {\n        return this.checkCollides(this.getHitBox());\n    }\n\n    checkCollides(pos, startFrom=1) { // use startFrom=0 to also check if it overlaps the head\n\n        return this.parts\n            .slice(startFrom) // ignore head\n            .reduce((collided, part) => {\n                if (collided) {\n                    return collided;\n                }\n                if (part.collides(pos)) {\n                    return part;\n                }\n                return undefined;\n        }, undefined);\n    }\n\n    updateLerp(delta) {\n        this.lerpProgress += delta;\n        let moveToNext = this.lerpProgress > this.speed;\n        while (this.lerpProgress > this.speed) {\n            this.lerpProgress -= this.speed;\n        }\n        return moveToNext;\n    }\n\n    turnDirection(newDirection) {\n\t    const err = 0.0001; // arbitrary error in case of float magic\n\t    if (this.direction.plus(newDirection).magnitude() >= err) { // not opposites\n       \t\tthis.nextDirection = newDirection;\n\t    }\n\t}\n\n    addCornerAt(position) {\n        let corner = this.body(position, new _vector_js__WEBPACK_IMPORTED_MODULE_0__[\"Vector\"](0,0));\n        corner.sprite.filters = this.filters;\n        corner.addTo(this.container);\n        this.corners[position.toString()] = {corner, ttl: this.parts.length};\n    }\n\n    addTailPiece() {\n        let tail = this.body(this.parts[this.parts.length - 1].pos.clone(), new _vector_js__WEBPACK_IMPORTED_MODULE_0__[\"Vector\"](0, 0));\n        tail.sprite.filters = this.filters;\n        tail.addTo(this.container);\n        this.parts.push(tail);\n\n        // increase ttl on corners!\n        for (let k in this.corners) {\n            this.corners[k].ttl += 1;\n        }\n    }\n\n    getPoints() {\n        return this.parts.map((point) => point.pos.toString());\n    }\n\n    applyFilters(filters) {\n        this.filters = filters;\n        for (let i = 0; i < this.parts.length ; i++) {\n            this.parts[i].sprite.filters = filters;\n        }\n        for (let k in this.corners) {\n            this.corners[k].sprite.filters = filters;\n        }\n        return this.parts.map((part) => part.sprite.filters = filters);\n    }\n}\n\nclass WrappedSnuok {\n    constructor(container, worldConfig, start, len, speed) {\n        this.LEFT_OFFSET = new _vector_js__WEBPACK_IMPORTED_MODULE_0__[\"Vector\"](-worldConfig.MAP_WIDTH, 0);\n        this.RIGHT_OFFSET = new _vector_js__WEBPACK_IMPORTED_MODULE_0__[\"Vector\"](worldConfig.MAP_WIDTH, 0);\n        this.UP_OFFSET = new _vector_js__WEBPACK_IMPORTED_MODULE_0__[\"Vector\"](0, -worldConfig.MAP_HEIGHT);\n        this.DOWN_OFFSET = new _vector_js__WEBPACK_IMPORTED_MODULE_0__[\"Vector\"](0, worldConfig.MAP_HEIGHT);\n\n        this.UPLEFT_OFFSET = this.UP_OFFSET.plus(this.LEFT_OFFSET);\n        this.UPRIGHT_OFFSET = this.UP_OFFSET.plus(this.RIGHT_OFFSET);\n        this.DOWNLEFT_OFFSET = this.DOWN_OFFSET.plus(this.LEFT_OFFSET);\n        this.DOWNRIGHT_OFFSET = this.DOWN_OFFSET.plus(this.RIGHT_OFFSET);\n\n        this.UP = this.up.bind(this);\n        this.DOWN = this.down.bind(this);\n        this.LEFT = this.left.bind(this);\n        this.RIGHT = this.right.bind(this);\n        this.dead = false;\n        this.replicas = {\n            centre: new Snuok(container, worldConfig, start, len, speed),\n            left: new Snuok(container, worldConfig, start.plus(this.LEFT_OFFSET),\n                            len, speed),\n            right: new Snuok(container, worldConfig, start.plus(this.RIGHT_OFFSET),\n                             len, speed),\n            up: new Snuok(container, worldConfig, start.plus(this.UP_OFFSET),\n                          len, speed),\n            down: new Snuok(container, worldConfig, start.plus(this.DOWN_OFFSET),\n                            len, speed),\n            upRight: new Snuok(container, worldConfig, start.plus(this.UPRIGHT_OFFSET),\n                               len, speed),\n            upLeft: new Snuok(container, worldConfig, start.plus(this.UPLEFT_OFFSET),\n                               len, speed),\n            downRight: new Snuok(container, worldConfig, start.plus(this.DOWNRIGHT_OFFSET),\n                               len, speed),\n            downLeft: new Snuok(container, worldConfig, start.plus(this.DOWNLEFT_OFFSET),\n                               len, speed),\n        };\n    }\n\n    map(func, args) {\n        return Object.values(this.replicas)\n            .map((s) => func.apply(s, args));\n    }\n\n    turnDirection(newDirection) {\n        this.map(Snuok.prototype.turnDirection, [newDirection]);\n\t}\n\n    up() {this.turnDirection(new _vector_js__WEBPACK_IMPORTED_MODULE_0__[\"Vector\"](0, -1));}\n    down() {this.turnDirection(new _vector_js__WEBPACK_IMPORTED_MODULE_0__[\"Vector\"](0, 1));}\n    left() {this.turnDirection(new _vector_js__WEBPACK_IMPORTED_MODULE_0__[\"Vector\"](-1, 0));}\n    right() {this.turnDirection(new _vector_js__WEBPACK_IMPORTED_MODULE_0__[\"Vector\"](1, 0));}\n\n    bindKeys(bindings) {\n    \t$(window).keydown((evt) => {\n    \t\tif (bindings[evt.key]) {\n    \t\t\tbindings[evt.key]();\n    \t\t}\n            if (bindings[evt.keyCode]) {\n                bindings[evt.keyCode]();\n            }\n    \t})\n    }\n\n    addTailPiece() {\n        this.map(Snuok.prototype.addTailPiece, []);\n    }\n\n    update(delta) {\n        if (!this.dead) {\n            let states = this.map(Snuok.prototype.update, [delta])\n            if (states[0]) {\n                this.stateTick();\n            }\n            return states[0];\n        }\n        return undefined;\n    }\n\n    stateTick() {\n        this.checkWrap();\n        let head = this.replicas.centre.getHitBox();\n        let collision = this.map(Snuok.prototype.checkCollides, [head])\n            .reduce((acc, next) => {\n                if (acc) {\n                    return acc;\n                }\n                return next;\n            });\n\n        if (collision) {\n            this.dead = true;\n            window.ghostTyper.display(\"Uh-Oh! You died :/\");\n        }\n    }\n\n    checkCollides(point, startFrom=1) {\n        return this.replicas.centre.checkCollides(point, startFrom);\n    }\n\n    checkWrap() {\n        if (this.replicas.centre.outOfBounds()) {\n            let wrapper = this.replicas.centre.parts[0].getWrappingVector();\n            if (wrapper.x > 0) { // out left\n                this.rotate('left', 'centre', 'right', wrapper);\n                this.rotate('upLeft', 'up', 'upRight', wrapper);\n                this.rotate('downLeft', 'down', 'downRight', wrapper);\n            }\n            if (wrapper.x < 0) {\n                this.rotate('right', 'centre', 'left', wrapper);\n                this.rotate('upRight', 'up', 'upLeft', wrapper);\n                this.rotate('downRight', 'down', 'downLeft', wrapper);\n            }\n            if (wrapper.y < 0) { // out bottom\n                this.rotate('down', 'centre', 'up', wrapper);\n                this.rotate('downLeft', 'left', 'upLeft', wrapper);\n                this.rotate('downRight', 'right', 'upRight', wrapper);\n            }\n            if (wrapper.y > 0) {\n                this.rotate('up', 'centre', 'down', wrapper);\n                this.rotate('upLeft', 'left', 'downLeft', wrapper);\n                this.rotate('upRight', 'right', 'downRight', wrapper);\n            }\n        }\n    }\n\n    rotate(outer, centre, inner, wrapper) {\n        let temp = this.replicas[centre];\n        this.replicas[centre] = this.replicas[inner];\n        this.replicas[inner] = this.replicas[outer];\n\n        this.replicas[inner] = this.replicas[outer];\n        this.replicas[outer] = temp;\n        this.replicas[inner].shiftBy(wrapper);\n        this.replicas[inner].shiftBy(wrapper);\n        this.replicas[inner].shiftBy(wrapper);\n    }\n\n    addTo(parent) {\n        this.map(Snuok.prototype.addTo, [parent]);\n    }\n\n    getPoints() {\n        return this.map(Snuok.prototype.getPoints, []).flat();\n    }\n\n    applyFilters(filters) {\n        return this.map(Snuok.prototype.applyFilters, [filters]);\n    }\n}\n\n\n//# sourceURL=webpack:///./snuok.js?");

/***/ }),

/***/ "./vector.js":
/*!*******************!*\
  !*** ./vector.js ***!
  \*******************/
/*! exports provided: Vector */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"Vector\", function() { return Vector; });\nclass Vector {\n    constructor(x,y) {\n        this.x = x;\n        this.y = y;\n    }\n    \n    left() {\n        return new Vector(this.x - 1, this.y);\n    }\n\n    right() {\n        return new Vector(this.x + 1, this.y);\n    }\n\n    up() {\n        return new Vector(this.x, this.y - 1);\n    }\n\n    down() {\n        return new Vector(this.x, this.y + 1);\n    }\n\n    outOfBounds() {\n        return this.x >= MAP_WIDTH ||\n            this.x < 0 ||\n            this.y >= MAP_HEIGHT ||\n            this.y < 0;\n    }\n\n    getWrappingVector() {\n        let dX = 0;\n        let dY = 0;\n\n        if (this.x >= MAP_WIDTH)\n            dX = -MAP_WIDTH;\n        if (this.x < 0)\n            dX = MAP_WIDTH;\n        if (this.y >= MAP_HEIGHT)\n            dY = -MAP_HEIGHT;\n        if (this.y < 0)\n            dY = MAP_HEIGHT;\n        return new Vector(dX, dY);\n    }\n\n\twrap() {\n        if (this.x >= MAP_WIDTH)\n            this.x -= MAP_WIDTH;\n        if (this.x < 0)\n            this.x += MAP_WIDTH;\n\n        if (this.y >= MAP_HEIGHT)\n            this.y -= MAP_HEIGHT;\n        if (this.y < 0)\n            this.y += MAP_HEIGHT;\n        return this;\n    }\n\n\tplus(v) {\n\t\treturn new Vector(this.x + v.x, this.y + v.y);\n\t}\n\n    minus(v) {\n        return new Vector(this.x - v.x, this.y - v.y);\n    }\n\t\n\tmagnitude() {\n\t\treturn Math.abs(Math.sqrt((this.x*this.x) + (this.y*this.y)));\n\t}\n    \n    clone() {\n        return new Vector(this.x, this.y);\n    }\n\n    equals(v) {\n        return this.x == v.x && this.y == v.y;\n    }\n\n    toString() {\n        return `${this.x}.${this.y}`;\n    }\n\n    static fromString(input) {\n        let [xtxt, yTxt] = string.split('.');\n        return new Vector(\n            Integer.parseInt(xTxt),\n            Integer.parseInt(yTxt)\n        );\n    }\n}\n\n\n//# sourceURL=webpack:///./vector.js?");

/***/ }),

/***/ "./world.js":
/*!******************!*\
  !*** ./world.js ***!
  \******************/
/*! exports provided: World, Apple */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"World\", function() { return World; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"Apple\", function() { return Apple; });\n/* harmony import */ var _entity_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./entity.js */ \"./entity.js\");\n/* harmony import */ var _vector_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./vector.js */ \"./vector.js\");\n/* harmony import */ var _filter_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./filter.js */ \"./filter.js\");\n\n\n\n\nclass World {\n    constructor(container, worldConfig, snuok, seed) {\n        this.container = container;\n        this.worldConfig = worldConfig;\n        this.filters = [];\n        this.snuok = snuok;\n        this.snuok.addTo(container);\n\n        this.seed = seed;\n        if (this.seed == undefined) {\n            this.seed = Math.floor(Math.random() * 1000000);     \n        }\n\n        this.apple = this.createApple();\n    }\n\n    random() {\n        let x = Math.sin(this.seed++) * 1000000;\n        return x - Math.floor(x);\n    }\n\n    createApple() {\n        let possibilities = [];\n        for (let i = 0; i < this.worldConfig.MAP_WIDTH ; i++) {\n            for (let j = 0; j < this.worldConfig.MAP_HEIGHT ; j++) {\n                possibilities.push(`${i}.${j}`);\n            }\n        }\n        let consumedPoints = this.snuok.getPoints();\n        \n        possibilities = possibilities.filter(x => {\n            return !this.snuok.getPoints().includes(x)\n        });\n        \n        let choice = Math.floor(this.random() * possibilities.length);\n        let pos = possibilities[choice].split('.').map((x) => {\n            return parseInt(x);\n        });\n        return new Apple(this.container, this.worldConfig, new _vector_js__WEBPACK_IMPORTED_MODULE_1__[\"Vector\"](pos[0], pos[1]));\n    }\n\n    update(delta) {\n        // TODO improve this... the snake should not be the controller of state ticks\n        let stateTick = this.snuok.update(delta);\n        if (stateTick) {\n            if (this.snuok.checkCollides(this.apple.getHitBox(), 0)) {\n                // eat the apple\n                this.snuok.addTailPiece();\n\n                let filter = this.apple.getFilter(this);\n                if (filter) {\n                    this.addFilter(filter);\n                }\n                \n                // get new apple\n                this.apple.destroy();\n                this.apple = this.createApple();\n            }\n            this.apple.stateTick();\n        }\n    }\n\n    addFilter(filter, timeout) {\n        this.filters.push(filter);\n        this.container.filters = this.filters;\n    }\n\n    removeFilter(filter) {\n        this.filters = this.filters.filter(f => f != filter);\n        this.container.filters = this.filters;\n    }\n}\n\nclass Apple extends _entity_js__WEBPACK_IMPORTED_MODULE_0__[\"SimpleEntity\"] {\n\n    constructor(container, worldConfig, position) {\n        let sprite = new PIXI.Sprite(\n            PIXI.loader.resources[\"apple.png\"].texture\n        );\n        super(worldConfig, sprite, position, new _vector_js__WEBPACK_IMPORTED_MODULE_1__[\"Vector\"](0,0));\n        this.addTo(container);\n    }\n\n    stateTick() {}\n\n    // Apply the effect\n    getFilter(world) {\n        let roll = Math.random() * 100;\n        let callback = world.removeFilter.bind(world);\n        if (roll > 50) {\n            return new _filter_js__WEBPACK_IMPORTED_MODULE_2__[\"SlideFilter\"](callback);\n        }\n        if (roll > 25) {\n            return new _filter_js__WEBPACK_IMPORTED_MODULE_2__[\"GradientFilter\"](callback);\n        }\n        return;\n    }\n}\n\n\n//# sourceURL=webpack:///./world.js?");

/***/ })

/******/ });