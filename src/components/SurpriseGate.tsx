import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { surpriseQuotePairs } from '../config/quotes';

type Phase = 'clickHere' | 'waiting' | 'box1' | 'box2' | 'box3' | 'done';

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
    if (p === 'box3') {
      onRevealComplete();
      setPhase('done');
      return;
    }
    if (p === 'clickHere') setPhase('waiting');
    else if (p === 'waiting') setPhase('box1');
    else if (p === 'box1') setPhase('box2');
    else if (p === 'box2') setPhase('box3');
  }, [onRevealComplete]);

  const boxIndex =
    phase === 'box1' ? 0 : phase === 'box2' ? 1 : phase === 'box3' ? 2 : -1;
  const pair =
    boxIndex >= 0
      ? surpriseQuotePairs[boxIndex % surpriseQuotePairs.length]
      : null;

  const boxSizes =
    phase === 'box1'
      ? { outer: 'min-h-[280px] w-full max-w-sm', inner: 'min-h-[200px]' }
      : phase === 'box2'
        ? { outer: 'min-h-[220px] w-full max-w-xs', inner: 'min-h-[150px]' }
        : phase === 'box3'
          ? { outer: 'min-h-[170px] w-full max-w-[240px]', inner: 'min-h-[110px]' }
          : { outer: '', inner: '' };

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
              <p className="mt-6 text-rose-300 text-sm">Tap to open the first box</p>
            </button>
          </motion.div>
        )}

        {(phase === 'box1' || phase === 'box2' || phase === 'box3') && pair && (
          <motion.div
            key={phase}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="relative z-10 w-full max-w-md flex flex-col items-center gap-6"
          >
            <button
              type="button"
              onClick={advance}
              className={`relative w-full rounded-2xl border-2 border-rose-300/50 bg-gradient-to-br from-white/10 to-rose-900/20 p-6 shadow-xl active:scale-[0.99] transition-transform ${boxSizes.outer}`}
            >
              <div
                className={`mx-auto flex flex-col items-center justify-center rounded-xl border border-white/20 bg-black/30 ${boxSizes.inner}`}
              >
                <span className="text-rose-300 text-xs uppercase tracking-widest mb-2">
                  {phase === 'box1' ? 'First' : phase === 'box2' ? 'Second' : 'Final'} box
                </span>
                <p className="text-white/90 text-sm px-2 text-center">
                  {phase === 'box3' ? 'Last one — your heart earned this.' : 'Keep going…'}
                </p>
                <p className="text-rose-200 text-xs mt-3">Tap the box to continue</p>
              </div>
            </button>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full rounded-2xl border border-white/15 bg-white/5 backdrop-blur-md p-5 sm:p-6"
            >
              <p className="text-[10px] uppercase tracking-widest text-rose-400/80 mb-2">
                For you
              </p>
              <p className="text-white font-serif text-base sm:text-lg leading-relaxed">
                {pair.quote}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.15 }}
              className="w-full rounded-xl border border-amber-500/20 bg-amber-950/30 px-4 py-3 text-center"
            >
              <p className="text-amber-100/90 text-sm italic">{pair.funny}</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
