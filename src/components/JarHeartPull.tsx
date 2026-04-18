import { motion } from 'framer-motion';

interface Props {
  /** 0 = first pull, 1 = second, 2 = third (pre-merge) */
  pullIndex: 0 | 1 | 2;
  /** Final merge animation */
  merging?: boolean;
  /** Pull rope (ignored when merging) */
  onPull?: () => void;
}

const liftPx: Record<0 | 1 | 2, number> = {
  0: 10,
  1: 34,
  2: 58,
};

function HalfHeartClip({ half }: { half: 'top' | 'bottom' }) {
  const clip =
    half === 'top'
      ? { clipPath: 'inset(0 0 52% 0)' as const }
      : { clipPath: 'inset(48% 0 0 0)' as const };

  return (
    <div
      className="relative flex h-[52px] w-[56px] items-center justify-center text-[52px] leading-none select-none"
      style={clip}
      aria-hidden
    >
      <span className="block translate-y-0.5 drop-shadow-[0_0_12px_rgba(251,113,133,0.6)]">&#10084;&#65039;</span>
    </div>
  );
}

export default function JarHeartPull({ pullIndex, merging = false, onPull }: Props) {
  const lift = liftPx[pullIndex];

  if (merging) {
    return (
      <div className="flex w-full max-w-[220px] flex-col items-center py-6">
        <motion.div
          initial={{ scale: 0.4, opacity: 0 }}
          animate={{ scale: [0.4, 1.15, 1], opacity: 1 }}
          transition={{ duration: 1.1, times: [0, 0.65, 1], ease: 'easeOut' }}
          className="text-[88px] leading-none drop-shadow-[0_0_40px_rgba(244,63,94,0.85)]"
          aria-hidden
        >
          &#10084;&#65039;
        </motion.div>
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="mt-4 text-center font-serif text-sm text-rose-100"
        >
          There it is — the whole heart.
        </motion.p>
      </div>
    );
  }

  return (
    <div className="flex w-full max-w-[260px] flex-col items-center gap-2">
      {/* Top anchor: other half */}
      <div className="relative z-20 flex flex-col items-center">
        <p className="mb-1 text-[10px] uppercase tracking-[0.2em] text-rose-300/70">Waiting up top</p>
        <HalfHeartClip half="top" />
      </div>

      {/* Rope */}
      <div className="relative flex h-[72px] w-2 flex-col items-center justify-end">
        <svg
          className="absolute bottom-0 left-1/2 h-full w-8 -translate-x-1/2 overflow-visible"
          viewBox="0 0 32 120"
          aria-hidden
        >
          <motion.path
            d="M16 0 Q 22 40 16 80 Q 10 100 16 118"
            fill="none"
            stroke="url(#ropeGrad)"
            strokeWidth="3"
            strokeLinecap="round"
            initial={false}
            animate={{ d: pullIndex === 0 ? 'M16 0 Q 22 40 16 80 Q 10 100 16 118' : pullIndex === 1 ? 'M16 0 Q 18 36 16 74 Q 12 96 16 114' : 'M16 0 Q 16 32 16 68 Q 16 92 16 108' }}
            transition={{ type: 'spring', stiffness: 120, damping: 14 }}
          />
          <defs>
            <linearGradient id="ropeGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#fda4af" />
              <stop offset="100%" stopColor="#9f1239" />
            </linearGradient>
          </defs>
        </svg>
        <motion.div
          className="relative z-10 h-3 w-3 rounded-full bg-amber-800/90 ring-2 ring-amber-600/50 shadow-md"
          animate={{ y: [0, -2, 0] }}
          transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
        />
      </div>

      {/* Glass jar */}
      <button
        type="button"
        onClick={() => onPull?.()}
        className="group relative w-full max-w-[220px] rounded-b-[44px] rounded-t-lg border-2 border-white/35 bg-gradient-to-b from-white/15 via-rose-500/10 to-rose-950/40 px-4 pb-6 pt-3 shadow-[inset_0_0_24px_rgba(255,255,255,0.12),0_12px_40px_rgba(0,0,0,0.35)] backdrop-blur-sm active:scale-[0.99] transition-transform outline-none focus-visible:ring-2 focus-visible:ring-rose-400"
        aria-label="Pull the rope to lift the heart"
      >
        <div className="pointer-events-none absolute inset-x-3 top-2 h-2 rounded-full bg-white/25 blur-[1px]" />
        <p className="mb-3 text-center text-[11px] text-rose-100/80">Glass jar (emotionally stable)</p>

        <div className="relative mx-auto flex h-[120px] w-full flex-col items-center justify-end overflow-hidden rounded-b-[32px]">
          <motion.div
            className="relative z-10 flex flex-col items-center"
            initial={false}
            animate={{ y: -lift }}
            transition={{ type: 'spring', stiffness: 100, damping: 16 }}
          >
            <p className="mb-1 text-[10px] uppercase tracking-[0.2em] text-rose-200/70">Rising half</p>
            <HalfHeartClip half="bottom" />
          </motion.div>
          <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-rose-950/60 to-transparent" />
        </div>

        <p className="mt-4 text-center text-xs font-medium text-rose-200 group-active:text-white">
          Pull the rope
        </p>
      </button>
    </div>
  );
}
