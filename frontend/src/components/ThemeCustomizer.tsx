'use client';

import { useState, useEffect, useRef } from 'react';
import { Palette, Check, X } from 'lucide-react';
import { THEME_PRESETS, applyTheme } from './ThemeProvider';

const DEFAULT_PRIMARY = '#0D9488';

function readSavedTheme(): { primary: string } {
  if (typeof window === 'undefined') return { primary: DEFAULT_PRIMARY };
  try {
    const saved = JSON.parse(localStorage.getItem('themeConfig') || '{}');
    return { primary: typeof saved.primary === 'string' ? saved.primary : DEFAULT_PRIMARY };
  } catch {
    return { primary: DEFAULT_PRIMARY };
  }
}

export function ThemeCustomizer() {
  const [open, setOpen] = useState(false);
  const [primary, setPrimary] = useState(() => readSavedTheme().primary);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, [open]);

  function selectPreset(p: string) {
    setPrimary(p);
    applyTheme(p);
    localStorage.setItem('themeConfig', JSON.stringify({ primary: p }));
  }

  return (
    <div ref={panelRef} style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 50 }}>
      {open && (
        <div style={{
          position: 'absolute', bottom: '52px', right: 0,
          width: '220px', borderRadius: '16px',
          background: 'rgba(15,15,15,0.97)',
          border: '1px solid rgba(255,255,255,0.1)',
          boxShadow: '0 16px 48px rgba(0,0,0,0.5)',
          padding: '16px',
          backdropFilter: 'blur(16px)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Theme Color</span>
            <button onClick={() => setOpen(false)} style={{ color: '#666', background: 'none', border: 'none', cursor: 'pointer', padding: '2px' }}>
              <X size={14} />
            </button>
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {THEME_PRESETS.map(preset => (
              <button
                key={preset.name}
                onClick={() => selectPreset(preset.primary)}
                title={preset.name}
                style={{
                  width: '32px', height: '32px', borderRadius: '50%',
                  background: preset.primary, border: 'none', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  outline: primary === preset.primary ? `3px solid ${preset.primary}` : '3px solid transparent',
                  outlineOffset: '2px', transition: 'outline 0.15s',
                }}
              >
                {primary === preset.primary && <Check size={14} color="#fff" strokeWidth={3} />}
              </button>
            ))}
          </div>

          <div style={{ marginTop: '14px', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.06)', fontSize: '11px', color: '#444' }}>
            Saved to your browser
          </div>
        </div>
      )}

      <button
        onClick={() => setOpen(!open)}
        style={{
          width: '44px', height: '44px', borderRadius: '50%',
          background: open ? 'var(--brand-primary)' : 'rgba(20,20,20,0.95)',
          border: '1px solid rgba(255,255,255,0.12)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
          transition: 'all 0.2s',
          color: open ? '#fff' : 'var(--brand-primary)',
        }}
        title="Customize theme"
      >
        <Palette size={18} />
      </button>
    </div>
  );
}
