import { useRef, useEffect, useState, useId, useCallback } from 'react';
import { motion, useMotionValue, useTransform, animate, type MotionValue } from 'framer-motion';
import { playPulleyTick } from '../lib/pulleyTick';

interface Props {
  pullIndex: 0 | 1 | 2;
  merging?: boolean;
  onPull?: () => void;
}

/**
 * Curtain half-separation (px). Each pull starts where the last one left off;
 * only the final pull animates to 0 (halves meet).
 */
const CURTAIN_START_GAP: Record<0 | 1 | 2, number> = {
  0: 46,
  1: 24,
  2: 9,
};

const CURTAIN_CLOSE_TARGET: Record<0 | 1 | 2, number> = {
  0: 24,
  1: 9,
  2: 0,
};

/** Lever arm angle (deg): rest leans right like the reference; pull swings left. */
const LEVER_REST_DEG = 22;
const LEVER_PULL_DEG = -34;

function BrokenHeartPair({ gap }: { gap: number }) {
  const size = 'text-[4.5rem] leading-none sm:text-[5rem]';
  return (
    <div className="relative flex h-[5.25rem] w-[5.5rem] items-center justify-center" aria-hidden>
      <motion.span
        className={`absolute select-none ${size}`}
        animate={{ x: -gap / 2 }}
        transition={{ type: 'spring', stiffness: 280, damping: 26 }}
      >
        <span
          className="inline-block drop-shadow-[0_0_14px_rgba(251,113,133,0.55)]"
          style={{ clipPath: 'inset(0 50% 0 0)' }}
        >
          &#128148;
        </span>
      </motion.span>
      <motion.span
        className={`absolute select-none ${size}`}
        animate={{ x: gap / 2 }}
        transition={{ type: 'spring', stiffness: 280, damping: 26 }}
      >
        <span
          className="inline-block drop-shadow-[0_0_14px_rgba(251,113,133,0.55)]"
          style={{ clipPath: 'inset(0 0 0 50%)' }}
        >
          &#128148;
        </span>
      </motion.span>
    </div>
  );
}

/** Two curtain halves: same vertical band, slide horizontally toward center. */
function CurtainHeart({ gap }: { gap: MotionValue<number> }) {
  const size = 'text-[5.5rem] leading-none sm:text-[6.25rem] md:text-[6.75rem]';
  const leftX = useTransform(gap, (g) => -g / 2);
  const rightX = useTransform(gap, (g) => g / 2);
  return (
    <div
      className="relative flex h-[6.75rem] w-[11.5rem] items-center justify-center overflow-visible sm:h-[7.5rem] sm:w-[13rem] md:h-[8rem] md:w-[14.5rem]"
      aria-hidden
    >
      <div className="pointer-events-none absolute inset-x-3 top-1 h-1.5 rounded-full bg-gradient-to-r from-rose-900/80 via-rose-400/50 to-rose-900/80" />
      <motion.span className={`absolute select-none ${size}`} style={{ x: leftX }}>
        <span
          className="inline-block drop-shadow-[0_0_18px_rgba(251,113,133,0.55)]"
          style={{ clipPath: 'inset(0 50% 0 0)' }}
        >
          &#128148;
        </span>
      </motion.span>
      <motion.span className={`absolute select-none ${size}`} style={{ x: rightX }}>
        <span
          className="inline-block drop-shadow-[0_0_18px_rgba(251,113,133,0.55)]"
          style={{ clipPath: 'inset(0 0 0 50%)' }}
        >
          &#128148;
        </span>
      </motion.span>
    </div>
  );
}

function LeverControl({
  uid,
  leverDeg,
  onCommit,
}: {
  uid: string;
  leverDeg: MotionValue<number>;
  onCommit: () => void;
}) {
  /** Pivot where the stem meets the housing (user space, matches translate below). */
  const px = 40;
  const py = 64;

  return (
    <button
      type="button"
      aria-label="Pull lever to close the curtain"
      onClick={() => void onCommit()}
      className="relative mt-1 flex touch-manipulation flex-col items-center border-0 bg-transparent p-2 outline-none focus-visible:ring-2 focus-visible:ring-rose-400/70"
    >
      <svg viewBox="0 0 80 96" className="h-[96px] w-[80px] overflow-visible" aria-hidden>
        <defs>
          <linearGradient id={`lev-base-${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#292524" />
            <stop offset="40%" stopColor="#57534e" />
            <stop offset="100%" stopColor="#1c1917" />
          </linearGradient>
          <linearGradient id={`lev-step-${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#881337" />
            <stop offset="100%" stopColor="#4c0519" />
          </linearGradient>
          <linearGradient id={`lev-dome-${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#44403c" />
            <stop offset="100%" stopColor="#0c0a09" />
          </linearGradient>
          <linearGradient id={`lev-stem-${uid}`} x1="0" y1="1" x2="1" y2="0">
            <stop offset="0%" stopColor="#fb7185" />
            <stop offset="100%" stopColor="#9f1239" />
          </linearGradient>
        </defs>

        {/* Static: base, step, semicircle housing, inner pivot ring — does not rotate */}
        <g>
          <rect x="4" y="80" width="72" height="14" rx="3" fill={`url(#lev-base-${uid})`} stroke="#a8a29e" strokeWidth="0.75" />
          <rect x="12" y="72" width="56" height="10" rx="2" fill={`url(#lev-step-${uid})`} stroke="#fda4af" strokeWidth="0.5" />
          <path
            d="M 18 72 A 22 22 0 0 1 62 72 Z"
            fill={`url(#lev-dome-${uid})`}
            stroke="#a8a29e"
            strokeWidth="1"
          />
          <path
            d="M 26 72 A 14 14 0 0 1 40 58 A 14 14 0 0 1 54 72"
            fill="none"
            stroke="#57534e"
            strokeWidth="1"
            opacity="0.9"
          />
          <circle cx={px} cy={py} r="5" fill="#1c1917" stroke="#78716c" strokeWidth="1" />
          <circle cx={px} cy={py} r="2" fill="#44403c" />
        </g>

        {/* Only arm + grip rotate around the pivot */}
        <g transform={`translate(${px} ${py})`}>
          <motion.g style={{ rotate: leverDeg, transformOrigin: '0px 0px' }}>
            <line
              x1="0"
              y1="0"
              x2="28"
              y2="-46"
              stroke={`url(#lev-stem-${uid})`}
              strokeWidth="7"
              strokeLinecap="round"
            />
            <ellipse
              cx="28"
              cy="-46"
              rx="11"
              ry="8"
              fill="#b45309"
              stroke="#fcd34d"
              strokeWidth="1.25"
              transform="rotate(32 28 -46)"
            />
          </motion.g>
        </g>
      </svg>
    </button>
  );
}

export default function JarHeartPull({ pullIndex, merging = false, onPull }: Props) {
  const uid = useId().replace(/:/g, '');
  const curtainGap = useMotionValue(CURTAIN_START_GAP[pullIndex]);
  const leverDeg = useMotionValue(LEVER_REST_DEG);
  const committed = useRef(false);
  const busy = useRef(false);

  const [mergeStep, setMergeStep] = useState<'split' | 'close' | 'whole'>('split');

  useEffect(() => {
    if (!merging) return;
    let cancelled = false;
    const run = async () => {
      setMergeStep('split');
      await new Promise((r) => setTimeout(r, 120));
      if (cancelled) return;
      setMergeStep('close');
      await new Promise((r) => setTimeout(r, 720));
      if (cancelled) return;
      setMergeStep('whole');
    };
    void run();
    return () => {
      cancelled = true;
    };
  }, [merging]);

  useEffect(() => {
    curtainGap.set(CURTAIN_START_GAP[pullIndex]);
    leverDeg.set(LEVER_REST_DEG);
    committed.current = false;
    busy.current = false;
  }, [pullIndex, curtainGap, leverDeg]);

  const runLeverPull = useCallback(async () => {
    if (committed.current || busy.current) return;
    busy.current = true;
    const target = CURTAIN_CLOSE_TARGET[pullIndex];
    try {
      await Promise.all([
        animate(leverDeg, LEVER_PULL_DEG, { duration: 0.24, ease: [0.22, 1, 0.36, 1] }),
        animate(curtainGap, target, { duration: 0.42, ease: [0.33, 1, 0.68, 1] }),
      ]);
      if (!committed.current) {
        committed.current = true;
        playPulleyTick();
        onPull?.();
      }
      await animate(leverDeg, LEVER_REST_DEG, { type: 'spring', stiffness: 400, damping: 22 });
    } finally {
      busy.current = false;
    }
  }, [curtainGap, leverDeg, onPull, pullIndex]);

  if (merging) {
    return (
      <div className="flex w-full max-w-[280px] flex-col items-center py-8">
        <div className="relative flex h-40 w-full items-center justify-center">
          {mergeStep === 'split' && <BrokenHeartPair gap={16} />}
          {mergeStep === 'close' && <BrokenHeartPair gap={-2} />}
          {mergeStep === 'whole' && (
            <motion.div
              initial={{ scale: 0.22, opacity: 0, filter: 'blur(14px)' }}
              animate={{
                scale: [0.22, 1.15, 1],
                opacity: 1,
                filter: ['blur(14px)', 'blur(0px)', 'blur(0px)'],
              }}
              transition={{ duration: 1.05, times: [0, 0.52, 1], ease: [0.19, 1, 0.22, 1] }}
              className="text-[5.75rem] leading-none drop-shadow-[0_0_48px_rgba(244,63,94,0.92)]"
            >
              &#10084;&#65039;
            </motion.div>
          )}
        </div>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="mt-3 text-center font-serif text-sm text-rose-100"
        >
          There it is — the whole heart.
        </motion.p>
      </div>
    );
  }

  const leverHint =
    pullIndex === 2
      ? 'Tap the lever — the curtain closes all the way; the halves meet, then the lever returns.'
      : 'Tap the lever — the curtain draws tighter; the halves get closer, then the lever returns.';

  return (
    <div className="flex w-full max-w-[min(100%,380px)] flex-col items-center gap-5 px-1">
      <p className="mb-0.5 text-[10px] uppercase tracking-[0.2em] text-rose-300/70">Behind the curtain</p>

      <div className="relative flex w-full max-w-[360px] flex-col items-center">
        <div className="relative flex min-h-[220px] w-full flex-col items-center justify-center rounded-2xl border border-rose-950/50 bg-gradient-to-b from-stone-950/90 to-[#1a0a10] px-6 py-10 shadow-inner ring-1 ring-white/5 sm:min-h-[248px] sm:px-8 sm:py-12">
          <p className="mb-5 text-center text-[9px] uppercase tracking-[0.2em] text-rose-300/50">Draw closed</p>
          <CurtainHeart gap={curtainGap} />
          <div className="pointer-events-none mt-5 h-2.5 w-[88%] max-w-[280px] rounded-full bg-black/40 blur-sm" />
        </div>

        <p className="mx-auto mt-4 max-w-[17rem] text-center text-[10px] leading-snug text-rose-200/90">{leverHint}</p>
        <div className="mt-1 flex justify-center">
          <LeverControl uid={uid} leverDeg={leverDeg} onCommit={() => void runLeverPull()} />
        </div>
      </div>

      <p className="max-w-[18rem] text-center text-[11px] leading-snug text-rose-200/65">
        {pullIndex === 2
          ? 'Last beat: one tap brings the curtain home and saves the finale.'
          : 'Each tap saves this beat; the next curtain starts a little nearer — until the last one.'}
      </p>
    </div>
  );
}
