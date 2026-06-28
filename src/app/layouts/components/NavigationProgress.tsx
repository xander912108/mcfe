import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';

export function NavigationProgress() {
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  useEffect(() => { queueMicrotask(() => { setIsLoading(true); setProgress(0); }); const interval = window.setInterval(() => setProgress((p) => Math.min(p + 18, 90)), 100); const timeout = window.setTimeout(() => { setProgress(100); window.setTimeout(() => setIsLoading(false), 300); }, 400); return () => { window.clearInterval(interval); window.clearTimeout(timeout); }; }, [location.pathname]);
  return <AnimatePresence>{isLoading && <motion.div initial={{ opacity: 0, scaleX: 0 }} animate={{ opacity: 1, scaleX: progress / 100 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="fixed left-0 right-0 top-0 z-[100] h-0.5 origin-left bg-gradient-to-r from-yellow-500 via-orange-500 to-emerald-500" />}</AnimatePresence>;
}
