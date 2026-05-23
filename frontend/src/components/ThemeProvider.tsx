'use client';

import { useEffect } from 'react';

export const THEME_PRESETS = [
  { name: 'Teal',   primary: '#0D9488' },
  { name: 'Blue',   primary: '#2563EB' },
  { name: 'Indigo', primary: '#6366F1' },
  { name: 'Violet', primary: '#7C3AED' },
  { name: 'Rose',   primary: '#E11D48' },
];

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function applyTheme(primary: string) {
  const root = document.documentElement;
  root.style.setProperty('--brand-primary', primary);
  root.style.setProperty('--brand-accent', primary);
  root.style.setProperty('--brand-primary-glow', hexToRgba(primary, 0.35));
  root.style.setProperty('--brand-accent-glow', hexToRgba(primary, 0.35));
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('themeConfig') || '{}');
      const primary = saved.primary || '#0D9488';
      applyTheme(primary);
    } catch {
      // ignore
    }
  }, []);

  return <>{children}</>;
}
