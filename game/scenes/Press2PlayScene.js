class Press2PlayScene extends Phaser.Scene {
  constructor() {
    super('Press2PlayScene');
  }

  preload() {
    this.load.image('press2play', 'assets/img/press2play_bg.png');
    }


  create() {
    const bg = this.add.image(0, 0, 'press2play').setOrigin(0);

    this.sound.volume = GameSettings.volume;
    this.scene.get('MusicManagerScene').playMusic(this);

    const screenWidth = this.cameras.main.width;
    const screenHeight = this.cameras.main.height;

    // Skaliere das Bild auf Bildschirmgröße (cover)
    const texture = this.textures.get('press2play').getSourceImage();
    const imgWidth = texture.width;
    const imgHeight = texture.height;

    const scale = Math.max(screenWidth / imgWidth, screenHeight / imgHeight);
    bg.setScale(scale);

    bg.setPosition(
      (screenWidth - imgWidth * scale) / 2,
      (screenHeight - imgHeight * scale) / 2
    );

    // Eingaben
    this.input.keyboard.once('keydown-E', () => {
      this.scene.start('MainMenuScene');
    });

    this.input.once('pointerdown', () => {
      this.scene.start('MainMenuScene');
    });
  }

}