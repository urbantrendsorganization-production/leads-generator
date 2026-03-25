'use client';

import { Suspense, useEffect, useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SearchForm } from '@/components/SearchForm';
import { LeadCard } from '@/components/LeadCard';
import { TokenBadge } from '@/components/TokenBadge';
import { PromoModal } from '@/components/PromoModal';
import { PricingCard } from '@/components/PricingCard';
import { api, ApiError } from '@/lib/api';
import { isAuthenticated, getUser, setUser, getToken } from '@/lib/auth';
import {
  Loader2,
  History,
  ShoppingCart,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

interface Lead {
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  website: string;
  industry: string;
  location: string;
  companySize: string;
  title: string;
}

const PRICING = [
  { id: 'starter', name: 'Starter', price: 9.99, tokens: 10, description: 'Perfect for trying out the platform', popular: false },
  { id: 'growth', name: 'Growth', price: 24.99, tokens: 50, description: 'For growing businesses', popular: true },
  { id: 'pro', name: 'Pro', price: 49.99, tokens: 150, description: 'For power users and agencies', popular: false },
];

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [user, setUserState] = useState<any>(null);
  const [results, setResults] = useState<Lead[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [history, setHistory] = useState<any[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [showBuyTokens, setShowBuyTokens] = useState(false);
  const [purchaseLoading, setPurchaseLoading] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('');

  const refreshUser = useCallback(async () => {
    try {
      const u = await api.auth.me();
      setUserState(u);
      setUser(u);
    } catch {
      router.push('/login');
    }
  }, [router]);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }

    const localUser = getUser();
    if (localUser) setUserState(localUser);
    refreshUser();

    const payment = searchParams.get('payment');
    const reference = searchParams.get('reference') || searchParams.get('trxref');
    if (payment === 'success') {
      setPaymentStatus('success');
      const startBalance = getUser()?.tokenBalance ?? 0;

      const handlePaymentSuccess = async () => {
        // First: actively verify + credit in case webhook hasn't fired
        if (reference) {
          try {
            await api.payments.verify(reference);
            const u = await api.auth.me();
            setUserState(u);
            setUser(u);
            if (u.tokenBalance > startBalance) return;
          } catch {
            // fall through to polling
          }
        }

        // Fallback: poll until balance increases (webhook may still be in-flight)
        let attempts = 0;
        const poll = setInterval(async () => {
          attempts++;
          try {
            const u = await api.auth.me();
            setUserState(u);
            setUser(u);
            if (u.tokenBalance > startBalance || attempts >= 10) {
              clearInterval(poll);
            }
          } catch {
            clearInterval(poll);
          }
        }, 2000);
      };

      handlePaymentSuccess();
    } else if (payment === 'cancelled') {
      setPaymentStatus('cancelled');
    }
  }, [router, searchParams, refreshUser]);

  async function handleSearch(query: any) {
    setSearching(true);
    setSearchError('');
    setResults([]);

    try {
      const result = await api.leads.search(query);
      setResults(result.results);
      setUserState((prev: any) => prev ? { ...prev, tokenBalance: result.remainingTokens } : prev);
      setUser({ ...user, tokenBalance: result.remainingTokens });
    } catch (err: any) {
      if (err instanceof ApiError && err.status === 402) {
        setSearchError('You have no tokens left. Purchase more to continue searching.');
        setShowBuyTokens(true);
      } else {
        setSearchError(err.message || 'Search failed');
      }
    } finally {
      setSearching(false);
    }
  }

  async function handleLoadHistory() {
    if (showHistory) {
      setShowHistory(false);
      return;
    }
    setHistoryLoading(true);
    try {
      const h = await api.leads.history();
      setHistory(h);
      setShowHistory(true);
    } catch {
      // silently fail
    } finally {
      setHistoryLoading(false);
    }
  }

  async function handlePurchase(tierId: string) {
    setPurchaseLoading(tierId);
    try {
      const result = await api.payments.checkout(tierId);
      if (result.url) {
        window.location.href = result.url;
      }
    } catch (err: any) {
      setSearchError(err.message || 'Purchase failed. Make sure Paystack is configured.');
    } finally {
      setPurchaseLoading('');
    }
  }

  function handlePromoSuccess(_tokensAdded: number, newBalance: number) {
    setUserState((prev: any) => prev ? { ...prev, tokenBalance: newBalance } : prev);
    setUser({ ...user, tokenBalance: newBalance });
  }

  if (!user) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Payment status */}
      {paymentStatus === 'success' && (
        <div className="flex items-center gap-2 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-4 text-green-700 dark:text-green-300">
          <CheckCircle2 className="h-5 w-5" />
          Payment successful! Your tokens have been added.
        </div>
      )}
      {paymentStatus === 'cancelled' && (
        <div className="flex items-center gap-2 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 p-4 text-yellow-700 dark:text-yellow-300">
          <AlertTriangle className="h-5 w-5" />
          Payment was cancelled. No charges were made.
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back{user.name ? `, ${user.name}` : ''}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <TokenBadge balance={user.tokenBalance} />
          {user.tokenBalance < 3 && (
            <Button
              variant="accent"
              size="sm"
              onClick={() => setShowBuyTokens(!showBuyTokens)}
            >
              <ShoppingCart className="h-4 w-4 mr-1" />
              Buy Tokens
            </Button>
          )}
        </div>
      </div>

      {/* Buy Tokens Section */}
      {showBuyTokens && (
        <div className="animate-fade-in">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Purchase Search Tokens</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {PRICING.map((tier) => (
                  <PricingCard
                    key={tier.id}
                    {...tier}
                    buttonText={purchaseLoading === tier.id ? 'Redirecting...' : `Buy ${tier.tokens} Searches`}
                    onSelect={() => handlePurchase(tier.id)}
                    disabled={!!purchaseLoading}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Promo Code */}
      <PromoModal onSuccess={handlePromoSuccess} />

      {/* Search */}
      <SearchForm
        onSearch={handleSearch}
        loading={searching}
        disabled={user.tokenBalance <= 0}
      />

      {/* Search Error */}
      {searchError && (
        <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-4 text-sm text-destructive">
          {searchError}
        </div>
      )}

      {/* Results */}
      {results.length > 0 && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">
              Search Results ({results.length} leads found)
            </h2>
          </div>
          <div className="grid gap-3">
            {results.map((lead, i) => (
              <LeadCard key={i} lead={lead} />
            ))}
          </div>
        </div>
      )}

      {/* History */}
      <div>
        <Button variant="outline" onClick={handleLoadHistory} className="gap-2">
          {historyLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <History className="h-4 w-4" />
          )}
          Search History
          {showHistory ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>

        {showHistory && history.length > 0 && (
          <div className="mt-4 space-y-3 animate-fade-in">
            {history.map((search) => {
              const query = search.query as any;
              const resultCount = Array.isArray(search.results) ? search.results.length : 0;
              return (
                <Card key={search.id} className="p-4">
                  <div className="flex flex-wrap items-center gap-2 text-sm">
                    <span className="text-muted-foreground">
                      {new Date(search.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                    <span className="text-muted-foreground">&middot;</span>
                    <Badge variant="secondary">{resultCount} leads</Badge>
                    {query.industry && <Badge variant="outline">{query.industry}</Badge>}
                    {query.location && <Badge variant="outline">{query.location}</Badge>}
                    {query.companySize && <Badge variant="outline">{query.companySize}</Badge>}
                    {query.keywords && <Badge variant="outline">{query.keywords}</Badge>}
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {showHistory && history.length === 0 && (
          <p className="mt-4 text-sm text-muted-foreground">No search history yet.</p>
        )}
      </div>
    </div>
  );
}
