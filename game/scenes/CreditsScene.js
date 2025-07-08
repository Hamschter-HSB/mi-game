class CreditsScene extends Phaser.Scene {
  constructor() {
    super('CreditsScene');
  }

  create() {
    const { width, height } = this.scale;

    this.sound.volume = GameSettings.volume;
    this.scene.get('MusicManagerScene').playMusic(this);

    this.add.text(width / 2, 100, 'Credits', {
      fontSize: '28px',
      color: '#fff'
    }).setOrigin(0.5);

    this.add.text(width / 2, 180, 'Maximilian Goldmann', {
      fontSize: '20px',
      color: '#aaa'
    }).setOrigin(0.5);

    this.add.text(width / 2, 260, 'Markus Vogel', {
      fontSize: '20px',
      color: '#aaa'
    }).setOrigin(0.5);

    this.add.text(width / 2, 340, 'Ammar Al Mawali', {
      fontSize: '20px',
      color: '#aaa'
    }).setOrigin(0.5);

    this.add.text(width / 2, 420, 'Amir Valibeygi', {
      fontSize: '20px',
      color: '#aaa'
    }).setOrigin(0.5);

    this.add.text(width / 2, 500, 'Hamschter-HSB Studios', {
      fontSize: '20px',
      color: '#aaa'
    }).setOrigin(0.5);

    this.add.text(width / 2, height - 100, 'Zurück', {
      fontSize: '24px',
      color: '#f00'
    }).setOrigin(0.5).setInteractive()
      .on('pointerdown', () => {
        this.sound.play('clickSound', { volume: GameSettings.volume });
        this.scene.start('MainMenuScene');
      });

    applyBrightness(this);
  }
}
