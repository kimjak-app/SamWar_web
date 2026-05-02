const DEFAULT_BGM_VOLUME = 0.4;

const TRACKS = {
  world: {
    id: "world",
    src: "assets/audio/world_map_bgm.mp3",
  },
  battle: {
    id: "battle",
    src: "assets/audio/battle_bgm.mp3",
  },
};

const audioState = {
  initialized: false,
  unlocked: false,
  requestedTrackId: "world",
  currentTrackId: null,
  playErrorLogged: false,
  tracks: {
    world: null,
    battle: null,
  },
};

function createTrack(src) {
  const audio = new Audio(src);
  audio.loop = true;
  audio.preload = "auto";
  audio.volume = DEFAULT_BGM_VOLUME;
  return audio;
}

function ensureInitialized() {
  if (audioState.initialized) {
    return;
  }

  audioState.tracks.world = createTrack(TRACKS.world.src);
  audioState.tracks.battle = createTrack(TRACKS.battle.src);

  const unlockOnce = () => {
    unlockAudio();
  };

  window.addEventListener("pointerdown", unlockOnce, { once: true });
  window.addEventListener("keydown", unlockOnce, { once: true });

  audioState.initialized = true;
}

function getTrack(trackId) {
  ensureInitialized();
  return audioState.tracks[trackId] ?? null;
}

function playTrack(trackId) {
  ensureInitialized();
  audioState.requestedTrackId = trackId;

  if (!audioState.unlocked || audioState.currentTrackId === trackId) {
    return;
  }

  const nextTrack = getTrack(trackId);

  if (!nextTrack) {
    return;
  }

  if (audioState.currentTrackId) {
    const previousTrack = getTrack(audioState.currentTrackId);

    if (previousTrack && previousTrack !== nextTrack) {
      previousTrack.pause();
      previousTrack.currentTime = 0;
    }
  }

  nextTrack.currentTime = 0;
  const playPromise = nextTrack.play();
  audioState.currentTrackId = trackId;

  if (playPromise?.catch) {
    playPromise.catch(() => {
      audioState.currentTrackId = null;

      if (!audioState.playErrorLogged) {
        audioState.playErrorLogged = true;
      }
    });
  }
}

export function initializeBgmManager() {
  ensureInitialized();
}

export function unlockAudio() {
  ensureInitialized();

  if (audioState.unlocked) {
    return;
  }

  audioState.unlocked = true;
  playTrack(audioState.requestedTrackId);
}

export function setBgmVolume(volume) {
  ensureInitialized();
  const nextVolume = Math.max(0, Math.min(1, volume));

  Object.values(audioState.tracks).forEach((track) => {
    if (track) {
      track.volume = nextVolume;
    }
  });
}

export function playWorldMapBgm() {
  playTrack(TRACKS.world.id);
}

export function playBattleBgm() {
  playTrack(TRACKS.battle.id);
}

export function stopBgm() {
  ensureInitialized();

  if (!audioState.currentTrackId) {
    return;
  }

  const currentTrack = getTrack(audioState.currentTrackId);

  if (currentTrack) {
    currentTrack.pause();
    currentTrack.currentTime = 0;
  }

  audioState.currentTrackId = null;
}
