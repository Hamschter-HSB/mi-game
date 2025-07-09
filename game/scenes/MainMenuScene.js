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
        if (this.scene.get('GameScene')) {
          this.scene.stop('GameScene');
          this.scene.remove('GameScene');
        }
        this.scene.add('GameScene', GameScene);
        this.scene.start('GameScene');
      }
    });

    buttons.push({
      key: 'btnContinue',
      callback: () => {
        this.sound.play('clickSound', { volume: GameSettings.volume });
        if (this.scene.get('GameScene')) {
          this.scene.stop('GameScene');
          this.scene.remove('GameScene');
        }
        this.scene.add('GameScene', GameScene);
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

    const createSlider = (x, y, height, value, onChange) => {
      const track = this.add.rectangle(x, y, 6, height, 0xffffff, 0.3).setOrigin(0.5);

      const valueToY = (v) => y - height / 2 + (1 - v) * height;
      const yToValue = (dragY) => 1 - ((dragY - (y - height / 2)) / height);

      const thumb = this.add.rectangle(x, valueToY(value), 16, 16, 0xffffff)
        .setOrigin(0.5)
        .setInteractive({ draggable: true });

      let lastValidY = thumb.y;

      const updateThumb = (dragY) => {
        const clampedY = Phaser.Math.Clamp(dragY, y - height / 2, y + height / 2);
        thumb.y = clampedY;

        lastValidY = clampedY;

        const newValue = Phaser.Math.Clamp(yToValue(clampedY), 0, 1);
        onChange(newValue);
      };

      thumb.on('drag', (pointer, dragX, dragY) => {
        updateThumb(dragY);
      });

      thumb.on('dragend', () => {
        updateThumb(lastValidY);
      });
    };


    const sliderHeight = 100;
    const sliderX = 40;

    createSlider(
      sliderX,
      height - sliderHeight - 40,
      sliderHeight,
      GameSettings.volume,
      (v) => {
        GameSettings.volume = v;
        this.sound.volume = v;
      }
    );

    this.input.setDraggable(this.children.getAll().filter(obj => obj.input && obj.input.draggable));
  }
}
