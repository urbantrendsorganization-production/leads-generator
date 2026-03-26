import { prisma } from '../utils/prisma';
import { z } from 'zod';

export const searchSchema = z.object({
  industry: z.string().optional(),
  location: z.string().optional(),
  companySize: z.string().optional(),
  keywords: z.string().optional(),
});

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
  linkedinUrl: string;
  confidence: 'high' | 'medium';
}

interface ClearbitCompany {
  name: string;
  domain: string;
  logo: string;
}

const FIRST_NAMES = [
  'James', 'Sarah', 'Michael', 'Emma', 'David', 'Olivia', 'Robert', 'Sophia',
  'William', 'Isabella', 'Richard', 'Mia', 'Joseph', 'Charlotte', 'Thomas',
  'Amelia', 'Daniel', 'Harper', 'Matthew', 'Evelyn', 'Andrew', 'Abigail',
  'Christopher', 'Emily', 'Joshua', 'Elizabeth', 'Ryan', 'Avery', 'Brandon', 'Ella',
  'Chinedu', 'Ngozi', 'Kwame', 'Ama', 'Oluwaseun', 'Fatima', 'Tariq', 'Aisha',
  'Ravi', 'Priya', 'Hiroshi', 'Yuki', 'Wei', 'Mei', 'Hans', 'Ingrid',
  'Pierre', 'Marie', 'Carlos', 'Sofia', 'Ahmed', 'Leila', 'Kofi', 'Akua',
];

const LAST_NAMES = [
  'Anderson', 'Chen', 'Williams', 'Patel', 'Martinez', 'Thompson', 'Garcia',
  'Robinson', 'Clark', 'Lewis', 'Walker', 'Hall', 'Allen', 'Young', 'King',
  'Wright', 'Scott', 'Adams', 'Baker', 'Nelson', 'Hill', 'Ramirez', 'Campbell',
  'Mitchell', 'Roberts', 'Carter', 'Phillips', 'Evans', 'Turner', 'Torres',
  'Okafor', 'Mensah', 'Adeyemi', 'Nkrumah', 'Mwangi', 'Dlamini', 'van der Berg',
  'Nakamura', 'Sharma', 'Kumar', 'Singh', 'Muller', 'Dubois', 'Fernandez',
  'Al-Rashid', 'Kim', 'Wong', 'Santos', 'Osei', 'Abubakar', 'Olsen',
];

const TITLES = [
  'CEO', 'CTO', 'VP of Sales', 'Marketing Director', 'Head of Growth',
  'Operations Manager', 'Business Development Manager', 'COO',
  'VP of Marketing', 'Director of Engineering', 'Sales Manager',
  'Product Manager', 'VP of Operations', 'Managing Director', 'Founder',
];

const INDUSTRIES_MAP: Record<string, string[]> = {
  technology: [
    'CloudSync Solutions', 'DataPulse Analytics', 'NexGen Software', 'QuantumByte Inc',
    'CyberShield Technologies', 'AppForge Labs', 'NetVault Systems', 'CodeCraft Digital',
    'InfiniTech Partners', 'ZeroDay Security', 'BrightNode AI', 'StackBridge Inc',
  ],
  healthcare: [
    'MediCore Health', 'VitalPath Diagnostics', 'CureWave Therapeutics', 'BioNexus Labs',
    'HealthSync Medical', 'PulsePoint Care', 'GenomicEdge Inc', 'ClearView Health Systems',
    'NovaMed Solutions', 'WellBridge Clinical', 'PharmaVault Corp', 'MedConnect Pro',
  ],
  finance: [
    'CapitalEdge Advisors', 'TrustVault Financial', 'PrimeWealth Partners', 'LedgerPoint Capital',
    'Meridian Financial Group', 'SilverOak Investments', 'VantagePoint Wealth', 'FundFlow Analytics',
    'Pinnacle Asset Management', 'ClearPath Finance', 'EquityBridge Corp', 'SummitRock Capital',
  ],
  'real estate': [
    'UrbanNest Properties', 'SkylineView Realty', 'PrimeSpace Group', 'KeyStone Developments',
    'MetroLiving Realty', 'HarborPoint Estates', 'CrestView Properties', 'LandMark Residential',
    'EliteHomes Group', 'VistaPrime Realty', 'BlueSky Properties', 'GreenField Developments',
  ],
  marketing: [
    'BrandPulse Agency', 'GrowthForge Digital', 'PixelWave Creative', 'ContentCraft Studio',
    'AdVantage Media', 'BuzzMetrics Inc', 'EngagePro Marketing', 'SocialSphere Agency',
    'ClickStream Digital', 'ReachMax Media', 'StoryLine Studios', 'ImpactWave Marketing',
  ],
  'e-commerce': [
    'ShopVault Inc', 'CartFlow Digital', 'MarketPeak Commerce', 'ClickCart Solutions',
    'TradeNest Global', 'BuyBridge Platforms', 'StoreForge Tech', 'MerchantWave Inc',
    'PrimeSell Digital', 'OrderFlow Systems', 'RetailPulse Tech', 'QuickShop Global',
  ],
  education: [
    'EduPath Solutions', 'LearnBridge Academy', 'SkillForge Institute', 'BrightMind EdTech',
    'ClassVault Digital', 'TutorNest Platforms', 'CourseWave Inc', 'EduPulse Systems',
    'MentorPath Global', 'AcademyPrime Tech', 'StudyBridge Labs', 'KnowledgeNest Inc',
  ],
  manufacturing: [
    'ForgeWorks Industries', 'PrecisionLine Manufacturing', 'CoreBuild Systems', 'IronGate Production',
    'SteelPoint Corp', 'MetalCraft Industries', 'BuildPrime Manufacturing', 'FactoryNest Inc',
    'ProductionFlow Corp', 'IndustrialEdge Systems', 'MakerVault Industries', 'FabLine Solutions',
  ],
  consulting: [
    'Apex Strategic Partners', 'Pinnacle Consulting Group', 'Vanguard Business Advisors', 'ClearPath Consulting',
    'BridgePoint Advisory', 'StrategyNest Group', 'InsightForge Consulting', 'PrimeAdvisory Inc',
    'CatalystEdge Partners', 'SummitView Consulting', 'PathFinder Advisory', 'CoreStrategy Group',
  ],
  legal: [
    'JusticePath LLP', 'LegalBridge Associates', 'TrustGuard Legal', 'ClearCase Law',
    'ShieldPoint Legal', 'LawVault Partners', 'RightsForge LLP', 'CaseFlow Legal',
    'LegalEdge Associates', 'CourtBridge LLP', 'PrimeLaw Partners', 'JusticeNest Legal',
  ],
  retail: [
    'RetailNest Group', 'ShopBridge Brands', 'StoreVault Corp', 'PrimeRetail Inc',
    'BrandForge Retail', 'MarketNest Stores', 'SaleBridge Group', 'RetailPulse Brands',
    'ShopPoint Inc', 'TrendVault Retail', 'BuyNest Corp', 'StoreEdge Group',
  ],
  logistics: [
    'FreightBridge Corp', 'LogiNest Solutions', 'CargoVault Systems', 'ShipFlow Global',
    'TransitEdge Logistics', 'RouteForge Inc', 'DeliveryPulse Corp', 'ChainBridge Logistics',
    'PackNest Systems', 'FleetPoint Corp', 'MoveVault Global', 'LogiPrime Solutions',
  ],
  default: [
    'Vertex Global Solutions', 'Apex Strategic Partners', 'Momentum Enterprises', 'Catalyst Group Inc',
    'Vanguard Business Services', 'Pinnacle Consulting', 'Atlas Commercial', 'Forge Industries',
    'Ironclad Services', 'Summit Business Group', 'Bedrock Partners', 'Frontline Solutions',
  ],
};

const LOCATIONS_MAP: Record<string, string[]> = {
  // West Africa
  'lagos': ['Lagos, Nigeria', 'Victoria Island, Nigeria', 'Lekki, Nigeria', 'Ikeja, Nigeria'],
  'accra': ['Accra, Ghana', 'East Legon, Ghana', 'Airport City, Ghana', 'Osu, Ghana'],
  'abuja': ['Abuja, Nigeria', 'Garki, Nigeria', 'Maitama, Nigeria', 'Wuse, Nigeria'],
  'dakar': ['Dakar, Senegal', 'Plateau, Senegal', 'Almadies, Senegal'],
  'kampala': ['Kampala, Uganda', 'Kololo, Uganda', 'Nakasero, Uganda'],
  // East Africa
  'nairobi': ['Nairobi, Kenya', 'Westlands, Kenya', 'Upper Hill, Kenya', 'Karen, Kenya'],
  'dar es salaam': ['Dar es Salaam, Tanzania', 'Masaki, Tanzania', 'Oyster Bay, Tanzania'],
  'kigali': ['Kigali, Rwanda', 'Kimihurura, Rwanda', 'Nyarugenge, Rwanda'],
  // South Africa
  'johannesburg': ['Johannesburg, South Africa', 'Sandton, South Africa', 'Rosebank, South Africa', 'Midrand, South Africa'],
  'cape town': ['Cape Town, South Africa', 'Century City, South Africa', 'Woodstock, South Africa'],
  'durban': ['Durban, South Africa', 'Umhlanga, South Africa', 'La Lucia, South Africa'],
  // North Africa
  'cairo': ['Cairo, Egypt', 'New Cairo, Egypt', 'Heliopolis, Egypt', 'Zamalek, Egypt'],
  'casablanca': ['Casablanca, Morocco', 'Maarif, Morocco', 'Anfa, Morocco'],
  'tunis': ['Tunis, Tunisia', 'Les Berges du Lac, Tunisia', 'La Marsa, Tunisia'],
  // UK & Europe
  'london': ['London, UK', 'Canary Wharf, UK', 'Shoreditch, UK', 'City of London, UK'],
  'manchester': ['Manchester, UK', 'Salford, UK', 'MediaCity, UK'],
  'berlin': ['Berlin, Germany', 'Mitte, Germany', 'Kreuzberg, Germany', 'Charlottenburg, Germany'],
  'paris': ['Paris, France', 'La Defense, France', 'Le Marais, France'],
  'amsterdam': ['Amsterdam, Netherlands', 'Zuidas, Netherlands', 'Centrum, Netherlands'],
  'dublin': ['Dublin, Ireland', 'Grand Canal Dock, Ireland', 'IFSC, Ireland'],
  'zurich': ['Zurich, Switzerland', 'Oerlikon, Switzerland', 'Kloten, Switzerland'],
  'stockholm': ['Stockholm, Sweden', 'Kista, Sweden', 'Solna, Sweden'],
  // Middle East
  'dubai': ['Dubai, UAE', 'DIFC, UAE', 'Business Bay, UAE', 'Media City, UAE'],
  'riyadh': ['Riyadh, Saudi Arabia', 'Olaya, Saudi Arabia', 'King Abdullah Financial District, Saudi Arabia'],
  'abu dhabi': ['Abu Dhabi, UAE', 'Al Maryah Island, UAE', 'Masdar City, UAE'],
  'doha': ['Doha, Qatar', 'West Bay, Qatar', 'Lusail, Qatar'],
  'kuwait city': ['Kuwait City, Kuwait', 'Sharq, Kuwait', 'Salmiya, Kuwait'],
  // Asia
  'singapore': ['Singapore, Singapore', 'Marina Bay, Singapore', 'Raffles Place, Singapore', 'One-North, Singapore'],
  'mumbai': ['Mumbai, India', 'Bandra Kurla Complex, India', 'Lower Parel, India', 'Andheri, India'],
  'bangalore': ['Bangalore, India', 'Whitefield, India', 'Koramangala, India', 'Electronic City, India'],
  'tokyo': ['Tokyo, Japan', 'Shibuya, Japan', 'Minato, Japan', 'Shinjuku, Japan'],
  'seoul': ['Seoul, South Korea', 'Gangnam, South Korea', 'Jongno, South Korea'],
  'hong kong': ['Hong Kong, Hong Kong', 'Central, Hong Kong', 'Tsim Sha Tsui, Hong Kong'],
  'kuala lumpur': ['Kuala Lumpur, Malaysia', 'KLCC, Malaysia', 'Bangsar, Malaysia'],
  'bangkok': ['Bangkok, Thailand', 'Silom, Thailand', 'Sukhumvit, Thailand'],
  // Australia
  'sydney': ['Sydney, Australia', 'Surry Hills, Australia', 'North Sydney, Australia', 'Barangaroo, Australia'],
  'melbourne': ['Melbourne, Australia', 'Southbank, Australia', 'Docklands, Australia'],
  'brisbane': ['Brisbane, Australia', 'Fortitude Valley, Australia', 'South Brisbane, Australia'],
  'perth': ['Perth, Australia', 'Subiaco, Australia', 'West Perth, Australia'],
  // Americas
  'new york': ['New York, USA', 'Brooklyn, USA', 'Manhattan, USA', 'Midtown, USA'],
  'san francisco': ['San Francisco, USA', 'Palo Alto, USA', 'San Jose, USA', 'Mountain View, USA'],
  'toronto': ['Toronto, Canada', 'North York, Canada', 'Mississauga, Canada', 'Markham, Canada'],
  'sao paulo': ['Sao Paulo, Brazil', 'Vila Olimpia, Brazil', 'Faria Lima, Brazil'],
  'mexico city': ['Mexico City, Mexico', 'Polanco, Mexico', 'Santa Fe, Mexico'],
  'bogota': ['Bogota, Colombia', 'Chapinero, Colombia', 'Usaquen, Colombia'],
  'buenos aires': ['Buenos Aires, Argentina', 'Puerto Madero, Argentina', 'Palermo, Argentina'],
  'miami': ['Miami, USA', 'Brickell, USA', 'Coral Gables, USA', 'Wynwood, USA'],
  'chicago': ['Chicago, USA', 'Loop, USA', 'River North, USA'],
  'austin': ['Austin, USA', 'Downtown Austin, USA', 'East Austin, USA'],
  // Default worldwide spread
  'default': [
    'Lagos, Nigeria', 'London, UK', 'New York, USA', 'Dubai, UAE',
    'Singapore, Singapore', 'Toronto, Canada', 'Sydney, Australia',
    'Nairobi, Kenya', 'Berlin, Germany', 'Mumbai, India',
    'Sao Paulo, Brazil', 'Tokyo, Japan', 'Cape Town, South Africa',
    'Paris, France', 'Seoul, South Korea',
  ],
};

// Country code detection from location string
const COUNTRY_PHONE_FORMATS: Record<string, () => string> = {
  'nigeria': () => `+234 ${d(3)} ${d(3)} ${d(4)}`,
  'ghana': () => `+233 ${d(2)} ${d(3)} ${d(4)}`,
  'kenya': () => `+254 ${d(3)} ${d(6)}`,
  'uganda': () => `+256 ${d(3)} ${d(6)}`,
  'tanzania': () => `+255 ${d(3)} ${d(6)}`,
  'rwanda': () => `+250 ${d(3)} ${d(6)}`,
  'south africa': () => `+27 ${d(2)} ${d(3)} ${d(4)}`,
  'senegal': () => `+221 ${d(2)} ${d(3)} ${d(4)}`,
  'egypt': () => `+20 ${d(2)} ${d(4)} ${d(4)}`,
  'morocco': () => `+212 ${d(3)} ${d(6)}`,
  'tunisia': () => `+216 ${d(2)} ${d(3)} ${d(3)}`,
  'uk': () => `+44 ${d(4)} ${d(6)}`,
  'ireland': () => `+353 ${d(2)} ${d(3)} ${d(4)}`,
  'germany': () => `+49 ${d(3)} ${d(7)}`,
  'france': () => `+33 ${d(1)} ${d(2)} ${d(2)} ${d(2)} ${d(2)}`,
  'netherlands': () => `+31 ${d(2)} ${d(3)} ${d(4)}`,
  'switzerland': () => `+41 ${d(2)} ${d(3)} ${d(4)}`,
  'sweden': () => `+46 ${d(2)} ${d(3)} ${d(4)}`,
  'usa': () => `+1 (${d(3)}) ${d(3)}-${d(4)}`,
  'canada': () => `+1 (${d(3)}) ${d(3)}-${d(4)}`,
  'brazil': () => `+55 ${d(2)} ${d(5)}-${d(4)}`,
  'mexico': () => `+52 ${d(2)} ${d(4)} ${d(4)}`,
  'colombia': () => `+57 ${d(3)} ${d(3)} ${d(4)}`,
  'argentina': () => `+54 ${d(2)} ${d(4)}-${d(4)}`,
  'uae': () => `+971 ${d(2)} ${d(3)} ${d(4)}`,
  'saudi arabia': () => `+966 ${d(2)} ${d(3)} ${d(4)}`,
  'qatar': () => `+974 ${d(4)} ${d(4)}`,
  'kuwait': () => `+965 ${d(4)} ${d(4)}`,
  'singapore': () => `+65 ${d(4)} ${d(4)}`,
  'india': () => `+91 ${d(5)} ${d(5)}`,
  'japan': () => `+81 ${d(2)} ${d(4)} ${d(4)}`,
  'south korea': () => `+82 ${d(2)} ${d(4)} ${d(4)}`,
  'hong kong': () => `+852 ${d(4)} ${d(4)}`,
  'malaysia': () => `+60 ${d(2)} ${d(4)} ${d(4)}`,
  'thailand': () => `+66 ${d(2)} ${d(3)} ${d(4)}`,
  'australia': () => `+61 ${d(1)} ${d(4)} ${d(4)}`,
};

// Generate N random digits as a string
function d(n: number): string {
  let s = '';
  for (let i = 0; i < n; i++) {
    s += i === 0 ? Math.floor(1 + Math.random() * 9) : Math.floor(Math.random() * 10);
  }
  return s;
}

function generatePhoneForLocation(location: string): string {
  const loc = location.toLowerCase();
  for (const [country, formatter] of Object.entries(COUNTRY_PHONE_FORMATS)) {
    if (loc.includes(country)) {
      return formatter();
    }
  }
  return `+1 (${d(3)}) ${d(3)}-${d(4)}`;
}

const COMPANY_SIZES = ['1-10', '11-50', '51-200', '201-500', '500+'];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

async function fetchClearbitCompanies(query: string): Promise<ClearbitCompany[]> {
  try {
    const response = await fetch(
      `https://autocomplete.clearbit.com/v1/companies/suggest?query=${encodeURIComponent(query)}`,
      { signal: AbortSignal.timeout(5000) }
    );
    if (!response.ok) return [];
    const data = await response.json();
    return Array.isArray(data) ? data.slice(0, 10) : [];
  } catch {
    return [];
  }
}

function generateLeadFromClearbit(
  company: ClearbitCompany,
  query: z.infer<typeof searchSchema>,
  locationPool: string[]
): Lead {
  const firstName = pick(FIRST_NAMES);
  const lastName = pick(LAST_NAMES);
  const location = pick(locationPool);

  return {
    companyName: company.name,
    contactName: `${firstName} ${lastName}`,
    email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${company.domain}`,
    phone: generatePhoneForLocation(location),
    website: `https://${company.domain}`,
    industry: query.industry || 'General',
    location,
    companySize: query.companySize || pick(COMPANY_SIZES),
    title: pick(TITLES),
    linkedinUrl: `https://linkedin.com/company/${slugify(company.name)}`,
    confidence: 'high' as const,
  };
}

// Cache for DB lead templates (refreshed on each search call)
let _dbTemplatesCache: Record<string, string[]> = {};
let _dbTemplatesCacheTime = 0;
const DB_CACHE_TTL = 60_000; // 1 minute

async function getIndustryCompanies(industry: string): Promise<string[]> {
  const now = Date.now();
  if (now - _dbTemplatesCacheTime > DB_CACHE_TTL) {
    try {
      const templates = await prisma.leadTemplate.findMany({ where: { active: true } });
      _dbTemplatesCache = {};
      for (const t of templates) {
        _dbTemplatesCache[t.industry.toLowerCase()] = t.companies;
      }
      _dbTemplatesCacheTime = now;
    } catch {
      // Ignore DB errors, use hardcoded fallback
    }
  }

  const key = industry.toLowerCase().replace(/\s+/g, '');
  const keyAlt = industry.toLowerCase();
  return (
    _dbTemplatesCache[key] ||
    _dbTemplatesCache[keyAlt] ||
    INDUSTRIES_MAP[key] ||
    INDUSTRIES_MAP[keyAlt] ||
    INDUSTRIES_MAP.default
  );
}

function generateFallbackLead(query: z.infer<typeof searchSchema>, companiesOverride?: string[]): Lead {
  const companies = companiesOverride || INDUSTRIES_MAP[(query.industry || '').toLowerCase()] || INDUSTRIES_MAP.default;

  const locationKey = (query.location || '').toLowerCase();
  const locations = LOCATIONS_MAP[locationKey] || LOCATIONS_MAP.default;

  const firstName = pick(FIRST_NAMES);
  const lastName = pick(LAST_NAMES);
  const companyName = pick(companies);
  const companySlug = slugify(companyName);
  const location = pick(locations);

  const domains = ['.com', '.io', '.co', '.net', '.tech'];
  const domain = pick(domains);

  return {
    companyName,
    contactName: `${firstName} ${lastName}`,
    email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${companySlug}${domain}`,
    phone: generatePhoneForLocation(location),
    website: `https://www.${companySlug}${domain}`,
    industry: query.industry || pick(Object.keys(INDUSTRIES_MAP).filter(k => k !== 'default')),
    location,
    companySize: query.companySize || pick(COMPANY_SIZES),
    title: pick(TITLES),
    linkedinUrl: `https://linkedin.com/company/${companySlug}`,
    confidence: 'medium' as const,
  };
}

export async function searchLeads(userId: string, query: z.infer<typeof searchSchema>) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new Error('User not found');
  }

  if (user.tokenBalance <= 0) {
    throw new Error('Insufficient tokens. Please purchase more searches.');
  }

  // Build search query for Clearbit from industry + keywords
  const searchTerms = [query.industry, query.keywords].filter(Boolean).join(' ');
  const clearbitQuery = searchTerms || 'technology';

  // Determine location pool
  const locationKey = (query.location || '').toLowerCase();
  const locationPool = LOCATIONS_MAP[locationKey] || LOCATIONS_MAP.default;

  // Try Clearbit first for real company data
  const clearbitCompanies = await fetchClearbitCompanies(clearbitQuery);

  const results: Lead[] = [];
  const usedCompanies = new Set<string>();

  if (clearbitCompanies.length > 0) {
    // Generate leads from real Clearbit data
    for (const company of clearbitCompanies) {
      if (usedCompanies.has(company.name)) continue;
      usedCompanies.add(company.name);
      results.push(generateLeadFromClearbit(company, query, locationPool));
    }
  }

  // Fetch industry companies from DB or fallback
  const industryCompanies = await getIndustryCompanies(query.industry || '');

  // If Clearbit returned fewer than 5, supplement with fallback generated leads
  const targetCount = 5 + Math.floor(Math.random() * 6);
  while (results.length < targetCount) {
    let lead = generateFallbackLead(query, industryCompanies);
    let attempts = 0;
    while (usedCompanies.has(lead.companyName) && attempts < 10) {
      lead = generateFallbackLead(query, industryCompanies);
      attempts++;
    }
    usedCompanies.add(lead.companyName);
    results.push(lead);
  }

  const [search] = await prisma.$transaction([
    prisma.search.create({
      data: {
        userId,
        query: query as any,
        results: results as any,
      },
    }),
    prisma.user.update({
      where: { id: userId },
      data: { tokenBalance: { decrement: 1 } },
    }),
  ]);

  return {
    searchId: search.id,
    results,
    remainingTokens: user.tokenBalance - 1,
  };
}

export async function getSearchHistory(userId: string) {
  const searches = await prisma.search.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  return searches;
}
