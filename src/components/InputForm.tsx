import { useState, useRef, useCallback, type FormEvent, type ChangeEvent } from 'react';
import { motion } from 'framer-motion';
import type { CoupleSubmission } from '../types';
import { googlePickerConfigured } from '../lib/googleAccess';
import { pickImagesFromGoogleDrive } from '../lib/googleDrivePicker';
import { pickImagesFromGooglePhotos } from '../lib/googlePhotosPicker';

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
  const [googleBusy, setGoogleBusy] = useState<'drive' | 'photos' | null>(null);
  const [googleError, setGoogleError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const googleConfigured = googlePickerConfigured();

  const appendFiles = useCallback((files: File[]) => {
    if (files.length === 0) return;
    setPhotos((prev) => {
      const newEntries: PhotoEntry[] = files.map((f) => ({
        id: nextId++,
        file: f,
        preview: URL.createObjectURL(f),
      }));
      return [...prev, ...newEntries];
    });
  }, []);

  const onFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    appendFiles(Array.from(files));
    setInputKey((k) => k + 1);
  };

  const onGoogleDrive = async () => {
    setGoogleError(null);
    setGoogleBusy('drive');
    try {
      const files = await pickImagesFromGoogleDrive();
      appendFiles(files);
    } catch (err) {
      setGoogleError(err instanceof Error ? err.message : 'Google Drive import failed.');
    } finally {
      setGoogleBusy(null);
    }
  };

  const onGooglePhotosClick = () => {
    const popup = window.open('about:blank', '_blank');
    if (!popup) {
      setGoogleError(
        'Pop-up was blocked. Allow pop-ups for this site to pick from Google Photos (Safari: aA → Website Settings).',
      );
      return;
    }
    try {
      popup.document.open();
      popup.document.write(
        '<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Photos</title></head><body style="margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;font-family:system-ui;background:#1a0a10;color:#fecdd3;font-size:15px">Connecting to Google Photos…</body></html>',
      );
      popup.document.close();
    } catch {
      /* ignore if document is not writable */
    }

    setGoogleError(null);
    setGoogleBusy('photos');
    void (async () => {
      try {
        const files = await pickImagesFromGooglePhotos(popup);
        appendFiles(files);
      } catch (err) {
        setGoogleError(err instanceof Error ? err.message : 'Google Photos import failed.');
      } finally {
        setGoogleBusy(null);
      }
    })();
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
        <label className={labelClass}>Your memories together ({photos.length} photos)</label>

        {photos.length > 0 && (
          <div className="mb-3 grid max-h-64 grid-cols-3 gap-2 overflow-y-auto pr-1 sm:max-h-80">
            {photos.map((entry) => (
              <div key={entry.id} className="group relative aspect-square overflow-hidden rounded-xl">
                <img
                  src={entry.preview}
                  alt={`Photo ${entry.id}`}
                  className="h-full w-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => removePhoto(entry.id)}
                  className="absolute right-1 top-1 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-sm text-white opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100"
                >
                  &times;
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex flex-col gap-2">
          <label className="block min-h-[56px] w-full cursor-pointer rounded-xl border-2 border-dashed border-white/20 py-6 text-center text-sm text-white/50 transition hover:border-rose-400 hover:text-rose-300 active:border-rose-400 active:text-rose-300">
            {photos.length === 0 ? 'Tap to add photos from this device' : 'Tap to add more from this device'}
            <input
              key={inputKey}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={onFileChange}
            />
          </label>

          {googleConfigured && (
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <button
                type="button"
                disabled={googleBusy !== null}
                onClick={() => void onGoogleDrive()}
                className="min-h-[48px] rounded-xl border border-white/25 bg-white/5 px-3 py-2 text-sm text-rose-100 transition hover:border-rose-400/60 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {googleBusy === 'drive' ? 'Opening Drive…' : 'Add from Google Drive'}
              </button>
              <button
                type="button"
                disabled={googleBusy !== null}
                onClick={onGooglePhotosClick}
                className="min-h-[48px] rounded-xl border border-white/25 bg-white/5 px-3 py-2 text-sm text-rose-100 transition hover:border-rose-400/60 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {googleBusy === 'photos' ? 'Opening Photos…' : 'Add from Google Photos'}
              </button>
            </div>
          )}

          {googleError && (
            <p className="rounded-lg border border-amber-500/40 bg-amber-950/40 px-3 py-2 text-center text-xs text-amber-100">
              {googleError}
            </p>
          )}
        </div>
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
