'use client';

import { useEffect } from 'react';
import Link from 'next/link';

interface ErrorPageProps {
  error: Error & { digest?: string };
  // Next.js 16 forwards `unstable_retry`; older minors forward `reset`.
  // Accept both so recovery works regardless of the exact runtime version.
  reset?: () => void;
  unstable_retry?: () => void;
}

export default function ErrorPage({ error, reset, unstable_retry }: ErrorPageProps) {
  useEffect(() => {
    // Surface the error for debugging / error-reporting hooks.
    console.error(error);
  }, [error]);

  function handleRetry() {
    const retry = reset ?? unstable_retry;
    if (retry) {
      retry();
    } else {
      // Fallback: full reload if no recovery function was provided.
      window.location.reload();
    }
  }

  return (
    <div
      className="relative flex flex-col items-center justify-center min-h-[80vh] overflow-hidden px-4 text-center"
      style={{ background: '#0d0d0d', color: '#ffffff' }}
    >
      {/* Background glow */}
      <div
        className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-[700px] h-80 opacity-10 blur-[100px] rounded-full"
        style={{ background: 'var(--brand-primary)' }}
      />
      {/* Dot-grid overlay */}
      <div className="pointer-events-none absolute inset-0 dot-grid-bg opacity-50" />

      <div className="relative animate-fade-in flex flex-col items-center">
        <div
          className="flex h-16 w-16 items-center justify-center rounded-2xl mb-6"
          style={{
            background: 'color-mix(in srgb, var(--brand-primary) 12%, transparent)',
            border: '1px solid color-mix(in srgb, var(--brand-primary) 28%, transparent)',
          }}
        >
          <svg viewBox="0 0 24 24" fill="none" className="h-8 w-8" aria-hidden="true">
            <path
              d="M12 9v4m0 4h.01M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z"
              stroke="var(--brand-primary)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <h1 className="text-3xl sm:text-4xl font-black text-white">Something went wrong</h1>
        <p className="mt-4 max-w-md text-base leading-relaxed" style={{ color: '#888888' }}>
          We hit an unexpected error while loading this page. You can try again,
          and if the problem persists, please contact our support team.
        </p>
        {error.digest && (
          <p className="mt-3 text-xs font-mono" style={{ color: '#555555' }}>
            Reference: {error.digest}
          </p>
        )}

        <div className="mt-10 flex flex-col sm:flex-row items-center gap-4">
          <button
            type="button"
            onClick={handleRetry}
            className="btn-shimmer btn-primary-hover inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-black text-base border-0"
            style={{
              background: 'var(--brand-primary)',
              color: '#ffffff',
              boxShadow: '0 0 32px var(--brand-primary-glow)',
            }}
          >
            Try again
          </button>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-semibold text-base transition-colors hover:text-white"
            style={{ color: '#cccccc', border: '1px solid rgba(255,255,255,0.15)' }}
          >
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}
