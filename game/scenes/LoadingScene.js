class LoadingScene extends Phaser.Scene {
  constructor() {
    super('LoadingScene');
  }

  preload() {
    this.load.audio('menuMusic', ['assets/music/menu.mp3']);
    this.load.audio('clickSound', ['assets/sounds/click.mp3']);
    console.log("preloaded audio");
    this.load.image('loadingBG', 'assets/img/pizza-bg.png');
    }


  create() {
    const bg = this.add.image(0, 0, 'loadingBG').setOrigin(0);

    // Bildschirmgröße
    const screenWidth = this.cameras.main.width;
    const screenHeight = this.cameras.main.height;

    const bannerHeight = 50;
    this.add.rectangle(
        screenWidth / 2,
        screenHeight - bannerHeight / 2,
        screenWidth,
        bannerHeight,
        0x000000,
        0.6 // Alpha = 60 % sichtbar
    );
    this.add.text(
        screenWidth / 2,
        screenHeight - bannerHeight / 2,
        'Lade Pizza in die Box...',
        { fontSize: '20px', color: '#ffffff' }
    ).setOrigin(0.5);

    // Bildgröße
    const texture = this.textures.get('loadingBG').getSourceImage();
    const imgWidth = texture.width;
    const imgHeight = texture.height;

    // Skaliere das Bild so, dass es den Bildschirm vollständig abdeckt (cover)
    const scale = Math.max(screenWidth / imgWidth, screenHeight / imgHeight);
    bg.setScale(scale);

    // Zentriere das Bild nach Skalierung
    bg.setPosition(
        (screenWidth - imgWidth * scale) / 2,
        (screenHeight - imgHeight * scale) / 2
    );

    // Lade-Text
    this.add.text(screenWidth / 2, screenHeight - 50, 'Lade Spiel...', {
        fontSize: '28px',
        color: '#ffffff'
    }).setOrigin(0.5);

    // Nach 3 Sekunden weiter
    this.time.delayedCall(3000, () => this.scene.start('MainMenuScene'));
    }

}