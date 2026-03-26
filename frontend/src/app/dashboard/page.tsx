'use client';

import { Suspense, useEffect, useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SearchForm } from '@/components/SearchForm';
import { LeadCard } from '@/components/LeadCard';
import { TokenBadge } from '@/components/TokenBadge';
import { PromoModal } from '@/components/PromoModal';
import { PricingCard } from '@/components/PricingCard';
import { api, ApiError } from '@/lib/api';
import { isAuthenticated, getUser, setUser } from '@/lib/auth';
import { detectUserCurrency, formatLocalPrice, type CurrencyInfo } from '@/lib/currency';
import {
  Loader2,
  History,
  ShoppingCart,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  AlertTriangle,
  Download,
  Zap,
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
  linkedinUrl?: string;
  confidence?: 'high' | 'medium';
}

const BASE_PRICING = [
  { id: 'starter', name: 'Starter', price: 9.99, tokens: 10, description: 'Perfect for trying out the platform', popular: false },
  { id: 'growth', name: 'Growth', price: 24.99, tokens: 50, description: 'For growing businesses', popular: true },
  { id: 'pro', name: 'Pro', price: 49.99, tokens: 150, description: 'For power users and agencies', popular: false },
];

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-[60vh] items-center justify-center" style={{ background: '#0d0d0d' }}>
        <Loader2 className="h-8 w-8 animate-spin" style={{ color: '#FFB800' }} />
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
  const [verifying, setVerifying] = useState(false);
  const [verifyTimedOut, setVerifyTimedOut] = useState(false);
  const [currency, setCurrency] = useState<CurrencyInfo | null>(null);

  const refreshUser = useCallback(async () => {
    try {
      const u = await api.auth.me();
      setUserState(u);
      setUser(u);
    } catch {
      router.push('/login');
    }
  }, [router]);

  // Detect user's local currency for display
  useEffect(() => {
    detectUserCurrency().then(setCurrency).catch(() => {});
  }, []);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }

    const localUser = getUser();
    if (localUser) setUserState(localUser);

    const payment = searchParams.get('payment');
    const reference = searchParams.get('reference') || searchParams.get('trxref');

    if (payment === 'success') {
      setPaymentStatus('success');
      setVerifying(true);
      const startBalance = getUser()?.tokenBalance ?? 0;

      const handlePaymentSuccess = async () => {
        // Try to verify + credit immediately
        if (reference) {
          try {
            await api.payments.verify(reference);
            const u = await api.auth.me();
            setUserState(u);
            setUser(u);
            setVerifying(false);
            router.replace('/dashboard');
            return;
          } catch {
            // fall through to polling
          }
        }

        // Poll until balance increases — max 20s
        let attempts = 0;
        const poll = setInterval(async () => {
          attempts++;
          try {
            const u = await api.auth.me();
            setUserState(u);
            setUser(u);
            if (u.tokenBalance > startBalance) {
              clearInterval(poll);
              setVerifying(false);
              router.replace('/dashboard');
            } else if (attempts >= 10) {
              clearInterval(poll);
              setVerifying(false);
              setVerifyTimedOut(true);
            }
          } catch {
            clearInterval(poll);
            setVerifying(false);
          }
        }, 2000);
      };

      handlePaymentSuccess();
    } else if (payment === 'cancelled') {
      setPaymentStatus('cancelled');
      refreshUser();
    } else {
      refreshUser();
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
    setSearchError('');
    try {
      const result = await api.payments.checkout(tierId);
      if (result.url) {
        window.location.href = result.url;
        return; // navigation starts — don't clear loading
      }
    } catch (err: any) {
      setSearchError(err.message || 'Purchase failed. Make sure Paystack is configured.');
      setPurchaseLoading('');
    }
  }

  function handlePromoSuccess(_tokensAdded: number, newBalance: number) {
    setUserState((prev: any) => prev ? { ...prev, tokenBalance: newBalance } : prev);
    setUser({ ...user, tokenBalance: newBalance });
  }

  function downloadCSV() {
    if (results.length === 0) return;
    const headers = ['Company', 'Contact', 'Title', 'Email', 'Phone', 'Website', 'Industry', 'Location', 'Company Size', 'LinkedIn', 'Confidence'];
    const escape = (val: string) => {
      if (val.includes(',') || val.includes('"') || val.includes('\n')) {
        return `"${val.replace(/"/g, '""')}"`;
      }
      return val;
    };
    const rows = results.map((lead) => [
      lead.companyName,
      lead.contactName,
      lead.title,
      lead.email,
      lead.phone,
      lead.website,
      lead.industry,
      lead.location,
      lead.companySize,
      lead.linkedinUrl || '',
      lead.confidence || 'medium',
    ].map(escape).join(','));

    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    link.href = url;
    link.download = `trendyyleads-export-${timestamp}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  const pricing = BASE_PRICING.map(tier => ({
    ...tier,
    localEquiv: currency ? `≈ ${formatLocalPrice(tier.price, currency)}` : undefined,
  }));

  if (!user) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center" style={{ background: '#0d0d0d' }}>
        <Loader2 className="h-8 w-8 animate-spin" style={{ color: '#FFB800' }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: '#0d0d0d', color: '#ffffff' }}>

      {/* Dashboard header bar */}
      <div
        className="border-b"
        style={{
          borderColor: 'rgba(255,184,0,0.15)',
          background: 'linear-gradient(135deg, rgba(255,184,0,0.07) 0%, rgba(26,26,26,0.9) 100%)',
        }}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                {/* <div
                  className="flex h-7 w-7 items-center justify-center rounded-lg"
                  style={{ background: '#FFB800' }}
                >
                  <Zap className="h-3.5 w-3.5" style={{ color: '#0a0a0a' }} />
                </div> */}
                <span className="text-sm font-black uppercase tracking-widest" style={{ color: '#FFB800' }}>
                  TrendyyLeads Dashboard
                </span>
              </div>
              <h1 className="text-2xl font-bold text-white">
                Welcome back{user.name ? `, ${user.name}` : ''}
              </h1>
              <p className="text-sm mt-0.5" style={{ color: '#888888' }}>{user.email}</p>
            </div>
            <div className="flex items-center gap-3">
              <TokenBadge balance={user.tokenBalance} />
              {user.tokenBalance < 3 && (
                <Button
                  size="sm"
                  onClick={() => setShowBuyTokens(!showBuyTokens)}
                  className="font-black border-0 shadow-[0_0_16px_rgba(255,184,0,0.4)] hover:opacity-90 hover:shadow-[0_0_24px_rgba(255,184,0,0.55)] transition-all duration-300"
                  style={{ background: '#FFB800', color: '#0a0a0a' }}
                >
                  <ShoppingCart className="h-4 w-4 mr-1" />
                  Buy Tokens
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">

        {/* Payment verification banner */}
        {verifying && (
          <div
            className="flex items-center gap-3 rounded-xl p-4 text-sm font-medium animate-fade-in"
            style={{
              background: 'rgba(255,184,0,0.08)',
              border: '1px solid rgba(255,184,0,0.3)',
              color: '#FFB800',
            }}
          >
            <Loader2 className="h-5 w-5 animate-spin shrink-0" />
            Confirming your payment and crediting tokens&hellip;
          </div>
        )}

        {!verifying && paymentStatus === 'success' && !verifyTimedOut && (
          <div
            className="flex items-center gap-3 rounded-xl p-4 text-sm font-medium animate-fade-in"
            style={{
              background: 'rgba(16,185,129,0.1)',
              border: '1px solid rgba(16,185,129,0.3)',
              color: '#34d399',
            }}
          >
            <CheckCircle2 className="h-5 w-5 shrink-0" />
            Payment successful! Your tokens have been added.
          </div>
        )}
        {verifyTimedOut && (
          <div
            className="flex items-center gap-3 rounded-xl p-4 text-sm font-medium animate-fade-in"
            style={{
              background: 'rgba(245,158,11,0.1)',
              border: '1px solid rgba(245,158,11,0.3)',
              color: '#fbbf24',
            }}
          >
            <AlertTriangle className="h-5 w-5 shrink-0" />
            Taking longer than expected. Tokens will appear shortly &mdash; refresh or contact support.
          </div>
        )}
        {paymentStatus === 'cancelled' && (
          <div
            className="flex items-center gap-3 rounded-xl p-4 text-sm font-medium animate-fade-in"
            style={{
              background: 'rgba(245,158,11,0.1)',
              border: '1px solid rgba(245,158,11,0.3)',
              color: '#fbbf24',
            }}
          >
            <AlertTriangle className="h-5 w-5 shrink-0" />
            Payment was cancelled. No charges were made.
          </div>
        )}

        {/* Buy Tokens Section */}
        {showBuyTokens && (
          <div className="animate-fade-in">
            <div
              className="rounded-2xl p-6"
              style={{
                background: '#1a1a1a',
                border: '1px solid rgba(255,184,0,0.2)',
              }}
            >
              <h2 className="text-lg font-bold mb-5 flex items-center gap-2 text-white">
                <ShoppingCart className="h-5 w-5" style={{ color: '#FFB800' }} />
                Purchase Search Tokens
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {pricing.map((tier) => (
                  <PricingCard
                    key={tier.id}
                    {...tier}
                    buttonText={purchaseLoading === tier.id ? 'Redirecting...' : `Buy ${tier.tokens} Searches`}
                    onSelect={() => handlePurchase(tier.id)}
                    disabled={!!purchaseLoading}
                  />
                ))}
              </div>
            </div>
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
          <div
            className="rounded-xl p-4 text-sm animate-fade-in"
            style={{
              background: 'rgba(239,68,68,0.1)',
              border: '1px solid rgba(239,68,68,0.25)',
              color: '#f87171',
            }}
          >
            {searchError}
          </div>
        )}

        {/* Results */}
        {results.length > 0 && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold flex items-center gap-2 text-white">
                <span
                  className="inline-flex items-center justify-center h-6 w-6 rounded-full text-xs font-black"
                  style={{ background: '#FFB800', color: '#0a0a0a' }}
                >
                  {results.length}
                </span>
                leads found
              </h2>
              <Button
                variant="outline"
                size="sm"
                onClick={downloadCSV}
                className="gap-2 transition-all"
                style={{
                  borderColor: 'rgba(255,184,0,0.3)',
                  color: '#FFB800',
                }}
              >
                <Download className="h-4 w-4" />
                Download CSV
              </Button>
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
          <Button
            variant="outline"
            onClick={handleLoadHistory}
            className="gap-2 transition-all"
            style={{
              borderColor: 'rgba(255,255,255,0.12)',
              color: '#888888',
            }}
          >
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
                  <div
                    key={search.id}
                    className="rounded-xl p-4"
                    style={{
                      background: '#1a1a1a',
                      border: '1px solid rgba(255,255,255,0.07)',
                    }}
                  >
                    <div className="flex flex-wrap items-center gap-2 text-sm">
                      <span style={{ color: '#888888' }}>
                        {new Date(search.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                      <span style={{ color: '#888888' }}>&middot;</span>
                      <span
                        className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold"
                        style={{
                          background: 'rgba(255,184,0,0.15)',
                          border: '1px solid rgba(255,184,0,0.35)',
                          color: '#FFB800',
                        }}
                      >
                        {resultCount} leads
                      </span>
                      {query.industry && (
                        <Badge variant="outline" className="text-xs" style={{ borderColor: 'rgba(255,255,255,0.12)', color: '#888888' }}>
                          {query.industry}
                        </Badge>
                      )}
                      {query.location && (
                        <Badge variant="outline" className="text-xs" style={{ borderColor: 'rgba(255,255,255,0.12)', color: '#888888' }}>
                          {query.location}
                        </Badge>
                      )}
                      {query.companySize && (
                        <Badge variant="outline" className="text-xs" style={{ borderColor: 'rgba(255,255,255,0.12)', color: '#888888' }}>
                          {query.companySize}
                        </Badge>
                      )}
                      {query.keywords && (
                        <Badge variant="outline" className="text-xs" style={{ borderColor: 'rgba(255,255,255,0.12)', color: '#888888' }}>
                          {query.keywords}
                        </Badge>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {showHistory && history.length === 0 && (
            <p className="mt-4 text-sm" style={{ color: '#888888' }}>No search history yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
