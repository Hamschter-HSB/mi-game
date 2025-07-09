const GameSettings = {
  volume: 0.3,
  brightness: 1,
  experimental: false
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
      {x: 2112, y: 64},
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
  },  
  6: {
    pickup: {x: 1215, y: 967},
    deliveries: [
      {x: 7087, y: 455},
      {x: 6080, y: 3001},
      {x: 4928, y: 2752},
      {x: 7744, y: 1359},
      {x: 7744, y: 2878},
      {x: 6709, y: 2110}
    ]
  },
  7: {
    pickup: {x: 1215, y: 967},
    deliveries: [
      {x: 194, y: 5952},
      {x: 4811, y: 6199},
      {x: 3264, y: 5959},
      {x: 7360, y: 5696},
      {x: 7998, y: 4032},
      {x: 7491, y: 8000},
      {x: 4282, y: 8128},
      {x: 192, y: 7721}
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
