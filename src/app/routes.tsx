import { lazy, Suspense, type ReactNode } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { ProtectedRoute } from '@/app/guards/ProtectedRoute';
import { RoleGuard } from '@/app/guards/RoleGuard';
import AuthLayout from '@/app/layouts/AuthLayout';
import LeaderConsoleLayout from '@/app/layouts/LeaderConsoleLayout';
import MainLayout from '@/app/layouts/MainLayout';
import PublicLayout from '@/app/layouts/PublicLayout';
import { navigationConfig } from '@/lib/navigation/config';

const AboutPage = lazy(() => import('@/pages/AboutPage'));
const LoginPage = lazy(() => import('@/pages/LoginPage'));
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'));
const RegisterPage = lazy(() => import('@/pages/RegisterPage'));

function SuspenseWrapper({ children }: { children: ReactNode }) {
  return <Suspense fallback={<div className="flex min-h-[400px] items-center justify-center"><div className="animate-pulse text-muted-foreground">Загрузка...</div></div>}>{children}</Suspense>;
}

export default function AppRoutes() {
  const leaderItem = navigationConfig.find((item) => item.id === 'leader-console');
  return <Routes><Route element={<PublicLayout />}><Route path="/about" element={<SuspenseWrapper><AboutPage /></SuspenseWrapper>} /></Route><Route element={<AuthLayout />}><Route path="/login" element={<SuspenseWrapper><LoginPage /></SuspenseWrapper>} /><Route path="/register" element={<SuspenseWrapper><RegisterPage /></SuspenseWrapper>} /></Route><Route element={<ProtectedRoute />}><Route element={<MainLayout />}><Route index element={<Navigate to="/my-path" replace />} />{navigationConfig.filter((item) => item.group !== 'leadership').map((item) => { const Page = item.component; return <Route key={item.id} path={item.path} element={<SuspenseWrapper><Page /></SuspenseWrapper>} />; })}</Route><Route element={<RoleGuard minRole="leader" />}><Route element={<LeaderConsoleLayout />}>{leaderItem && <Route path="/leader" element={<SuspenseWrapper><leaderItem.component /></SuspenseWrapper>} />}</Route></Route></Route><Route path="*" element={<SuspenseWrapper><NotFoundPage /></SuspenseWrapper>} /></Routes>;
}
