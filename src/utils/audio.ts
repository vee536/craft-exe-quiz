// Synthesized Web Audio API sound generator for CRAFT.exe
// Works 100% offline without external audio files

class SoundManager {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private volume: number = 0.7;

  private initCtx() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
  }

  public play(type: 'correct' | 'incorrect' | 'steal' | 'blaze' | 'dragon' | 'tick' | 'victory' | 'click') {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const masterGain = this.ctx.createGain();
      masterGain.gain.setValueAtTime(this.volume, now);
      masterGain.connect(this.ctx.destination);

      switch (type) {
        case 'tick': {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(800, now);
          osc.frequency.exponentialRampToValueAtTime(300, now + 0.05);
          gain.gain.setValueAtTime(0.3, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
          osc.connect(gain);
          gain.connect(masterGain);
          osc.start(now);
          osc.stop(now + 0.06);
          break;
        }

        case 'click': {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(1200, now);
          gain.gain.setValueAtTime(0.2, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.03);
          osc.connect(gain);
          gain.connect(masterGain);
          osc.start(now);
          osc.stop(now + 0.03);
          break;
        }

        case 'correct': {
          // Minecraft XP / Level up ascending arpeggio
          const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
          notes.forEach((freq, idx) => {
            const osc = this.ctx!.createOscillator();
            const gain = this.ctx!.createGain();
            osc.type = 'square';
            const startTime = now + idx * 0.08;
            osc.frequency.setValueAtTime(freq, startTime);
            gain.gain.setValueAtTime(0.15, startTime);
            gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.25);
            osc.connect(gain);
            gain.connect(masterGain);
            osc.start(startTime);
            osc.stop(startTime + 0.26);
          });
          break;
        }

        case 'incorrect': {
          // Buzzer sound
          const osc1 = this.ctx.createOscillator();
          const osc2 = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc1.type = 'sawtooth';
          osc2.type = 'sawtooth';
          osc1.frequency.setValueAtTime(140, now);
          osc2.frequency.setValueAtTime(148, now); // Dissonance
          gain.gain.setValueAtTime(0.25, now);
          gain.gain.linearRampToValueAtTime(0.25, now + 0.35);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
          osc1.connect(gain);
          osc2.connect(gain);
          gain.connect(masterGain);
          osc1.start(now);
          osc2.start(now);
          osc1.stop(now + 0.51);
          osc2.stop(now + 0.51);
          break;
        }

        case 'steal': {
          // Alert siren / buzzer open
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(440, now);
          osc.frequency.linearRampToValueAtTime(880, now + 0.15);
          osc.frequency.linearRampToValueAtTime(440, now + 0.3);
          gain.gain.setValueAtTime(0.3, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
          osc.connect(gain);
          gain.connect(masterGain);
          osc.start(now);
          osc.stop(now + 0.36);
          break;
        }

        case 'blaze': {
          // Fire whoosh / ignition
          const bufferSize = this.ctx.sampleRate * 0.5;
          const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
          const data = buffer.getChannelData(0);
          for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
          }
          const noise = this.ctx.createBufferSource();
          noise.buffer = buffer;
          const filter = this.ctx.createBiquadFilter();
          filter.type = 'bandpass';
          filter.frequency.setValueAtTime(600, now);
          filter.frequency.linearRampToValueAtTime(1800, now + 0.25);
          filter.frequency.exponentialRampToValueAtTime(200, now + 0.5);
          const gain = this.ctx.createGain();
          gain.gain.setValueAtTime(0.4, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
          noise.connect(filter);
          filter.connect(gain);
          gain.connect(masterGain);
          noise.start(now);
          noise.stop(now + 0.51);
          break;
        }

        case 'dragon': {
          // Ender Dragon roar - deep rumble sweep
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(90, now);
          osc.frequency.linearRampToValueAtTime(180, now + 0.3);
          osc.frequency.exponentialRampToValueAtTime(45, now + 1.2);
          gain.gain.setValueAtTime(0.35, now);
          gain.gain.linearRampToValueAtTime(0.4, now + 0.4);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 1.3);
          osc.connect(gain);
          gain.connect(masterGain);
          osc.start(now);
          osc.stop(now + 1.35);
          break;
        }

        case 'victory': {
          // Victorious fanfare chords
          const fanfare = [
            { f: 523.25, t: 0.0 }, // C5
            { f: 659.25, t: 0.15 }, // E5
            { f: 783.99, t: 0.3 }, // G5
            { f: 1046.50, t: 0.5 }, // C6
            { f: 1318.51, t: 0.75 } // E6
          ];
          fanfare.forEach((n) => {
            const osc = this.ctx!.createOscillator();
            const gain = this.ctx!.createGain();
            osc.type = 'sine';
            const sTime = now + n.t;
            osc.frequency.setValueAtTime(n.f, sTime);
            gain.gain.setValueAtTime(0.2, sTime);
            gain.gain.exponentialRampToValueAtTime(0.001, sTime + 0.5);
            osc.connect(gain);
            gain.connect(masterGain);
            osc.start(sTime);
            osc.stop(sTime + 0.55);
          });
          break;
        }
      }
    } catch {
      // Audio context might be restricted before user interaction
    }
  }
}

export const soundManager = new SoundManager();
