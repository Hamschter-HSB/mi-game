class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
  }


  preload() {
    this.load.tilemapTiledJSON('pizzamap', 'assets/map/city_map.json');
    this.load.image('tiles', 'assets/img/city_tilemap.png');
    this.load.image('player', 'assets/img/player.png');
    this.load.image('customer', 'assets/img/player.png');
    this.load.image('npc', 'assets/img/npc.jpg');
    this.load.image('car', 'assets/img/car.png');

    this.load.image('menuOverlay', 'assets/img/Logo.png');
    this.load.image('resumeBtn', 'assets/img/ui/Resume.png');
    this.load.image('exitBtn', 'assets/img/ui/Exit.png');

    this.load.image('pizzyDefault', 'assets/img/ui/pizzy/default-pizzy.png');
    this.load.image('pizzyNewOrder', 'assets/img/ui/pizzy/neworder-pizzy.png');
    this.load.image('pizzyDelivery', 'assets/img/ui/pizzy/delivery-pizzy.png');



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
    this.walkSound = this.sound.add('walkSound', {
      volume: GameSettings.volume,
      loop: true // Sound soll bei gedrückter Taste durchgehend spielen
    });

    // Car
    this.inCar = false;
    this.carVelocity = { x: 0, y: 0 }; // Für „Nachschieben“

    this.car = this.physics.add.sprite(500, 500, 'car');
    this.car.setCollideWorldBounds(true);

    this.driveSound = this.sound.add('driveSound', {
      volume: GameSettings.volume,
      loop: true // Sound soll bei gedrückter Taste durchgehend spielen
    });

    // adding collision
    this.physics.add.collider(this.player, ObjectLayer);
    this.physics.add.collider(this.car, ObjectLayer);



    // Kamera folgt Spieler
    this.cameras.main.startFollow(this.player);
    this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

    // Physik-Bereich auf Mapgröße begrenzen
    this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

    // WASD, F, H & SPACE
    this.keys = this.input.keyboard.addKeys('W,A,S,D');
    this.fKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F);
    this.hKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.H);
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    applyBrightness(this);

    const pizzyWidth = this.scale.width;
    const pizzyHeight = this.scale.height;

    this.pizzyAssistant = this.add.image(pizzyWidth - 100, pizzyHeight - 100, 'pizzyDefault')
      .setOrigin(1, 1)
      .setScrollFactor(0)
      .setDepth(9998)
      .setScale(this.scale.width / 1920 * 0.5); // skalierbar je nach Auflösung



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

    // NPC's erstellen und hinzufügen
    this.npcs = this.add.group();
    const amountOfNPCS = 4

    for (let i = 0; i < amountOfNPCS; i++) {
      const npc = this.physics.add.sprite(100, 100, 'npc');
      npc.setCollideWorldBounds(true); // bleibt im Weltbereich

      // Richtungswerte speichern
      npc.dx = 0;
      npc.dy = 0;

      this.npcs.add(npc);
    }

    // Bewegung starten
    this.changeDirection();

    // Collision
    this.physics.add.collider(this.npcs, ObjectLayer);
    this.physics.add.collider(this.npcs, this.npcs);

    // Alle paar Sekunden Richtung ändern
    this.time.addEvent({
      delay: 2000,
      callback: this.changeDirection,
      callbackScope: this,
      loop: true
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
      this.updatePizzy('default');
      return;
    }

    GameState.pickup = level.pickup;
    GameState.deliveryPoints = level.deliveries;

    if (!GameState.hasPizza) {
      this.updatePizzy('pickup');
      this.createWaypoints(this.player.x, this.player.y, GameState.pickup.x, GameState.pickup.y);
    } else {
      const delivery = GameState.deliveryPoints[GameState.deliveryIndex];
      if (delivery) {
        this.updatePizzy('delivery');
        this.createWaypoints(this.player.x, this.player.y, delivery.x, delivery.y);
        this.spawnCustomer(delivery.x, delivery.y);
      }
    }
  }

  updateNPC() {
    this.npcs.children.iterate(npc => {
      this.npcSpeed = 25;
      npc.setVelocity(npc.dx * this.npcSpeed, npc.dy * this.npcSpeed);
    });
  }

  changeDirection() {
    const directions = [
      { dx: 7, dy: 0 },
      { dx: -7, dy: 0 },
      { dx: 0, dy: 7 },
      { dx: 0, dy: -7  },
      { dx: 0, dy: 0 }
    ];

    this.npcs.children.iterate(npc => {
      const dir = Phaser.Math.RND.pick(directions);
      npc.dx = dir.dx;
      npc.dy = dir.dy;
    });
  }

  updatePizzy(mode = 'default') {
    if (!this.pizzyAssistant) return;

    let key = 'pizzyDefault';

    switch (mode) {
      case 'pickup':
        key = 'pizzyNewOrder';
        break;
      case 'delivery':
        key = 'pizzyDelivery';
        break;
    }

    this.pizzyAssistant.setTexture(key);
  }

  checkObjective() {
    const px = this.player.x;
    const py = this.player.y;

    if (!GameState.hasPizza) {
      if (Phaser.Math.Distance.Between(px, py, GameState.pickup.x, GameState.pickup.y) < 100) {
        GameState.hasPizza = true;
        GameState.pizzyStatus = 'delivery';
        this.updatePizzy('delivery');


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

        this.stopPlayerWalkSoundIfPlayed();

        this.scene.start('DeliveryCutsceneScene');

        GameState.pizzyStatus = 'default';
        this.updatePizzy('default');

        GameState.deliveryIndex++;

        this.time.delayedCall(1000, () => {
          if (GameState.deliveryIndex >= GameState.deliveryPoints.length) {
            GameState.currentLevel++;
            this.setupLevel();
          } else {
            this.updatePizzy('pickup');
            GameState.hasPizza = false;

            // Jetzt auch beim Zurückfahren Wegpunkte anzeigen
            this.createWaypoints(this.player.x, this.player.y, GameState.pickup.x, GameState.pickup.y);
          }
        });
      }
    }
    this.updatePizzy(GameState.pizzyStatus || 'default');
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
    const width = this.scale.width;
    const height = this.scale.height;

    if (this.menuVisible) {
      this.menuElements.forEach(e => e.setVisible(false));
      this.menuVisible = false;
    } else {
      if (!this.menuElements) {
        this.menuElements = [];

        // Overlay
        const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.6)
          .setScrollFactor(0)
          .setDepth(9999);
        this.menuElements.push(overlay);

        // Dynamische Skalierung
        const logoScale = width / 1920 * 0.9;
        const buttonScale = width / 1920 * 0.4;

        this.logoScale = logoScale;
        this.buttonScale = buttonScale;

        // Logo
        const logo = this.add.image(width / 2, height * 0.2, 'menuOverlay')
          .setOrigin(0.5)
          .setScale(logoScale)
          .setScrollFactor(0)
          .setDepth(10000);
        this.menuElements.push(logo);

        // Resume Button
        const resumeBtn = this.add.image(width / 2, height * 0.45, 'resumeBtn')
          .setOrigin(0.5)
          .setScale(buttonScale)
          .setScrollFactor(0)
          .setDepth(10000)
          .setInteractive()
          .on('pointerdown', () => this.toggleMenu());
        this.menuElements.push(resumeBtn);

        // Exit Button
        const exitBtn = this.add.image(width / 2, height * 0.58, 'exitBtn')
          .setOrigin(0.5)
          .setScale(buttonScale)
          .setScrollFactor(0)
          .setDepth(10000)
          .setInteractive()
          .on('pointerdown', () => {
            this.sound.play('clickSound', { volume: GameSettings.volume });
            this.scene.start('MainMenuScene');
          });
        this.menuElements.push(exitBtn);
      } else {
        // Falls bereits erstellt → nur neu positionieren & anzeigen
        const [overlay, logo, resumeBtn, exitBtn] = this.menuElements;

        overlay.setPosition(width / 2, height / 2).setSize(width, height);
        logo.setPosition(width / 2, height * 0.2).setScale(this.logoScale);
        resumeBtn.setPosition(width / 2, height * 0.45).setScale(this.buttonScale);
        exitBtn.setPosition(width / 2, height * 0.58).setScale(this.buttonScale);

        this.menuElements.forEach(e => e.setVisible(true));
      }

      this.menuVisible = true;
    }
  }



  // end of game functions

  update(time, delta) {
    if (!this.player || !this.player.body) return;

    const playerSpeed = 200;
    const body = this.player.body;

    // F drücken → einsteigen oder aussteigen
    if (Phaser.Input.Keyboard.JustDown(this.fKey)) {
      if (!this.inCar) {

        this.stopPlayerWalkSoundIfPlayed();

        const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.car.x, this.car.y);
        if (dist < 100) {
          // Einsteigen
          this.inCar = true;
          this.player.setVisible(false);
          this.cameras.main.startFollow(this.car);

          //Ignition sound
          this.sound.play('IgnitionSound', { volume: GameSettings.volume });

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

        this.stopCarDriveSoundIfPlayed()
      }
    }

    // Player walk-sound

    const isWalkingKeyDown = this.keys.W.isDown || this.keys.A.isDown || this.keys.S.isDown || this.keys.D.isDown;

    if (!this.inCar && isWalkingKeyDown && !this.walkSound.isPlaying)
      this.walkSound.play();

    if (!this.inCar && !isWalkingKeyDown && this.walkSound.isPlaying)
      this.walkSound.stop();

    if (!this.inCar) {
      body.setVelocity(0);

      if (this.keys.W.isDown) body.setVelocityY(-playerSpeed);
      if (this.keys.S.isDown) body.setVelocityY(playerSpeed);
      if (this.keys.A.isDown) body.setVelocityX(-playerSpeed);
      if (this.keys.D.isDown) body.setVelocityX(playerSpeed);
    } else {
      const carSpeed = 600; // schneller als Spieler
      this.carSpeedBoost = 1; //Boost-Multiply, wenn "SPACE"-Taste gedrückt wird
      let targetVX = 0;
      let targetVY = 0;

      const isDrivingKeyDown = this.keys.W.isDown || this.keys.A.isDown || this.keys.S.isDown || this.keys.D.isDown;

      if (this.inCar && isDrivingKeyDown && !this.driveSound.isPlaying)
        this.driveSound.play();

      if (this.inCar && !isDrivingKeyDown && this.driveSound.isPlaying)
        this.driveSound.stop();

      // Manage car speed

      // Car-Booost
      if (this.spaceKey.isDown && isDrivingKeyDown) {
          this.carSpeedBoost = 1.8
      }
      if(!this.spaceKey.isDown && isDrivingKeyDown) {
        this.carSpeedBoost = 1
      }

      // Set car direction
      if (this.keys.W.isDown) targetVY = -carSpeed * this.carSpeedBoost;
      if (this.keys.S.isDown) targetVY = carSpeed * this.carSpeedBoost;
      if (this.keys.A.isDown) targetVX = -carSpeed * this.carSpeedBoost;
      if (this.keys.D.isDown) targetVX = carSpeed * this.carSpeedBoost;

      // „Nachschieben“ (einfache Trägheit)
      this.carVelocity.x += (targetVX - this.carVelocity.x) * 0.1;
      this.carVelocity.y += (targetVY - this.carVelocity.y) * 0.1;

      this.car.setVelocity(this.carVelocity.x, this.carVelocity.y);

      if (this.car.body.velocity.length() > 10) {
        this.car.rotation = Phaser.Math.Angle.Between(0, 0, this.carVelocity.x, this.carVelocity.y);
      }

      if (Phaser.Input.Keyboard.JustDown(this.hKey)) {
        if (this.inCar)
          this.sound.play('hornSound', { volume: GameSettings.volume });
      }

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

    this.scale.on('resize', (gameSize) => {
      const width = gameSize.width;
      const height = gameSize.height;

      if (this.pizzyAssistant) {
        this.pizzyAssistant.setPosition(width - 100, height - 100);
        this.pizzyAssistant.setScale(width / 1920 * 0.5);
      }
    });


    this.updateNPC();
  }

  /**
   * Deaktiviert den Lauf-Sound eines Spielers
   */
  stopPlayerWalkSoundIfPlayed() {
    if(this.walkSound.isPlaying)
      this.walkSound.stop();
  }

  /**
   * Deaktiviert den Lauf-Sound eines Spielers
   */
  stopCarDriveSoundIfPlayed() {
    if(this.driveSound.isPlaying)
      this.driveSound.stop();
  }

}