import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import LandingPage from './pages/LandingPage';
import DisplayPage from './pages/DisplayPage';
import { saveLoveStory, loadLoveStory } from './lib/storage';
import type { CoupleData, CoupleSubmission } from './types';

type View = 'landing' | 'saving' | 'loading' | 'display';

export default function App() {
  const [view, setView] = useState<View>('landing');
  const [data, setData] = useState<CoupleData | null>(null);
  const [shareId, setShareId] = useState<string | null>(null);
  const [isSharedView, setIsSharedView] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('s');
    if (!id) return;

    setIsSharedView(true);
    setView('loading');

    loadLoveStory(id)
      .then((result) => {
        if (result) {
          setData(result);
          setShareId(id);
          setView('display');
        } else {
          setError('This love story was not found.');
          setView('landing');
        }
      })
      .catch(() => {
        setError('Could not load the love story. Please try again.');
        setView('landing');
      });
  }, []);

  const handleStart = async (submission: CoupleSubmission) => {
    const coupleData: CoupleData = {
      partner1: submission.partner1,
      partner2: submission.partner2,
      startDate: submission.startDate,
      photos: submission.previews,
    };
    setData(coupleData);
    setView('saving');

    const timeout = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Upload timed out after 60 seconds')), 60000),
    );

    try {
      const id = await Promise.race([
        saveLoveStory(
          {
            partner1: submission.partner1,
            partner2: submission.partner2,
            startDate: submission.startDate,
          },
          submission.files,
        ),
        timeout,
      ]);
      setShareId(id);
      setView('display');
    } catch (err) {
      console.error('Failed to save story:', err);
      setError(
        err instanceof Error
          ? `Save failed: ${err.message}`
          : 'Failed to save. Check browser console for details.',
      );
      setView('display');
    }
  };

  const handleBack = () => {
    window.history.replaceState({}, '', window.location.pathname);
    setData(null);
    setShareId(null);
    setIsSharedView(false);
    setError(null);
    setView('landing');
  };

  return (
    <AnimatePresence mode="wait">
      {view !== 'display' ? (
        <motion.div
          key={view === 'loading' || view === 'saving' ? 'loader' : 'landing'}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="min-h-screen"
        >
          {view === 'loading' && (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-[#1a0a10] via-[#2d0a1e] to-[#1a0a10]">
              <div className="text-4xl animate-pulse mb-4">&#10084;</div>
              <p className="text-rose-300 text-sm">Loading your love story...</p>
            </div>
          )}
          {view === 'saving' && (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-[#1a0a10] via-[#2d0a1e] to-[#1a0a10]">
              <div className="text-4xl animate-pulse mb-4">&#10084;</div>
              <p className="text-rose-300 text-sm">Saving your love story...</p>
            </div>
          )}
          {view === 'landing' && (
            <>
              {error && (
                <div className="fixed top-4 inset-x-4 z-50 mx-auto max-w-md bg-rose-900/80 backdrop-blur-sm text-rose-100 text-sm text-center py-3 px-4 rounded-xl">
                  {error}
                </div>
              )}
              <LandingPage onStart={handleStart} />
            </>
          )}
        </motion.div>
      ) : (
        <motion.div
          key="display"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="min-h-screen"
        >
          {error && (
            <div className="fixed top-4 inset-x-4 z-50 mx-auto max-w-md bg-rose-900/80 backdrop-blur-sm text-rose-100 text-sm text-center py-3 px-4 rounded-xl">
              {error}
            </div>
          )}
          {data && (
            <DisplayPage
              data={data}
              shareId={shareId}
              isSharedView={isSharedView}
              onBack={handleBack}
            />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
