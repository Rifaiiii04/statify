import React, { createContext, useContext, useMemo } from 'react';
import { getColors, ThemeColors } from '@/constants/design';

interface ThemeContextValue {
  colors: ThemeColors;
}

const ThemeContext = createContext<ThemeContextValue>({
  colors: getColors(),
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const colors = useMemo(() => getColors(), []);
  const value = useMemo(() => ({ colors }), [colors]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useThemeContext() {
  return useContext(ThemeContext);
}
