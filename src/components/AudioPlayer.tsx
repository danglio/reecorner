import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Volume1,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  Music,
  Radio,
  Sparkles
} from 'lucide-react';

export interface AudioPlayerProps {
  /**
   * Controlled playback state from parent component.
   * If not provided, AudioPlayer manages its own playback state.
   */
  isPlaying?: boolean;
  /**
   * Callback fired when playback state changes or user clicks Play/Pause.
   */
  onToggle?: (playing: boolean) => void;
  /**
   * Audio source URL. Defaults to '/audio/conan-theme.mp3'.
   */
  src?: string;
  /**
   * Whether to automatically attempt play on first user interaction if blocked.
   * Default: true
   */
  autoPlayOnFirstInteraction?: boolean;
  /**
   * Default audio volume (0.0 to 1.0). Default: 0.35 (comfortable BGM level).
   */
  defaultVolume?: number;
  /**
   * Additional wrapper class names.
   */
  className?: string;
  /**
   * Initial expanded state. Default: true on desktop, compact on mobile.
   */
  initialExpanded?: boolean;
}

/**
 * Conan's Voice-Changing Bowtie Icon (Nơ biến đổi giọng nói của Conan)
 */
export const ConanBowtieIcon: React.FC<{ className?: string; isAnimated?: boolean }> = ({
  className = 'w-6 h-6',
  isAnimated = false,
}) => (
  <svg
    viewBox="0 0 28 24"
    fill="currentColor"
    className={`${className} ${isAnimated ? 'animate-pulse' : ''} transition-transform duration-300`}
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Left Ribbon Wing */}
    <path
      d="M14 12L3.5 4.5C2.4 3.7 1 4.5 1 5.8V18.2C1 19.5 2.4 20.3 3.5 19.5L14 12Z"
      className="fill-conan-red"
    />
    <path
      d="M3.5 4.5L14 12L3.5 19.5"
      stroke="#FF6B6B"
      strokeWidth="0.8"
      strokeOpacity="0.6"
      fill="none"
    />

    {/* Right Ribbon Wing */}
    <path
      d="M14 12L24.5 4.5C25.6 3.7 27 4.5 27 5.8V18.2C27 19.5 25.6 20.3 24.5 19.5L14 12Z"
      className="fill-conan-red"
    />
    <path
      d="M24.5 4.5L14 12L24.5 19.5"
      stroke="#FF6B6B"
      strokeWidth="0.8"
      strokeOpacity="0.6"
      fill="none"
    />

    {/* Central Knot / Voice Tuner Dial */}
    <rect
      x="11"
      y="7.5"
      width="6"
      height="9"
      rx="2.5"
      fill="#9B111E"
      stroke="#F59E0B"
      strokeWidth="1.2"
    />
    <circle cx="14" cy="12" r="1.6" fill="#F59E0B" />
    <circle cx="14" cy="12" r="0.6" fill="#0B192C" />
  </svg>
);

/**
 * Global helper to dispatch event to trigger BGM playback from any component
 */
export const triggerPlayConanBGM = (): void => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('conan-play-audio'));
  }
};

/**
 * Global helper to pause BGM playback from any component
 */
export const triggerPauseConanBGM = (): void => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('conan-pause-audio'));
  }
};

export const AudioPlayer: React.FC<AudioPlayerProps> = ({
  isPlaying: controlledIsPlaying,
  onToggle,
  src = '/audio/conan-theme.mp3',
  autoPlayOnFirstInteraction = true,
  defaultVolume = 0.35,
  className = '',
  initialExpanded = true,
}) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Volume state with LocalStorage persistence
  const [volume, setVolume] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('conan_bgm_volume');
      if (saved !== null) {
        const parsed = parseFloat(saved);
        if (!isNaN(parsed) && parsed >= 0 && parsed <= 1) return parsed;
      }
    } catch {
      // Ignore localStorage errors
    }
    return defaultVolume;
  });

  const [isMuted, setIsMuted] = useState<boolean>(() => {
    try {
      return localStorage.getItem('conan_bgm_muted') === 'true';
    } catch {
      return false;
    }
  });

  // Internal playing state if uncontrolled
  const [internalPlaying, setInternalPlaying] = useState<boolean>(false);
  const isControlled = controlledIsPlaying !== undefined;
  const isPlaying = isControlled ? controlledIsPlaying : internalPlaying;

  // UI state
  const [isExpanded, setIsExpanded] = useState<boolean>(initialExpanded);
  const [autoplayBlocked, setAutoplayBlocked] = useState<boolean>(false);
  const [hasInteracted, setHasInteracted] = useState<boolean>(false);

  // Update audio volume whenever volume or muted changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  // Persist volume to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('conan_bgm_volume', volume.toString());
      localStorage.setItem('conan_bgm_muted', isMuted ? 'true' : 'false');
    } catch {
      // Ignore storage errors
    }
  }, [volume, isMuted]);

  // Safe play helper handling browser autoplay restrictions
  const safePlay = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio) return;

    try {
      audio.volume = isMuted ? 0 : volume;
      await audio.play();
      setAutoplayBlocked(false);
      if (!isControlled) {
        setInternalPlaying(true);
      }
      onToggle?.(true);
    } catch (err: unknown) {
      // Browser prevented autoplay before user interaction
      setAutoplayBlocked(true);
      // Suppress unhandled rejection noise
      if (err instanceof Error && err.name === 'NotAllowedError') {
        // Autoplay policy waiting for user gesture
      }
    }
  }, [isControlled, isMuted, onToggle, volume]);

  // Safe pause helper
  const safePause = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.pause();
    if (!isControlled) {
      setInternalPlaying(false);
    }
    onToggle?.(false);
  }, [isControlled, onToggle]);

  // Handle play/pause changes driven by props or state
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      safePlay();
    } else {
      audio.pause();
    }
  }, [isPlaying, safePlay]);

  // Browser Autoplay: Listen for first user gesture if blocked or enabled
  useEffect(() => {
    if (!autoPlayOnFirstInteraction) return;

    const handleFirstUserGesture = () => {
      setHasInteracted(true);
      // If audio is meant to be playing or was blocked by autoplay policy
      if (audioRef.current && (isPlaying || autoplayBlocked)) {
        safePlay();
      }
      removeListeners();
    };

    const events = ['click', 'touchstart', 'keydown', 'pointerdown'];
    events.forEach((ev) => window.addEventListener(ev, handleFirstUserGesture, { once: true }));

    const removeListeners = () => {
      events.forEach((ev) => window.removeEventListener(ev, handleFirstUserGesture));
    };

    return () => {
      removeListeners();
    };
  }, [autoPlayOnFirstInteraction, isPlaying, autoplayBlocked, safePlay]);

  // Listen for custom global events ('conan-play-audio', 'conan-pause-audio', 'conan-toggle-audio')
  useEffect(() => {
    const handleGlobalPlay = () => {
      if (!isControlled) {
        setInternalPlaying(true);
      }
      onToggle?.(true);
      safePlay();
    };

    const handleGlobalPause = () => {
      if (!isControlled) {
        setInternalPlaying(false);
      }
      onToggle?.(false);
      safePause();
    };

    const handleGlobalToggle = () => {
      if (isPlaying) {
        handleGlobalPause();
      } else {
        handleGlobalPlay();
      }
    };

    window.addEventListener('conan-play-audio', handleGlobalPlay);
    window.addEventListener('conan-pause-audio', handleGlobalPause);
    window.addEventListener('conan-toggle-audio', handleGlobalToggle);

    return () => {
      window.removeEventListener('conan-play-audio', handleGlobalPlay);
      window.removeEventListener('conan-pause-audio', handleGlobalPause);
      window.removeEventListener('conan-toggle-audio', handleGlobalToggle);
    };
  }, [isControlled, isPlaying, onToggle, safePause, safePlay]);

  // Toggle button handler
  const handleTogglePlay = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (isPlaying) {
      safePause();
    } else {
      safePlay();
    }
  };

  // Quick replay / restart
  const handleRestart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      safePlay();
    }
  };

  // Toggle mute
  const handleToggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMuted((prev) => !prev);
  };

  // Change volume
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVol = parseFloat(e.target.value);
    setVolume(newVol);
    if (isMuted && newVol > 0) {
      setIsMuted(false);
    }
  };

  return (
    <aside
      aria-label="Detective Conan BGM Player"
      className={`fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40 transition-all duration-300 ${className}`}
    >
      {/* Hidden HTML5 Audio Element */}
      <audio
        ref={audioRef}
        src={src}
        loop
        preload="auto"
        onPlay={() => {
          if (!isControlled) setInternalPlaying(true);
        }}
        onPause={() => {
          if (!isControlled) setInternalPlaying(false);
        }}
        onError={(e) => {
          // Graceful fallback without unhandled crashing
          console.warn('Conan BGM audio notice: Cannot load audio resource', e);
        }}
      />

      {/* COMPACT MODE / MINIMIZED FLOATING BADGE */}
      {!isExpanded ? (
        <div
          onClick={() => setIsExpanded(true)}
          className="group relative flex items-center space-x-2.5 px-3.5 py-2.5 rounded-full glass-panel border border-conan-gold/40 glow-gold shadow-xl cursor-pointer hover:border-conan-gold hover:scale-105 active:scale-95 transition-all duration-200"
          title="Nhạc Nền Thám Tử Conan (Bấm để mở trình phát)"
        >
          {/* Animated red bowtie icon */}
          <ConanBowtieIcon className="w-5 h-5 text-conan-red flex-shrink-0" isAnimated={isPlaying} />

          {/* Equalizer sound bars */}
          <div className="flex items-end space-x-0.5 h-4 px-0.5">
            <span
              className={`w-0.5 rounded-full bg-conan-gold ${
                isPlaying ? 'animate-equalizer-1' : 'h-1 opacity-40'
              }`}
            />
            <span
              className={`w-0.5 rounded-full bg-conan-red ${
                isPlaying ? 'animate-equalizer-2' : 'h-1 opacity-40'
              }`}
            />
            <span
              className={`w-0.5 rounded-full bg-conan-gold ${
                isPlaying ? 'animate-equalizer-3' : 'h-1 opacity-40'
              }`}
            />
            <span
              className={`w-0.5 rounded-full bg-conan-red ${
                isPlaying ? 'animate-equalizer-4' : 'h-1 opacity-40'
              }`}
            />
          </div>

          {/* Quick Play/Pause Mini Button */}
          <button
            type="button"
            onClick={handleTogglePlay}
            aria-label={isPlaying ? 'Tạm dừng nhạc nền' : 'Phát nhạc nền'}
            className="w-7 h-7 rounded-full bg-conan-red/90 hover:bg-conan-red flex items-center justify-center text-white shadow-md transition-transform active:scale-90"
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 ml-0.5" />}
          </button>

          {/* Expand Chevron */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(true);
            }}
            aria-label="Mở rộng trình phát"
            className="text-slate-400 hover:text-conan-gold p-0.5 transition-colors"
          >
            <ChevronUp className="w-4 h-4" />
          </button>

          {/* Subtle pulse badge when autoplay is awaiting interaction */}
          {autoplayBlocked && !hasInteracted && (
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-conan-gold opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-conan-gold" />
            </span>
          )}
        </div>
      ) : (
        /* EXPANDED DETECTIVE THEMED GLASS PANEL */
        <div className="glass-card w-[310px] sm:w-[340px] rounded-2xl border border-conan-gold/30 glow-gold shadow-2xl p-4 relative backdrop-blur-xl animate-in fade-in zoom-in-95 duration-200">
          {/* Top Header Row */}
          <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-white/10">
            <div className="flex items-center space-x-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-conan-red/20 border border-conan-red/40 flex items-center justify-center flex-shrink-0 glow-red">
                <ConanBowtieIcon className="w-5 h-5 text-conan-red" isAnimated={isPlaying} />
              </div>
              <div className="truncate">
                <div className="flex items-center space-x-1.5">
                  <span className="text-[10px] font-bold tracking-wider uppercase text-conan-gold flex items-center gap-1">
                    <Radio className="w-3 h-3 text-conan-gold animate-pulse" />
                    Mouri OST
                  </span>
                  <span className="text-[9px] px-1.5 py-0.2 bg-conan-blue/80 text-conan-gold-light border border-conan-gold/30 rounded font-mono">
                    #1412
                  </span>
                </div>
                <h2 className="text-xs font-semibold text-white truncate" title="Detective Conan Theme (Nhạc Nền Thám Tử)">
                  Detective Conan Theme
                </h2>
              </div>
            </div>

            {/* Minimize button */}
            <button
              type="button"
              onClick={() => setIsExpanded(false)}
              aria-label="Thu nhỏ trình phát nhạc"
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors"
              title="Thu nhỏ"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>

          {/* Equalizer Visualizer & Track Status */}
          <div className="bg-conan-navy-dark/70 rounded-xl p-2.5 mb-3 border border-conan-blue/40 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-5 h-5 rounded-full bg-conan-gold/15 flex items-center justify-center text-conan-gold">
                <Music className="w-3 h-3" />
              </div>
              <div className="text-[11px]">
                <p className="text-slate-200 font-medium leading-none">
                  {isPlaying ? 'Nhạc Nền Thám Tử' : 'Đang tạm dừng'}
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  {isPlaying ? 'Đang phát không khí phá án...' : 'Bấm phát để tạo cảm hứng'}
                </p>
              </div>
            </div>

            {/* 5-Bar Dynamic Equalizer */}
            <div className="flex items-end space-x-1 h-5 px-1 bg-conan-navy-deep/60 py-0.5 rounded border border-white/5">
              <span
                className={`w-1 rounded-full bg-conan-gold transition-all duration-200 ${
                  isPlaying ? 'animate-equalizer-1' : 'h-1.5 opacity-30'
                }`}
              />
              <span
                className={`w-1 rounded-full bg-conan-red transition-all duration-200 ${
                  isPlaying ? 'animate-equalizer-2' : 'h-1 opacity-30'
                }`}
              />
              <span
                className={`w-1 rounded-full bg-conan-gold transition-all duration-200 ${
                  isPlaying ? 'animate-equalizer-3' : 'h-2 opacity-30'
                }`}
              />
              <span
                className={`w-1 rounded-full bg-conan-red transition-all duration-200 ${
                  isPlaying ? 'animate-equalizer-4' : 'h-1.5 opacity-30'
                }`}
              />
              <span
                className={`w-1 rounded-full bg-conan-gold transition-all duration-200 ${
                  isPlaying ? 'animate-equalizer-2' : 'h-1 opacity-30'
                }`}
              />
            </div>
          </div>

          {/* Autoplay blocked notification prompt */}
          {autoplayBlocked && !isPlaying && (
            <div className="mb-2.5 px-2.5 py-1.5 bg-conan-gold/10 border border-conan-gold/30 rounded-lg flex items-center justify-between text-[11px] text-conan-gold">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 flex-shrink-0 animate-spin" style={{ animationDuration: '3s' }} />
                <span>Nhấn nút để bật nhạc nền</span>
              </span>
              <button
                type="button"
                onClick={handleTogglePlay}
                className="underline font-semibold hover:text-white"
              >
                Phát ngay
              </button>
            </div>
          )}

          {/* Main Controls Row */}
          <div className="flex items-center justify-between gap-2">
            {/* Play/Pause & Restart Button Group */}
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={handleTogglePlay}
                aria-label={isPlaying ? 'Tạm dừng nhạc' : 'Phát nhạc Conan'}
                className="w-9 h-9 rounded-full bg-conan-red hover:bg-conan-red-hover flex items-center justify-center text-white shadow-lg shadow-conan-red/30 transition-all active:scale-95 glow-red"
                title={isPlaying ? 'Tạm dừng' : 'Phát'}
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
              </button>

              <button
                type="button"
                onClick={handleRestart}
                aria-label="Phát lại từ đầu"
                className="w-7 h-7 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-conan-gold flex items-center justify-center border border-white/10 transition-colors"
                title="Phát lại từ đầu"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Volume Control Group */}
            <div className="flex items-center space-x-1.5 flex-1 justify-end max-w-[170px]">
              <button
                type="button"
                onClick={handleToggleMute}
                aria-label={isMuted ? 'Bật âm thanh' : 'Tắt tiếng'}
                className="text-slate-300 hover:text-conan-gold p-1 rounded transition-colors"
                title={isMuted ? 'Bật tiếng' : 'Tắt tiếng'}
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-4 h-4 text-conan-red" />
                ) : volume < 0.5 ? (
                  <Volume1 className="w-4 h-4" />
                ) : (
                  <Volume2 className="w-4 h-4" />
                )}
              </button>

              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                aria-label="Điều chỉnh âm lượng"
                className="w-20 sm:w-24 h-1.5 bg-slate-700/80 rounded-lg appearance-none cursor-pointer accent-[#F59E0B] focus:outline-none"
                title={`Âm lượng: ${Math.round((isMuted ? 0 : volume) * 100)}%`}
              />

              <span className="text-[10px] font-mono text-slate-400 w-6 text-right select-none">
                {isMuted ? '0%' : `${Math.round(volume * 100)}%`}
              </span>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};

export default AudioPlayer;
