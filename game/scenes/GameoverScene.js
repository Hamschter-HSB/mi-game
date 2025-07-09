class GameoverScene extends Phaser.Scene {
  constructor() {
    super('GameoverScene');
  }

  preload() {
    this.load.image('GameOver', 'assets/img/ui/GameOver.png');
  }

  create() {
    const { width, height } = this.scale;

    this.sound.volume = GameSettings.volume;
    this.scene.get('MusicManagerScene').playMusic(this);

    // Hintergrundbild
    const bg = this.add.image(0, 0, 'BG').setOrigin(0);
    const texture = this.textures.get('BG').getSourceImage();
    const scale = Math.max(width / texture.width, height / texture.height);
    bg.setScale(scale);
    bg.setPosition(
      (width - texture.width * scale) / 2,
      (height - texture.height * scale) / 2
    );
    bg.setAlpha(0.5);

    const bg2 = this.add.image(0, 0, 'GameOver').setOrigin(0);
    const texture2 = this.textures.get('GameOver').getSourceImage();
    const scale2 = Math.max(width / texture2.width, height / texture2.height);
    bg2.setScale(scale2);
    bg2.setPosition(
      (width - texture2.width * scale2) / 2,
      (height - texture2.height * scale2) / 2
    );

    applyBrightness(this);

    // Tastatur-Input für "E"
    this.input.keyboard.on('keydown-E', () => {
        GameState.currentLevel = 1;
        GameState.deliveryIndex = 0;
        GameState.hasPizza = false;
        GameState.playerPos = null;
        GameState.carPos = null;
        GameState.inCar = false;
      this.scene.start('MainMenuScene');
    });

    // Maus-Input (Linksklick)
    this.input.on('pointerdown', () => {
        GameState.currentLevel = 1;
        GameState.deliveryIndex = 0;
        GameState.hasPizza = false;
        GameState.playerPos = null;
        GameState.carPos = null;
        GameState.inCar = false;
      this.scene.start('MainMenuScene');
    });
  }
}

