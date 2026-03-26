'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { api } from '@/lib/api';
import { Gift, Loader2, CheckCircle2, XCircle } from 'lucide-react';

interface PromoModalProps {
  onSuccess: (tokensAdded: number, newBalance: number) => void;
}

export function PromoModal({ onSuccess }: PromoModalProps) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  async function handleRedeem(e: React.FormEvent) {
    e.preventDefault();
    if (!code.trim()) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const result = await api.promos.redeem(code.trim());
      setSuccess(`${result.tokensAdded} tokens added! New balance: ${result.newBalance}`);
      setCode('');
      onSuccess(result.tokensAdded, result.newBalance);
    } catch (err: any) {
      setError(err.message || 'Failed to redeem promo code');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="rounded-2xl p-5"
      style={{
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(6,182,212,0.18)',
      }}
    >
      <div className="flex items-center gap-2.5 mb-4">
        <div
          className="flex h-8 w-8 items-center justify-center rounded-lg shrink-0"
          style={{
            background: 'linear-gradient(135deg,rgba(6,182,212,0.2),rgba(124,58,237,0.2))',
            border: '1px solid rgba(6,182,212,0.3)',
          }}
        >
          <Gift className="h-4 w-4" style={{ color: '#22d3ee' }} />
        </div>
        <h3 className="text-sm font-semibold text-slate-300">Redeem Promo Code</h3>
      </div>

      <form onSubmit={handleRedeem} className="flex gap-2">
        <Input
          placeholder="Enter promo code"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          className="flex-1 uppercase tracking-widest"
          style={{
            background: 'rgba(255,255,255,0.05)',
            borderColor: 'rgba(6,182,212,0.3)',
          }}
        />
        <Button
          type="submit"
          disabled={loading || !code.trim()}
          className="gradient-bg text-white font-semibold border-0 hover:opacity-90 transition-opacity"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Redeem'}
        </Button>
      </form>

      {error && (
        <div className="mt-3 flex items-center gap-2 text-sm" style={{ color: '#f87171' }}>
          <XCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}
      {success && (
        <div className="mt-3 flex items-center gap-2 text-sm text-emerald-400">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          {success}
        </div>
      )}
    </div>
  );
}
