const GameSettings = {
  volume: 1,
  brightness: 1
};

const GameState = {
  currentLevel: 1,
  deliveryIndex: 0,
  hasPizza: false,
  pickup: null,
  deliveryPoints: [],
  playerPos: null,
  carPos: null,
  inCar: false
};


const Levels = {
    1: {
      pickup: {x: 1215, y: 967},
      deliveries: [{x: 915, y: 1168}]
    },
    2: {
      pickup: {x: 1215, y: 967},
      deliveries: [
        {x: 2195, y: 315},
        {x: 2879, y: 980}
      ]
    }
  };


function applyBrightness(scene) {
  scene.brightnessOverlay = scene.add.rectangle(0, 0, 800, 600, 0x000000)
    .setOrigin(0)
    .setAlpha(getBrightnessAlpha())
    .setDepth(999);
}

function updateBrightnessOverlay(scene) {
  if (scene.brightnessOverlay) {
    scene.brightnessOverlay.setAlpha(getBrightnessAlpha());
  }
}

function getBrightnessAlpha() {
  // brightness: 1 → alpha: 0 (keine Verdunklung)
  // brightness: 0.5 → alpha: 0.5 (dunkel)
  // brightness: 1.5 → alpha: -0.5 (heller als normal = NICHT möglich)
  // → Wir deckeln auf 1 und rechnen nur im Bereich 0.5 bis 1:
  return Math.max(0, 1 - Math.min(GameSettings.brightness, 1));
}

class MusicManagerScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MusicManagerScene', active: true });
  }

  create() {
    this.music = null;
  }

  playMusic(scene) {
    if (!this.music) {
      this.music = scene.sound.add('menuMusic', { loop: true, volume: GameSettings.volume });
      this.music.play();
    } else {
      this.music.setVolume(GameSettings.volume);
    }
  }

  stopMusic() {
    if (this.music) {
      this.music.stop();
      this.music = null;
    }
  }
}

class LoadingScene extends Phaser.Scene {
  constructor() {
    super('LoadingScene');
  }

  preload() {
    this.load.audio('menuMusic', ['assets/music/menu.mp3']);
    this.load.audio('clickSound', ['assets/sounds/click.mp3']);
    console.log("preloaded audio");
    this.load.image('loadingBG', 'assets/img/bg_loading.jpg');
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

class MainMenuScene extends Phaser.Scene {
  constructor() {
    super('MainMenuScene');
  }

  preload() {
    this.load.image('loadingBG', 'assets/img/bg_loading.jpg');
  }


  create() {
    this.sound.volume = GameSettings.volume;
    this.scene.get('MusicManagerScene').playMusic(this);

    const bg = this.add.image(0, 0, 'loadingBG').setOrigin(0);

    // Bildschirmgröße
    const screenWidth = this.cameras.main.width;
    const screenHeight = this.cameras.main.height;

    // Bildgröße
    const texture = this.textures.get('loadingBG').getSourceImage();
    const imgWidth = texture.width;
    const imgHeight = texture.height;

    // Skaliere wie in LoadingScene
    const scale = Math.max(screenWidth / imgWidth, screenHeight / imgHeight);
    bg.setScale(scale);

    // Zentriere
    bg.setPosition(
        (screenWidth - imgWidth * scale) / 2,
        (screenHeight - imgHeight * scale) / 2
    );

    // Abdunkeln
    bg.setAlpha(0.3);


    this.add.text(400, 100, 'Hauptmenü', { fontSize: '32px', color: '#fff' }).setOrigin(0.5);

    //this.add.text(400, 200, 'Spielen', { fontSize: '24px', color: '#0f0' })
    //  .setOrigin(0.5).setInteractive()
    //  .on('pointerdown', () => {
    //    this.sound.play('clickSound', { volume: GameSettings.volume });
    //    this.scene.start('GameScene');
    //});
    const newGameBtn = this.add.text(400, 200, 'Neues Spiel', { fontSize: '24px', color: '#0f0' })
      .setOrigin(0.5)
      .setInteractive()
      .on('pointerdown', () => {
        GameState.currentLevel = 1;
        GameState.deliveryIndex = 0;
        GameState.hasPizza = false;
        this.sound.play('clickSound', { volume: GameSettings.volume });
        this.scene.start('GameScene');
      });
      const continueBtn = this.add.text(400, 250, 'Fortsetzen', { fontSize: '24px', color: GameState.currentLevel === 1 ? '#555' : '#0ff' })
        .setOrigin(0.5);

        if (GameState.currentLevel !== 1) {
          continueBtn.setInteractive()
            .on('pointerdown', () => {
              this.sound.play('clickSound', { volume: GameSettings.volume });
              this.scene.start('GameScene');
            });
      }



    this.add.text(400, 300, 'Einstellungen', { fontSize: '24px', color: '#0ff' })
      .setOrigin(0.5).setInteractive()
      .on('pointerdown', () => {
        this.sound.play('clickSound', { volume: GameSettings.volume });
        this.scene.start('SettingsScene');
    });

    this.add.text(400, 350, 'Credits', { fontSize: '24px', color: '#ff0' })
      .setOrigin(0.5).setInteractive()
      .on('pointerdown', () => {
        this.sound.play('clickSound', { volume: GameSettings.volume });
        this.scene.start('CreditsScene');
    });

    applyBrightness(this);
  }
}

class SettingsScene extends Phaser.Scene {
  constructor() {
    super('SettingsScene');
  }

  create() {
    this.sound.volume = GameSettings.volume;
    this.scene.get('MusicManagerScene').playMusic(this);

    this.add.text(400, 80, 'Einstellungen', { fontSize: '28px', color: '#fff' }).setOrigin(0.5);

    // Lautstärke
    this.add.text(300, 150, 'Lautstärke:', { fontSize: '20px', color: '#fff' });
    const volumeText = this.add.text(500, 150, `${Math.round(GameSettings.volume * 100)}%`, { fontSize: '20px', color: '#fff' }).setOrigin(0.5);

    this.add.text(470, 150, '-', { fontSize: '24px', color: '#f00' })
      .setInteractive().on('pointerdown', () => {
        GameSettings.volume = Math.max(0, GameSettings.volume - 0.1);
        volumeText.setText(`${Math.round(GameSettings.volume * 100)}%`);
        this.sound.volume = GameSettings.volume;
        this.sound.play('clickSound', { volume: GameSettings.volume });
      });

    this.add.text(530, 150, '+', { fontSize: '24px', color: '#0f0' })
      .setInteractive().on('pointerdown', () => {
        GameSettings.volume = Math.min(1, GameSettings.volume + 0.1);
        volumeText.setText(`${Math.round(GameSettings.volume * 100)}%`);
        this.sound.volume = GameSettings.volume;
        this.sound.play('clickSound', { volume: GameSettings.volume });
      });

    // Helligkeit
    this.add.text(300, 200, 'Helligkeit:', { fontSize: '20px', color: '#fff' });
    const brightnessText = this.add.text(500, 200, `${Math.round(GameSettings.brightness * 100)}%`, { fontSize: '20px', color: '#fff' }).setOrigin(0.5);

    this.add.text(470, 200, '-', { fontSize: '24px', color: '#f00' })
    .setInteractive().on('pointerdown', () => {
        GameSettings.brightness = Math.max(0.5, GameSettings.brightness - 0.1);
        GameSettings.brightness = Math.round(GameSettings.brightness * 10) / 10; // auf 1 Nachkommastelle runden
        brightnessText.setText(`${Math.round(GameSettings.brightness * 100)}%`);
        updateBrightnessOverlay(this);
        this.sound.play('clickSound', { volume: GameSettings.volume });
    });

    this.add.text(530, 200, '+', { fontSize: '24px', color: '#0f0' })
    .setInteractive().on('pointerdown', () => {
        GameSettings.brightness = Math.min(1.5, GameSettings.brightness + 0.1);
        GameSettings.brightness = Math.round(GameSettings.brightness * 10) / 10;
        brightnessText.setText(`${Math.round(GameSettings.brightness * 100)}%`);
        updateBrightnessOverlay(this);
        this.sound.play('clickSound', { volume: GameSettings.volume });
    });


    this.add.text(400, 350, 'Zurück', { fontSize: '24px', color: '#f00' })
      .setOrigin(0.5).setInteractive()
      .on('pointerdown', () => {
        this.sound.play('clickSound', { volume: GameSettings.volume });
        this.scene.start('MainMenuScene');
    });

    applyBrightness(this);
  }
}

class CreditsScene extends Phaser.Scene {
  constructor() {
    super('CreditsScene');
  }

  create() {
    this.sound.volume = GameSettings.volume;
    this.scene.get('MusicManagerScene').playMusic(this);

    this.add.text(400, 100, 'Credits', { fontSize: '28px', color: '#fff' }).setOrigin(0.5);
    this.add.text(400, 180, 'Maximilian Goldmann', { fontSize: '20px', color: '#aaa' }).setOrigin(0.5);
    this.add.text(400, 210, 'Hamschter-HSB Studios', { fontSize: '20px', color: '#aaa' }).setOrigin(0.5);

    this.add.text(400, 350, 'Zurück', { fontSize: '24px', color: '#f00' })
      .setOrigin(0.5).setInteractive()
      .on('pointerdown', () => {
        this.sound.play('clickSound', { volume: GameSettings.volume });
        this.scene.start('MainMenuScene');
    });

    applyBrightness(this);
  }
}

class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
  }


  preload() {
    this.load.tilemapTiledJSON('pizzamap', 'assets/map/city_map.json');
    this.load.image('tiles', 'assets/img/city_tilemap.png');
    this.load.image('player', 'assets/img/player.png');
    this.load.image('customer', 'assets/img/player.png');
    this.load.image('car', 'assets/img/car.png');

    // Optionaler Spieler-Sprite
  }

  create() {
    window.currentScene = this; // for debug
    this.scene.get('MusicManagerScene').stopMusic();
    this.sound.volume = GameSettings.volume;

    this.menuBG = null;
    this.menuTitle = null;
    this.resumeButton = null;
    this.mainMenuButton = null;
    this.menuVisible = false;



    // Karte laden
    const map = this.make.tilemap({ key: 'pizzamap' });
    const tileset = map.addTilesetImage('city_tilemap', 'tiles'); // name in Tiled + image key
    const groundLayer = map.createLayer('Ground', tileset, 0, 0); // Layername wie in Tiled
    const ObjectLayer = map.createLayer('Objects', tileset, 0, 0); // Layername wie in Tiled
    ObjectLayer.setCollisionByExclusion([-1]);

    // Spieler hinzufügen
    this.player = this.physics.add.sprite(768, 768, 'player'); // ← wichtig: physics.add!
    this.player.setCollideWorldBounds(true);

    // Car
    this.inCar = false;
    this.carVelocity = { x: 0, y: 0 }; // Für „Nachschieben“

    this.car = this.physics.add.sprite(500, 500, 'car');
    this.car.setCollideWorldBounds(true);

    // adding collision
    this.physics.add.collider(this.player, ObjectLayer);
    this.physics.add.collider(this.car, ObjectLayer);



    // Kamera folgt Spieler
    this.cameras.main.startFollow(this.player);
    this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

    // Physik-Bereich auf Mapgröße begrenzen
    this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

    // WASD & F
    this.keys = this.input.keyboard.addKeys('W,A,S,D');
    this.fKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F);

    applyBrightness(this);

    this.instructionText = this.add.text(20, 20, '', {
      fontSize: '28px',
      color: '#fff',
      backgroundColor: 'rgba(0,0,0,0.7)',
      padding: { x: 10, y: 5 }
    }).setScrollFactor(0);


    // Waypoints
    this.waypoints = [];
    this.waypointGroup = this.add.group();
    this.currentWaypointTarget = null;
    this.waypointUpdateTimer = 0;

    this.customerSprite = null;


    this.setupLevel();

    this.menuButton = this.add.text(1700, 20, '☰', {
      fontSize: '48px',
      color: '#fff',
      backgroundColor: 'rgba(0,0,0,0.7)',
      padding: { x: 10, y: 5 }
    })
    .setScrollFactor(0)
    .setInteractive()
    .on('pointerdown', () => {
      this.toggleMenu();
    });

  }
  // game functions
  setupLevel() {
    // Falls Positionen gespeichert → wiederherstellen
    if (GameState.playerPos) {
      this.player.x = GameState.playerPos.x;
      this.player.y = GameState.playerPos.y;
      this.player.body.reset(GameState.playerPos.x, GameState.playerPos.y);
    }

    if (GameState.carPos) {
      this.car.x = GameState.carPos.x;
      this.car.y = GameState.carPos.y;
      this.car.body.reset(GameState.carPos.x, GameState.carPos.y);
    }

    this.inCar = GameState.inCar || false;
    if (this.inCar) {
      this.player.setVisible(false);
      this.cameras.main.startFollow(this.car);
    } else {
      this.player.setVisible(true);
      this.cameras.main.startFollow(this.player);
    }

    // Level-Setup
    const level = Levels[GameState.currentLevel];
    if (!level) {
      this.showInstruction('Alle Lieferungen abgeschlossen!');
      return;
    }

    GameState.pickup = level.pickup;
    GameState.deliveryPoints = level.deliveries;

    if (!GameState.hasPizza) {
      this.showInstruction('Fahre zur Pizzeria, um Pizza abzuholen!');
      this.createWaypoints(this.player.x, this.player.y, GameState.pickup.x, GameState.pickup.y);
    } else {
      const delivery = GameState.deliveryPoints[GameState.deliveryIndex];
      if (delivery) {
        this.showInstruction('Fahre zur Lieferadresse!');
        this.createWaypoints(this.player.x, this.player.y, delivery.x, delivery.y);
        this.spawnCustomer(delivery.x, delivery.y);
      }
    }
  }

  showInstruction(text) {
    if (this.instructionText) {
      this.instructionText.setText(text);
    }
  }
  checkObjective() {
    const px = this.player.x;
    const py = this.player.y;

    if (!GameState.hasPizza) {
      if (Phaser.Math.Distance.Between(px, py, GameState.pickup.x, GameState.pickup.y) < 100) {
        GameState.hasPizza = true;
        this.showInstruction('Pizza abgeholt! Fahre zur Lieferadresse.');

        const delivery = GameState.deliveryPoints[GameState.deliveryIndex];
        if (delivery) {
          this.createWaypoints(this.player.x, this.player.y, delivery.x, delivery.y);

          // ⬇️ HIER KUNDE SPAWNEN
          this.spawnCustomer(delivery.x, delivery.y);
        }
      }
    } else {
      const delivery = GameState.deliveryPoints[GameState.deliveryIndex];
      if (delivery && Phaser.Math.Distance.Between(px, py, delivery.x, delivery.y) < 100) {
        if (this.customerSprite) {
          this.customerSprite.destroy();
          this.customerSprite = null;
        }

        // Vorher speichern
        GameState.playerPos = { x: this.player.x, y: this.player.y };
        GameState.carPos = { x: this.car.x, y: this.car.y };
        GameState.inCar = this.inCar;


        // Scene wechseln
        this.scene.start('DeliveryCutsceneScene');


        this.showInstruction('Pizza wurde abgeliefert!');
        GameState.deliveryIndex++;

        this.time.delayedCall(3000, () => {
          if (GameState.deliveryIndex >= GameState.deliveryPoints.length) {
            GameState.currentLevel++;
            this.setupLevel();
          } else {
            this.showInstruction('Fahre zurück zur Pizzeria für die nächste Pizza.');
            GameState.hasPizza = false;

            // Jetzt auch beim Zurückfahren Wegpunkte anzeigen
            this.createWaypoints(this.player.x, this.player.y, GameState.pickup.x, GameState.pickup.y);
          }
        });
      }
    }
  }

  createWaypoints(startX, startY, endX, endY) {
    const dist = Phaser.Math.Distance.Between(startX, startY, endX, endY);
    const steps = Math.max(1, Math.floor(dist / 150));

    const dx = (endX - startX) / steps;
    const dy = (endY - startY) / steps;

    this.waypointGroup.clear(true, true);
    this.waypoints = [];

    for (let i = 1; i <= steps; i++) {
      const x = startX + dx * i;
      const y = startY + dy * i;

      const wp = this.add.circle(x, y, 10, 0xff0000).setDepth(100);
      this.waypointGroup.add(wp);
      this.waypoints.push(wp);
    }
  }

  checkWaypoints() {
    this.waypoints.forEach((wp) => {
      if (wp.active && Phaser.Math.Distance.Between(this.player.x, this.player.y, wp.x, wp.y) < 40) {
        wp.destroy();
      }
    });
  }
  spawnCustomer(x, y) {
    // Falls bereits ein Kunde da ist, zerstören
    if (this.customerSprite) {
      this.customerSprite.destroy();
      this.customerSprite = null;
    }

    this.customerSprite = this.add.sprite(x, y, 'customer').setDepth(150);
  }

  teleportPlayer(x, y) {
    if (this.player) {
      this.player.x = x;
      this.player.y = y;

      // Körper direkt aktualisieren
      this.player.body.reset(x, y);

      console.log(`Spieler teleportiert zu: (${x}, ${y})`);
    }
  }
  getPlayerCoords() {
    if (this.player) {
      console.log(`Player coords: x=${Math.round(this.player.x)}, y=${Math.round(this.player.y)}`);
      return { x: Math.round(this.player.x), y: Math.round(this.player.y) };
    }
  }


  toggleMenu() {
    if (this.menuVisible) {
      this.menuBG.setVisible(false);
      this.menuTitle.setVisible(false);
      this.resumeButton.setVisible(false);
      this.mainMenuButton.setVisible(false);
      this.menuVisible = false;
    } else {
      // Falls Buttons noch nicht existieren → anlegen
      if (!this.menuBG) {
        this.menuBG = this.add.rectangle(960, 514, 800, 600, 0x000000, 0.8).setScrollFactor(0).setDepth(9999);
        this.menuTitle = this.add.text(960, 300, 'Pause-Menü', { fontSize: '48px', color: '#fff' }).setOrigin(0.5).setScrollFactor(0).setDepth(9999);

        this.resumeButton = this.add.text(960, 400, 'Weiterspielen', { fontSize: '32px', color: '#0f0' })
          .setOrigin(0.5)
          .setScrollFactor(0)
          .setDepth(9999)
          .setInteractive()
          .on('pointerdown', () => {
            this.toggleMenu();
          });

        this.mainMenuButton = this.add.text(960, 480, 'Zum Hauptmenü', { fontSize: '32px', color: '#f00' })
          .setOrigin(0.5)
          .setScrollFactor(0)
          .setDepth(9999)
          .setInteractive()
          .on('pointerdown', () => {
            this.sound.play('clickSound', { volume: GameSettings.volume });
            this.scene.start('MainMenuScene');
          });

        const restartButton = this.add.text(960, 560, 'Neustarten', { fontSize: '32px', color: '#ff0' })
          .setOrigin(0.5)
          .setScrollFactor(0)
          .setDepth(9999)
          .setInteractive()
          .on('pointerdown', () => {
            GameState.currentLevel = 1;
            GameState.deliveryIndex = 0;
            GameState.hasPizza = false;
            this.menuBG.setVisible(false);
            this.menuTitle.setVisible(false);
            this.resumeButton.setVisible(false);
            this.mainMenuButton.setVisible(false);
            restartButton.setVisible(false);
            this.menuVisible = false;
            this.setupLevel();
          });


        // Erst unsichtbar
        this.menuBG.setVisible(false);
        this.menuTitle.setVisible(false);
        this.resumeButton.setVisible(false);
        this.mainMenuButton.setVisible(false);
        restartButton.setVisible(false);
        
      }

      this.menuBG.setVisible(true);
      this.menuTitle.setVisible(true);
      this.resumeButton.setVisible(true);
      this.mainMenuButton.setVisible(true);
      restartButton.setVisible(true);
      this.menuVisible = true;
    }
  }










  // end of game functions

  update(time, delta) {
    if (!this.player || !this.player.body) return;

    const speed = 200;
    const body = this.player.body;

    // F drücken → einsteigen oder aussteigen
    if (Phaser.Input.Keyboard.JustDown(this.fKey)) {
      if (!this.inCar) {
        const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.car.x, this.car.y);
        if (dist < 100) {
          // Einsteigen
          this.inCar = true;
          this.player.setVisible(false);
          this.cameras.main.startFollow(this.car);
        }
      } else {
        // Aussteigen
        this.inCar = false;
        this.player.x = this.car.x;
        this.player.y = this.car.y;
        this.player.body.reset(this.car.x, this.car.y);
        this.player.setVisible(true);
        this.cameras.main.startFollow(this.player);
        this.car.setVelocity(0, 0);
        this.carVelocity = { x: 0, y: 0 };
      }
    }

    if (!this.inCar) {
      body.setVelocity(0);

      if (this.keys.W.isDown) body.setVelocityY(-speed);
      if (this.keys.S.isDown) body.setVelocityY(speed);
      if (this.keys.A.isDown) body.setVelocityX(-speed);
      if (this.keys.D.isDown) body.setVelocityX(speed);
    } else {
      const carSpeed = 600; // schneller als Spieler
      let targetVX = 0;
      let targetVY = 0;

      if (this.keys.W.isDown) targetVY = -carSpeed;
      if (this.keys.S.isDown) targetVY = carSpeed;
      if (this.keys.A.isDown) targetVX = -carSpeed;
      if (this.keys.D.isDown) targetVX = carSpeed;

      // „Nachschieben“ (einfache Trägheit)
      this.carVelocity.x += (targetVX - this.carVelocity.x) * 0.1;
      this.carVelocity.y += (targetVY - this.carVelocity.y) * 0.1;

      this.car.setVelocity(this.carVelocity.x, this.carVelocity.y);
    }

    this.checkObjective();
    this.checkWaypoints();

    // Nur alle 500 ms aktualisieren
    this.waypointUpdateTimer += delta;
    if (this.waypointUpdateTimer >= 500) {
      this.waypointUpdateTimer = 0;

      let target = null;
      if (!GameState.hasPizza) {
        target = GameState.pickup;
      } else if (GameState.deliveryPoints[GameState.deliveryIndex]) {
        target = GameState.deliveryPoints[GameState.deliveryIndex];
      }

      if (target) {
        const currentX = this.inCar ? this.car.x : this.player.x;
        const currentY = this.inCar ? this.car.y : this.player.y;

        const dist = Phaser.Math.Distance.Between(currentX, currentY, target.x, target.y);
        if (dist > 100) {
          this.createWaypoints(currentX, currentY, target.x, target.y);
          this.currentWaypointTarget = target;
        } else {
          this.waypointGroup.clear(true, true);
          this.waypoints = [];
        }
      }
    }

  }



}

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



const config = {
  type: Phaser.AUTO,
  width: 1920,
  height: 1028,
  scene: [LoadingScene, MusicManagerScene, MainMenuScene, SettingsScene, CreditsScene, GameScene, DeliveryCutsceneScene],
  backgroundColor: '#000',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  }
};

new Phaser.Game(config);