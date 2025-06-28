const GameSettings = {
  volume: 1,
  brightness: 1
};

const GameState = {
  currentLevel: 1,
  objectives: [],
  deliveryPoints: [],
  deliveryIndex: 0,
  hasPizza: false
};

const Levels = {
    1: {
      pickup: { x: 500, y: 500 },
      deliveries: [{ x: 1200, y: 800 }]
    },
    2: {
      pickup: { x: 500, y: 500 },
      deliveries: [
        { x: 1300, y: 700 },
        { x: 1400, y: 500 }
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

  create() {
    this.sound.volume = GameSettings.volume;
    this.scene.get('MusicManagerScene').playMusic(this);



    this.add.text(400, 100, 'Hauptmenü', { fontSize: '32px', color: '#fff' }).setOrigin(0.5);

    this.add.text(400, 200, 'Spielen', { fontSize: '24px', color: '#0f0' })
      .setOrigin(0.5).setInteractive()
      .on('pointerdown', () => {
        this.sound.play('clickSound', { volume: GameSettings.volume });
        this.scene.start('GameScene');
    });

    this.add.text(400, 250, 'Einstellungen', { fontSize: '24px', color: '#0ff' })
      .setOrigin(0.5).setInteractive()
      .on('pointerdown', () => {
        this.sound.play('clickSound', { volume: GameSettings.volume });
        this.scene.start('SettingsScene');
    });

    this.add.text(400, 300, 'Credits', { fontSize: '24px', color: '#ff0' })
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

    // Optionaler Spieler-Sprite
  }

  create() {
    window.currentScene = this; // for debug
    this.scene.get('MusicManagerScene').stopMusic();
    this.sound.volume = GameSettings.volume;

    // Karte laden
    const map = this.make.tilemap({ key: 'pizzamap' });
    const tileset = map.addTilesetImage('city_tilemap', 'tiles'); // name in Tiled + image key
    const groundLayer = map.createLayer('Ground', tileset, 0, 0); // Layername wie in Tiled
    const ObjectLayer = map.createLayer('Objects', tileset, 0, 0); // Layername wie in Tiled

    // Spieler hinzufügen
    this.player = this.physics.add.sprite(768, 768, 'player'); // ← wichtig: physics.add!
    this.player.setCollideWorldBounds(true);


    // Kamera folgt Spieler
    this.cameras.main.startFollow(this.player);
    this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

    // Physik-Bereich auf Mapgröße begrenzen
    this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

    // WASD
    this.keys = this.input.keyboard.addKeys('W,A,S,D');

    applyBrightness(this);

    this.instructionText = this.add.text(960, 50, '', {
      fontSize: '32px',
      color: '#fff',
      backgroundColor: 'rgba(0,0,0,0.5)',
      padding: { x: 10, y: 5 }
    }).setOrigin(0.5);

    // Waypoints
    this.waypoints = [];
    this.waypointGroup = this.add.group();

    this.setupLevel();
  }
  // game functions
  setupLevel() {
    const level = Levels[GameState.currentLevel];
    if (!level) {
      this.showInstruction('Alle Lieferungen abgeschlossen!');
      return;
    }

    GameState.pickup = level.pickup;
    GameState.deliveryPoints = level.deliveries;
    GameState.deliveryIndex = 0;
    GameState.hasPizza = false;

    this.showInstruction('Fahre zur Pizzeria, um Pizza abzuholen!');
    this.createWaypoints(this.player.x, this.player.y, GameState.pickup.x, GameState.pickup.y);

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
        }
      }
    } else {
      const delivery = GameState.deliveryPoints[GameState.deliveryIndex];
      if (delivery && Phaser.Math.Distance.Between(px, py, delivery.x, delivery.y) < 100) {
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
    // Anzahl der Punkte (z. B. alle ~150 px)
    console.log('Erzeuge Wegpunkte', startX, startY, endX, endY);
    const dist = Phaser.Math.Distance.Between(startX, startY, endX, endY);
    const steps = Math.max(1, Math.floor(dist / 150));

    // Vektor
    const dx = (endX - startX) / steps;
    const dy = (endY - startY) / steps;

    // Gruppe löschen
    this.waypointGroup.clear(true, true);
    this.waypoints = [];

    for (let i = 1; i <= steps; i++) {
      const x = startX + dx * i;
      const y = startY + dy * i;

      const wp = this.add.circle(x, y, 10, 0xff0000).setDepth(500);
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
  teleportPlayer(x, y) {
    if (this.player) {
      this.player.x = x;
      this.player.y = y;

      // Körper direkt aktualisieren
      this.player.body.reset(x, y);

      console.log(`Spieler teleportiert zu: (${x}, ${y})`);
    }
  }




  // end of game functions

  update() {
    if (!this.player || !this.player.body) return;

    const speed = 400;
    const body = this.player.body;
    body.setVelocity(0);

    if (this.keys.W.isDown) body.setVelocityY(-speed);
    if (this.keys.S.isDown) body.setVelocityY(speed);
    if (this.keys.A.isDown) body.setVelocityX(-speed);
    if (this.keys.D.isDown) body.setVelocityX(speed);

    this.checkObjective();
    this.checkWaypoints();
  }
}


const config = {
  type: Phaser.AUTO,
  width: 1920,
  height: 1028,
  scene: [LoadingScene, MusicManagerScene, MainMenuScene, SettingsScene, CreditsScene, GameScene],
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