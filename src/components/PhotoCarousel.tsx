import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  photos: string[];
}

const variants = {
  enter: (dir: number) => ({ x: dir > 0 ? '100%' : '-100%', opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? '-100%' : '100%', opacity: 0 }),
};

export default function PhotoCarousel({ photos }: Props) {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [dragStartX, setDragStartX] = useState(0);

  const paginate = useCallback(
    (dir: number) => {
      setDirection(dir);
      setIndex((prev) => (prev + dir + photos.length) % photos.length);
    },
    [photos.length],
  );

  useEffect(() => {
    if (photos.length <= 1) return;
    const id = setInterval(() => paginate(1), 4000);
    return () => clearInterval(id);
  }, [photos.length, paginate]);

  const handleTouchStart = (e: React.TouchEvent) => {
    setDragStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = dragStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      paginate(diff > 0 ? 1 : -1);
    }
  };

  if (photos.length === 0) return null;

  return (
    <div className="relative w-full aspect-[4/5] max-h-[60vh] rounded-2xl overflow-hidden shadow-2xl shadow-black/40">
      <AnimatePresence initial={false} custom={direction} mode="popLayout">
        <motion.img
          key={index}
          src={photos[index]}
          alt={`Memory ${index + 1}`}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.4, ease: 'easeInOut' }}
          className="absolute inset-0 w-full h-full object-cover"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          draggable={false}
        />
      </AnimatePresence>

      {/* Gradient overlay at bottom for dots */}
      <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />

      {/* Navigation dots */}
      {photos.length > 1 && (
        <div className="absolute bottom-4 inset-x-0 flex justify-center gap-2 z-10">
          {photos.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                setDirection(i > index ? 1 : -1);
                setIndex(i);
              }}
              className={`w-2.5 h-2.5 rounded-full transition-all duration-300 min-w-[10px] min-h-[10px] ${
                i === index
                  ? 'bg-white scale-110'
                  : 'bg-white/40 hover:bg-white/60'
              }`}
              aria-label={`Go to photo ${i + 1}`}
            />
          ))}
        </div>
      )}

      {/* Left / Right arrow buttons for desktop */}
      {photos.length > 1 && (
        <>
          <button
            onClick={() => paginate(-1)}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/30 backdrop-blur-sm text-white flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity hidden sm:flex"
            aria-label="Previous photo"
          >
            &#8249;
          </button>
          <button
            onClick={() => paginate(1)}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/30 backdrop-blur-sm text-white flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity hidden sm:flex"
            aria-label="Next photo"
          >
            &#8250;
          </button>
        </>
      )}
    </div>
  );
}
