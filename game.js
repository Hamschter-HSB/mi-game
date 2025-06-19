const GameSettings = {
  volume: 1,
  brightness: 1
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
    this.load.tilemapTiledJSON('pizzamap', 'unbenannt.json');
    this.load.image('tiles', 'download.jpg');

    // Optionaler Spieler-Sprite
  }

  create() {
    this.scene.get('MusicManagerScene').stopMusic();
    this.sound.volume = GameSettings.volume;

    // Karte laden
    const map = this.make.tilemap({ key: 'pizzamap' });
    const tileset = map.addTilesetImage('download', 'tiles'); // name in Tiled + image key
    const groundLayer = map.createLayer('Ground', tileset, 0, 0); // Layername wie in Tiled

    // Spieler hinzufügen
    this.player = this.physics.add.sprite(100, 100, 'player'); // ← wichtig: physics.add!
    this.player.setCollideWorldBounds(true);


    // Kamera folgt Spieler
    this.cameras.main.startFollow(this.player);
    this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

    // Physik-Bereich auf Mapgröße begrenzen
    this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

    // WASD
    this.keys = this.input.keyboard.addKeys('W,A,S,D');

    applyBrightness(this);
  }

  update() {
    if (!this.player || !this.player.body) return;

    const speed = 200;
    const body = this.player.body;
    body.setVelocity(0);

    if (this.keys.W.isDown) body.setVelocityY(-speed);
    if (this.keys.S.isDown) body.setVelocityY(speed);
    if (this.keys.A.isDown) body.setVelocityX(-speed);
    if (this.keys.D.isDown) body.setVelocityX(speed);

  }
}


class IntroDeliveryScene extends Phaser.Scene {
  constructor() {
    super('IntroDeliveryScene');
  }

  preload() {
    // Optional: Lade Spieler-Asset oder benutze Platzhalter
  }

  create() {
    this.sound.volume = GameSettings.volume;
    this.scene.get('MusicManagerScene').stopMusic();
    applyBrightness(this);

    // Begrüßungstext
    const welcomeText = this.add.text(400, 50, 'Willkommen bei Pizza Delivery!\nLiefern wir die erste Pizza aus.', {
      fontSize: '20px',
      color: '#ffffff',
      align: 'center'
    }).setOrigin(0.5);

    this.time.delayedCall(3000, () => welcomeText.destroy());

    // Spieler-Objekt als Kreis (Platzhalter)
    this.player = this.add.circle(400, 300, 20, 0xff0000);
    this.physics.add.existing(this.player);
    this.player.body.setCollideWorldBounds(true);

    // WASD Steuerung
    this.keys = this.input.keyboard.addKeys('W,A,S,D');
  }

  update() {
    const speed = 200;
    const body = this.player.body;

    body.setVelocity(0);

    if (this.keys.W.isDown) body.setVelocityY(-speed);
    if (this.keys.S.isDown) body.setVelocityY(speed);
    if (this.keys.A.isDown) body.setVelocityX(-speed);
    if (this.keys.D.isDown) body.setVelocityX(speed);
  }
}


const config = {
  type: Phaser.AUTO,
  width: 1200,
  height: 900,
  scene: [LoadingScene, MusicManagerScene, MainMenuScene, SettingsScene, CreditsScene, IntroDeliveryScene, GameScene],
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