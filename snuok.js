let app = new PIXI.Application({
    width: 256,
    height: 256,
    antialias: true,
    transparent: false,
    resolution: 1,
});

app.renderer.backgroundColor = "0xf4f4f4";

// load sprites!
PIXI.loader
  .add("wall.png")
  .load(setup);


function setup() {
    console.log("hi");
}

$(document).ready(() => {
    $(".root")[0].appendChild(app.view);
})

