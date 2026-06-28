/* eslint-disable react-refresh/only-export-components */
import React from 'react';

type MotionProps = Record<string, unknown> & { children?: React.ReactNode; className?: string };
const ignored = new Set(['initial', 'animate', 'exit', 'transition', 'layoutId', 'whileHover', 'whileTap']);

function cleanProps(props: MotionProps) {
  return Object.fromEntries(Object.entries(props).filter(([key]) => !ignored.has(key)));
}

function createMotionElement(tag: keyof React.JSX.IntrinsicElements) {
  return function MotionElement(props: MotionProps) {
    return React.createElement(tag, cleanProps(props));
  };
}

export const motion = new Proxy({}, {
  get: (_target, prop: string) => createMotionElement(prop as keyof React.JSX.IntrinsicElements),
}) as Record<keyof React.JSX.IntrinsicElements, React.FC<MotionProps>>;

export function AnimatePresence({ children }: { children: React.ReactNode; mode?: 'wait' | 'sync' | 'popLayout' }) {
  return <>{children}</>;
}
