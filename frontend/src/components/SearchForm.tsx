'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Loader2, SlidersHorizontal } from 'lucide-react';

interface SearchFormProps {
  onSearch: (query: {
    industry?: string;
    location?: string;
    companySize?: string;
    keywords?: string;
  }) => void;
  loading?: boolean;
  disabled?: boolean;
}

const INDUSTRIES = [
  'Technology',
  'Healthcare',
  'Finance',
  'Real Estate',
  'Marketing',
  'E-commerce',
  'Education',
  'Manufacturing',
  'Consulting',
  'Legal',
  'Retail',
  'Logistics',
];

const COMPANY_SIZES = [
  { label: 'Any', value: '' },
  { label: '1-10', value: '1-10' },
  { label: '11-50', value: '11-50' },
  { label: '51-200', value: '51-200' },
  { label: '201-500', value: '201-500' },
  { label: '500+', value: '500+' },
];

interface LocationGroup {
  label: string;
  cities: { label: string; value: string }[];
}

const LOCATION_GROUPS: LocationGroup[] = [
  {
    label: 'Africa',
    cities: [
      { label: 'Lagos', value: 'lagos' },
      { label: 'Accra', value: 'accra' },
      { label: 'Abuja', value: 'abuja' },
      { label: 'Dakar', value: 'dakar' },
      { label: 'Nairobi', value: 'nairobi' },
      { label: 'Kampala', value: 'kampala' },
      { label: 'Dar es Salaam', value: 'dar es salaam' },
      { label: 'Kigali', value: 'kigali' },
      { label: 'Johannesburg', value: 'johannesburg' },
      { label: 'Cape Town', value: 'cape town' },
      { label: 'Durban', value: 'durban' },
      { label: 'Cairo', value: 'cairo' },
      { label: 'Casablanca', value: 'casablanca' },
      { label: 'Tunis', value: 'tunis' },
    ],
  },
  {
    label: 'Europe',
    cities: [
      { label: 'London', value: 'london' },
      { label: 'Manchester', value: 'manchester' },
      { label: 'Berlin', value: 'berlin' },
      { label: 'Paris', value: 'paris' },
      { label: 'Amsterdam', value: 'amsterdam' },
      { label: 'Dublin', value: 'dublin' },
      { label: 'Zurich', value: 'zurich' },
      { label: 'Stockholm', value: 'stockholm' },
    ],
  },
  {
    label: 'Middle East',
    cities: [
      { label: 'Dubai', value: 'dubai' },
      { label: 'Riyadh', value: 'riyadh' },
      { label: 'Abu Dhabi', value: 'abu dhabi' },
      { label: 'Doha', value: 'doha' },
      { label: 'Kuwait City', value: 'kuwait city' },
    ],
  },
  {
    label: 'Asia',
    cities: [
      { label: 'Singapore', value: 'singapore' },
      { label: 'Mumbai', value: 'mumbai' },
      { label: 'Bangalore', value: 'bangalore' },
      { label: 'Tokyo', value: 'tokyo' },
      { label: 'Seoul', value: 'seoul' },
      { label: 'Hong Kong', value: 'hong kong' },
      { label: 'Kuala Lumpur', value: 'kuala lumpur' },
      { label: 'Bangkok', value: 'bangkok' },
    ],
  },
  {
    label: 'Oceania',
    cities: [
      { label: 'Sydney', value: 'sydney' },
      { label: 'Melbourne', value: 'melbourne' },
      { label: 'Brisbane', value: 'brisbane' },
      { label: 'Perth', value: 'perth' },
    ],
  },
  {
    label: 'Americas',
    cities: [
      { label: 'New York', value: 'new york' },
      { label: 'San Francisco', value: 'san francisco' },
      { label: 'Chicago', value: 'chicago' },
      { label: 'Miami', value: 'miami' },
      { label: 'Austin', value: 'austin' },
      { label: 'Toronto', value: 'toronto' },
      { label: 'Sao Paulo', value: 'sao paulo' },
      { label: 'Mexico City', value: 'mexico city' },
      { label: 'Bogota', value: 'bogota' },
      { label: 'Buenos Aires', value: 'buenos aires' },
    ],
  },
];

const selectClassName =
  'flex h-10 w-full rounded-xl px-3 py-2 text-sm appearance-none transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50';

export function SearchForm({ onSearch, loading, disabled }: SearchFormProps) {
  const [industry, setIndustry] = useState('');
  const [location, setLocation] = useState('');
  const [companySize, setCompanySize] = useState('');
  const [keywords, setKeywords] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSearch({
      industry: industry || undefined,
      location: location || undefined,
      companySize: companySize || undefined,
      keywords: keywords || undefined,
    });
  }

  return (
    <div
      className="rounded-2xl p-6"
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(139,92,246,0.2)',
      }}
    >
      {/* Card header */}
      <div className="flex items-center gap-3 mb-6">
        <div
          className="flex h-9 w-9 items-center justify-center rounded-xl shrink-0"
          style={{
            background: 'linear-gradient(135deg,rgba(124,58,237,0.25),rgba(6,182,212,0.2))',
            border: '1px solid rgba(139,92,246,0.4)',
          }}
        >
          <SlidersHorizontal className="h-4.5 w-4.5" style={{ color: '#8b5cf6' }} />
        </div>
        <div>
          <h2 className="text-base font-semibold">Search Leads</h2>
          <p className="text-xs text-muted-foreground">Filter by industry, location, size, or keywords</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Industry */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500" htmlFor="industry">
              Industry
            </label>
            <select
  id="industry"
  value={industry}
  onChange={(e) => setIndustry(e.target.value)}
  className={selectClassName}
  style={{
    background: 'rgba(255,255,255,0.05)', // The visible box
    border: '1px solid rgba(255,255,255,0.1)',
    color: 'white',
  }}
>
  {/* Add a solid background to options so they are readable in the popup */}
  <option value="" style={{ background: '#1a1a1a', color: 'white' }}>
    All Industries
  </option>
  {INDUSTRIES.map((ind) => (
    <option key={ind} value={ind} style={{ background: '#1a1a1a', color: 'white' }}>
      {ind}
    </option>
  ))}
</select>
          </div>

          {/* Location */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500" htmlFor="location">
              Location
            </label>
            <select
  id="location"
  value={location}
  onChange={(e) => setLocation(e.target.value)}
  className={selectClassName}
  style={{
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    color: 'var(--foreground)',
  }}
>
  <option value="" style={{ background: '#1a1a1a', color: 'white' }}>
    All Locations (Worldwide)
  </option>
  {LOCATION_GROUPS.map((group) => (
    <optgroup 
      key={group.label} 
      label={group.label} 
      style={{ background: '#1a1a1a', color: '#94a3b8' }} // Color for the group heading
    >
      {group.cities.map((city) => (
        <option 
          key={city.value} 
          value={city.value} 
          style={{ background: '#1a1a1a', color: 'white' }}
        >
          {city.label}
        </option>
      ))}
    </optgroup>
  ))}
</select>
          </div>

          {/* Company Size */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500" htmlFor="companySize">
              Company Size
            </label>
            <select
              id="companySize"
              value={companySize}
              onChange={(e) => setCompanySize(e.target.value)}
              className={selectClassName}
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: 'var(--foreground)',
              }}
            >
              {COMPANY_SIZES.map((size) => (
                <option key={size.value} value={size.value}>{size.label}</option>
              ))}
            </select>
          </div>

          {/* Keywords */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500" htmlFor="keywords">
              Keywords
            </label>
            <Input
              id="keywords"
              placeholder="e.g. SaaS, AI, B2B"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              style={{
                background: 'rgba(255,255,255,0.05)',
                borderColor: 'rgba(255,255,255,0.1)',
              }}
            />
          </div>
        </div>

        {/* Submit */}
        <Button
          type="submit"
          className="w-full btn-shimmer gradient-bg text-white font-bold border-0 shadow-[0_0_20px_rgba(124,58,237,0.35)] hover:shadow-[0_0_32px_rgba(124,58,237,0.55)] hover:opacity-95 transition-all duration-300"
          size="lg"
          disabled={loading || disabled}
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Searching&hellip;
            </>
          ) : (
            <>
              <Search className="h-4 w-4" />
              Search Leads — 1 token
            </>
          )}
        </Button>
      </form>
    </div>
  );
}
