export class AudioEngine {
  constructor() {
    this.audioContext = null;
    this.buffers = new Map();
    this.initialized = false;
    this.activeSources = new Set();
    this._hasUserGesture = false;
    this.currentGame = null;
    this.initPromise = null;
    this.setupVisibilityHandler();
    this.setupUserGestureTracking();
  }
  
  setupUserGestureTracking() {
    const userGestureEvents = ['touchstart', 'touchend', 'click', 'keydown'];
    const handler = async () => {
      this._hasUserGesture = true;
      // Try to resume AudioContext on user gesture
      if (this.audioContext?.state === 'suspended') {
        try {
          await this.audioContext.resume();
          console.log('AudioContext resumed after user gesture');
        } catch (error) {
          console.error('Failed to resume AudioContext:', error);
        }
      }
      userGestureEvents.forEach(event => {
        document.removeEventListener(event, handler);
      });
    };
    userGestureEvents.forEach(event => {
      document.addEventListener(event, handler);
    });
  }

  setupVisibilityHandler() {
    this.stopAllSounds = this.stopAllSounds.bind(this);

    document.addEventListener('visibilitychange', async () => {
      if (document.hidden) {
        console.log('Page hidden - stopping all audio');
        this.stopAllSounds();
        if (this.audioContext?.state === 'running') {
          try {
            await this.audioContext.suspend();
          } catch (e) {
            console.error('Error suspending context:', e);
          }
        }
      } else {
        console.log('Page visible - attempting to resume audio');
        try {
          // Only try to resume if we have user gesture
          if (this._hasUserGesture) {
            if (!this.audioContext) {
              await this.init();
            } else if (this.audioContext.state === 'suspended') {
              await this.audioContext.resume();
              if (!await this.verifyBuffers()) {
                await this.init();
              }
            }
          }
          console.log('Audio context status:', this.audioContext?.state);
        } catch (e) {
          console.error('Error resuming audio context:', e);
        }
      }
    });

    window.addEventListener('pagehide', () => this.stopAllSounds());
    window.addEventListener('pageshow', async () => {
      if (this._hasUserGesture && this.audioContext?.state === 'suspended') {
        try {
          await this.audioContext.resume();
        } catch (error) {
          console.error('Error resuming on pageshow:', error);
        }
      }
    });
  }

  stopAllSounds() {
    console.log('Stopping all sounds');
    if (this.activeSources) {
      this.activeSources.forEach(source => {
        try {
          source.stop(0);
          source.disconnect();
        } catch (e) {
          console.error('Error stopping source:', e);
        }
      });
      this.activeSources.clear();
    }
  }

  async init() {
    // Use promise to prevent multiple simultaneous initializations
    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = (async () => {
      console.log('Starting AudioEngine initialization...');
      try {
        if (this.initialized && this.audioContext?.state === 'running') {
          console.log('AudioEngine already initialized and running');
          return true;
        }

        if (!this.audioContext) {
          const AudioContext = window.AudioContext || window.webkitAudioContext;
          this.audioContext = new AudioContext();
          console.log('AudioContext created:', this.audioContext.state);
        }

        // Only attempt to resume if we have user gesture
        if (this._hasUserGesture && this.audioContext.state === 'suspended') {
          console.log('Attempting to resume suspended audio context...');
          await this.audioContext.resume();
          console.log('Audio context resumed:', this.audioContext.state);
        }

        this.initialized = true;
        return true;
      } catch (error) {
        console.error('AudioEngine initialization failed:', error);
        this.initialized = false;
        return false;
      } finally {
        this.initPromise = null;
      }
    })();

    return this.initPromise;
  }

  async loadSound(url, id, gameNumber = null) {
    try {
      if (!this.audioContext) {
        await this.init();
      }

      if (gameNumber && id.startsWith('melody') && this.currentGame !== gameNumber) {
        this.clearMelodies();
        this.currentGame = gameNumber;
      }

      console.log(`Loading sound: ${id} from ${url}`);
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
      this.buffers.set(id, audioBuffer);
      console.log(`Sound loaded successfully: ${id}`);
      return audioBuffer;
    } catch (error) {
      console.error(`Failed to load sound ${id}:`, error);
      throw error;
    }
  }

  clearMelodies() {
    for (const [key] of this.buffers) {
      if (key.startsWith('melody')) {
        this.buffers.delete(key);
      }
    }
    console.log('Cleared melody buffers');
  }

  async verifyBuffers() {
    for (let i = 1; i <= 8; i++) {
      if (!this.buffers.has(`n${i}`)) {
        return false;
      }
    }
    return true;
  }

  playSound(id, time = 0, onComplete = null) {
    if (!this._hasUserGesture) {
      console.log('No user gesture yet, cannot play sound');
      return null;
    }

    if (!this.initialized || !this.audioContext || !this.buffers.has(id)) {
      console.error(`Cannot play sound ${id}: Engine not initialized or buffer not found`);
      return null;
    }

    try {
      if (document.hidden) {
        console.log('Page is hidden, not playing sound');
        return null;
      }

      const source = this.audioContext.createBufferSource();
      source.buffer = this.buffers.get(id);
      
      const gainNode = this.audioContext.createGain();
      gainNode.gain.value = 1.0;

      source.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      const startTime = this.audioContext.currentTime + time;
      source.start(startTime);
      
      this.activeSources.add(source);
      
      source.onended = () => {
        this.activeSources.delete(source);
        source.disconnect();
        gainNode.disconnect();
        if (onComplete && typeof onComplete === 'function') {
          onComplete();
        }
      };
      
      return source;
    } catch (error) {
      console.error(`Error playing sound ${id}:`, error);
      return null;
    }
  }

  playNote(noteNumber) {
    return this.playSound(`n${noteNumber}`);
  }

  isPlaying() {
    return this.activeSources.size > 0;
  }

  getAudioContextState() {
    return {
      exists: !!this.audioContext,
      state: this.audioContext?.state || 'no context',
      initialized: this.initialized,
      hasUserGesture: this._hasUserGesture
    };
  }
} // Close the class definition here

export const audioEngine = new AudioEngine(); 