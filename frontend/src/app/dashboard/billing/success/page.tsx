'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import { getUser, setUser, isAuthenticated } from '@/lib/auth';

function BillingSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [status, setStatus] = useState<'verifying' | 'success' | 'timeout' | 'error'>('verifying');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace('/login');
      return;
    }

    const reference = searchParams.get('reference') || searchParams.get('trxref');
    const startBalance = getUser()?.tokenBalance ?? 0;

    async function verify() {
      // Try immediate verify + credit
      if (reference) {
        try {
          const result = await api.payments.verify(reference);
          const u = await api.auth.me();
          setUser(u);
          setStatus('success');
          setTimeout(() => router.replace('/dashboard'), 2500);
          return;
        } catch {
          // fall through to polling
        }
      }

      // Poll until balance increases — max 20 s (10 × 2 s)
      let attempts = 0;
      const poll = setInterval(async () => {
        attempts++;
        try {
          const u = await api.auth.me();
          setUser(u);
          if (u.tokenBalance > startBalance) {
            clearInterval(poll);
            setStatus('success');
            setTimeout(() => router.replace('/dashboard'), 2500);
          } else if (attempts >= 10) {
            clearInterval(poll);
            setStatus('timeout');
            setTimeout(() => router.replace('/dashboard'), 4000);
          }
        } catch {
          clearInterval(poll);
          setStatus('error');
          setErrorMsg('Could not reach the server. Check your connection.');
        }
      }, 2000);
    }

    verify();
  }, [router, searchParams]);

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: '#0d0d0d' }}
    >
      <div
        className="w-full max-w-md rounded-2xl p-8 text-center space-y-5"
        style={{ background: '#1a1a1a', border: '1px solid rgba(255,184,0,0.2)' }}
      >
        {status === 'verifying' && (
          <>
            <Loader2 className="mx-auto h-12 w-12 animate-spin" style={{ color: '#FFB800' }} />
            <h1 className="text-xl font-bold text-white">Confirming your payment&hellip;</h1>
            <p className="text-sm" style={{ color: '#888888' }}>
              This usually takes just a moment. Please don&rsquo;t close this tab.
            </p>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle2 className="mx-auto h-12 w-12" style={{ color: '#10b981' }} />
            <h1 className="text-xl font-bold text-white">Payment confirmed!</h1>
            <p className="text-sm" style={{ color: '#888888' }}>
              Your tokens have been added. Redirecting to your dashboard&hellip;
            </p>
          </>
        )}

        {status === 'timeout' && (
          <>
            <AlertTriangle className="mx-auto h-12 w-12" style={{ color: '#f59e0b' }} />
            <h1 className="text-xl font-bold text-white">Taking longer than expected</h1>
            <p className="text-sm" style={{ color: '#888888' }}>
              Your payment was received. Tokens will appear in your balance shortly &mdash; refresh
              your dashboard or contact support if they don&rsquo;t show up.
            </p>
            <p className="text-xs" style={{ color: '#555555' }}>
              Redirecting to dashboard&hellip;
            </p>
          </>
        )}

        {status === 'error' && (
          <>
            <AlertTriangle className="mx-auto h-12 w-12" style={{ color: '#ef4444' }} />
            <h1 className="text-xl font-bold text-white">Something went wrong</h1>
            <p className="text-sm" style={{ color: '#888888' }}>{errorMsg}</p>
            <button
              onClick={() => router.replace('/dashboard')}
              className="mt-2 px-6 py-2 rounded-lg font-bold text-sm transition-opacity hover:opacity-90"
              style={{ background: '#FFB800', color: '#0a0a0a' }}
            >
              Go to Dashboard
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default function BillingSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center" style={{ background: '#0d0d0d' }}>
          <Loader2 className="h-8 w-8 animate-spin" style={{ color: '#FFB800' }} />
        </div>
      }
    >
      <BillingSuccessContent />
    </Suspense>
  );
}
