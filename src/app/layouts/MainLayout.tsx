import { AnimatePresence, motion } from 'framer-motion';
import { Outlet, useLocation } from 'react-router-dom';
import { Header } from '@/app/layouts/components/Header';
import { NavigationProgress } from '@/app/layouts/components/NavigationProgress';
import { RouteErrorBoundary } from '@/app/layouts/components/RouteErrorBoundary';
import { Sidebar } from '@/app/layouts/components/Sidebar';

export default function MainLayout() {
  const location = useLocation();
  return (
    <div className="min-h-screen bg-background">
      <NavigationProgress />
      <Sidebar />
      <Header />
      <main className="pt-16 md:pl-64 transition-all duration-300">
        <div className="container mx-auto max-w-7xl px-4 py-6">
          <AnimatePresence mode="wait">
            <motion.div key={location.pathname} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2, ease: 'easeOut' }}>
              <RouteErrorBoundary routeName={location.pathname}><Outlet /></RouteErrorBoundary>
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
