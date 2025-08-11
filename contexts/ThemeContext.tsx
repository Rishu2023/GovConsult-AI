
import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';

type Theme = 'dark' | 'light' | 'system';
type PrimaryColor = { h: number; s: string; l: string; };

interface ThemeProviderState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  primaryColor: PrimaryColor;
  setPrimaryColor: (color: PrimaryColor) => void;
}

const initialState: ThemeProviderState = {
  theme: 'system',
  setTheme: () => null,
  primaryColor: { h: 221, s: '83%', l: '53%' },
  setPrimaryColor: () => null,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem('app-theme') as Theme) || 'system'
  );

  const [primaryColor, setPrimaryColor] = useState<PrimaryColor>(
    () => JSON.parse(localStorage.getItem('app-primary-color') || JSON.stringify(initialState.primaryColor))
  );

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');

    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      root.classList.add(systemTheme);
    } else {
        root.classList.add(theme);
    }
    
    localStorage.setItem('app-theme', theme);
  }, [theme]);

  useEffect(() => {
      const root = window.document.documentElement;
      root.style.setProperty('--color-primary-hue', String(primaryColor.h));
      root.style.setProperty('--color-primary-saturation', primaryColor.s);
      root.style.setProperty('--color-primary-lightness', primaryColor.l);
      localStorage.setItem('app-primary-color', JSON.stringify(primaryColor));
  }, [primaryColor]);


  const value = useMemo(() => ({
    theme,
    setTheme,
    primaryColor,
    setPrimaryColor
  }), [theme, primaryColor]);

  return (
    <ThemeProviderContext.Provider value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};