import type { ReactNode } from 'react';

type PageFrameProps = {
  children: ReactNode;
  sidebar?: ReactNode;
  mainClassName?: string;
  sidebarClassName?: string;
};

export function PageFrame({ children, sidebar, mainClassName = '', sidebarClassName = '' }: PageFrameProps) {
  return (
    <div className="flex-1 min-w-0 flex flex-col lg:flex-row gap-4 md:gap-6">
      <main className={`flex-1 min-w-0 space-y-5 pb-8 ${mainClassName}`.trim()}>{children}</main>
      {sidebar && (
        <aside className={`w-full lg:w-[240px] shrink-0 space-y-4 lg:sticky lg:top-[88px] lg:h-[calc(100vh-104px)] lg:overflow-y-auto right-scrollbar ${sidebarClassName}`.trim()}>
          {sidebar}
        </aside>
      )}
    </div>
  );
}
