class DeliveryCutsceneScene extends Phaser.Scene {
  constructor() {
    super('DeliveryCutsceneScene');
  }

  preload() {
    this.load.image('BG2', 'assets/img/ui/Background.png'); // Hintergrund laden
    this.load.image('pizza', 'assets/img/pizza.png');
    this.load.image('customer', 'assets/img/player.png');
    this.load.image('success', 'assets/img/ui/success.png'); // Erfolgsbild
  }

  create() {
    const { width, height } = this.scale;

    // === Hintergrund ===
    const bg = this.add.image(0, 0, 'BG2').setOrigin(0);
    const texture = this.textures.get('BG2').getSourceImage();
    const scale = Math.max(width / texture.width, height / texture.height);
    bg.setScale(scale);
    bg.setPosition(
      (width - texture.width * scale) / 2,
      (height - texture.height * scale) / 2
    );
    bg.setAlpha(0.5); // leicht transparent

    // === Szene-Elemente ===

    const customer = this.add.sprite(700, 500, 'customer');

    this.pizza = this.add.image(400, 500, 'pizza').setInteractive();
    this.input.setDraggable(this.pizza);

    this.input.on('drag', (pointer, gameObject, dragX, dragY) => {
      gameObject.x = dragX;
      gameObject.y = dragY;
    });

    this.input.on('dragend', (pointer, gameObject) => {
      const dist = Phaser.Math.Distance.Between(gameObject.x, gameObject.y, customer.x, customer.y);
      if (dist < 100) {
        // Pizza erfolgreich übergeben
        gameObject.destroy();

        // Erfolgsbild einblenden (zentral)
        const success = this.add.image(width / 2, height / 2, 'success')
          .setOrigin(0.5)
          .setScale(2.0)
          .setAlpha(0); // zunächst unsichtbar

        this.tweens.add({
          targets: success,
          alpha: 1,
          duration: 300
        });

        // GameState-Update
        let nextIndex = GameState.deliveryIndex + 1;

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

            if (nextLevel.deliveries.length === 1) {
              GameState.hasPizza = false;
            }
          } else {
            GameState.hasPizza = false;
          }
        }

        // Zurück ins Spiel
        this.time.delayedCall(2000, () => {
          this.scene.start('GameScene');
        });
      } else {
        // Falsche Position – zurück zur Box
        gameObject.x = 400;
        gameObject.y = 500;
      }
    });

    applyBrightness(this);
  }
}
