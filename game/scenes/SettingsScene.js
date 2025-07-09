class SettingsScene extends Phaser.Scene {
  constructor() {
    super('SettingsScene');
  }

  preload() {
    this.load.image('logo', 'assets/img/logo.png');
    this.load.image('plus', 'assets/img/ui/settings/plus.png');
    this.load.image('minus', 'assets/img/ui/settings/minus.png');
    this.load.image('Volume', 'assets/img/ui/settings/volume.png');
    this.load.image('Brightness', 'assets/img/ui/settings/brightness.png');
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
    bg.setAlpha(0.5); // leicht transparent

    // Einheitliches, auflösungssicheres Scaling
    const scaleBase = 1920; // FullHD als Referenz
    const scaleFactor = width / scaleBase;

    const centerX = width / 2;
    const startY = height * 0.3;

    // Logo oben
    this.add.image(centerX, height * 0.1, 'logo')
      .setOrigin(0.5)
      .setScale(0.3 * scaleFactor);

    const iconScale = 0.18 * scaleFactor;
    const buttonScale = 0.07 * scaleFactor;
    const spacingX = 160 * scaleFactor; // Abstand zw. den Elementen in einer Reihe
    const spacingY = 180 * scaleFactor; // Abstand zw. Reihen

    const addSettingRow = (y, iconKey, onMinus, onPlus) => {
      const leftX = centerX - spacingX;
      const rightX = centerX + spacingX;

      // Minus
      this.add.image(leftX, y, 'minus')
        .setOrigin(0.5)
        .setScale(buttonScale)
        .setScrollFactor(0)
        .setDepth(20)
        .setInteractive()
        .on('pointerdown', onMinus);

      // Icon (z. B. Volume oder Brightness)
      this.add.image(centerX, y, iconKey)
        .setOrigin(0.5)
        .setScale(iconScale)
        .setScrollFactor(0)
        .setDepth(15);

      // Plus
      this.add.image(rightX, y, 'plus')
        .setOrigin(0.5)
        .setScale(buttonScale)
        .setScrollFactor(0)
        .setDepth(20)
        .setInteractive()
        .on('pointerdown', onPlus);
    };

    // Volume
    addSettingRow(startY, 'Volume',
      () => {
        GameSettings.volume = Math.max(0, GameSettings.volume - 0.1);
        GameSettings.volume = Math.round(GameSettings.volume * 10) / 10;
        this.sound.volume = GameSettings.volume;
        this.sound.play('clickSound', { volume: GameSettings.volume });
      },
      () => {
        GameSettings.volume = Math.min(1, GameSettings.volume + 0.1);
        GameSettings.volume = Math.round(GameSettings.volume * 10) / 10;
        this.sound.volume = GameSettings.volume;
        this.sound.play('clickSound', { volume: GameSettings.volume });
      }
    );

    // Brightness
    addSettingRow(startY + spacingY, 'Brightness',
      () => {
        GameSettings.brightness = Math.max(0.5, GameSettings.brightness - 0.1);
        GameSettings.brightness = Math.round(GameSettings.brightness * 10) / 10;
        updateBrightnessOverlay(this);
        this.sound.play('clickSound', { volume: GameSettings.volume });
      },
      () => {
        GameSettings.brightness = Math.min(1.5, GameSettings.brightness + 0.1);
        GameSettings.brightness = Math.round(GameSettings.brightness * 10) / 10;
        updateBrightnessOverlay(this);
        this.sound.play('clickSound', { volume: GameSettings.volume });
      }
    );

        // Exit Button (zentriert unter den Einstellungen)
      this.add.image(centerX, startY + 2 * spacingY + 50 * scaleFactor, 'exitsettings')
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