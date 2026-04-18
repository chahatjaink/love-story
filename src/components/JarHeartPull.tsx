import { useRef, useEffect, useState, useId, useCallback, type PointerEvent as ReactPointerEvent } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { playPulleyTick } from '../lib/pulleyTick';

interface Props {
  pullIndex: 0 | 1 | 2;
  merging?: boolean;
  onPull?: () => void;
}

/** Total crank rotation (deg) for one full draw — drives pulley, rope, bucket. */
const MAX_CRANK_DEG = 280;
const THRESHOLD = MAX_CRANK_DEG * 0.52;
const NOTCH_STEP = MAX_CRANK_DEG / 8;

function unwrapAngleDelta(fromRad: number, toRad: number): number {
  let d = toRad - fromRad;
  while (d > Math.PI) d -= 2 * Math.PI;
  while (d < -Math.PI) d += 2 * Math.PI;
  return d;
}

const restLift: Record<0 | 1 | 2, number> = {
  0: 0,
  1: 22,
  2: 46,
};

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

export default function JarHeartPull({ pullIndex, merging = false, onPull }: Props) {
  const uid = useId().replace(/:/g, '');
  const crankDeg = useMotionValue(0);
  const committed = useRef(false);
  const crankRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{
    startRad: number;
    startCrank: number;
  } | null>(null);
  const lastNotchIndex = useRef(0);

  const pulleyRotate = useTransform(crankDeg, [0, MAX_CRANK_DEG], [0, -320]);
  const ropeSway = useTransform(crankDeg, [0, MAX_CRANK_DEG], [0, 3.5]);
  const bucketY = useTransform(crankDeg, (deg) => {
    const drag = (deg / MAX_CRANK_DEG) * 58;
    return -(restLift[pullIndex] + drag);
  });

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
    crankDeg.set(0);
    committed.current = false;
    lastNotchIndex.current = 0;
  }, [pullIndex, crankDeg]);

  const updateNotchTicks = useCallback((deg: number) => {
    const idx = Math.floor(deg / NOTCH_STEP);
    if (idx > lastNotchIndex.current) {
      const steps = idx - lastNotchIndex.current;
      for (let t = 0; t < steps; t++) playPulleyTick();
      lastNotchIndex.current = idx;
    } else if (idx < lastNotchIndex.current) {
      lastNotchIndex.current = idx;
    }
  }, []);

  const endCrankGesture = useCallback(() => {
    if (crankDeg.get() >= THRESHOLD && !committed.current) {
      committed.current = true;
      onPull?.();
    }
    void animate(crankDeg, 0, { type: 'spring', stiffness: 420, damping: 26 });
  }, [crankDeg, onPull]);

  const onCrankPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    const el = crankRef.current;
    if (!el) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    const r = el.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    const startRad = Math.atan2(e.clientY - cy, e.clientX - cx);
    dragRef.current = { startRad, startCrank: crankDeg.get() };
  };

  const onCrankPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragRef.current || !crankRef.current) return;
    const r = crankRef.current.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    const curRad = Math.atan2(e.clientY - cy, e.clientX - cx);
    const deltaRad = unwrapAngleDelta(dragRef.current.startRad, curRad);
    const deltaDeg = (deltaRad * 180) / Math.PI;
    const next = Math.min(MAX_CRANK_DEG, Math.max(0, dragRef.current.startCrank + deltaDeg));
    crankDeg.set(next);
    updateNotchTicks(next);
  };

  const onCrankPointerUp = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    dragRef.current = null;
    endCrankGesture();
  };

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

  const rad = (deg: number) => (deg * Math.PI) / 180;

  return (
    <div className="flex w-full max-w-[340px] flex-col items-center gap-4">
      <div className="relative z-20 flex flex-col items-center">
        <p className="mb-1 text-[10px] uppercase tracking-[0.2em] text-rose-300/70">Waiting at the rim</p>
        <BrokenHeartPair gap={6} />
      </div>

      <div className="relative flex w-full flex-row items-end justify-center gap-4 sm:gap-6">
        <div className="relative flex w-[230px] shrink-0 flex-col items-center sm:w-[248px]">
          <svg viewBox="0 0 220 210" className="h-[210px] w-full overflow-visible" aria-hidden>
            <defs>
              <linearGradient id={`wood-${uid}`} x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#3f1d10" />
                <stop offset="45%" stopColor="#7a4a32" />
                <stop offset="100%" stopColor="#3f1d10" />
              </linearGradient>
              <linearGradient id={`rope-${uid}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#fecdd3" />
                <stop offset="100%" stopColor="#881337" />
              </linearGradient>
            </defs>
            <rect x="28" y="44" width="14" height="166" rx="3" fill={`url(#wood-${uid})`} opacity="0.95" />
            <rect x="178" y="44" width="14" height="166" rx="3" fill={`url(#wood-${uid})`} opacity="0.95" />
            <rect x="24" y="40" width="172" height="12" rx="4" fill={`url(#wood-${uid})`} />
            <circle cx="110" cy="50" r="19" fill="#2a1810" stroke="#a67c52" strokeWidth="2" />
            <motion.g style={{ rotate: pulleyRotate, transformOrigin: '110px 50px' }}>
              {[0, 45, 90, 135].map((deg) => (
                <line
                  key={deg}
                  x1="110"
                  y1="50"
                  x2={110 + 17 * Math.cos(rad(deg))}
                  y2={50 + 17 * Math.sin(rad(deg))}
                  stroke="#d4b896"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              ))}
            </motion.g>
            <motion.line
              x1="110"
              y1="69"
              x2="110"
              y2="128"
              stroke={`url(#rope-${uid})`}
              strokeWidth="3.5"
              strokeLinecap="round"
              style={{ x: ropeSway }}
            />
          </svg>

          <motion.div
            className="absolute bottom-[12px] left-1/2 flex w-[128px] -translate-x-1/2 flex-col items-center"
            style={{ y: bucketY }}
          >
            <div className="rounded-b-2xl rounded-t-md border-2 border-amber-900/55 bg-gradient-to-b from-amber-950/85 to-stone-900/92 px-3 pb-2 pt-2 shadow-xl ring-1 ring-white/10">
              <p className="mb-1 text-center text-[9px] uppercase tracking-widest text-amber-200/75">
                Bucket
              </p>
              <BrokenHeartPair gap={10} />
            </div>
          </motion.div>

          <div className="pointer-events-none absolute bottom-0 left-1/2 h-6 w-[86%] -translate-x-1/2 rounded-full bg-stone-500/35 blur-[2px]" />
        </div>

        <div className="flex shrink-0 flex-col items-center pb-1">
          <p className="mb-2 max-w-[6.5rem] text-center text-[10px] leading-snug text-rose-200/90">
            Turn the crank — each notch clicks like the pulley
          </p>
          <div className="relative flex h-[172px] w-[5.25rem] flex-col items-center justify-end">
            <div className="absolute bottom-2 h-[7.5rem] w-[7.5rem] rounded-full border border-stone-600/40 bg-stone-900/25 shadow-inner" />
            <div
              ref={crankRef}
              className="relative z-10 flex h-[7.5rem] w-[7.5rem] cursor-grab touch-none items-center justify-center active:cursor-grabbing"
              aria-label="Well crank, turn to raise the bucket"
              onPointerDown={onCrankPointerDown}
              onPointerMove={onCrankPointerMove}
              onPointerUp={onCrankPointerUp}
              onPointerCancel={onCrankPointerUp}
            >
              <motion.div className="absolute inset-0" style={{ rotate: crankDeg }}>
                <svg viewBox="-48 -48 96 96" className="h-full w-full overflow-visible" aria-hidden>
                  <defs>
                    <linearGradient id={`crank-wood-${uid}`} x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#78350f" />
                      <stop offset="100%" stopColor="#451a03" />
                    </linearGradient>
                  </defs>
                  <line
                    x1="0"
                    y1="0"
                    x2="44"
                    y2="0"
                    stroke={`url(#crank-wood-${uid})`}
                    strokeWidth="7"
                    strokeLinecap="round"
                  />
                  <circle cx="44" cy="0" r="13" fill="#b45309" stroke="#fcd34d" strokeWidth="1.5" />
                  <circle cx="0" cy="0" r="20" fill="#57534e" stroke="#92400e" strokeWidth="2" />
                </svg>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      <p className="max-w-[17rem] text-center text-[11px] leading-snug text-rose-200/65">
        Crank smoothly; let go after you have gone most of the way — the pulley springs back and your draw is saved.
      </p>
    </div>
  );
}
