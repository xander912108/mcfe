import { Link, Outlet } from 'react-router-dom';

export default function AuthLayout() {
  return <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background to-muted/20 p-4"><div className="w-full max-w-md"><div className="mb-8 text-center"><div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-accent"><span className="text-2xl font-bold text-accent-foreground">M</span></div><h1 className="text-2xl font-bold text-foreground">Mentori Club</h1><p className="mt-2 text-muted-foreground">Премиальная платформа для коммьюнити</p></div><div className="rounded-2xl border border-border bg-card p-8 shadow-lg"><Outlet /></div><p className="mt-6 text-center text-sm text-muted-foreground">Продолжая, вы соглашаетесь с <Link to="/terms" className="text-accent hover:underline">условиями использования</Link></p></div></div>;
}
