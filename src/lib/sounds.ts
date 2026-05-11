/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

class SoundManager {
  private sounds: Record<string, HTMLAudioElement> = {};

  constructor() {
    this.sounds = {
      pop: new Audio('https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3'),
      success: new Audio('https://assets.mixkit.co/active_storage/sfx/2013/2013-preview.mp3'),
      error: new Audio('https://assets.mixkit.co/active_storage/sfx/2018/2018-preview.mp3'),
      click: new Audio('https://www.soundjay.com/buttons/sounds/button-4.mp3'),
      swipe: new Audio('https://www.soundjay.com/buttons/sounds/button-16.mp3'),
      win: new Audio('https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3'),
    };

    // Preload
    Object.values(this.sounds).forEach(s => {
      s.volume = 0.4;
      s.load();
    });
  }

  play(name: keyof typeof this.sounds) {
    const sound = this.sounds[name];
    if (sound) {
      sound.currentTime = 0;
      sound.play().catch(() => {
        // Silently fail if browser blocks autoplay (usually needs first interaction)
      });
    }
  }
}

export const sounds = new SoundManager();
