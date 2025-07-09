class LoadingScene extends Phaser.Scene {
  constructor() {
    super('LoadingScene');
  }

  preload() {
    this.load.audio('menuMusic', ['assets/music/menu.mp3']);
    this.load.audio('actionMusic', ['assets/music/actionMusic.mp3']);
    this.load.audio('clickSound', ['assets/sounds/click.mp3']);
    this.load.audio('gameoverSound', ['assets/sounds/gameoverSound.mp3']);
    this.load.audio('walkSound', ['assets/sounds/walkSound.mp3']);
    this.load.audio('driveSound', ['assets/sounds/DriveSound.mp3']);
    this.load.audio('nitroReadySound', ['assets/sounds/nitroReadySound.mp3']);
    this.load.audio('nitroSound', ['assets/sounds/nitroSound.mp3']);
    this.load.audio('hornSound', ['assets/sounds/hornSound.mp3']);
    this.load.audio('IgnitionSound', ['assets/sounds/ignitionSound.mp3']);
    this.load.audio('itemPickupSound', ['assets/sounds/itemPickupSound.mp3']);
    this.load.image('loadingBG', 'assets/img/pizza-bg.png');
    this.load.image('pizzy', 'assets/img/pizzy.png');
    console.log("preloaded assets");
  }

  create() {
    const screenWidth = this.cameras.main.width;
    const screenHeight = this.cameras.main.height;

    this.scene.launch('MusicManagerScene');

    // Hintergrundbild skalieren und zentrieren
    const bg = this.add.image(0, 0, 'loadingBG').setOrigin(0);
    const texture = this.textures.get('loadingBG').getSourceImage();
    const scale = Math.max(screenWidth / texture.width, screenHeight / texture.height);
    bg.setScale(scale);
    bg.setPosition(
      (screenWidth - texture.width * scale) / 2,
      (screenHeight - texture.height * scale) / 2
    );

    // pizzy unten mittig positionieren (aber nicht zu nah am Rand!)
    const pizzy = this.add.image(0, 0, 'pizzy')
      .setOrigin(0.5)
      .setScale(0.4)
      .setScrollFactor(0); // bleibt fix im Sichtbereich (wie UI)

    const pizzyHeight = pizzy.displayHeight;
    const margin = 20;
    pizzy.setPosition(screenWidth / 2, screenHeight - pizzyHeight / 2 - margin);

    // Rotation um sich selbst (nicht im Kreis)
    this.pizzy = pizzy;

    // Szenewechsel nach 3 Sekunden
    this.time.delayedCall(3000, () => {
      this.scene.start('Press2PlayScene');
    });
  }

  update() {
    // Drehung um eigene Achse
    if (this.pizzy) {
      this.pizzy.angle += 2; // Geschwindigkeit einstellbar
    }
  }
}
