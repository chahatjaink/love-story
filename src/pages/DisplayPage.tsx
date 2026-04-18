import { useState } from 'react';
import { motion } from 'framer-motion';
import PhotoCarousel from '../components/PhotoCarousel';
import RelationshipTimer from '../components/RelationshipTimer';
import CoupleDetails from '../components/CoupleDetails';
import MusicPlayer from '../components/MusicPlayer';
import type { CoupleData } from '../types';

interface Props {
  data: CoupleData;
  shareId: string | null;
  isSharedView: boolean;
  onBack: () => void;
}

function ShareSection({ shareId }: { shareId: string }) {
  const [copied, setCopied] = useState(false);
  const link = `${window.location.origin}${window.location.pathname}?s=${shareId}`;

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const input = document.querySelector<HTMLInputElement>('#share-link-input');
      input?.select();
      document.execCommand('copy');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const nativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Our Love Story',
          text: 'Check out our love story!',
          url: link,
        });
      } catch {
        /* user cancelled */
      }
    } else {
      copyLink();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.7, duration: 0.5 }}
      className="w-full rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-5 sm:p-6 space-y-4"
    >
      <p className="text-center text-rose-200 font-serif text-sm">
        Share this with your partner &#10084;
      </p>

      <div className="flex gap-2">
        <input
          id="share-link-input"
          type="text"
          readOnly
          value={link}
          className="flex-1 min-w-0 rounded-lg bg-white/10 border border-white/10 px-3 py-2.5 text-xs text-white/70 outline-none truncate"
        />
        <button
          onClick={copyLink}
          className="shrink-0 rounded-lg bg-white/10 border border-white/10 px-4 py-2.5 text-xs text-white hover:bg-white/20 active:bg-white/20 transition min-h-[44px]"
        >
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>

      <button
        onClick={nativeShare}
        className="w-full rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 py-3 text-sm font-semibold text-white shadow-lg shadow-rose-500/30 active:scale-[0.98] transition min-h-[44px]"
      >
        Share &#10084;
      </button>
    </motion.div>
  );
}

export default function DisplayPage({ data, shareId, isSharedView, onBack }: Props) {
  return (
    <div className="relative min-h-full bg-gradient-to-b from-[#1a0a10] via-[#2d0a1e] to-[#1a0a10] overflow-x-hidden">
      {/* Ambient glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-rose-500/10 blur-[120px] pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center gap-8 px-4 pt-8 sm:pt-12 pb-32 max-w-lg mx-auto">
        {/* Back button (hidden for shared view) */}
        {!isSharedView && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            onClick={onBack}
            className="self-start text-white/40 hover:text-white active:text-white text-sm flex items-center gap-1 transition min-h-[44px]"
          >
            <span>&larr;</span> Start over
          </motion.button>
        )}

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-3xl sm:text-4xl font-serif text-white text-center"
        >
          {data.partner1.name} &amp; {data.partner2.name}
        </motion.h1>

        {/* Photo carousel */}
        <PhotoCarousel photos={data.photos} />

        {/* Relationship timer */}
        <RelationshipTimer startDate={data.startDate} />

        {/* Couple details */}
        <CoupleDetails partner1={data.partner1} partner2={data.partner2} />

        {/* Share section */}
        {shareId && !isSharedView && <ShareSection shareId={shareId} />}
      </div>

      {/* Music player */}
      <MusicPlayer />
    </div>
  );
}
