function slideFragmentShader(phaseScale, heightScale) {
    let phaseString = phaseScale.toFixed(2);
    let heightString = heightScale.toFixed(2);
    return `
varying vec2 vTextureCoord;

uniform sampler2D uSampler;

void main(void){
    vec2 sampleCoord = vTextureCoord;
    sampleCoord.y = sampleCoord.y + sin((sampleCoord.x * 6.283) / ${phaseString}) / ${heightString} ;
    gl_FragColor = texture2D(uSampler, sampleCoord);
}
`
}


export class SlideFilter extends PIXI.Filter {
    constructor(phaseScale = 1.0, heightScale = 5.0) {
        super(undefined, slideFragmentShader(phaseScale, heightScale))
    }
}
