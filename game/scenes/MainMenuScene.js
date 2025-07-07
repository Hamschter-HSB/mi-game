class MainMenuScene extends Phaser.Scene {
  constructor() {
    super('MainMenuScene');
  }

  preload() {
    this.load.image('BG', 'assets/img/ui/Background.png');
    this.load.image('homescreenTitle', 'assets/img/logo.png');
    this.load.image('btnNewGame', 'assets/img/ui/NewGame.png');
    this.load.image('btnContinue', 'assets/img/ui/Continue.png');
    this.load.image('btnSettings', 'assets/img/ui/Settings.png');
    this.load.image('btnCredits', 'assets/img/ui/Credits.png');
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

    // Titelbild (Logo)
    const title = this.add.image(width / 2, height / 5, 'homescreenTitle')
      .setOrigin(0.5)
      .setScale(0.9);

    // Menü-Buttons
    const buttons = [];

    buttons.push({
      key: 'btnNewGame',
      callback: () => {
        GameState.currentLevel = 1;
        GameState.deliveryIndex = 0;
        GameState.hasPizza = false;
        this.sound.play('clickSound', { volume: GameSettings.volume });
        this.scene.start('GameScene');
      }
    });

    buttons.push({
      key: 'btnContinue',
      callback: () => {
        this.sound.play('clickSound', { volume: GameSettings.volume });
        this.scene.start('GameScene');
      },
      disabled: GameState.currentLevel === 1
    });

    buttons.push({
      key: 'btnSettings',
      callback: () => {
        this.sound.play('clickSound', { volume: GameSettings.volume });
        this.scene.start('SettingsScene');
      }
    });

    buttons.push({
      key: 'btnCredits',
      callback: () => {
        this.sound.play('clickSound', { volume: GameSettings.volume });
        this.scene.start('CreditsScene');
      }
    });

    // Buttons anzeigen
    const buttonScale = 0.5;
    const buttonSpacing = 10;
    const totalHeight = buttons.length * 100 * buttonScale + (buttons.length - 1) * buttonSpacing;
    let startY = height / 2 - totalHeight / 2 + 80;

    buttons.forEach(btn => {
      const image = this.add.image(width / 2, startY, btn.key)
        .setOrigin(0.5)
        .setScale(buttonScale)
        .setAlpha(btn.disabled ? 0.3 : 1);

      if (!btn.disabled) {
        image.setInteractive({ useHandCursor: true }).on('pointerdown', btn.callback);
      }

      startY += image.displayHeight + buttonSpacing;
    });

    applyBrightness(this);

    // === SLIDER-Bereich: Lautstärke & Helligkeit ===

    const createSlider = (x, y, height, value, onChange, invert = false) => {
      const track = this.add.rectangle(x, y, 6, height, 0xffffff, 0.3).setOrigin(0.5);

      const thumbY = invert
        ? y - height / 2 + (1 - value) * height
        : y - height / 2 + value * height;

      const thumb = this.add.rectangle(x, thumbY, 16, 16, 0xffffff)
        .setOrigin(0.5)
        .setInteractive({ draggable: true });

      const updateValue = (dragY) => {
        dragY = Phaser.Math.Clamp(dragY, y - height / 2, y + height / 2);
        thumb.y = dragY;

        let percent = (dragY - (y - height / 2)) / height;
        if (invert) percent = 1 - percent;

        onChange(Phaser.Math.Clamp(percent, 0, 1));
      };

      thumb.on('drag', (pointer, dragX, dragY) => {
        updateValue(dragY);
      });

      thumb.on('dragend', (pointer, dragX, dragY) => {
        updateValue(dragY);
      });
    };

    const sliderHeight = 100;
    const sliderX = 40;

    // Lautstärke-Slider (unten leise, oben laut)
    createSlider(
      sliderX,
      height - sliderHeight - 40,
      sliderHeight,
      GameSettings.volume,
      (v) => {
        GameSettings.volume = v;
        this.sound.volume = v;
      },
      false // nicht invertiert
    );

    // Drag-Handling aktivieren
    this.input.setDraggable(this.children.getAll().filter(obj => obj.input && obj.input.draggable));
  }
}
