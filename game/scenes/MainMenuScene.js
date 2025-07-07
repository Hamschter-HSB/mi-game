class MainMenuScene extends Phaser.Scene {
  constructor() {
    super('MainMenuScene');
  }

  preload() {
    this.load.image('loadingBG', 'assets/img/pizza-bg.png');
  }


  create() {
    const { width, height } = this.scale;

    this.sound.volume = GameSettings.volume;
    this.scene.get('MusicManagerScene').playMusic(this);

    const bg = this.add.image(0, 0, 'loadingBG').setOrigin(0);

    // Hintergrund skalieren
    const texture = this.textures.get('loadingBG').getSourceImage();
    const imgWidth = texture.width;
    const imgHeight = texture.height;
    const scale = Math.max(width / imgWidth, height / imgHeight);
    bg.setScale(scale);
    bg.setPosition(
      (width - imgWidth * scale) / 2,
      (height - imgHeight * scale) / 2
    );
    bg.setAlpha(0.3);

    // Titel
    this.add.text(width / 2, 100, 'Hauptmenü', {
      fontSize: '32px',
      color: '#fff'
    }).setOrigin(0.5);

    // Buttons
    const buttonSpacing = 50;
    let y = 200;

    const newGameBtn = this.add.text(width / 2, y, 'Neues Spiel', {
      fontSize: '24px',
      color: '#0f0'
    }).setOrigin(0.5).setInteractive()
      .on('pointerdown', () => {
        GameState.currentLevel = 1;
        GameState.deliveryIndex = 0;
        GameState.hasPizza = false;
        this.sound.play('clickSound', { volume: GameSettings.volume });
        this.scene.start('GameScene');
      });

    y += buttonSpacing;

    const continueBtn = this.add.text(width / 2, y, 'Fortsetzen', {
      fontSize: '24px',
      color: GameState.currentLevel === 1 ? '#555' : '#0ff'
    }).setOrigin(0.5);

    if (GameState.currentLevel !== 1) {
      continueBtn.setInteractive().on('pointerdown', () => {
        this.sound.play('clickSound', { volume: GameSettings.volume });
        this.scene.start('GameScene');
      });
    }

    y += buttonSpacing;

    this.add.text(width / 2, y, 'Einstellungen', {
      fontSize: '24px',
      color: '#0ff'
    }).setOrigin(0.5).setInteractive()
      .on('pointerdown', () => {
        this.sound.play('clickSound', { volume: GameSettings.volume });
        this.scene.start('SettingsScene');
      });

    y += buttonSpacing;

    this.add.text(width / 2, y, 'Credits', {
      fontSize: '24px',
      color: '#ff0'
    }).setOrigin(0.5).setInteractive()
      .on('pointerdown', () => {
        this.sound.play('clickSound', { volume: GameSettings.volume });
        this.scene.start('CreditsScene');
      });

    applyBrightness(this);
  }

}