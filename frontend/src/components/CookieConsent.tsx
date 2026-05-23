'use client';

import { useState, useEffect } from 'react';
import { Cookie, X } from 'lucide-react';

const STORAGE_KEY = 'cookie_consent';

export function CookieConsent() {
  // Always false on server; flip to true client-side after hydration if not yet answered.
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem(STORAGE_KEY)) setVisible(true);
  }, []);

  function accept() {
    localStorage.setItem(STORAGE_KEY, 'accepted');
    setVisible(false);
  }

  function decline() {
    localStorage.setItem(STORAGE_KEY, 'declined');
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        padding: '16px',
        background: 'rgba(10,10,10,0.97)',
        borderTop: '1px solid rgba(255,255,255,0.08)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
      }}
    >
      <div
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          flexWrap: 'wrap',
        }}
      >
        {/* Icon */}
        <div
          style={{
            flexShrink: 0,
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            background: 'color-mix(in srgb, var(--brand-primary) 14%, transparent)',
            border: '1px solid color-mix(in srgb, var(--brand-primary) 28%, transparent)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Cookie size={18} style={{ color: 'var(--brand-primary)' }} />
        </div>

        {/* Text */}
        <p style={{ flex: 1, minWidth: '220px', fontSize: '13px', color: '#aaa', lineHeight: 1.6, margin: 0 }}>
          We use cookies to keep you logged in and improve your experience.
          By continuing to use this site you agree to our{' '}
          <a href="/cookies" style={{ color: 'var(--brand-primary)', textDecoration: 'underline', textUnderlineOffset: '2px' }}>
            Privacy Policy
          </a>
          .
        </p>

        {/* Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
          <button
            onClick={decline}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              background: 'transparent',
              border: '1px solid rgba(255,255,255,0.12)',
              color: '#666',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'color 0.15s',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#fff'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#666'; }}
          >
            Decline
          </button>
          <button
            onClick={accept}
            style={{
              padding: '8px 20px',
              borderRadius: '8px',
              background: 'var(--brand-primary)',
              border: 'none',
              color: '#fff',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'filter 0.15s',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.filter = 'brightness(1.1)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.filter = 'none'; }}
          >
            Accept All
          </button>
          <button
            onClick={decline}
            aria-label="Dismiss"
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'rgba(255,255,255,0.05)',
              border: 'none',
              color: '#555',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'color 0.15s',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#fff'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#555'; }}
          >
            <X size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}
