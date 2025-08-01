class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
    }

    preload() {
        this.load.tilemapTiledJSON('pizzamap', 'assets/map/map1.json');
        this.load.image('tiles', 'assets/img/tileset_map1.png');
        this.load.spritesheet('tileset_sprites', 'assets/img/tileset_map1.png', {
            frameWidth: 16,
            frameHeight: 16
        });
        this.load.spritesheet('player', 'assets/img/player.png', {
            frameWidth: 16,
            frameHeight: 16
        });
        this.load.spritesheet('npc', 'assets/img/npc.png', {
            frameWidth: 16,
            frameHeight: 16
        });
        this.load.spritesheet('customer', 'assets/img/customer.png', {
            frameWidth: 16,
            frameHeight: 16
        });
        this.load.spritesheet('car', 'assets/img/car.png', {
            frameWidth: 32,
            frameHeight: 32
        })

        this.load.image('menuOverlay', 'assets/img/logo.png');
        this.load.image('menuBtn', 'assets/img/ui/Menu.png');

        this.load.image('pizzyDefault', 'assets/img/ui/pizzy/default-pizzy.png');
        this.load.image('pizzyNewOrder', 'assets/img/ui/pizzy/neworder-pizzy.png');
        this.load.image('pizzyDelivery', 'assets/img/ui/pizzy/delivery-pizzy.png');

        for (let i = 1; i <= 10; i++) {
            this.load.image(`level${i}`, `assets/img/ui/level/${i}.png`);
        }

        // Optionaler Spieler-Sprite
    }

    create() {

        console.log("Scene wurde gestartet!");

        this.gameSessionTimer = this.add.text(20, 170, `Zeit: ${GameState.minutes >= 10 ? GameState.minutes : '0' + GameState.minutes}:${GameState.seconds >= 10 ? GameState.seconds : '0' + GameState.seconds}`, {
            fontSize: '100px',
            fontFamily: 'Roboto',
            fontStyle: 'bold',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 6
        }).setOrigin(0, 0)
            .setScrollFactor(0)
            .setDepth(9999)
            .setScale(this.scale.width / 1920 * 0.3);

        this.deliveryTimer = this.add.text(20, 200, `Auslieferungszeit: ${(GameState.deliveryTimeLeft / 1000)} Sekunden`, {
            fontSize: '100px',
            fontFamily: 'Roboto',
            fontStyle: 'bold',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 6
        }).setOrigin(0, 0)
            .setScrollFactor(0)
            .setDepth(9999)
            .setScale(this.scale.width / 1920 * 0.3);

        // Timer jede Sekunde aufrufen
        this.time.addEvent({
            delay: 1000,        // 1000 ms = 1 Sekunde
            callback: this.updateGameTimer,
            callbackScope: this,
            loop: true
        });

        const scaleFactor = 8;
        window.currentScene = this; // for debug
        this.sound.volume = GameSettings.volume;
        this.scene.get('MusicManagerScene').playActionMusic();


        this.menuBG = null;
        this.menuTitle = null;
        this.resumeButton = null;
        this.mainMenuButton = null;
        this.menuVisible = false;


        // Karte laden
        const map = this.make.tilemap({ key: 'pizzamap' });
        const tileset = map.addTilesetImage('tileset_map1', 'tiles'); // name in Tiled + image key

        const ornamentLayer = map.createLayer('Ornaments', tileset, 0, 0); // Layername wie in Tiled
        ornamentLayer.setScale(scaleFactor);
        ornamentLayer.setDepth(9980);

        const ornamentLayer2 = map.createLayer('Ornaments2', tileset, 0, 0); // Layername wie in Tiled
        ornamentLayer2.setScale(scaleFactor);
        ornamentLayer2.setDepth(9981);

        const droppedLayer = map.createLayer('Dropped', tileset, 0, 0); // Layername wie in Tiled
        droppedLayer.setScale(scaleFactor);
        droppedLayer.setDepth(2);

        const droppedLayer2 = map.createLayer('Dropped2', tileset, 0, 0); // Layername wie in Tiled
        droppedLayer2.setScale(scaleFactor);
        droppedLayer2.setDepth(3);

        const droppedLayer3 = map.createLayer('Dropped3', tileset, 0, 0); // Layername wie in Tiled
        droppedLayer3.setScale(scaleFactor);
        droppedLayer3.setDepth(4);

        const droppedLayer4 = map.createLayer('Dropped4', tileset, 0, 0); // Layername wie in Tiled
        droppedLayer4.setScale(scaleFactor);
        droppedLayer4.setDepth(5);



        const groundLayer = map.createLayer('Ground', tileset, 0, 0); // Layername wie in Tiled
        groundLayer.setScale(scaleFactor);

        const collisionObjects = map.getObjectLayer('Collisions')['objects'];
        this.collisionGroup = this.physics.add.staticGroup();

        collisionObjects.forEach((objData) => {
            const { x, y, width, height } = objData;

            const scaledX = (x + width / 2) * scaleFactor;
            const scaledY = (y + height / 2) * scaleFactor;
            const scaledWidth = width * scaleFactor;
            const scaledHeight = height * scaleFactor;

            const rect = this.add.rectangle(scaledX, scaledY, scaledWidth, scaledHeight);
            this.physics.add.existing(rect, true);
            this.collisionGroup.add(rect);
        });

        const objectLayer = map.getObjectLayer('DynamicLayering');
        this.depthGroup = this.add.group();

        const tileWidth = tileset.tileWidth * scaleFactor;  // z.B. 16 * 8 = 128
        const tileHeight = tileset.tileHeight * scaleFactor;

        objectLayer.objects.forEach(obj => {
            if (!obj.gid) return;

            const frame = obj.gid - tileset.firstgid;
            const spriteX = (obj.x * scaleFactor) + (tileWidth / 2);
            const spriteY = (obj.y * scaleFactor);

            const sprite = this.add.sprite(spriteX, spriteY, 'tileset_sprites', frame)
                .setOrigin(0.5, 1)
                .setScale(scaleFactor)
                .setDepth(spriteY);
            this.depthGroup.add(sprite);
        });


        // Spieler hinzufügen
        this.player = this.physics.add.sprite(1230, 1152, 'player')
            .setScale(scaleFactor)
            .setCollideWorldBounds(true)
        this.player.body.setSize(10, 3)          // Größe der Hitbox
        this.player.body.setOffset(3, 13);
        this.player.setPushable(false);
        this.walkSound = this.sound.add('walkSound', {
            volume: GameSettings.volume,
            loop: true // Sound soll bei gedrückter Taste durchgehend spielen
        });

        // Car
        this.inCar = false;
        this.isBoostActive = false;
        this.isBoostLocked = false;
        this.carSpeedBoost = 1; //Boost-Multiply, wenn "SPACE"-Taste gedrückt wird
        this.carVelocity = { x: 0, y: 0 }; // Für „Nachschieben“

        this.car = this.physics.add.sprite(840, 830, 'car')
            .setCollideWorldBounds(true)
            .setDepth(16)
            .setScale(scaleFactor);
        this.car.body.setSize(18, 18)
        this.car.setPushable(false);

        // .setOffset(5, 5);

        this.driveSound = this.sound.add('driveSound', {
            volume: GameSettings.volume,
            loop: true // Sound soll bei gedrückter Taste durchgehend spielen
        });


        // Kamera folgt Spieler
        this.cameras.main.startFollow(this.player);
        this.cameras.main.setBounds(0, 0, map.widthInPixels * scaleFactor, map.heightInPixels * scaleFactor);

        // Physik-Bereich auf Mapgröße begrenzen
        this.physics.world.setBounds(0, 0, map.widthInPixels * scaleFactor, map.heightInPixels * scaleFactor);

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
            .setScale(this.scale.width / 1920 * 0.9); // skalierbar je nach Auflösung

        this.scale.on('resize', (gameSize) => {
            if (!gameSize || !this.pizzyAssistant) return;

            const width = gameSize.width;
            const height = gameSize.height;

            if (this.pizzyAssistant) {
                this.pizzyAssistant.setPosition(width - 100, height - 100);
                this.pizzyAssistant.setScale(width / 1920 * 0.5);
            }
            if (this.menuButton) {
                this.menuButton.setPosition(width - 20, 20);
                this.menuButton.setScale(width / 1920 * 0.3);
            }
            if (this.levelImage) {
                this.levelImage.setPosition(20, 20);
                this.levelImage.setScale(gameSize.width / 1920 * 0.3);
            }

        });


        // Waypoints
        this.waypoints = [];
        this.waypointGroup = this.add.group();
        this.currentWaypointTarget = null;
        this.waypointUpdateTimer = 0;

        this.customerSprite = null;


        this.setupLevel();

        this.menuButton = this.add.image(this.scale.width - 20, 20, 'menuBtn')
            .setOrigin(1, 0) // oben rechts
            .setScrollFactor(0)
            .setInteractive()
            .setDepth(9999)
            .setScale(this.scale.width / 1920 * 0.1) // dynamisch skalieren
            .on('pointerdown', () => {
                this.toggleMenu();
            });

        this.levelImage = this.add.image(20, 20, `level${GameState.currentLevel}`)
            .setOrigin(0, 0)
            .setScrollFactor(0)
            .setDepth(9999)
            .setScale(this.scale.width / 1920 * 0.3);

        // NPC's erstellen und hinzufügen
        this.npcs = this.physics.add.group();
        const amountOfNPCS = 46;
        let npcSpawnPointX = 2496; // Startbereich
        let npcSpawnPointY = 1216;

        for (let i = 0; i < amountOfNPCS; i++) {

            if (i > 5) { // Brückenstadt
                npcSpawnPointX = 1856;
                npcSpawnPointY = 2838;
            }
            if (i > 11) { // Park
                npcSpawnPointX = 6071;
                npcSpawnPointY = 1078;
            }
            if (i > 17) { // Flussplatz
                npcSpawnPointX = 6093;
                npcSpawnPointY = 2240;
            }
            if (i > 23) { // Strand
                npcSpawnPointX = 192;
                npcSpawnPointY = 7451;
            }
            if (i > 27) { // Innenstadt
                npcSpawnPointX = 5136;
                npcSpawnPointY = 6144;
            }
            if (i > 40) { // Bürogebäudeplaza
                npcSpawnPointX = 7492;
                npcSpawnPointY = 6592;
            }


            const npc = this.physics.add.sprite(npcSpawnPointX, npcSpawnPointY, 'npc');
            npc.setScale(scaleFactor);
            npc.setDepth(15);
            npc.body.setSize(10, 3);          // Größe der Hitbox
            npc.body.setOffset(3, 13);
            npc.setCollideWorldBounds(true); // bleibt im Weltbereich

            // Richtungswerte speichern
            npc.dx = 0;
            npc.dy = 0;

            this.npcs.add(npc);
        }

        // Bewegung starten
        this.changeDirection();

        // Collision
        this.physics.add.collider(this.npcs, this.npcs);

        this.physics.add.collider(this.car, this.npcs, (car, npc) => {
            console.log('Auto kollidiert mit NPC!');
        });
        this.physics.add.collider(this.player, this.collisionGroup);
        this.physics.add.collider(this.car, this.collisionGroup);
        this.physics.add.collider(this.npcs, this.collisionGroup);
        this.physics.add.collider(this.player, this.npcs, (player, npc) => {
            console.log('Spieler kollidiert mit NPC!');
        });

        // Alle paar Sekunden Richtung ändern
        this.time.addEvent({

            delay: 2000,
            callback: this.changeDirection,
            callbackScope: this,
            loop: true
        });

        // Animation: Spieler läuft nach unten
        if (!this.anims.exists('walk-down')) {
            this.anims.create({
                key: 'walk-down',
                frames: this.anims.generateFrameNumbers('player', { frames: [0, 1, 0, 2] }),
                frameRate: 8,
                repeat: -1
            });
        }

        // Animation: Spieler läuft nach links
        if (!this.anims.exists('walk-left')) {
            this.anims.create({
                key: 'walk-left',
                frames: this.anims.generateFrameNumbers('player', { frames: [3, 4, 3, 5] }),
                frameRate: 8,
                repeat: -1
            });
        }

        // Animation: Spieler läuft nach rechts
        if (!this.anims.exists('walk-right')) {
            this.anims.create({
                key: 'walk-right',
                frames: this.anims.generateFrameNumbers('player', { frames: [6, 7, 6, 8] }),
                frameRate: 8,
                repeat: -1
            });
        }

        // Animation: Spieler läuft nach oben
        if (!this.anims.exists('walk-up')) {
            this.anims.create({
                key: 'walk-up',
                frames: this.anims.generateFrameNumbers('player', { frames: [9, 10, 9, 11] }),
                frameRate: 8,
                repeat: -1
            });
        }

        // Spieler steht still
        if (!this.anims.exists('idle')) {
            this.anims.create({
                key: 'idle',
                frames: this.anims.generateFrameNumbers('player', { frames: [0, 12, 13, 12] }),
                frameRate: 4,
                repeat: -1
            });
        }

        // Animation: NPC läuft nach unten
        if (!this.anims.exists('npc-walk-down')) {
            this.anims.create({
                key: 'npc-walk-down',
                frames: this.anims.generateFrameNumbers('npc', { frames: [0, 1, 0, 2] }),
                frameRate: 8,
                repeat: -1
            });
        }

        // Animation: NPC läuft nach links
        if (!this.anims.exists('npc-walk-left')) {
            this.anims.create({
                key: 'npc-walk-left',
                frames: this.anims.generateFrameNumbers('npc', { frames: [3, 4, 3, 5] }),
                frameRate: 8,
                repeat: -1
            });
        }

        // Animation: NPC läuft nach rechts
        if (!this.anims.exists('npc-walk-right')) {
            this.anims.create({
                key: 'npc-walk-right',
                frames: this.anims.generateFrameNumbers('npc', { frames: [6, 7, 6, 8] }),
                frameRate: 8,
                repeat: -1
            });
        }

        // Animation: NPC läuft nach oben
        if (!this.anims.exists('npc-walk-up')) {
            this.anims.create({
                key: 'npc-walk-up',
                frames: this.anims.generateFrameNumbers('npc', { frames: [9, 10, 9, 11] }),
                frameRate: 8,
                repeat: -1
            });
        }

        // NPC steht still 
        if (!this.anims.exists('npc-idle')) {
            this.anims.create({
                key: 'npc-idle',
                frames: this.anims.generateFrameNumbers('npc', { frames: [0, 12, 13, 12] }),
                frameRate: 4,
                repeat: -1
            });
        }

        // Animation: Customer idle animation
        if (!this.anims.exists('customer-idle')) {
            this.anims.create({
                key: 'customer-idle',
                frames: this.anims.generateFrameNumbers('customer', { frames: [0, 1, 2, 1] }),
                frameRate: 6,
                repeat: -1
            });
        }

        this.events.once('shutdown', this.shutdown, this);


        // Animation: Car fährt nach oben
        if (!this.anims.exists('car-drive-up')) {
            this.anims.create({
                key: 'car-drive-up',
                frames: this.anims.generateFrameNumbers('car', { frames: [0, 8] }),
                frameRate: 2,
                repeat: -1
            });
        }

        // Animation: Car fährt nach oben rechts
        if (!this.anims.exists('car-drive-up-right')) {
            this.anims.create({
                key: 'car-drive-up-right',
                frames: this.anims.generateFrameNumbers('car', { frames: [1, 12] }),
                frameRate: 2,
                repeat: -1
            });
        }

        // Animation: Car fährt nach rechts

        if (!this.anims.exists('car-drive-right')) {
            this.anims.create({
                key: 'car-drive-right',
                frames: this.anims.generateFrameNumbers('car', { frames: [2, 10] }),
                frameRate: 2,
                repeat: -1
            });
        }

        // Animation: Car fährt nach rechts unten 
        if (!this.anims.exists('car-drive-down-right')) {
            this.anims.create({
                key: 'car-drive-down-right',
                frames: this.anims.generateFrameNumbers('car', { frames: [3, 13] }),
                frameRate: 2,
                repeat: -1
            });
        }

        // Animation: Car fährt nach unten
        if (!this.anims.exists('car-drive-down')) {
            this.anims.create({
                key: 'car-drive-down',
                frames: this.anims.generateFrameNumbers('car', { frames: [4, 9] }),
                frameRate: 2,
                repeat: -1
            });
        }

        // Animation: Car fährt nach unten links
        if (!this.anims.exists('car-drive-down-left')) {
            this.anims.create({
                key: 'car-drive-down-left',
                frames: this.anims.generateFrameNumbers('car', { frames: [5, 14] }),
                frameRate: 2,
                repeat: -1
            });
        }

        // Animation: Car fährt nach links
        if (!this.anims.exists('car-drive-left')) {
            this.anims.create({
                key: 'car-drive-left',
                frames: this.anims.generateFrameNumbers('car', { frames: [6, 11] }),
                frameRate: 2,
                repeat: -1
            });
        }

        // Animation: Car fährt nach links oben
        if (!this.anims.exists('car-drive-up-left')) {
            this.anims.create({
                key: 'car-drive-up-left',
                frames: this.anims.generateFrameNumbers('car', { frames: [7, 15] }),
                frameRate: 2,
                repeat: -1
            });
        }



    } // end of create

    shutdown() {
        this.scale.off('resize');
        this.scene.stop('GameScene');
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
        if (this.levelImage) {
            const levelKey = `level${GameState.currentLevel + 1}`;
            if (this.levelImage && this.textures.exists(levelKey)) {
                this.levelImage.setTexture(levelKey);
            }
        }


    }

    updateNPC() {
        this.npcs.children.iterate(npc => {
            this.npcSpeed = 25;
            npc.setVelocity(npc.dx * this.npcSpeed, npc.dy * this.npcSpeed);
            npc.setImmovable(false); //kollision mit spieler: NPCs können nicht verschoben werden
        });
    }

    changeDirection() {
        const directions = [
            { dx: 7, dy: 0 },
            { dx: -7, dy: 0 },
            { dx: 0, dy: 7 },
            { dx: 0, dy: -7 },
            { dx: 0, dy: 0 }
        ];

        this.npcs.children.iterate(npc => {
            const dir = Phaser.Math.RND.pick(directions);
            npc.dx = dir.dx;
            npc.dy = dir.dy;
            if (npc.dx > 0) {
                npc.anims.play('npc-walk-right', true);
            }
            else if (npc.dx < 0) {
                npc.anims.play('npc-walk-left', true);
            }
            else if (npc.dy > 0) {
                npc.anims.play('npc-walk-down', true);
            }
            else if (npc.dy < 0) {
                npc.anims.play('npc-walk-up', true);
            }
            else {
                npc.anims.play('npc-idle', true);
            }
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
                    this.startPizzaDeliveryTimer();
                    this.sound.play('itemPickupSound', { volume: GameSettings.volume });

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
                GameState.deliveryTimeLeft = 30000;

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

        this.customerSprite = this.physics.add.sprite(x, y, 'customer').setDepth(150);
        this.customerSprite.setScale(8);
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
        this.scene.launch('PauseMenuScene', { pausedSceneKey: this.scene.key });
        this.scene.bringToTop('PauseMenuScene');
        this.scene.pause();
    }

    // end of game functions

    update(time, delta) {
        if (!this.player || !this.player.body) return;
        const playerSpeed = 200;
        const body = this.player.body;
        const player = this.player;


        this.player.setDepth(this.player.y + 64);
        this.car.setDepth(this.car.y);

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

                this.stopCarDriveSoundIfPlayed();
                this.stopCarNitroSoundIfPlayed();
            }
        }

        // Player walk-sound

        const isWalkingKeyDown = this.keys.W.isDown || this.keys.A.isDown || this.keys.S.isDown || this.keys.D.isDown;

        if (!this.inCar && isWalkingKeyDown && !this.walkSound.isPlaying)
            this.walkSound.play();

        if (!this.inCar && !isWalkingKeyDown && this.walkSound.isPlaying)
            this.walkSound.stop();

        if (!this.inCar) {

            player.setVelocity(0);
            if (this.keys.A.isDown) {
                player.setVelocityX(-playerSpeed);
                player.anims.play('walk-left', true);
            }
            if (this.keys.D.isDown) {
                player.setVelocityX(playerSpeed);
                player.anims.play('walk-right', true);
            }

            if (this.keys.W.isDown) {
                player.setVelocityY(-playerSpeed);
                if (!this.keys.A.isDown && !this.keys.D.isDown) {
                    player.anims.play('walk-up', true);
                }
            }
            if (this.keys.S.isDown) {
                player.setVelocityY(playerSpeed);
                if (!this.keys.A.isDown && !this.keys.D.isDown) {
                    player.anims.play('walk-down', true);
                }
            }

            if (!isWalkingKeyDown) {
                player.anims.play('idle', true);
            }
        } else {
            const carSpeed = 600; // schneller als Spieler
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
                this.activateCarBoost();
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

            if (Phaser.Input.Keyboard.JustDown(this.hKey)) {
                if (this.inCar)
                    this.sound.play('hornSound', { volume: GameSettings.volume });
            }

        }

        const angleRad = this.car.body.velocity.angle();
        let angleDeg = Phaser.Math.RadToDeg(angleRad);
        if (angleDeg < 0) angleDeg += 360; // z. B. -90 → 270


        // Car Animation basierend auf Bewegungsrichtung
        if (angleDeg >= 337.5 || angleDeg < 22.5)   // rechts
            {this.car.anims.play('car-drive-right', true)}         
        else if (angleDeg < 67.5)                   // rechts unten
            {this.car.anims.play('car-drive-down-right', true)}         
        else if (angleDeg < 112.5)                  // unten  
            {this.car.anims.play('car-drive-down', true)}         
        else if (angleDeg < 157.5)                  // unten links          
            {this.car.anims.play('car-drive-down-left', true)}         
        else if (angleDeg < 202.5)                  // links
            {this.car.anims.play('car-drive-left', true)}         
        else if (angleDeg < 247.5)                  // links oben       
            {this.car.anims.play('car-drive-up-left', true)}         
        else if (angleDeg < 292.5)                  // oben    
            {this.car.anims.play('car-drive-up', true)}         
        else                                        // oben rechts  
            {this.car.anims.play('car-drive-up-right', true)}         

        const toleranceValue = 1

        if ((this.car.body.velocity.x <= toleranceValue && this.car.body.velocity.x >= -toleranceValue) && (this.car.body.velocity.y <= toleranceValue && this.car.body.velocity.y >= -toleranceValue)) {
            this.car.anims.stop();
        }
        //this.car.setFrame(frameIndex);

        // Customer animation
        if (this.customerSprite != null) {
            this.customerSprite.anims.play('customer-idle', true);
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
        if (GameSettings.experimental == true) {
            if (GameState.currentLevel > 6) {
                this.scene.pause();
                const name = prompt("Du hast gewonnen! Wie heißt du?");

                if (name) {
                    const time = `${GameState.minutes.toString().padStart(2, '0')}:${GameState.seconds.toString().padStart(2, '0')}`;
                    this.sendScoreToServer(name, time);
                }
            }
        }

        this.updateNPC();
    }

    sendScoreToServer(name, time) {
        if (GameSettings.experimental == true) {
            fetch('speichern.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: `username=${encodeURIComponent(name)}&zeit=${encodeURIComponent(time)}`
            })
                .then(res => res.text())
                .then(data => {
                    console.log(data);
                    window.location.href = 'highscore.php'; // → Highscore-Seite öffnen
                });
        }
    }

    /**
     * Deaktiviert den Lauf-Sound eines Spielers
     */
    stopPlayerWalkSoundIfPlayed() {
        if (this.walkSound.isPlaying)
            this.walkSound.stop();
    }

    /**
     * Deaktiviert den Fahr-Sound eines Autos
     */
    stopCarDriveSoundIfPlayed() {
        if (this.driveSound.isPlaying)
            this.driveSound.stop();
    }

    /**
     * Deaktiviert den Boost-Sound eines Autos
     */
    stopCarNitroSoundIfPlayed() {
        if (this.nitroSoundInstance) {
            this.nitroSoundInstance.stop();
            this.nitroSoundInstance.destroy();
            this.nitroSoundInstance = null;
        }
    }

    activateCarBoost() {
        if (this.isBoostLocked) return; // Locked heißt 6 sec noch nicht um

        this.lockCarBoost();

        if (this.isBoostActive) return; // Verhindere mehrfaches Aktivieren

        this.isBoostActive = true;
        this.carSpeedBoost = 1.6;

        // === Sound starten und merken
        this.nitroSoundInstance = this.sound.add('nitroSound');
        this.nitroSoundInstance.play({ volume: GameSettings.volume * 0.5, loop: true });

        console.log('Boost aktiviert!');

        this.time.delayedCall(3000, () => {
            this.isBoostActive = false;
            this.carSpeedBoost = 1;
            console.log('Boost deaktiviert!');

            // === Sound stoppen
            this.stopCarNitroSoundIfPlayed()
        }, [], this);
    }


    lockCarBoost() {
        if (this.isBoostLocked) return; // Verhindere mehrfaches Aktivieren

        this.isBoostLocked = true;
        console.log('Boost locked!');

        // Setze einen Timer, der nach 3 Sekunden wieder deaktiviert
        this.time.delayedCall(6000, () => {
            this.isBoostLocked = false;
            this.sound.play('nitroReadySound', { volume: GameSettings.volume });
            console.log('Boost unlocked!');
        }, [], this);
    }

    startPizzaDeliveryTimer() {
        // Timer alle 1000ms (1 Sekunde) ausführen
        this.timeEvent = this.time.addEvent({
            delay: 1000,             // 1 Sekunde
            callback: this.updateTimer,
            callbackScope: this,
            loop: true               // damit es wiederholt wird
        });
    }

    updateTimer() {
        if (GameState.deliveryTimeLeft > 0) {
            GameState.deliveryTimeLeft = GameState.deliveryTimeLeft - 1000;
            const deliveryTimerLeftStr = (GameState.deliveryTimeLeft / 1000).toString().padStart(2, '0');
            this.deliveryTimer.setText(`Auslieferungszeit: ${deliveryTimerLeftStr} Sekunden`);

            console.log(GameState.deliveryTimeLeft);
        } else {
            // Timer stoppen, wenn 0 erreicht ist
            this.timeEvent.remove();

            console.log("GAME OVER");
            this.scene.get('MusicManagerScene').stopMusic();
            this.sound.play('gameoverSound', { volume: GameSettings.volume });
            GameState.deliveryTimeLeft = 30000;
            this.scene.start('GameoverScene');
        }
    }

    updateGameTimer() {
        GameState.seconds++;

        if (GameState.seconds >= 60) {
            GameState.seconds = 0;
            GameState.minutes++;
        }

        // Anzeige aktualisieren
        const minStr = GameState.minutes.toString().padStart(2, '0');
        const secStr = GameState.seconds.toString().padStart(2, '0');

        this.gameSessionTimer.setText(`Zeit: ${minStr}:${secStr}`);
    }

}