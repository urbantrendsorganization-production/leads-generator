'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Gift className="h-5 w-5 text-accent" />
          Redeem Promo Code
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleRedeem} className="flex gap-2">
          <Input
            placeholder="Enter promo code"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            className="flex-1 uppercase"
          />
          <Button type="submit" disabled={loading || !code.trim()}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Redeem'}
          </Button>
        </form>
        {error && (
          <div className="mt-3 flex items-center gap-2 text-sm text-destructive">
            <XCircle className="h-4 w-4" />
            {error}
          </div>
        )}
        {success && (
          <div className="mt-3 flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
            <CheckCircle2 className="h-4 w-4" />
            {success}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
