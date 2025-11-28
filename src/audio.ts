const SOUND_FILE_NAMES = {
  move: 'Move.mp3',
  capture: 'Capture.mp3',
  check: 'Check.mp3',
  checkmate: 'Checkmate.mp3',
  victory: 'Victory.mp3',
  defeat: 'Defeat.mp3',
  draw: 'Draw.mp3',
} as const;

export type SoundEvent = keyof typeof SOUND_FILE_NAMES;

export type SoundDetail = {
  src: string;
  volume?: number;
  playbackRate?: number;
};

export type SoundPack = Partial<
  Record<SoundEvent, SoundDetail | string | null | undefined>
>;

type NormalizedSoundDetail = {
  src: string;
  volume: number;
  playbackRate: number;
};

type NormalizedSoundPack = Record<
  SoundEvent,
  NormalizedSoundDetail | null | undefined
>;

const clampVolume = (value: number | undefined): number => {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return 1;
  }
  if (value < 0) {
    return 0;
  }
  if (value > 1) {
    return 1;
  }
  return value;
};

const normalizePlaybackRate = (value: number | undefined): number => {
  if (typeof value !== 'number' || Number.isNaN(value) || value <= 0) {
    return 1;
  }
  return value;
};

const normalizeSoundPack = (pack?: SoundPack | null): NormalizedSoundPack => {
  const normalized = {} as NormalizedSoundPack;
  for (const event of SOUND_EVENTS) {
    const override = pack?.[event];
    if (override === null) {
      normalized[event] = null;
      continue;
    }
    const detail: SoundDetail | undefined =
      typeof override === 'string'
        ? { src: override }
        : (override ?? DEFAULT_SOUND_PACK[event]);
    if (!detail?.src) {
      normalized[event] = null;
      continue;
    }
    normalized[event] = {
      src: detail.src,
      volume: clampVolume(detail.volume),
      playbackRate: normalizePlaybackRate(detail.playbackRate),
    };
  }
  return normalized;
};

const CDN_AUDIO_BASE_URL =
  'https://hexagonchess.github.io/hexchess-board/assets/audio';

const resolveAssetUrl = (event: SoundEvent): string => {
  if (
    typeof window !== 'undefined' &&
    window.location.hostname === 'localhost'
  ) {
    return new URL(
      `../docs/assets/audio/${SOUND_FILE_NAMES[event]}`,
      window.location.href,
    ).href;
  }
  return `${CDN_AUDIO_BASE_URL}/${SOUND_FILE_NAMES[event]}`;
};

export const DEFAULT_SOUND_PACK: Record<SoundEvent, SoundDetail> = {
  move: { src: resolveAssetUrl('move'), volume: 0.6 },
  capture: { src: resolveAssetUrl('capture'), volume: 0.75 },
  check: { src: resolveAssetUrl('check'), volume: 0.7 },
  checkmate: { src: resolveAssetUrl('checkmate'), volume: 0.8 },
  victory: { src: resolveAssetUrl('victory'), volume: 0.85 },
  defeat: { src: resolveAssetUrl('defeat'), volume: 0.65 },
  draw: { src: resolveAssetUrl('draw'), volume: 0.65 },
};

const hasAudioSupport =
  typeof window !== 'undefined' && typeof window.Audio === 'function';

const SOUND_EVENTS = Object.keys(SOUND_FILE_NAMES) as SoundEvent[];

export class AudioManager {
  private _muted = false;
  private _hasUserGesture = !hasAudioSupport;
  private _canPlayAudio = !hasAudioSupport;
  private _soundPack: NormalizedSoundPack;
  private readonly _audioElements = new Map<SoundEvent, HTMLAudioElement>();
  private _preloadPromise: Promise<void> | null = null;
  private readonly _pendingEvents: SoundEvent[] = [];

  constructor(pack?: SoundPack | null) {
    this._soundPack = normalizeSoundPack(pack);
  }

  setMuted(muted: boolean): void {
    this._muted = muted;
  }

  updateSoundPack(pack?: SoundPack | null): void {
    this._soundPack = normalizeSoundPack(pack);
    this._audioElements.clear();
    this._preloadPromise = null;
  }

  allowPlayback(): void {
    this._hasUserGesture = true;
    this._canPlayAudio = true;
    const pending = this._pendingEvents.splice(0, this._pendingEvents.length);
    for (const event of pending) {
      void this._playInternal(event);
    }
  }

  async preloadAll(): Promise<void> {
    if (!hasAudioSupport) {
      return;
    }
    if (!this._preloadPromise) {
      this._preloadPromise = Promise.all(
        SOUND_EVENTS.map((event) => this._loadEvent(event)),
      ).then(() => undefined);
    }
    await this._preloadPromise;
  }

  async play(event: SoundEvent): Promise<void> {
    if (this._muted) {
      return;
    }
    if (!this._hasUserGesture) {
      return;
    }
    if (!this._canPlayAudio) {
      this._pendingEvents.push(event);
      return;
    }
    await this._playInternal(event);
  }

  private async _playInternal(event: SoundEvent): Promise<void> {
    if (this._muted) {
      return;
    }
    const audio = await this._getOrCreateAudio(event);
    if (!audio) {
      return;
    }
    try {
      audio.currentTime = 0;
      const playPromise = audio.play();
      if (playPromise) {
        await playPromise;
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === 'NotAllowedError') {
        this._canPlayAudio = false;
        this._pendingEvents.push(event);
      }
    }
  }

  private async _getOrCreateAudio(
    event: SoundEvent,
  ): Promise<HTMLAudioElement | null> {
    if (!hasAudioSupport) {
      return null;
    }
    const config = this._soundPack[event];
    if (!config) {
      return null;
    }
    let audio = this._audioElements.get(event);
    if (!audio) {
      audio = new Audio(config.src);
      audio.preload = 'auto';
      this._audioElements.set(event, audio);
    }
    audio.volume = config.volume;
    audio.playbackRate = config.playbackRate;
    return audio;
  }

  private async _loadEvent(event: SoundEvent): Promise<void> {
    const audio = await this._getOrCreateAudio(event);
    if (!audio) {
      return;
    }
    if (audio.readyState >= 2) {
      return;
    }
    await new Promise<void>((resolve) => {
      const handleDone = () => {
        audio.removeEventListener('canplaythrough', handleDone);
        audio.removeEventListener('error', handleDone);
        resolve();
      };
      audio.addEventListener('canplaythrough', handleDone);
      audio.addEventListener('error', handleDone);
      audio.load();
    });
  }
}
