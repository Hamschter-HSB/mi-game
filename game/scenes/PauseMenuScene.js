class PauseMenuScene extends Phaser.Scene {
    constructor() {
        super({key: 'PauseMenuScene'});
    }

    preload() {
        this.load.image('resumeBtn', 'assets/img/ui/Resume.png');
        this.load.image('exitBtn', 'assets/img/ui/Exit.png');
    }

    create(data) {
        const pausedSceneKey = data.pausedSceneKey;

        // Wichtig: Jetzt erst pausieren!
        this.scene.pause(pausedSceneKey);

        const { width, height } = this.scale;

        // Menü Overlay
        this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.6)
            .setScrollFactor(0)
            .setDepth(9999);

        // Dynamische Skalierung
        const logoScale = width / 1920 * 0.9;
        const buttonScale = width / 1920 * 0.4;

        // Logo
        this.add.image(width / 2, height * 0.2, 'menuOverlay')
            .setOrigin(0.5)
            .setScale(logoScale)
            .setScrollFactor(0)
            .setDepth(10000);

        // Resume Button
        this.add.image(width / 2, height * 0.45, 'resumeBtn')
            .setOrigin(0.5)
            .setScale(buttonScale)
            .setScrollFactor(0)
            .setDepth(10000)
            .setInteractive()
            .on('pointerdown', () => {
                this.sound.play('clickSound', { volume: GameSettings.volume });

                this.scene.stop(); // Menü schließen
                this.scene.resume(pausedSceneKey); // Spielszene fortsetzen
            });

        // Exit Button
        this.add.image(width / 2, height * 0.58, 'exitBtn')
            .setOrigin(0.5)
            .setScale(buttonScale)
            .setScrollFactor(0)
            .setDepth(10000)
            .setInteractive()
            .on('pointerdown', () => {
                this.sound.play('clickSound', { volume: GameSettings.volume });
                this.scene.stop(pausedSceneKey);
                this.scene.start('MainMenuScene');
            });
    }
}