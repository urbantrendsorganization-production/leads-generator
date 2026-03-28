'use client';

import { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Loader2, SlidersHorizontal, X } from 'lucide-react';

interface SearchFormProps {
  onSearch: (query: {
    industries?: string[];
    locations?: string[];
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

const ALL_LOCATIONS = LOCATION_GROUPS.flatMap((g) => g.cities);

const MAX_TAGS = 5;

const selectClassName =
  'flex h-10 w-full rounded-xl px-3 py-2 text-sm appearance-none transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50';

// ─── Tag badge component ───────────────────────────────────────────────────
function TagBadge({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium"
      style={{
        background: 'linear-gradient(135deg,rgba(124,58,237,0.2),rgba(6,182,212,0.15))',
        border: '1px solid rgba(139,92,246,0.3)',
        color: '#c4b5fd',
      }}
    >
      {label}
      <button
        type="button"
        onClick={onRemove}
        className="ml-0.5 rounded-full p-0.5 transition-colors hover:bg-white/10"
        aria-label={`Remove ${label}`}
      >
        <X className="h-3 w-3" />
      </button>
    </span>
  );
}

// ─── Multi-tag input with dropdown ─────────────────────────────────────────
function TagInput({
  tags,
  setTags,
  options,
  placeholder,
  id,
}: {
  tags: string[];
  setTags: (tags: string[]) => void;
  options: { label: string; value: string }[];
  placeholder: string;
  id: string;
  grouped?: boolean;
}) {
  const [inputValue, setInputValue] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const addTag = useCallback(
    (value: string) => {
      const trimmed = value.trim();
      if (!trimmed || tags.includes(trimmed) || tags.length >= MAX_TAGS) return;
      setTags([...tags, trimmed]);
      setInputValue('');
    },
    [tags, setTags]
  );

  const removeTag = (value: string) => {
    setTags(tags.filter((t) => t !== value));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === 'Enter' || e.key === ',') && inputValue.trim()) {
      e.preventDefault();
      addTag(inputValue.trim());
    }
    if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
      removeTag(tags[tags.length - 1]);
    }
  };

  const filteredOptions = options.filter(
    (opt) =>
      !tags.includes(opt.value) &&
      opt.label.toLowerCase().includes(inputValue.toLowerCase())
  );

  const getLabelForValue = (value: string) => {
    const opt = options.find((o) => o.value === value);
    return opt ? opt.label : value;
  };

  return (
    <div className="relative">
      <div
        className="flex flex-wrap gap-1.5 min-h-[2.5rem] rounded-xl px-3 py-1.5 text-sm transition-colors focus-within:ring-2 focus-within:ring-offset-0"
        style={{
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.1)',
        }}
        onClick={() => inputRef.current?.focus()}
      >
        {tags.map((tag) => (
          <TagBadge key={tag} label={getLabelForValue(tag)} onRemove={() => removeTag(tag)} />
        ))}
        {tags.length < MAX_TAGS && (
          <input
            ref={inputRef}
            id={id}
            type="text"
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              setShowDropdown(true);
            }}
            onKeyDown={handleKeyDown}
            onFocus={() => setShowDropdown(true)}
            onBlur={() => {
              // Delay to allow dropdown click
              setTimeout(() => setShowDropdown(false), 200);
            }}
            placeholder={tags.length === 0 ? placeholder : `Add up to ${MAX_TAGS - tags.length} more...`}
            className="flex-1 min-w-[120px] bg-transparent outline-none text-white placeholder:text-slate-500 py-1"
          />
        )}
      </div>
      {tags.length >= MAX_TAGS && (
        <p className="text-[10px] mt-1" style={{ color: '#f59e0b' }}>
          Maximum {MAX_TAGS} tags reached
        </p>
      )}

      {/* Dropdown */}
      {showDropdown && filteredOptions.length > 0 && tags.length < MAX_TAGS && (
        <div
          className="absolute z-50 mt-1 w-full max-h-48 overflow-auto rounded-xl py-1 text-sm shadow-xl"
          style={{
            background: '#1a1a1a',
            border: '1px solid rgba(139,92,246,0.3)',
          }}
        >
          {filteredOptions.slice(0, 20).map((opt) => (
            <button
              key={opt.value}
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                addTag(opt.value);
              }}
              className="flex w-full items-center px-3 py-1.5 text-left transition-colors hover:bg-white/5 text-slate-300 hover:text-white"
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main SearchForm ───────────────────────────────────────────────────────
export function SearchForm({ onSearch, loading, disabled }: SearchFormProps) {
  const [industries, setIndustries] = useState<string[]>([]);
  const [locations, setLocations] = useState<string[]>([]);
  const [companySize, setCompanySize] = useState('');
  const [keywords, setKeywords] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSearch({
      industries: industries.length > 0 ? industries : undefined,
      locations: locations.length > 0 ? locations : undefined,
      companySize: companySize || undefined,
      keywords: keywords || undefined,
    });
  }

  const industryOptions = INDUSTRIES.map((ind) => ({ label: ind, value: ind }));

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
          {/* Industry — multi-tag */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500" htmlFor="industry">
              Industries <span className="text-slate-600 normal-case font-normal">(up to {MAX_TAGS})</span>
            </label>
            <TagInput
              id="industry"
              tags={industries}
              setTags={setIndustries}
              options={industryOptions}
              placeholder="Select or type industry..."
            />
          </div>

          {/* Location — multi-tag */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500" htmlFor="location">
              Locations <span className="text-slate-600 normal-case font-normal">(up to {MAX_TAGS})</span>
            </label>
            <TagInput
              id="location"
              tags={locations}
              setTags={setLocations}
              options={ALL_LOCATIONS}
              placeholder="Select or type location..."
              grouped
            />
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
              className={`${selectClassName} font-heading uppercase tracking-wider text-xs cursor-pointer transition-all duration-200 hover:border-[#FFB800]/50 focus:ring-1 focus:ring-[#FFB800]/30 outline-none`}
              style={{
                background: 'rgba(255,255,255,0.03)',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(255,255,255,0.08)',
                color: '#ffffff',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                appearance: 'none',
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23FFB800'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 1rem center',
                backgroundSize: '1em',
              }}
            >
              {COMPANY_SIZES.map((size) => (
                <option
                  key={size.value}
                  value={size.value}
                  style={{ background: '#111111', color: '#ffffff' }}
                >
                  {size.label.toUpperCase()}
                </option>
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
          className="w-full btn-shimmer btn-primary-hover font-black border-0 shadow-[0_0_20px_rgba(255,184,0,0.25)]"
          size="lg"
          disabled={loading || disabled}
          style={{ background: '#FFB800', color: '#0a0a0a', minHeight: '48px' }}
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
