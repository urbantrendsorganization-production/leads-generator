'use client';

import { useState } from 'react';
import { Search, Loader2, MapPin, Store, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface LocalSearchFormProps {
  onSearch: (query: {
    businessType: string;
    location: string;
    opportunityFilter: 'all' | 'no-website' | 'no-or-social';
  }) => void;
  loading?: boolean;
  disabled?: boolean;
}

const BUSINESS_TYPES = [
  'Restaurants', 'Cafes & Coffee Shops', 'Bars & Nightclubs', 'Bakeries',
  'Hair Salons', 'Barbershops', 'Nail Salons', 'Spas & Wellness Centers',
  'Gyms & Fitness Centers', 'Yoga Studios', 'Personal Trainers',
  'Hotels & Guesthouses', 'Airbnb Hosts', 'Travel Agencies',
  'Real Estate Agents', 'Law Firms', 'Accounting Firms', 'Dental Clinics',
  'Medical Clinics', 'Pharmacies', 'Veterinary Clinics',
  'Auto Repair Shops', 'Car Dealerships', 'Plumbers', 'Electricians',
  'Cleaning Services', 'Landscaping Services', 'Construction Companies',
  'Supermarkets', 'Clothing Stores', 'Jewelry Shops', 'Shoe Stores',
  'Electronics Stores', 'Furniture Stores', 'Bookstores',
  'Schools & Tutoring', 'Kindergartens', 'Music Schools',
  'Event Planners', 'Wedding Photographers', 'Florists', 'Caterers',
  'Insurance Agencies', 'Marketing Agencies', 'IT Services', 'Print Shops',
];

const OPPORTUNITY_OPTIONS = [
  { value: 'no-website', label: 'No website only', description: 'Businesses with zero online presence' },
  { value: 'no-or-social', label: 'No website or social-only', description: 'No site or only FB/IG page' },
  { value: 'all', label: 'All businesses', description: 'Show everyone, sorted by opportunity' },
] as const;

export function LocalSearchForm({ onSearch, loading, disabled }: LocalSearchFormProps) {
  const [businessType, setBusinessType] = useState('');
  const [location, setLocation] = useState('');
  const [opportunityFilter, setOpportunityFilter] = useState<'all' | 'no-website' | 'no-or-social'>('no-or-social');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const filtered = BUSINESS_TYPES.filter(
    (b) => b.toLowerCase().includes(businessType.toLowerCase()) && businessType.length > 0
  );

  function selectType(val: string) {
    setBusinessType(val);
    setShowSuggestions(false);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!businessType.trim() || !location.trim()) return;
    onSearch({ businessType: businessType.trim(), location: location.trim(), opportunityFilter });
  }

  return (
    <div
      className="rounded-2xl p-6"
      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(16,185,129,0.2)' }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div
          className="flex h-9 w-9 items-center justify-center rounded-xl shrink-0"
          style={{
            background: 'linear-gradient(135deg,rgba(16,185,129,0.25),rgba(6,182,212,0.2))',
            border: '1px solid rgba(16,185,129,0.4)',
          }}
        >
          <MapPin className="h-4.5 w-4.5" style={{ color: '#10b981' }} />
        </div>
        <div>
          <h2 className="text-base font-semibold text-white">Local Business Search</h2>
          <p className="text-xs text-muted-foreground">
            Find real local businesses on Google Maps — filter for ones with no website to pitch your services
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

          {/* Business type */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500" htmlFor="businessType">
              Business Type
            </label>
            <div className="relative">
              <div className="relative">
                <Store className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: '#64748b' }} />
                <input
                  id="businessType"
                  type="text"
                  value={businessType}
                  onChange={(e) => { setBusinessType(e.target.value); setShowSuggestions(true); }}
                  onFocus={() => setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                  placeholder="e.g. Restaurants, Hair Salons..."
                  className="w-full rounded-xl pl-9 pr-3 py-2.5 text-sm text-white outline-none"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
                />
              </div>
              {showSuggestions && filtered.length > 0 && (
                <div
                  className="absolute z-50 mt-1 w-full max-h-48 overflow-auto rounded-xl py-1 text-sm shadow-xl"
                  style={{ background: '#1a1a1a', border: '1px solid rgba(16,185,129,0.3)' }}
                >
                  {filtered.slice(0, 12).map((b) => (
                    <button
                      key={b}
                      type="button"
                      onMouseDown={() => selectType(b)}
                      className="flex w-full items-center px-3 py-1.5 text-left text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
                    >
                      {b}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Location */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500" htmlFor="localLocation">
              Location
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: '#64748b' }} />
              <Input
                id="localLocation"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Madrid, Spain / Lagos, Nigeria"
                className="pl-9"
                style={{ background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.1)' }}
              />
            </div>
          </div>
        </div>

        {/* Opportunity filter */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <Filter className="h-3 w-3" />
            Opportunity Filter
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {OPPORTUNITY_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setOpportunityFilter(opt.value)}
                className="rounded-xl px-3 py-2.5 text-left transition-all"
                style={{
                  background:
                    opportunityFilter === opt.value
                      ? 'rgba(16,185,129,0.12)'
                      : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${
                    opportunityFilter === opt.value
                      ? 'rgba(16,185,129,0.4)'
                      : 'rgba(255,255,255,0.08)'
                  }`,
                }}
              >
                <p
                  className="text-xs font-semibold"
                  style={{ color: opportunityFilter === opt.value ? '#10b981' : '#e2e8f0' }}
                >
                  {opt.label}
                </p>
                <p className="text-[10px] mt-0.5" style={{ color: '#64748b' }}>
                  {opt.description}
                </p>
              </button>
            ))}
          </div>
        </div>

        <Button
          type="submit"
          className="w-full font-black border-0"
          size="lg"
          disabled={loading || disabled || !businessType.trim() || !location.trim()}
          style={{ background: '#10b981', color: '#000', minHeight: '48px' }}
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Searching Google Maps&hellip;
            </>
          ) : (
            <>
              <Search className="h-4 w-4" />
              Find Local Businesses — 1 token
            </>
          )}
        </Button>
      </form>
    </div>
  );
}
