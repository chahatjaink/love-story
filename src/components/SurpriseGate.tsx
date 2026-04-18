import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { surprisePullQuotes } from '../config/quotes';
import { playMergeRustle } from '../lib/mergeRustle';
import JarHeartPull from './JarHeartPull';

type Phase = 'clickHere' | 'waiting' | 'jar1' | 'jar2' | 'jar3' | 'merge' | 'done';

const MERGE_MS = 2400;

interface Props {
  children: React.ReactNode;
  onRevealComplete: () => void;
}

export default function SurpriseGate({ children, onRevealComplete }: Props) {
  const [phase, setPhase] = useState<Phase>('clickHere');
  const phaseRef = useRef(phase);
  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  const advance = useCallback(() => {
    const p = phaseRef.current;
    if (p === 'clickHere') setPhase('waiting');
    else if (p === 'waiting') setPhase('jar1');
  }, []);

  const handlePull = useCallback(() => {
    const p = phaseRef.current;
    if (p === 'jar1') setPhase('jar2');
    else if (p === 'jar2') setPhase('jar3');
    else if (p === 'jar3') {
      playMergeRustle(MERGE_MS / 1000);
      onRevealComplete();
      setPhase('merge');
      window.setTimeout(() => setPhase('done'), MERGE_MS);
    }
  }, [onRevealComplete]);

  const jarIndex: 0 | 1 | 2 | null =
    phase === 'jar1' ? 0 : phase === 'jar2' ? 1 : phase === 'jar3' ? 2 : null;
  const pullQuote = jarIndex !== null ? surprisePullQuotes[jarIndex] : null;

  if (phase === 'done') {
    return <>{children}</>;
  }

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-gradient-to-b from-[#1a0a10] via-[#2d0a1e] to-[#1a0a10] px-4 overflow-y-auto overscroll-contain py-8">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-rose-500/15 blur-[100px] pointer-events-none" />

      <AnimatePresence mode="wait">
        {phase === 'clickHere' && (
          <motion.div
            key="clickHere"
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            className="relative z-10 flex flex-col items-center gap-8 text-center max-w-md"
          >
            <p className="text-rose-200/90 font-serif text-lg sm:text-xl">
              Someone who adores you left something here.
            </p>
            <motion.button
              type="button"
              whileTap={{ scale: 0.96 }}
              onClick={advance}
              className="rounded-2xl bg-gradient-to-r from-rose-500 to-pink-500 px-10 py-5 text-lg font-semibold text-white shadow-xl shadow-rose-500/40 min-h-[56px] min-w-[200px]"
            >
              Click here
            </motion.button>
            <p className="text-white/40 text-xs">Tap to begin — no peeking behind the curtain.</p>
          </motion.div>
        )}

        {phase === 'waiting' && (
          <motion.div
            key="waiting"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            className="relative z-10 w-full max-w-md"
          >
            <button
              type="button"
              onClick={advance}
              className="w-full rounded-2xl border-2 border-rose-400/40 bg-white/5 backdrop-blur-md p-10 sm:p-12 text-center shadow-2xl shadow-rose-900/30 active:scale-[0.99] transition-transform min-h-[200px]"
            >
              <p className="text-3xl mb-2" aria-hidden="true">
                &#10084;
              </p>
              <p className="text-xl sm:text-2xl font-serif text-white leading-snug">
                A surprise is waiting for you
              </p>
              <p className="mt-6 text-rose-300 text-sm">Tap when you are ready</p>
            </button>
          </motion.div>
        )}

        {(phase === 'jar1' || phase === 'jar2' || phase === 'jar3') && pullQuote && jarIndex !== null && (
          <motion.div
            key={phase}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="relative z-10 flex w-full max-w-md flex-col items-center gap-5"
          >
            <div className="w-full rounded-2xl border border-white/15 bg-white/5 p-5 sm:p-6 backdrop-blur-md">
              <p className="mb-2 text-[10px] uppercase tracking-widest text-rose-400/90">
                {pullQuote.vibeLabel}
              </p>
              <p className="font-serif text-base leading-relaxed text-white sm:text-lg">
                {pullQuote.quote}
              </p>
            </div>

            <div className="w-full rounded-xl border border-amber-500/25 bg-amber-950/35 px-4 py-3 text-center backdrop-blur-sm">
              <p className="text-sm italic text-amber-100/95">{pullQuote.funny}</p>
            </div>

            <JarHeartPull pullIndex={jarIndex} merging={false} onPull={handlePull} />
          </motion.div>
        )}
      </AnimatePresence>

      {phase === 'merge' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-[110] flex flex-col items-center justify-center bg-gradient-to-b from-[#0a0408]/95 via-[#2d0a1e]/95 to-[#0a0408]/95 px-6 backdrop-blur-md"
        >
          <JarHeartPull pullIndex={2} merging />
        </motion.div>
      )}
    </div>
  );
}
