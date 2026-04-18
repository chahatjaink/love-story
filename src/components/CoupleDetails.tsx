import { motion } from 'framer-motion';
import type { Partner } from '../types';

interface Props {
  partner1: Partner;
  partner2: Partner;
}

function PartnerCard({ partner, side }: { partner: Partner; side: 'left' | 'right' }) {
  return (
    <div className={`flex-1 text-center ${side === 'left' ? 'sm:text-right' : 'sm:text-left'}`}>
      <h3 className="text-xl sm:text-2xl font-serif text-white mb-1">
        {partner.name}
      </h3>
      <p className="text-rose-300/70 text-sm">{partner.occupation}</p>
      <div className="flex flex-wrap justify-center gap-1.5 mt-3">
        {partner.interests.map((tag) => (
          <span
            key={tag}
            className="rounded-full bg-white/10 px-3 py-1 text-xs text-rose-200 backdrop-blur-sm"
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function CoupleDetails({ partner1, partner2 }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.5 }}
      className="w-full rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-6 sm:p-8"
    >
      <div className="flex flex-col sm:flex-row items-center gap-6">
        <PartnerCard partner={partner1} side="left" />

        <div className="flex flex-col items-center gap-1 shrink-0">
          <span className="text-3xl text-rose-400 animate-pulse select-none">&#10084;</span>
        </div>

        <PartnerCard partner={partner2} side="right" />
      </div>
    </motion.div>
  );
}
