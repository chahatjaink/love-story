import { motion } from 'framer-motion';
import { useTimer } from '../hooks/useTimer';

interface Props {
  startDate: string;
}

function Segment({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <span className="text-2xl sm:text-4xl font-bold tabular-nums text-white">
        {String(value).padStart(2, '0')}
      </span>
      <span className="text-[10px] sm:text-xs text-rose-300/80 uppercase tracking-widest mt-1">
        {label}
      </span>
    </div>
  );
}

export default function RelationshipTimer({ startDate }: Props) {
  const timer = useTimer(startDate);

  const segments: { value: number; label: string }[] = [
    { value: timer.years, label: 'Years' },
    { value: timer.months, label: 'Months' },
    { value: timer.days, label: 'Days' },
    { value: timer.hours, label: 'Hours' },
    { value: timer.minutes, label: 'Min' },
    { value: timer.seconds, label: 'Sec' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.3, duration: 0.6 }}
      className="text-center space-y-4"
    >
      <p className="text-rose-300 font-serif text-sm sm:text-base tracking-wide">
        Together for
      </p>

      <div className="flex items-center justify-center gap-2 sm:gap-4 flex-wrap">
        {segments.map((seg, i) => (
          <div key={seg.label} className="flex items-center gap-2 sm:gap-4">
            <Segment value={seg.value} label={seg.label} />
            {i < segments.length - 1 && (
              <span className="text-rose-400/60 text-lg sm:text-2xl font-light select-none">
                :
              </span>
            )}
          </div>
        ))}
      </div>

      <p className="animate-pulse-glow text-rose-300 font-serif text-lg sm:text-2xl tracking-wide">
        &hellip; to &infin;
      </p>
    </motion.div>
  );
}
