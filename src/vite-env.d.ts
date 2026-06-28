/// <reference types="vite/client" />

declare module 'framer-motion' {
  import type { FC, JSX, ReactNode } from 'react';

  type MotionProps = Record<string, unknown> & { children?: ReactNode; className?: string };
  export const motion: Record<keyof JSX.IntrinsicElements, FC<MotionProps>>;
  export function AnimatePresence(props: { children: ReactNode; mode?: 'wait' | 'sync' | 'popLayout' }): JSX.Element;
}
