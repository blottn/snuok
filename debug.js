class ScriptedSnuok extends WrappedSnuok {
    constructor(app, start, len, speed, script) {
        super(app, start, len, speed);
        this.script = script;
        this.scriptPos = 0;
    }

    stateTick() {
        super.stateTick();
        this.execute(this.script[this.scriptPos]);
        this.scriptPos += 1;
        this.scriptPos %= this.script.length;

    }

    bindKeys() {}

    execute(command) {
        if (command === 'up') {
            this.UP();
        }
        if (command === 'down') {
            this.DOWN();
        }
        if (command === 'left') {
            this.LEFT();
        }
        if (command === 'right') {
            this.RIGHT();
        }
    }
}
