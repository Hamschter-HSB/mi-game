const GameSettings = {
  volume: 0.3,
  brightness: 1
};

const GameState = {
  currentLevel: 1,
  deliveryIndex: 0,
  hasPizza: false,
  pickup: null,
  deliveryPoints: [],
  playerPos: null,
  carPos: null,
  inCar: false
};

const Levels = {
  1: {
    pickup: {x: 1215, y: 967},
    deliveries: [{x: 915, y: 1168}]
  },
  2: {
    pickup: {x: 1215, y: 967},
    deliveries: [
      {x: 2195, y: 315},
      {x: 2879, y: 980} // wird übersprungen warum??? immer jedes 2te
    ]
  },
  3: {
    pickup: {x: 1215, y: 967},
    deliveries: [
      {x: 1347, y: 3021},
      {x: 2490, y: 3008}, // wird übersprungen warum???
      {x: 2887, y: 3008}
    ]
  }
};

function applyBrightness(scene) {
  const cam = scene.cameras.main;

  scene.brightnessOverlay = scene.add.rectangle(
      0, 0,
      cam.width,
      cam.height,
      0x000000
    )
    .setOrigin(0)
    .setScrollFactor(0) // <- damit es fix bleibt
    .setAlpha(getBrightnessAlpha())
    .setDepth(999);
}


function updateBrightnessOverlay(scene) {
  if (scene.brightnessOverlay) {
    scene.brightnessOverlay.setAlpha(getBrightnessAlpha());
  }
}

function getBrightnessAlpha() {
  return Math.max(0, 1 - Math.min(GameSettings.brightness, 1));
}

// phaser
