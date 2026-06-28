import { AnimatePresence, motion } from 'framer-motion';
import { Outlet, useLocation } from 'react-router-dom';
import { Header } from '@/app/layouts/components/Header';
import { NavigationProgress } from '@/app/layouts/components/NavigationProgress';
import { RouteErrorBoundary } from '@/app/layouts/components/RouteErrorBoundary';
import { Sidebar } from '@/app/layouts/components/Sidebar';

export default function LeaderConsoleLayout() {
  const location = useLocation();
  return (
    <div className="min-h-screen bg-background">
      <NavigationProgress />
      <Sidebar variant="leader" />
      <Header />
      <main className="pt-16 md:pl-64 transition-all duration-300">
        <div className="container mx-auto max-w-7xl px-4 py-6">
          <AnimatePresence mode="wait">
            <motion.div key={location.pathname} initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} transition={{ duration: 0.25, ease: 'easeOut' }}>
              <RouteErrorBoundary routeName={location.pathname}><Outlet /></RouteErrorBoundary>
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
