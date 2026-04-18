import { useState, useRef, type FormEvent, type ChangeEvent } from 'react';
import { motion } from 'framer-motion';
import type { CoupleSubmission } from '../types';

interface PhotoEntry {
  id: number;
  file: File;
  preview: string;
}

interface Props {
  onSubmit: (data: CoupleSubmission) => void;
}

let nextId = 1;

export default function InputForm({ onSubmit }: Props) {
  const [name1, setName1] = useState('');
  const [occupation1, setOccupation1] = useState('');
  const [interests1, setInterests1] = useState('');
  const [name2, setName2] = useState('');
  const [occupation2, setOccupation2] = useState('');
  const [interests2, setInterests2] = useState('');
  const [startDate, setStartDate] = useState('');
  const [photos, setPhotos] = useState<PhotoEntry[]>([]);
  const [inputKey, setInputKey] = useState(0);
  const formRef = useRef<HTMLFormElement>(null);

  const onFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    console.log('[PhotoUpload] onChange fired, files selected:', files.length);

    setPhotos((prev) => {
      const remaining = 5 - prev.length;
      console.log('[PhotoUpload] current count:', prev.length, 'remaining slots:', remaining);
      if (remaining <= 0) return prev;

      const incoming = Array.from(files).slice(0, remaining);
      const newEntries: PhotoEntry[] = incoming.map((f) => ({
        id: nextId++,
        file: f,
        preview: URL.createObjectURL(f),
      }));

      const updated = [...prev, ...newEntries];
      console.log('[PhotoUpload] new count:', updated.length);
      return updated;
    });

    setInputKey((k) => k + 1);
  };

  const removePhoto = (id: number) => {
    setPhotos((prev) => {
      const entry = prev.find((p) => p.id === id);
      if (entry) URL.revokeObjectURL(entry.preview);
      return prev.filter((p) => p.id !== id);
    });
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (photos.length < 1) return;

    onSubmit({
      partner1: {
        name: name1.trim(),
        occupation: occupation1.trim(),
        interests: interests1.split(',').map((s) => s.trim()).filter(Boolean),
      },
      partner2: {
        name: name2.trim(),
        occupation: occupation2.trim(),
        interests: interests2.split(',').map((s) => s.trim()).filter(Boolean),
      },
      startDate,
      previews: photos.map((p) => p.preview),
      files: photos.map((p) => p.file),
    });
  };

  const inputClass =
    'w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-white placeholder-white/40 backdrop-blur-sm outline-none transition focus:border-rose-400 focus:ring-2 focus:ring-rose-400/30 text-base';

  const labelClass = 'block text-sm font-medium text-rose-200 mb-1.5';

  return (
    <motion.form
      ref={formRef}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      onSubmit={handleSubmit}
      className="w-full max-w-lg mx-auto space-y-8 px-4"
    >
      {/* Partner 1 */}
      <fieldset className="space-y-4">
        <legend className="text-lg font-serif text-rose-100 flex items-center gap-2">
          <span className="text-rose-400">&#9825;</span> Partner One
        </legend>
        <div>
          <label className={labelClass}>Name</label>
          <input
            type="text"
            required
            value={name1}
            onChange={(e) => setName1(e.target.value)}
            placeholder="Their name"
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Occupation</label>
          <input
            type="text"
            required
            value={occupation1}
            onChange={(e) => setOccupation1(e.target.value)}
            placeholder="What they do"
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Interests</label>
          <input
            type="text"
            required
            value={interests1}
            onChange={(e) => setInterests1(e.target.value)}
            placeholder="Travel, Music, Cooking..."
            className={inputClass}
          />
        </div>
      </fieldset>

      {/* Partner 2 */}
      <fieldset className="space-y-4">
        <legend className="text-lg font-serif text-rose-100 flex items-center gap-2">
          <span className="text-rose-400">&#9825;</span> Partner Two
        </legend>
        <div>
          <label className={labelClass}>Name</label>
          <input
            type="text"
            required
            value={name2}
            onChange={(e) => setName2(e.target.value)}
            placeholder="Their name"
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Occupation</label>
          <input
            type="text"
            required
            value={occupation2}
            onChange={(e) => setOccupation2(e.target.value)}
            placeholder="What they do"
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Interests</label>
          <input
            type="text"
            required
            value={interests2}
            onChange={(e) => setInterests2(e.target.value)}
            placeholder="Reading, Dancing, Art..."
            className={inputClass}
          />
        </div>
      </fieldset>

      {/* Date */}
      <div>
        <label className={labelClass}>When did your story begin?</label>
        <input
          type="date"
          required
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className={inputClass}
        />
      </div>

      {/* Photos */}
      <div>
        <label className={labelClass}>
          Your memories together ({photos.length}/5 photos)
        </label>

        {photos.length > 0 && (
          <div className="grid grid-cols-3 gap-2 mb-3">
            {photos.map((entry) => (
              <div key={entry.id} className="relative aspect-square rounded-xl overflow-hidden group">
                <img
                  src={entry.preview}
                  alt={`Photo ${entry.id}`}
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => removePhoto(entry.id)}
                  className="absolute top-1 right-1 w-7 h-7 rounded-full bg-black/60 text-white text-sm flex items-center justify-center opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition"
                >
                  &times;
                </button>
              </div>
            ))}
          </div>
        )}

        {photos.length < 5 && (
          <label className="block w-full rounded-xl border-2 border-dashed border-white/20 py-6 text-white/50 hover:border-rose-400 hover:text-rose-300 active:border-rose-400 active:text-rose-300 transition text-sm min-h-[56px] text-center cursor-pointer">
            {photos.length === 0
              ? 'Tap to add up to 5 photos'
              : `Tap to add more (${5 - photos.length} remaining)`}
            <input
              key={inputKey}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={onFileChange}
            />
          </label>
        )}
      </div>

      {/* Submit */}
      <motion.button
        type="submit"
        whileTap={{ scale: 0.97 }}
        className="w-full rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 py-4 text-lg font-semibold text-white shadow-lg shadow-rose-500/30 active:shadow-rose-500/50 transition min-h-[56px]"
      >
        Create Our Love Story &#10084;
      </motion.button>
    </motion.form>
  );
}
