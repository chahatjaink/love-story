import { useState, useEffect, useRef, useCallback } from 'react';
import { Howl } from 'howler';
import { motion, AnimatePresence } from 'framer-motion';
import { playlist } from '../config/songs';

export default function MusicPlayer() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [showVolume, setShowVolume] = useState(false);
  const howlRef = useRef<Howl | null>(null);
  const rafRef = useRef<number>(0);

  const stopCurrent = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    if (howlRef.current) {
      howlRef.current.unload();
      howlRef.current = null;
    }
  }, []);

  const loadAndPlay = useCallback(
    (index: number, autoplay: boolean) => {
      stopCurrent();
      const song = playlist[index];
      if (!song) return;

      const howl = new Howl({
        src: [song.src],
        html5: true,
        volume,
        onload: () => setDuration(howl.duration()),
        onplay: () => {
          setPlaying(true);
          const tick = () => {
            setProgress(howl.seek() as number);
            rafRef.current = requestAnimationFrame(tick);
          };
          rafRef.current = requestAnimationFrame(tick);
        },
        onpause: () => setPlaying(false),
        onend: () => {
          const next = (index + 1) % playlist.length;
          setCurrentIndex(next);
          loadAndPlay(next, true);
        },
      });

      howlRef.current = howl;
      if (autoplay) howl.play();
    },
    [stopCurrent, volume],
  );

  useEffect(() => {
    loadAndPlay(currentIndex, false);
    return stopCurrent;
    // Only on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (howlRef.current) howlRef.current.volume(volume);
  }, [volume]);

  const togglePlay = () => {
    if (!howlRef.current) return;
    if (playing) {
      howlRef.current.pause();
    } else {
      howlRef.current.play();
    }
  };

  const next = () => {
    const idx = (currentIndex + 1) % playlist.length;
    setCurrentIndex(idx);
    loadAndPlay(idx, true);
  };

  const prev = () => {
    const idx = (currentIndex - 1 + playlist.length) % playlist.length;
    setCurrentIndex(idx);
    loadAndPlay(idx, true);
  };

  const seek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setProgress(val);
    howlRef.current?.seek(val);
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${String(sec).padStart(2, '0')}`;
  };

  const song = playlist[currentIndex];

  return (
    <motion.div
      initial={{ y: 80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.8, duration: 0.5 }}
      className="fixed bottom-0 inset-x-0 z-50"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="mx-auto max-w-lg bg-black/70 backdrop-blur-xl border-t border-white/10 rounded-t-2xl px-4 py-3 space-y-2">
        {/* Song title */}
        <p className="text-center text-xs text-rose-300 truncate">
          {song?.title ?? 'No songs'}
        </p>

        {/* Progress bar */}
        <div className="flex items-center gap-2 text-[10px] text-white/50">
          <span className="w-8 text-right tabular-nums">{formatTime(progress)}</span>
          <input
            type="range"
            min={0}
            max={duration || 1}
            step={0.1}
            value={progress}
            onChange={seek}
            className="flex-1 h-1 accent-rose-500 cursor-pointer"
          />
          <span className="w-8 tabular-nums">{formatTime(duration)}</span>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-6 relative">
          {/* Volume toggle */}
          <button
            onClick={() => setShowVolume((v) => !v)}
            className="w-11 h-11 flex items-center justify-center text-white/60 hover:text-white active:text-white transition"
            aria-label="Volume"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
              <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 001.5 12c0 .898.121 1.768.35 2.595.341 1.24 1.518 1.905 2.659 1.905h1.93l4.5 4.5c.945.945 2.561.276 2.561-1.06V4.06zM18.584 5.106a.75.75 0 011.06 0c3.808 3.807 3.808 9.98 0 13.788a.75.75 0 11-1.06-1.06 8.25 8.25 0 000-11.668.75.75 0 010-1.06z" />
              <path d="M15.932 7.757a.75.75 0 011.061 0 6 6 0 010 8.486.75.75 0 01-1.06-1.061 4.5 4.5 0 000-6.364.75.75 0 010-1.06z" />
            </svg>
          </button>

          <button
            onClick={prev}
            className="w-11 h-11 flex items-center justify-center text-white/80 hover:text-white active:text-white transition"
            aria-label="Previous song"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
              <path d="M9.195 18.44c1.25.714 2.805-.189 2.805-1.629v-2.34l6.945 3.968c1.25.715 2.805-.188 2.805-1.628V7.19c0-1.44-1.555-2.343-2.805-1.628L12 9.54v-2.34c0-1.44-1.555-2.343-2.805-1.628l-7.108 4.061c-1.26.72-1.26 2.536 0 3.256l7.108 4.061z" />
            </svg>
          </button>

          <button
            onClick={togglePlay}
            className="w-14 h-14 rounded-full bg-rose-500 flex items-center justify-center text-white shadow-lg shadow-rose-500/40 active:scale-95 transition-transform"
            aria-label={playing ? 'Pause' : 'Play'}
          >
            {playing ? (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7">
                <path fillRule="evenodd" d="M6.75 5.25a.75.75 0 01.75-.75H9a.75.75 0 01.75.75v13.5a.75.75 0 01-.75.75H7.5a.75.75 0 01-.75-.75V5.25zm7.5 0A.75.75 0 0115 4.5h1.5a.75.75 0 01.75.75v13.5a.75.75 0 01-.75.75H15a.75.75 0 01-.75-.75V5.25z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7">
                <path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z" clipRule="evenodd" />
              </svg>
            )}
          </button>

          <button
            onClick={next}
            className="w-11 h-11 flex items-center justify-center text-white/80 hover:text-white active:text-white transition"
            aria-label="Next song"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
              <path d="M5.055 7.06C3.805 6.347 2.25 7.25 2.25 8.69v6.622c0 1.44 1.555 2.343 2.805 1.628L12 12.872v2.34c0 1.44 1.555 2.343 2.805 1.628l7.108-4.061c1.26-.72 1.26-2.536 0-3.256l-7.108-4.06C13.555 4.715 12 5.617 12 7.058v2.34L5.055 5.44z" />
            </svg>
          </button>

          {/* Spacer to balance volume button */}
          <div className="w-11 h-11" />

          {/* Volume slider dropdown */}
          <AnimatePresence>
            {showVolume && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute -top-14 left-4 bg-black/80 backdrop-blur-xl rounded-xl px-3 py-2 flex items-center gap-2"
              >
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  value={volume}
                  onChange={(e) => setVolume(parseFloat(e.target.value))}
                  className="w-24 h-1 accent-rose-500 cursor-pointer"
                />
                <span className="text-[10px] text-white/50 w-7 tabular-nums">
                  {Math.round(volume * 100)}
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
