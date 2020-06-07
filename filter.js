export class LerpFilter extends PIXI.Filter {
    constructor(totalLerpTime, vertex, fragment, uniforms = {}) {
        super(vertex, fragment, {lerp: 0, ...uniforms});
        PIXI.Ticker.shared.add((delta) => {
            if (this.uniforms.lerp < 1)
                this.uniforms.lerp += delta / totalLerpTime;
            if (this.uniforms.lerp > 1)
                this.uniforms.lerp = 1;
        });
    }
}

function slideFragmentShader(phaseScale, heightScale) {
    let phaseString = phaseScale.toFixed(2);
    let heightString = heightScale.toFixed(2);
    return `
varying vec2 vTextureCoord;
uniform float lerp;
uniform sampler2D uSampler;

void main(void){
    vec2 sampleCoord = vTextureCoord;
    sampleCoord.y = sampleCoord.y + lerp * sin((sampleCoord.x * 6.283) / ${phaseString}) / ${heightString} ;
    gl_FragColor = texture2D(uSampler, sampleCoord);
}
`
}

export class SlideFilter extends LerpFilter {
    constructor(phaseScale = 1.0, heightScale = 5.0) {
        super(1000, undefined, slideFragmentShader(phaseScale, heightScale))
    }
}


