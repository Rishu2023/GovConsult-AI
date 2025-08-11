
import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { Icons } from './icons/Icons';
import { Button } from './ui/Button';

const colorSwatches = [
  { name: 'Blue', h: 221, s: 83, l: 53 },
  { name: 'Rose', h: 346, s: 84, l: 60 },
  { name: 'Green', h: 142, s: 71, l: 45 },
  { name: 'Orange', h: 25, s: 95, l: 53 },
  { name: 'Violet', h: 262, s: 85, l: 60 },
];

export const ThemeSwitcher: React.FC = () => {
  const { theme, setTheme, setPrimaryColor } = useTheme();

  return (
    <div className="flex items-center gap-2 p-2 rounded-lg bg-card/80 border border-border/50 backdrop-blur-sm">
      <Button
        variant="outline"
        size="icon"
        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        title="Toggle Dark/Light Mode"
      >
        <Icons.sun className="h-5 w-5 scale-100 dark:scale-0 transition-transform" />
        <Icons.moon className="absolute h-5 w-5 scale-0 dark:scale-100 transition-transform" />
        <span className="sr-only">Toggle theme</span>
      </Button>
      <div className="flex items-center gap-1.5">
        {colorSwatches.map((color) => (
          <button
            key={color.name}
            title={color.name}
            className="h-5 w-5 rounded-full"
            style={{ backgroundColor: `hsl(${color.h}, ${color.s}%, ${color.l}%)` }}
            onClick={() => setPrimaryColor({ h: color.h, s: `${color.s}%`, l: `${color.l}%` })}
          />
        ))}
      </div>
    </div>
  );
};