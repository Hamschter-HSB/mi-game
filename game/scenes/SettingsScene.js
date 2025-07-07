class SettingsScene extends Phaser.Scene {
  constructor() {
    super('SettingsScene');
  }

  create() {
    const { width, height } = this.scale;

    this.sound.volume = GameSettings.volume;
    this.scene.get('MusicManagerScene').playMusic(this);

    this.add.text(width / 2, 80, 'Einstellungen', { fontSize: '28px', color: '#fff' }).setOrigin(0.5);

    // Lautstärke
    this.add.text(width / 2 - 100, 150, 'Lautstärke:', { fontSize: '20px', color: '#fff' });
    const volumeText = this.add.text(width / 2 + 100, 150, `${Math.round(GameSettings.volume * 100)}%`, { fontSize: '20px', color: '#fff' }).setOrigin(0.5);

    this.add.text(width / 2 + 70, 150, '-', { fontSize: '24px', color: '#f00' })
      .setInteractive().on('pointerdown', () => {
        GameSettings.volume = Math.max(0, GameSettings.volume - 0.1);
        volumeText.setText(`${Math.round(GameSettings.volume * 100)}%`);
        this.sound.volume = GameSettings.volume;
        this.sound.play('clickSound', { volume: GameSettings.volume });
      });

    this.add.text(width / 2 + 130, 150, '+', { fontSize: '24px', color: '#0f0' })
      .setInteractive().on('pointerdown', () => {
        GameSettings.volume = Math.min(1, GameSettings.volume + 0.1);
        volumeText.setText(`${Math.round(GameSettings.volume * 100)}%`);
        this.sound.volume = GameSettings.volume;
        this.sound.play('clickSound', { volume: GameSettings.volume });
      });

    // Helligkeit
    this.add.text(width / 2 - 100, 200, 'Helligkeit:', { fontSize: '20px', color: '#fff' });
    const brightnessText = this.add.text(width / 2 + 100, 200, `${Math.round(GameSettings.brightness * 100)}%`, { fontSize: '20px', color: '#fff' }).setOrigin(0.5);

    this.add.text(width / 2 + 70, 200, '-', { fontSize: '24px', color: '#f00' })
      .setInteractive().on('pointerdown', () => {
        GameSettings.brightness = Math.max(0.5, GameSettings.brightness - 0.1);
        GameSettings.brightness = Math.round(GameSettings.brightness * 10) / 10;
        brightnessText.setText(`${Math.round(GameSettings.brightness * 100)}%`);
        updateBrightnessOverlay(this);
        this.sound.play('clickSound', { volume: GameSettings.volume });
      });

    this.add.text(width / 2 + 130, 200, '+', { fontSize: '24px', color: '#0f0' })
      .setInteractive().on('pointerdown', () => {
        GameSettings.brightness = Math.min(1.5, GameSettings.brightness + 0.1);
        GameSettings.brightness = Math.round(GameSettings.brightness * 10) / 10;
        brightnessText.setText(`${Math.round(GameSettings.brightness * 100)}%`);
        updateBrightnessOverlay(this);
        this.sound.play('clickSound', { volume: GameSettings.volume });
      });

    this.add.text(width / 2, 350, 'Zurück', { fontSize: '24px', color: '#f00' })
      .setOrigin(0.5).setInteractive()
      .on('pointerdown', () => {
        this.sound.play('clickSound', { volume: GameSettings.volume });
        this.scene.start('MainMenuScene');
      });

    applyBrightness(this);
  }
}