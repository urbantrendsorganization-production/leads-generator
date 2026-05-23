'use client';

import { Suspense, useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SearchForm } from '@/components/SearchForm';
import { LeadCard } from '@/components/LeadCard';
import { TokenBadge } from '@/components/TokenBadge';
import { api, ApiError, API_URL, fetchCsrfToken } from '@/lib/api';
import { isAuthenticated, getUser, setUser, getToken } from '@/lib/auth';
import {
  Loader2,
  History,
  ChevronDown,
  ChevronUp,
  Download,
  ClockIcon,
  MapPin,
  Building2,
  Mail,
  Filter,
} from 'lucide-react';

interface Lead {
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  whatsapp?: string;
  website: string;
  industry: string;
  location: string;
  companySize: string;
  title: string;
  linkedinUrl?: string;
  mapsUrl?: string;
  confidence?: 'high' | 'medium';
}

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-[60vh] items-center justify-center" style={{ background: '#0d0d0d' }}>
        <Loader2 className="h-8 w-8 animate-spin" style={{ color: 'var(--brand-primary)' }} />
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}

function DashboardContent() {
  const router = useRouter();

  const [user, setUserState] = useState<any>(null);
  const [results, setResults] = useState<Lead[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [history, setHistory] = useState<any[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [lastSearchedLocations, setLastSearchedLocations] = useState<string[]>([]);

  // ── Local business search state ──
  const [activeTab, setActiveTab] = useState<'company' | 'email'>('company');

  // ── Email campaigns + refine state ──
  const [emailHistory, setEmailHistory] = useState<any[]>([]);
  const [emailHistoryLoading, setEmailHistoryLoading] = useState(false);
  const [lastQuery, setLastQuery] = useState<any>(null);
  const [showRefine, setShowRefine] = useState(false);
  const [refineFilters, setRefineFilters] = useState({ titles: '', revenueMin: '', revenueMax: '', excludeCompanies: '' });

  const refreshUser = useCallback(async () => {
    try {
      const u = await api.auth.me();
      setUserState(u);
      setUser(u);
    } catch {
      router.push('/login');
    }
  }, [router]);

  // Fetch CSRF token on mount
  useEffect(() => {
    fetchCsrfToken();
  }, []);

  // SSE: real-time token balance updates
  useEffect(() => {
    if (!isAuthenticated()) return;
    const token = getToken();
    if (!token) return;

    // Use a URL with token as query param for EventSource (no custom headers support)
    const eventSource = new EventSource(
      `${API_URL}/api/realtime/token-balance?token=${encodeURIComponent(token)}`,
      { withCredentials: true }
    );

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (typeof data.tokenBalance === 'number') {
          setUserState((prev: any) =>
            prev ? { ...prev, tokenBalance: data.tokenBalance } : prev
          );
        }
      } catch {
        // Ignore parse errors
      }
    };

    eventSource.onerror = () => {
      // EventSource will auto-reconnect
    };

    return () => {
      eventSource.close();
    };
  }, []);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }
    const localUser = getUser();
    if (localUser) setUserState(localUser);
    refreshUser();
  }, [router, refreshUser]);

  async function executeSearch(query: any) {
    setSearching(true);
    setSearchError('');
    setResults([]);

    // Remember the query so the Refine panel can re-run it with filters
    setLastQuery(query);

    // Track searched locations for Google Maps display
    const locs: string[] = query.locations || [];
    setLastSearchedLocations(locs);

    try {
      const result = await api.leads.search(query);
      setResults(result.results);
      setUserState((prev: any) => prev ? { ...prev, tokenBalance: result.remainingTokens } : prev);
      setUser({ ...user, tokenBalance: result.remainingTokens });
    } catch (err: any) {
      setSearchError(err.message || 'Search failed');
    } finally {
      setSearching(false);
    }
  }

  function handleSearch(query: any) {
    return executeSearch(query);
  }

  function handleSearchWithRefine(query: any) {
    return executeSearch(query);
  }

  async function loadEmailHistory() {
    if (emailHistory.length > 0) return;
    setEmailHistoryLoading(true);
    try {
      const data = await api.email.history();
      setEmailHistory(data);
    } catch {
      // silent fail
    } finally {
      setEmailHistoryLoading(false);
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

  function downloadCSV() {
    if (results.length === 0) return;
    const headers = ['Company', 'Contact', 'Title', 'Email', 'Phone', 'WhatsApp', 'Website', 'Industry', 'Location', 'Company Size', 'LinkedIn', 'Maps URL', 'Confidence'];
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
      user?.isPremium ? (lead.whatsapp || '') : '',
      lead.website,
      lead.industry,
      lead.location,
      lead.companySize,
      lead.linkedinUrl || '',
      lead.mapsUrl || '',
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

  if (!user) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center" style={{ background: '#0d0d0d' }}>
        <Loader2 className="h-8 w-8 animate-spin" style={{ color: 'var(--brand-primary)' }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen dashboard-bg" style={{ color: '#ffffff' }}>

      {/* Dashboard header bar */}
      <div
        className="border-b relative overflow-hidden"
        style={{
          borderColor: 'color-mix(in srgb, var(--brand-primary) 18%, transparent)',
          background: 'linear-gradient(135deg, color-mix(in srgb, var(--brand-primary) 9%, #111111) 0%, #111111 60%, #0d0d0d 100%)',
        }}
      >
        {/* Radial glow behind header content */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse 60% 120% at 0% 50%, color-mix(in srgb, var(--brand-primary) 12%, transparent) 0%, transparent 70%)',
          }}
        />
        {/* Top accent line */}
        <div
          className="absolute top-0 left-0 right-0 h-px"
          style={{ background: 'linear-gradient(90deg, transparent, var(--brand-primary), transparent)' }}
        />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 relative">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span
                  className="text-xs font-black uppercase tracking-widest"
                  style={{ color: 'var(--brand-primary)', letterSpacing: '0.18em' }}
                >
                  TrendyyLeads Dashboard
                </span>
              </div>
              <h1 className="text-2xl font-bold text-white" style={{ letterSpacing: '-0.02em' }}>
                Welcome back{user.name ? `, ${user.name}` : ''}
              </h1>
              <p className="text-sm mt-0.5" style={{ color: '#666666' }}>{user.email}</p>
            </div>
            <div className="flex items-center gap-3">
              <TokenBadge balance={user.tokenBalance} />
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">

        {/* Stats bar */}
        <div className="flex flex-wrap items-center gap-2 animate-fade-in">
          {/* Token balance stat */}
          <div
            className="flex items-center gap-2 rounded-full px-4 py-1.5"
            style={{
              background: 'color-mix(in srgb, var(--brand-primary) 10%, transparent)',
              border: '1px solid color-mix(in srgb, var(--brand-primary) 25%, transparent)',
            }}
          >
            <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#666' }}>Tokens</span>
            <span className="stat-number text-sm font-black" style={{ color: 'var(--brand-primary)' }}>
              {user.tokenBalance ?? '—'}
            </span>
          </div>
          {/* Total searches stat */}
          <div
            className="flex items-center gap-2 rounded-full px-4 py-1.5"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#555' }}>Searches</span>
            <span className="stat-number text-sm font-black" style={{ color: '#aaaaaa' }}>
              {showHistory ? history.length : '—'}
            </span>
          </div>
          {/* Credits never expire badge */}
          <div
            className="flex items-center gap-1.5 rounded-full px-4 py-1.5"
            style={{
              background: 'rgba(16,185,129,0.07)',
              border: '1px solid rgba(16,185,129,0.18)',
            }}
          >
            <span
              className="inline-block h-1.5 w-1.5 rounded-full"
              style={{ background: '#10b981' }}
            />
            <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#10b981', letterSpacing: '0.12em' }}>Credits never expire</span>
          </div>
        </div>

        {/* Search mode tabs */}
        <div
          className="flex rounded-xl p-1 gap-1"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
        >
          <button
            type="button"
            onClick={() => setActiveTab('company')}
            className="flex-1 flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold transition-all duration-200"
            style={
              activeTab === 'company'
                ? {
                    background: 'color-mix(in srgb, var(--brand-primary) 14%, #1a1a1a)',
                    border: '1px solid color-mix(in srgb, var(--brand-primary) 35%, transparent)',
                    color: 'var(--brand-primary)',
                    boxShadow: '0 0 16px color-mix(in srgb, var(--brand-primary) 18%, transparent)',
                  }
                : { color: '#4a5568', border: '1px solid transparent' }
            }
          >
            <Building2 className="h-4 w-4" />
            Company Leads
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab('email'); loadEmailHistory(); }}
            className="flex-1 flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold transition-all duration-200"
            style={activeTab === 'email'
              ? {
                  background: 'color-mix(in srgb, var(--brand-primary) 14%, #1a1a1a)',
                  border: '1px solid color-mix(in srgb, var(--brand-primary) 35%, transparent)',
                  color: 'var(--brand-primary)',
                  boxShadow: '0 0 16px color-mix(in srgb, var(--brand-primary) 18%, transparent)',
                }
              : { color: '#4a5568', border: '1px solid transparent' }
            }
          >
            <Mail className="h-4 w-4" />
            Email Campaigns
          </button>
        </div>

        {/* Company lead search */}
        {activeTab === 'company' && (
          <div>
            <p className="text-xs font-black uppercase tracking-widest mb-3" style={{ color: '#444', letterSpacing: '0.16em' }}>
              Find Your Leads
            </p>
            <SearchForm
              onSearch={handleSearch}
              loading={searching}
              disabled={user.tokenBalance <= 0}
            />
          </div>
        )}

        {/* Search Error */}
        {searchError && activeTab === 'company' && (
          <div
            className="rounded-xl p-4 text-sm animate-fade-in"
            style={{
              background: 'rgba(239,68,68,0.08)',
              border: '1px solid rgba(239,68,68,0.22)',
              color: '#f87171',
            }}
          >
            {searchError}
          </div>
        )}

        {/* Skeleton loading cards while searching */}
        {searching && (
          <div className="space-y-3 animate-fade-in">
            <div className="flex items-center gap-2 mb-2">
              <div className="skeleton h-5 w-32" />
            </div>
            {[0, 1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="rounded-xl p-5 space-y-3"
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.07)',
                  boxShadow: '0 0 20px color-mix(in srgb, var(--brand-primary) 4%, transparent)',
                }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <div
                      className="skeleton h-4 w-48"
                      style={{ background: 'linear-gradient(90deg, rgba(13,148,136,0.06) 0%, rgba(13,148,136,0.12) 50%, rgba(13,148,136,0.06) 100%)', backgroundSize: '200% 100%', animation: 'skeleton-shimmer 1.6s ease-in-out infinite' }}
                    />
                    <div className="flex gap-2">
                      <div className="skeleton h-5 w-24 rounded-full" />
                      <div className="skeleton h-5 w-20 rounded-full" />
                    </div>
                  </div>
                  <div className="skeleton h-4 w-16" />
                </div>
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div className="skeleton h-4 w-40" />
                  <div className="skeleton h-4 w-32" />
                  <div className="skeleton h-4 w-44" />
                  <div className="skeleton h-4 w-28" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Google Maps embed for searched location */}
        {!searching && results.length > 0 && lastSearchedLocations.length > 0 && (
          <div className="animate-fade-in">
            {(() => {
              const mapsKey = typeof window !== 'undefined'
                ? (process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY || '')
                : '';
              const locationQuery = lastSearchedLocations.join(', ');
              if (mapsKey) {
                return (
                  <div
                    className="rounded-xl overflow-hidden"
                    style={{ border: '1px solid color-mix(in srgb, var(--brand-primary) 18%, transparent)' }}
                  >
                    <iframe
                      width="100%"
                      height="200"
                      style={{ border: 0 }}
                      loading="lazy"
                      allowFullScreen
                      referrerPolicy="no-referrer-when-downgrade"
                      src={`https://www.google.com/maps/embed/v1/place?key=${mapsKey}&q=${encodeURIComponent(locationQuery)}`}
                    />
                  </div>
                );
              }
              return (
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(locationQuery)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2.5 rounded-full px-4 py-2.5 text-sm font-semibold transition-all hover:opacity-80"
                  style={{
                    background: 'rgba(16,185,129,0.08)',
                    border: '1px solid rgba(16,185,129,0.22)',
                    color: '#34d399',
                  }}
                >
                  <MapPin className="h-4 w-4" />
                  View {locationQuery} on Google Maps
                  <svg className="h-3.5 w-3.5 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                  </svg>
                </a>
              );
            })()}
          </div>
        )}

        {/* Company Results */}
        {activeTab === 'company' && !searching && results.length > 0 && (
          <div className="space-y-4 animate-fade-in">
            {/* Results toolbar */}
            <div
              className="flex items-center justify-between rounded-xl px-4 py-3"
              style={{
                background: 'rgba(255,255,255,0.025)',
                border: '1px solid rgba(255,255,255,0.07)',
                backdropFilter: 'blur(8px)',
              }}
            >
              <h2 className="text-sm font-bold flex items-center gap-2.5 text-white">
                <span
                  className="inline-flex items-center justify-center h-6 w-6 rounded-full text-xs font-black"
                  style={{ background: 'var(--brand-primary)', color: '#ffffff' }}
                >
                  {results.length}
                </span>
                <span style={{ color: '#cccccc' }}>leads found</span>
              </h2>
              <Button
                variant="outline"
                size="sm"
                onClick={downloadCSV}
                className="gap-2 transition-all btn-primary-hover"
                style={{
                  borderColor: 'color-mix(in srgb, var(--brand-primary) 35%, transparent)',
                  color: 'var(--brand-primary)',
                  background: 'color-mix(in srgb, var(--brand-primary) 6%, transparent)',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                }}
              >
                <Download className="h-3.5 w-3.5" />
                Download CSV
              </Button>
            </div>

            {/* Refine Results */}
            {results.length > 0 && (
              <div style={{ marginBottom: '16px' }}>
                <button
                  type="button"
                  onClick={() => setShowRefine(!showRefine)}
                  className="inline-flex items-center gap-2 text-xs font-semibold rounded-lg px-3 py-2 transition-all"
                  style={{
                    color: 'var(--brand-primary)',
                    background: 'color-mix(in srgb, var(--brand-primary) 8%, transparent)',
                    border: '1px solid color-mix(in srgb, var(--brand-primary) 20%, transparent)',
                  }}
                >
                  <Filter className="h-3.5 w-3.5" /> {showRefine ? 'Hide Refine' : 'Refine Results'}
                </button>

                {showRefine && (
                  <div className="mt-3 rounded-xl p-4 space-y-3"
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold mb-1.5" style={{ color: '#888' }}>Job Titles (comma-separated)</label>
                        <input
                          value={refineFilters.titles}
                          onChange={(e) => setRefineFilters(f => ({ ...f, titles: e.target.value }))}
                          placeholder="e.g. VP Sales, Head of Growth"
                          className="w-full rounded-lg px-3 py-2 text-sm text-white"
                          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', outline: 'none' }}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold mb-1.5" style={{ color: '#888' }}>Exclude Companies</label>
                        <input
                          value={refineFilters.excludeCompanies}
                          onChange={(e) => setRefineFilters(f => ({ ...f, excludeCompanies: e.target.value }))}
                          placeholder="e.g. Acme Corp, Initech"
                          className="w-full rounded-lg px-3 py-2 text-sm text-white"
                          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', outline: 'none' }}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold mb-1.5" style={{ color: '#888' }}>Min Revenue ($)</label>
                        <input
                          type="number"
                          value={refineFilters.revenueMin}
                          onChange={(e) => setRefineFilters(f => ({ ...f, revenueMin: e.target.value }))}
                          placeholder="e.g. 1000000"
                          className="w-full rounded-lg px-3 py-2 text-sm text-white"
                          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', outline: 'none' }}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold mb-1.5" style={{ color: '#888' }}>Max Revenue ($)</label>
                        <input
                          type="number"
                          value={refineFilters.revenueMax}
                          onChange={(e) => setRefineFilters(f => ({ ...f, revenueMax: e.target.value }))}
                          placeholder="e.g. 50000000"
                          className="w-full rounded-lg px-3 py-2 text-sm text-white"
                          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', outline: 'none' }}
                        />
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        if (!lastQuery) return;
                        const rf: any = {};
                        if (refineFilters.titles.trim()) rf.titles = refineFilters.titles.split(',').map(s => s.trim()).filter(Boolean);
                        if (refineFilters.excludeCompanies.trim()) rf.excludeCompanies = refineFilters.excludeCompanies.split(',').map(s => s.trim()).filter(Boolean);
                        if (refineFilters.revenueMin) rf.revenueMin = parseInt(refineFilters.revenueMin);
                        if (refineFilters.revenueMax) rf.revenueMax = parseInt(refineFilters.revenueMax);
                        // Re-run last search with refineFilters
                        handleSearchWithRefine({ ...lastQuery, refineFilters: Object.keys(rf).length > 0 ? rf : undefined });
                      }}
                      className="inline-flex items-center gap-2 text-sm font-bold rounded-lg px-4 py-2.5 transition-all"
                      style={{ background: 'var(--brand-primary)', color: '#fff' }}
                    >
                      Re-run Search with Filters
                    </button>
                  </div>
                )}
              </div>
            )}

            <div className="grid gap-3">
              {results.map((lead, i) => (
                <LeadCard key={i} lead={lead} isPremium={!!user?.isPremium} />
              ))}
            </div>
          </div>
        )}

        {/* Email Campaigns */}
        {activeTab === 'email' && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-widest mb-1" style={{ color: '#444', letterSpacing: '0.16em' }}>
                  Email Campaigns
                </p>
                <h2 className="text-lg font-bold text-white">Outreach History</h2>
              </div>
              <p className="text-xs hidden sm:block" style={{ color: '#444' }}>
                Click &ldquo;Email&rdquo; on any lead card to start outreach
              </p>
            </div>

            {emailHistoryLoading && (
              <div className="space-y-3">
                {[0,1,2].map(i => (
                  <div key={i} className="skeleton h-16 rounded-xl" />
                ))}
              </div>
            )}

            {!emailHistoryLoading && emailHistory.length === 0 && (
              <div
                className="rounded-2xl p-12 text-center"
                style={{
                  background: 'rgba(255,255,255,0.02)',
                  border: '1.5px dashed rgba(255,255,255,0.09)',
                }}
              >
                {/* Icon container with gradient */}
                <div
                  className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl"
                  style={{
                    background: 'linear-gradient(135deg, color-mix(in srgb, var(--brand-primary) 15%, transparent) 0%, color-mix(in srgb, var(--brand-primary) 6%, transparent) 100%)',
                    border: '1px solid color-mix(in srgb, var(--brand-primary) 25%, transparent)',
                    boxShadow: '0 0 24px color-mix(in srgb, var(--brand-primary) 12%, transparent)',
                  }}
                >
                  <Mail className="h-7 w-7" style={{ color: 'var(--brand-primary)' }} />
                </div>
                <p className="text-base font-bold mb-2 text-white">No emails sent yet</p>
                <p className="text-sm max-w-xs mx-auto" style={{ color: '#555' }}>
                  Search for leads, then click the Email button on any lead card to launch your outreach.
                </p>
              </div>
            )}

            {!emailHistoryLoading && emailHistory.length > 0 && (
              <div className="space-y-2">
                {emailHistory.map((send: any) => (
                  <div
                    key={send.id}
                    className="rounded-xl p-4 transition-all"
                    style={{
                      background: '#1a1a1a',
                      border: '1px solid rgba(255,255,255,0.06)',
                      borderLeft: '3px solid color-mix(in srgb, var(--brand-primary) 50%, transparent)',
                    }}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-white truncate">{send.subject}</p>
                        <p className="text-xs mt-0.5" style={{ color: '#555' }}>
                          {send.toName} &middot; {send.toEmail} &middot; {send.company}
                        </p>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        {/* Opens counter */}
                        <span className="flex items-baseline gap-1 text-xs">
                          <span className="font-black stat-number" style={{ color: '#10b981' }}>{send.openCount}</span>
                          <span style={{ color: '#444' }}>opens</span>
                        </span>
                        {/* Clicks counter */}
                        <span className="flex items-baseline gap-1 text-xs">
                          <span className="font-black stat-number" style={{ color: 'var(--brand-primary)' }}>{send.clickCount}</span>
                          <span style={{ color: '#444' }}>clicks</span>
                        </span>
                        {/* Status badge */}
                        <span
                          className="rounded-full px-2.5 py-0.5 font-bold uppercase text-xs tracking-wide"
                          style={
                            send.status === 'sent'
                              ? { background: 'rgba(16,185,129,0.12)', color: '#10b981', border: '1px solid rgba(16,185,129,0.25)' }
                              : send.status === 'failed'
                                ? { background: 'rgba(239,68,68,0.12)', color: '#f87171', border: '1px solid rgba(239,68,68,0.25)' }
                                : { background: 'color-mix(in srgb, var(--brand-primary) 12%, transparent)', color: 'var(--brand-primary)', border: '1px solid color-mix(in srgb, var(--brand-primary) 25%, transparent)' }
                          }
                        >
                          {send.status}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs mt-2" style={{ color: '#3d3d3d' }}>
                      {new Date(send.createdAt).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* History */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs font-black uppercase tracking-widest" style={{ color: '#333', letterSpacing: '0.16em' }}>
              Search History
            </p>
          </div>
          <Button
            variant="outline"
            onClick={handleLoadHistory}
            className="gap-2 transition-all"
            style={{
              borderColor: 'rgba(255,255,255,0.1)',
              color: '#666666',
              background: 'rgba(255,255,255,0.02)',
            }}
          >
            {historyLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <History className="h-4 w-4" />
            )}
            {showHistory ? 'Hide History' : 'Load History'}
            {showHistory ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>

          {showHistory && history.length > 0 && (
            <div className="mt-4 space-y-2 animate-fade-in">
              {history.map((search) => {
                const query = search.query as any;
                const resultCount = Array.isArray(search.results) ? search.results.length : 0;
                return (
                  <div
                    key={search.id}
                    className="card-hover-lift rounded-xl px-4 py-3.5"
                    style={{
                      background: '#111111',
                      border: '1px solid rgba(255,255,255,0.06)',
                      borderLeft: '3px solid var(--brand-primary)',
                    }}
                  >
                    {/* Date row */}
                    <p className="text-xs mb-2 font-medium" style={{ color: '#555' }}>
                      <ClockIcon className="inline h-3 w-3 mr-1 opacity-60" style={{ verticalAlign: '-1px' }} />
                      {new Date(search.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                    {/* Tags row */}
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-black"
                        style={{
                          background: 'color-mix(in srgb, var(--brand-primary) 15%, transparent)',
                          border: '1px solid color-mix(in srgb, var(--brand-primary) 30%, transparent)',
                          color: 'var(--brand-primary)',
                        }}
                      >
                        {resultCount} leads
                      </span>
                      {/* Support both legacy (industry/location string) and new (industries/locations array) */}
                      {query.industries && Array.isArray(query.industries)
                        ? query.industries.map((ind: string) => (
                            <Badge key={ind} variant="outline" className="text-xs" style={{ borderColor: 'rgba(255,255,255,0.1)', color: '#777', background: 'rgba(255,255,255,0.03)' }}>
                              {ind}
                            </Badge>
                          ))
                        : query.industry && (
                            <Badge variant="outline" className="text-xs" style={{ borderColor: 'rgba(255,255,255,0.1)', color: '#777', background: 'rgba(255,255,255,0.03)' }}>
                              {query.industry}
                            </Badge>
                          )
                      }
                      {query.locations && Array.isArray(query.locations)
                        ? query.locations.map((loc: string) => (
                            <Badge key={loc} variant="outline" className="text-xs" style={{ borderColor: 'rgba(255,255,255,0.1)', color: '#777', background: 'rgba(255,255,255,0.03)' }}>
                              {loc}
                            </Badge>
                          ))
                        : query.location && (
                            <Badge variant="outline" className="text-xs" style={{ borderColor: 'rgba(255,255,255,0.1)', color: '#777', background: 'rgba(255,255,255,0.03)' }}>
                              {query.location}
                            </Badge>
                          )
                      }
                      {query.companySize && (
                        <Badge variant="outline" className="text-xs" style={{ borderColor: 'rgba(255,255,255,0.1)', color: '#777', background: 'rgba(255,255,255,0.03)' }}>
                          {query.companySize}
                        </Badge>
                      )}
                      {query.keywords && (
                        <Badge variant="outline" className="text-xs" style={{ borderColor: 'rgba(255,255,255,0.1)', color: '#777', background: 'rgba(255,255,255,0.03)' }}>
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
            <div
              className="mt-4 flex flex-col items-center justify-center py-12 rounded-xl text-center animate-fade-in"
              style={{
                background: 'rgba(255,255,255,0.02)',
                border: '1.5px dashed rgba(255,255,255,0.07)',
              }}
            >
              <div
                className="flex h-14 w-14 items-center justify-center rounded-2xl mb-4"
                style={{
                  background: 'color-mix(in srgb, var(--brand-primary) 10%, transparent)',
                  border: '1px solid color-mix(in srgb, var(--brand-primary) 20%, transparent)',
                }}
              >
                <ClockIcon className="h-7 w-7" style={{ color: 'var(--brand-primary)' }} />
              </div>
              <h3 className="text-base font-semibold text-white mb-1">No history yet</h3>
              <p className="text-sm max-w-xs" style={{ color: '#555' }}>
                Your search history will appear here after your first lead search.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
