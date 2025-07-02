class CreditsScene extends Phaser.Scene {
  constructor() {
    super('CreditsScene');
  }

  create() {
    this.sound.volume = GameSettings.volume;
    this.scene.get('MusicManagerScene').playMusic(this);

    this.add.text(400, 100, 'Credits', { fontSize: '28px', color: '#fff' }).setOrigin(0.5);
    this.add.text(400, 180, 'Maximilian Goldmann', { fontSize: '20px', color: '#aaa' }).setOrigin(0.5);
    this.add.text(400, 210, 'Hamschter-HSB Studios', { fontSize: '20px', color: '#aaa' }).setOrigin(0.5);

    this.add.text(400, 350, 'Zurück', { fontSize: '24px', color: '#f00' })
      .setOrigin(0.5).setInteractive()
      .on('pointerdown', () => {
        this.sound.play('clickSound', { volume: GameSettings.volume });
        this.scene.start('MainMenuScene');
    });

    applyBrightness(this);
  }
}