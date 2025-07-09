class DeliveryCutsceneScene extends Phaser.Scene {
  constructor() {
    super('DeliveryCutsceneScene');
  }

  preload() {
    this.load.image('BG2', 'assets/img/ui/Background.png'); // Hintergrund laden
    this.load.image('pizza', 'assets/img/pizza.png');
    this.load.image('customer', 'assets/img/player.png');
    this.load.image('DeliveryUI', 'assets/img/ui/DeliveryUI.png');
    this.load.image('success', 'assets/img/ui/success.png'); // Erfolgsbild
  }

  create() {
    const { width, height } = this.scale;

    this.sound.volume = GameSettings.volume;
    this.scene.get('MusicManagerScene').playActionMusic();

    // === Hintergrund ===
    const bg = this.add.image(0, 0, 'BG2').setOrigin(0);
    const bgTex = this.textures.get('BG2').getSourceImage();
    const bgScale = Math.max(width / bgTex.width, height / bgTex.height);
    bg.setScale(bgScale);
    bg.setPosition((width - bgTex.width * bgScale) / 2, (height - bgTex.height * bgScale) / 2);
    bg.setAlpha(0.5);

    // === DeliveryUI Overlay ===
    const uiTex = this.textures.get('DeliveryUI').getSourceImage();
    const uiScale = Math.min(width / uiTex.width, height / uiTex.height) * 0.9; // etwas kleiner
    const ui = this.add.image(width / 2, height / 2, 'DeliveryUI')
      .setOrigin(0.5)
      .setScale(uiScale)
      .setDepth(10);

    // === Pizzabox Startposition (links in der Mitte des UI) ===
    const uiWidth = uiTex.width * uiScale;
    const uiHeight = uiTex.height * uiScale;

    const pizzaStartX = ui.x - uiWidth / 7.5;
    const pizzaStartY = ui.y;

    this.pizza = this.add.image(pizzaStartX, pizzaStartY, 'pizza')
      .setInteractive()
      .setScale(3.0)
      .setDepth(11);

    this.input.setDraggable(this.pizza);

    // === Drag-Verhalten ===
    this.input.on('drag', (pointer, gameObject, dragX, dragY) => {
      gameObject.x = dragX;
      gameObject.y = dragY;
    });

    this.input.on('dragend', (pointer, gameObject) => {
      const dropX = gameObject.x;
      const dropY = gameObject.y;

      // === Prüfung: Pizza rechts der UI-Mitte und vertikal innerhalb ===
      const isRightOfCenter = dropX >= ui.x;
      const isWithinUIVertically = dropY >= ui.y - uiHeight / 2 && dropY <= ui.y + uiHeight / 2;

      if (isRightOfCenter && isWithinUIVertically) {
        gameObject.destroy();

        const success = this.add.image(width / 2, height / 2, 'success')
          .setOrigin(0.5)
          .setScale(2.0)
          .setAlpha(0)
          .setDepth(20);

        this.tweens.add({
          targets: success,
          alpha: 1,
          duration: 300
        });

        // GameState aktualisieren
        let nextIndex = GameState.deliveryIndex;
        if (nextIndex < GameState.deliveryPoints.length) {
          GameState.deliveryIndex = nextIndex;
          GameState.hasPizza = false;
        } else {
          GameState.currentLevel++;
          const nextLevel = Levels[GameState.currentLevel];
          if (nextLevel) {
            GameState.pickup = nextLevel.pickup;
            GameState.deliveryPoints = nextLevel.deliveries;
            GameState.deliveryIndex = 0;
            GameState.hasPizza = false;
          } else {
            GameState.hasPizza = false;
          }
        }

        // GameScene resetten
        if (this.scene.get('GameScene')) {
          this.scene.stop('GameScene');
          this.scene.remove('GameScene');
        }
        this.scene.add('GameScene', GameScene);

        this.time.delayedCall(2000, () => {
          this.scene.start('GameScene');
        });

      } else {
        // Falsche Position – zurück
        gameObject.x = pizzaStartX;
        gameObject.y = pizzaStartY;
      }
    });

    applyBrightness(this);
  }

}
