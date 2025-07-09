class CreditsScene extends Phaser.Scene {
  constructor() {
    super('CreditsScene');
  }

   preload() {
    this.load.image('credits', 'assets/img/ui/CreditsList.png');
    this.load.image('exitsettings', 'assets/img/ui/Exit.png');
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

  // Einheitliches, auflösungssicheres Scaling
  const scaleBase = 1920;
  const scaleFactor = width / scaleBase;

  const centerX = width / 2;
  const centerY = height / 2;

  // === Credits Bild zentriert und groß ===
  const creditsImage = this.add.image(centerX, centerY, 'credits')
    .setOrigin(0.5)
    .setScale(0.6 * scaleFactor); // Größe anpassen wie gewünscht

  // === Exit Button direkt unter dem Bild ===
  const spacing = 80 * scaleFactor; // Abstand nach unten
  this.add.image(centerX, centerY + creditsImage.displayHeight / 2 + spacing, 'exitsettings')
    .setOrigin(0.5)
    .setScale(0.15 * scaleFactor)
    .setInteractive()
    .on('pointerdown', () => {
      this.sound.play('clickSound', { volume: GameSettings.volume });
      this.scene.start('MainMenuScene');
    });

  applyBrightness(this);
}

}
