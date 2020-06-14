// Ticker is a UI component that gives a number an animated appearance as it counts.


export class Ticker {
    constructor(domElement, startVal = 0, precision=3) {
        this.domElement = domElement;
        this.value = startVal;
        this.precision = precision;
    }
    
    setValue(newValue) {
        let transitions = ['ticker', 'rotation', 'downcounter'];
        let transition = transitions[Math.floor(Math.random() * transitions.length)];
        if (transition === 'ticker') {
            this.tickUpTo(newValue);
        }
        else if (transition === 'rotation') {
            this.rotateTo(newValue);
        }
        else if (transition === 'downcounter') {
            this.rollDownTo(newValue);
        }
    }

    tickUpTo(newValue) {
        if (this.value != newValue) {
            this.value += 1;
            this.setDom(this.value);
            setTimeout(this.tickUpTo.bind(this, newValue), 100);
        }
    }

    rotateTo(newValue) {
        if (this.value != newValue) {
            let hundreds = Math.floor(newValue / 100);
            let tens = Math.floor((newValue % 100) / 10);
            let ones = newValue % 10;
            this.value = (this.value * 10) % 1000 + hundreds
            this.setDom(this.value);
            setTimeout(() => {
                this.value = (this.value * 10) % 1000 + tens;
                this.setDom(this.value);
                setTimeout(() => {
                    this.value = (this.value * 10) % 1000 + ones;
                    this.setDom(this.value);
                }, 200);
            }, 200);
        }
    }

    rollDownTo(newValue) {
        if (this.value != newValue) {
            this.value -= 10;
            if (this.value < 0) {
                this.value += 1000;
            }
            this.setDom(this.value);
            setTimeout(this.rollDownTo.bind(this, newValue),1);
        }
    }

    setDom(value) {
        let text = value.toString();
        if (value < 100) {
            text = '0' + text;
        }
        if (value < 10) {
            text = '0' + text;
        }
        this.domElement.innerText = text;
    }
}
