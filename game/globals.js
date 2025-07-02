const GameSettings = {
  volume: 1,
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
      {x: 2879, y: 980}
    ]
  }
};

function applyBrightness(scene) {
  scene.brightnessOverlay = scene.add.rectangle(0, 0, 800, 600, 0x000000)
    .setOrigin(0)
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
