import { motion } from 'framer-motion';
import InputForm from '../components/InputForm';
import type { CoupleSubmission } from '../types';

interface Props {
  onStart: (data: CoupleSubmission) => void;
}

function FloatingHeart({ delay, left, size }: { delay: number; left: string; size: string }) {
  return (
    <motion.span
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: [0, 0.6, 0], y: -60 }}
      transition={{ duration: 6, delay, repeat: Infinity, ease: 'easeInOut' }}
      className="absolute text-rose-400/30 pointer-events-none select-none"
      style={{ left, fontSize: size, top: '50%' }}
    >
      &#10084;
    </motion.span>
  );
}

export default function LandingPage({ onStart }: Props) {
  return (
    <div className="relative min-h-full overflow-hidden bg-gradient-to-b from-[#1a0a10] via-[#2d0a1e] to-[#1a0a10]">
      {/* Floating hearts background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <FloatingHeart delay={0} left="10%" size="1.5rem" />
        <FloatingHeart delay={1.2} left="25%" size="1rem" />
        <FloatingHeart delay={2.5} left="50%" size="2rem" />
        <FloatingHeart delay={0.8} left="70%" size="1.2rem" />
        <FloatingHeart delay={3} left="85%" size="1.8rem" />
        <FloatingHeart delay={1.8} left="40%" size="0.8rem" />
      </div>

      <div className="relative z-10 flex flex-col items-center justify-start min-h-full px-4 py-12 sm:py-16">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-10"
        >
          <h1 className="text-4xl sm:text-5xl font-serif text-white mb-3 tracking-tight">
            Our Love Story
          </h1>
          <p className="text-rose-300/70 text-sm sm:text-base max-w-xs mx-auto">
            Tell us about your journey together, and we'll make it unforgettable.
          </p>
        </motion.div>

        <InputForm onSubmit={onStart} />

        <div className="h-8" />
      </div>
    </div>
  );
}
