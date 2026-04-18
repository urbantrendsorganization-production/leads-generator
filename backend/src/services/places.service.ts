// Google Places API v1 (New) — Text Search
// https://developers.google.com/maps/documentation/places/web-service/text-search
//
// Used to find real local businesses (restaurants, salons, gyms, etc.) by
// type + location, then score them by website presence as outreach opportunities.

const PLACES_URL = 'https://places.googleapis.com/v1/places:searchText';

// Fields we request from the API (controls billing cost)
const FIELD_MASK = [
  'places.id',
  'places.displayName',
  'places.formattedAddress',
  'places.nationalPhoneNumber',
  'places.internationalPhoneNumber',
  'places.websiteUri',
  'places.rating',
  'places.userRatingCount',
  'places.googleMapsUri',
  'places.primaryTypeDisplayName',
  'places.businessStatus',
  'places.regularOpeningHours',
].join(',');

interface PlacesApiResult {
  id: string;
  displayName?: { text: string };
  formattedAddress?: string;
  nationalPhoneNumber?: string;
  internationalPhoneNumber?: string;
  websiteUri?: string;
  rating?: number;
  userRatingCount?: number;
  googleMapsUri?: string;
  primaryTypeDisplayName?: { text: string };
  businessStatus?: string;
}

export interface LocalLead {
  placeId: string;
  businessName: string;
  category: string;
  address: string;
  phone: string;
  website: string | null;
  rating: number | null;
  reviewCount: number | null;
  googleMapsUrl: string;
  // Pre-built outreach search links for Instagram & Facebook
  instagramSearchUrl: string;
  facebookSearchUrl: string;
  googleSearchUrl: string;
  hasWebsite: boolean;
  websiteType: 'none' | 'social' | 'proper';
  // Opportunity score — used for sorting and badge display
  opportunity: 'high' | 'medium' | 'low';
  opportunityReason: string;
}

/**
 * Classify a website URL to determine outreach opportunity.
 * - No website → "high"  (immediate web/marketing pitch)
 * - Only social link (fb/ig/linktree) → "medium" (upgrade from social-only)
 * - Proper website → "low" (they're already online)
 */
function classifyWebsite(websiteUri?: string): {
  hasWebsite: boolean;
  websiteType: 'none' | 'social' | 'proper';
  opportunity: 'high' | 'medium' | 'low';
  opportunityReason: string;
} {
  if (!websiteUri) {
    return {
      hasWebsite: false,
      websiteType: 'none',
      opportunity: 'high',
      opportunityReason: 'No website — perfect pitch for web design or digital marketing',
    };
  }
  const url = websiteUri.toLowerCase();
  const isSocialOnly =
    url.includes('facebook.com') ||
    url.includes('instagram.com') ||
    url.includes('twitter.com') ||
    url.includes('x.com') ||
    url.includes('linktr.ee') ||
    url.includes('linktree.com') ||
    url.includes('beacons.ai');
  if (isSocialOnly) {
    return {
      hasWebsite: true,
      websiteType: 'social',
      opportunity: 'medium',
      opportunityReason: 'Using social page as website — strong candidate for a proper site',
    };
  }
  return {
    hasWebsite: true,
    websiteType: 'proper',
    opportunity: 'low',
    opportunityReason: 'Has a website — lower priority unless offering other services',
  };
}

export function isPlacesConfigured(): boolean {
  const key = process.env.GOOGLE_PLACES_API_KEY;
  return !!(key && key !== 'your_google_places_api_key_here');
}

/**
 * Search for local businesses using Google Places Text Search.
 *
 * @param businessType  e.g. "restaurants", "hair salons", "gyms"
 * @param location      e.g. "Madrid, Spain", "Lagos, Nigeria"
 * @param opportunityFilter  'all' | 'no-website' | 'no-or-social'
 * @param maxResults    1–20 (Google Places cap per request)
 */
export async function searchLocalBusinesses(
  businessType: string,
  location: string,
  opportunityFilter: 'all' | 'no-website' | 'no-or-social' = 'all',
  maxResults = 20
): Promise<LocalLead[]> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey || apiKey === 'your_google_places_api_key_here') {
    throw new Error(
      'Google Places API key is not configured. Set GOOGLE_PLACES_API_KEY in your .env file.'
    );
  }

  const textQuery = `${businessType} in ${location}`;

  const response = await fetch(PLACES_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': apiKey,
      'X-Goog-FieldMask': FIELD_MASK,
    },
    body: JSON.stringify({
      textQuery,
      maxResultCount: Math.min(maxResults, 20),
      languageCode: 'en',
    }),
    signal: AbortSignal.timeout(12_000),
  });

  if (!response.ok) {
    const errBody = await response.json().catch(() => ({})) as any;
    throw new Error(
      errBody?.error?.message || `Google Places API returned HTTP ${response.status}`
    );
  }

  const data = (await response.json()) as { places?: PlacesApiResult[] };
  const places = (data.places || []).filter(
    (p) => p.businessStatus !== 'CLOSED_PERMANENTLY'
  );

  const leads: LocalLead[] = places.map((p) => {
    const name = p.displayName?.text || 'Unknown Business';
    const { hasWebsite, websiteType, opportunity, opportunityReason } = classifyWebsite(p.websiteUri);

    const encodedName = encodeURIComponent(`"${name}"`);
    const encodedLocation = encodeURIComponent(location);
    const encodedQuery = encodeURIComponent(`${name} ${location}`);

    return {
      placeId: p.id,
      businessName: name,
      category: p.primaryTypeDisplayName?.text || businessType,
      address: p.formattedAddress || '',
      phone: p.internationalPhoneNumber || p.nationalPhoneNumber || '',
      website: p.websiteUri || null,
      rating: p.rating ?? null,
      reviewCount: p.userRatingCount ?? null,
      googleMapsUrl:
        p.googleMapsUri ||
        `https://www.google.com/maps/search/?api=1&query=${encodedQuery}`,
      instagramSearchUrl: `https://www.google.com/search?q=site%3Ainstagram.com+${encodedName}+${encodedLocation}`,
      facebookSearchUrl: `https://www.facebook.com/search/places/?q=${encodeURIComponent(`${name} ${location}`)}`,
      googleSearchUrl: `https://www.google.com/search?q=${encodedQuery}`,
      hasWebsite,
      websiteType,
      opportunity,
      opportunityReason,
    };
  });

  // Apply filter
  if (opportunityFilter === 'no-website') {
    return leads.filter((l) => l.websiteType === 'none');
  }
  if (opportunityFilter === 'no-or-social') {
    return leads.filter((l) => l.websiteType !== 'proper');
  }

  // Default: sort by opportunity (high → medium → low)
  const order = { high: 0, medium: 1, low: 2 };
  return leads.sort((a, b) => order[a.opportunity] - order[b.opportunity]);
}
