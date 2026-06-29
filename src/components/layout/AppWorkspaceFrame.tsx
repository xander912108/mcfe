import type { ReactNode } from 'react';

import { RouteErrorBoundary } from '@/components/errors/RouteErrorBoundary';

interface AppWorkspaceFrameProps {
  children: ReactNode;
  routeName: string;
}

export function AppWorkspaceFrame({ children, routeName }: AppWorkspaceFrameProps) {
  return (
    <RouteErrorBoundary routeName={routeName}>
      <div className="flex-1 min-w-0 flex flex-col lg:flex-row gap-4 md:gap-6">
        {children}
      </div>
    </RouteErrorBoundary>
  );
}
