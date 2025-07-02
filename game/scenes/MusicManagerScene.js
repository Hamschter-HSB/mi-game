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