class MainMenuScene extends Phaser.Scene {
  constructor() {
    super('MainMenuScene');
  }

  preload() {
    this.load.image('loadingBG', 'assets/img/bg_loading.jpg');
  }


  create() {
    this.sound.volume = GameSettings.volume;
    this.scene.get('MusicManagerScene').playMusic(this);

    const bg = this.add.image(0, 0, 'loadingBG').setOrigin(0);

    // Bildschirmgröße
    const screenWidth = this.cameras.main.width;
    const screenHeight = this.cameras.main.height;

    // Bildgröße
    const texture = this.textures.get('loadingBG').getSourceImage();
    const imgWidth = texture.width;
    const imgHeight = texture.height;

    // Skaliere wie in LoadingScene
    const scale = Math.max(screenWidth / imgWidth, screenHeight / imgHeight);
    bg.setScale(scale);

    // Zentriere
    bg.setPosition(
        (screenWidth - imgWidth * scale) / 2,
        (screenHeight - imgHeight * scale) / 2
    );

    // Abdunkeln
    bg.setAlpha(0.3);


    this.add.text(400, 100, 'Hauptmenü', { fontSize: '32px', color: '#fff' }).setOrigin(0.5);

    //this.add.text(400, 200, 'Spielen', { fontSize: '24px', color: '#0f0' })
    //  .setOrigin(0.5).setInteractive()
    //  .on('pointerdown', () => {
    //    this.sound.play('clickSound', { volume: GameSettings.volume });
    //    this.scene.start('GameScene');
    //});
    const newGameBtn = this.add.text(400, 200, 'Neues Spiel', { fontSize: '24px', color: '#0f0' })
      .setOrigin(0.5)
      .setInteractive()
      .on('pointerdown', () => {
        GameState.currentLevel = 1;
        GameState.deliveryIndex = 0;
        GameState.hasPizza = false;
        this.sound.play('clickSound', { volume: GameSettings.volume });
        this.scene.start('GameScene');
      });
      const continueBtn = this.add.text(400, 250, 'Fortsetzen', { fontSize: '24px', color: GameState.currentLevel === 1 ? '#555' : '#0ff' })
        .setOrigin(0.5);

        if (GameState.currentLevel !== 1) {
          continueBtn.setInteractive()
            .on('pointerdown', () => {
              this.sound.play('clickSound', { volume: GameSettings.volume });
              this.scene.start('GameScene');
            });
      }



    this.add.text(400, 300, 'Einstellungen', { fontSize: '24px', color: '#0ff' })
      .setOrigin(0.5).setInteractive()
      .on('pointerdown', () => {
        this.sound.play('clickSound', { volume: GameSettings.volume });
        this.scene.start('SettingsScene');
    });

    this.add.text(400, 350, 'Credits', { fontSize: '24px', color: '#ff0' })
      .setOrigin(0.5).setInteractive()
      .on('pointerdown', () => {
        this.sound.play('clickSound', { volume: GameSettings.volume });
        this.scene.start('CreditsScene');
    });

    applyBrightness(this);
  }
}