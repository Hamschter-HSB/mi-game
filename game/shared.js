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
  deliveryTimeLeft: 30000,
  seconds: 0,
  minutes: 0,
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
      {x: 2879, y: 980}
    ]
  },
  3: {
    pickup: {x: 1215, y: 967},
    deliveries: [
      {x: 1347, y: 3021},
      {x: 2490, y: 3008},
      {x: 2887, y: 3008}
    ]
  },
  4: {
    pickup: {x: 1215, y: 967},
    deliveries: [
      {x: 832, y: 2109},
      {x: 64, y: 2880},
      {x: 1339, y: 3008},
      {x: 4800, y: 704}
    ]
  },
  5: {
    pickup: {x: 1215, y: 967},
    deliveries: [
      {x: 3392, y: 2224},
      {x: 4546, y: 3380},
      {x: 6061, y: 1088},
      {x: 6459, y: 2484},
      {x: 1856, y: 2391}
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
