'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, Loader2 } from 'lucide-react';

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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Search className="h-5 w-5 text-primary" />
          Search Leads
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground" htmlFor="industry">
                Industry
              </label>
              <Input
                id="industry"
                placeholder="e.g. Technology, Healthcare"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground" htmlFor="location">
                Location
              </label>
              <Input
                id="location"
                placeholder="e.g. New York, San Francisco"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground" htmlFor="companySize">
                Company Size
              </label>
              <Input
                id="companySize"
                placeholder="e.g. 1-10, 51-200, 500+"
                value={companySize}
                onChange={(e) => setCompanySize(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground" htmlFor="keywords">
                Keywords
              </label>
              <Input
                id="keywords"
                placeholder="e.g. SaaS, AI, B2B"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
              />
            </div>
          </div>
          <Button type="submit" className="w-full" size="lg" disabled={loading || disabled}>
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Searching...
              </>
            ) : (
              <>
                <Search className="h-4 w-4" />
                Search Leads (1 token)
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
