
class DeliveryCutsceneScene extends Phaser.Scene {
  constructor() {
    super('DeliveryCutsceneScene');
  }

  preload() {
    this.load.image('box', 'assets/img/box.png');
    this.load.image('pizza', 'assets/img/pizza.png');
    this.load.image('customer', 'assets/img/player.png');
  }

  create() {
    this.add.text(400, 50, 'Übergabe', { fontSize: '32px', color: '#fff' }).setOrigin(0.5);

    // Kunde
    const customer = this.add.sprite(700, 500, 'customer');

    // Box
    const box = this.add.image(400, 500, 'box');

    // Pizza (als Kreis oder Sprite)
    this.pizza = this.add.image(400, 500, 'pizza').setInteractive();
    this.input.setDraggable(this.pizza);

    this.input.on('drag', (pointer, gameObject, dragX, dragY) => {
      gameObject.x = dragX;
      gameObject.y = dragY;
    });

    this.input.on('dragend', (pointer, gameObject) => {
      const dist = Phaser.Math.Distance.Between(gameObject.x, gameObject.y, customer.x, customer.y);
      if (dist < 100) {
        // Pizza "übergeben"
        gameObject.destroy();
        this.add.text(400, 600, 'Pizza übergeben!', { fontSize: '28px', color: '#0f0' }).setOrigin(0.5);

        // Status anpassen — NICHT sofort deliveryIndex++
        let nextIndex = GameState.deliveryIndex + 1;

        if (nextIndex < GameState.deliveryPoints.length) {
          // Noch weitere Lieferungen im aktuellen Level
          GameState.deliveryIndex = nextIndex;
          GameState.hasPizza = false; // Muss wieder zur Pizzeria
        } else {
          // Aktuelles Level fertig
          GameState.currentLevel++;
          const nextLevel = Levels[GameState.currentLevel];
          if (nextLevel) {
            GameState.pickup = nextLevel.pickup;
            GameState.deliveryPoints = nextLevel.deliveries;
            GameState.deliveryIndex = 0;
            GameState.hasPizza = false; // Muss wieder zur neuen Pizzeria

            if (nextLevel.deliveries.length === 1) {
              GameState.hasPizza = false;
            }
          } else {
            // Kein weiteres Level
            GameState.hasPizza = false;
          }
        }

        this.time.delayedCall(2000, () => {
          this.scene.start('GameScene');
        });
      } else {
        // Zurück in die Box
        gameObject.x = 400;
        gameObject.y = 500;
      }
    });

  }
}