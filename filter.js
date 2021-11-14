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

export class YoyoFilter extends PIXI.Filter {
    constructor(totalLerpTime, cb, vertex, fragment, uniforms = {}) {
        super(vertex, fragment, {lerp: 0, ...uniforms});
        this.progress = 0;
        PIXI.Ticker.shared.add((delta) => {
            this.progress += delta;
            if (this.progress > totalLerpTime) {
                cb(this);
                this.progress = totalLerpTime;
            }
            this.uniforms.lerp = Math.sin((this.progress / totalLerpTime) * Math.PI);
        });
    };
}

function ySlideFragmentShader(phaseScale, heightScale) {
    let phaseString = phaseScale.toFixed(2);
    let heightString = heightScale.toFixed(2);
    return `
varying vec2 vTextureCoord;
uniform float lerp;
uniform float phase;
uniform sampler2D uSampler;

void main(void){
    vec2 sampleCoord = vTextureCoord;
    sampleCoord.y = sampleCoord.y + lerp * sin(phase + (sampleCoord.x * 6.283) * ${phaseString}) / ${heightString} ;
    gl_FragColor = texture2D(uSampler, sampleCoord);
}
`
}

function xSlideFragmentShader(phaseScale, heightScale) {
    let phaseString = phaseScale.toFixed(2);
    let heightString = heightScale.toFixed(2);
    return `
varying vec2 vTextureCoord;
uniform float lerp;
uniform float phase;
uniform sampler2D uSampler;

void main(void){
    vec2 sampleCoord = vTextureCoord;
    sampleCoord.x = sampleCoord.x + lerp * sin(phase + (sampleCoord.y * 6.283) * ${phaseString}) / ${heightString} ;
    gl_FragColor = texture2D(uSampler, sampleCoord);
}
`
}

export class YSlideFilter extends YoyoFilter {
    constructor(cb, phaseScale = 1.0, heightScale = 8.0) {
        super(500, cb ,undefined, ySlideFragmentShader(phaseScale, heightScale), {phase: Math.random() * Math.PI * 2 })
    }
}

export class XSlideFilter extends YoyoFilter {
    constructor(cb, phaseScale = 1.0, heightScale = 8.0) {
        super(500, cb ,undefined, xSlideFragmentShader(phaseScale, heightScale), {phase: Math.random() * Math.PI * 2 })
    }
}

function gradientFragmentShader() {
    return `
varying vec2 vTextureCoord;
uniform float lerp;
uniform sampler2D uSampler;

void main(void){
    vec4 sampledColor = texture2D(uSampler, vTextureCoord);
    vec4 outputColor = vec4(0.0);
    outputColor.w = sampledColor.w;
    outputColor.x = sampledColor.x * sin(lerp * 6.283) + sampledColor.y * sin(lerp* 6.283 + 2.073) + sampledColor.z * sin(lerp * 6.283 + 4.21);
    outputColor.y = sampledColor.x * sin(lerp * 6.283 + 2.073) + sampledColor.y * sin(lerp* 6.283 + 4.21) + sampledColor.z * sin(lerp * 6.283);
    outputColor.z = sampledColor.x * sin(lerp * 6.283 + 4.21) + sampledColor.y * sin(lerp* 6.283) + sampledColor.z * sin(lerp * 6.283 + 2.07);
    gl_FragColor = outputColor;

}
`;
}
export class GradientFilter extends YoyoFilter {
    constructor(cb) {
        super(500, cb, undefined, gradientFragmentShader(), {});
    }
}
