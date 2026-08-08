'use client';

import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { DEFAULT_LANDING_CONTENT, type LandingContent } from '../types/landing-content';

const LandingContentContext = createContext<LandingContent>(DEFAULT_LANDING_CONTENT);

export function LandingContentProvider({
  content,
  children,
}: {
  content: LandingContent;
  children: ReactNode;
}) {
  const value = useMemo(() => content ?? DEFAULT_LANDING_CONTENT, [content]);
  return <LandingContentContext.Provider value={value}>{children}</LandingContentContext.Provider>;
}

export function useLandingContent(): LandingContent {
  return useContext(LandingContentContext);
}
