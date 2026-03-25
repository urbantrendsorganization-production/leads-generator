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
}

const FIRST_NAMES = [
  'James', 'Sarah', 'Michael', 'Emma', 'David', 'Olivia', 'Robert', 'Sophia',
  'William', 'Isabella', 'Richard', 'Mia', 'Joseph', 'Charlotte', 'Thomas',
  'Amelia', 'Daniel', 'Harper', 'Matthew', 'Evelyn', 'Andrew', 'Abigail',
  'Christopher', 'Emily', 'Joshua', 'Elizabeth', 'Ryan', 'Avery', 'Brandon', 'Ella',
];

const LAST_NAMES = [
  'Anderson', 'Chen', 'Williams', 'Patel', 'Martinez', 'Thompson', 'Garcia',
  'Robinson', 'Clark', 'Lewis', 'Walker', 'Hall', 'Allen', 'Young', 'King',
  'Wright', 'Scott', 'Adams', 'Baker', 'Nelson', 'Hill', 'Ramirez', 'Campbell',
  'Mitchell', 'Roberts', 'Carter', 'Phillips', 'Evans', 'Turner', 'Torres',
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
  realestate: [
    'UrbanNest Properties', 'SkylineView Realty', 'PrimeSpace Group', 'KeyStone Developments',
    'MetroLiving Realty', 'HarborPoint Estates', 'CrestView Properties', 'LandMark Residential',
    'EliteHomes Group', 'VistaPrime Realty', 'BlueSky Properties', 'GreenField Developments',
  ],
  marketing: [
    'BrandPulse Agency', 'GrowthForge Digital', 'PixelWave Creative', 'ContentCraft Studio',
    'AdVantage Media', 'BuzzMetrics Inc', 'EngagePro Marketing', 'SocialSphere Agency',
    'ClickStream Digital', 'ReachMax Media', 'StoryLine Studios', 'ImpactWave Marketing',
  ],
  default: [
    'Vertex Global Solutions', 'Apex Strategic Partners', 'Momentum Enterprises', 'Catalyst Group Inc',
    'Vanguard Business Services', 'Pinnacle Consulting', 'Atlas Commercial', 'Forge Industries',
    'Ironclad Services', 'Summit Business Group', 'Bedrock Partners', 'Frontline Solutions',
  ],
};

const LOCATIONS_MAP: Record<string, string[]> = {
  'new york': ['New York, NY', 'Brooklyn, NY', 'Manhattan, NY', 'Queens, NY'],
  'los angeles': ['Los Angeles, CA', 'Santa Monica, CA', 'Beverly Hills, CA', 'Pasadena, CA'],
  'chicago': ['Chicago, IL', 'Evanston, IL', 'Naperville, IL', 'Schaumburg, IL'],
  'san francisco': ['San Francisco, CA', 'Oakland, CA', 'Palo Alto, CA', 'San Jose, CA'],
  'miami': ['Miami, FL', 'Fort Lauderdale, FL', 'Coral Gables, FL', 'Boca Raton, FL'],
  'london': ['London, UK', 'Westminster, UK', 'Camden, UK', 'Greenwich, UK'],
  'default': ['Austin, TX', 'Denver, CO', 'Seattle, WA', 'Boston, MA', 'Atlanta, GA', 'Portland, OR', 'Nashville, TN', 'Charlotte, NC'],
};

const COMPANY_SIZES = ['1-10', '11-50', '51-200', '201-500', '500+'];

const DOMAINS = ['.com', '.io', '.co', '.net', '.tech'];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateLead(query: z.infer<typeof searchSchema>): Lead {
  const industryKey = (query.industry || '').toLowerCase().replace(/\s+/g, '');
  const companies = INDUSTRIES_MAP[industryKey] || INDUSTRIES_MAP.default;

  const locationKey = (query.location || '').toLowerCase();
  const locations = LOCATIONS_MAP[locationKey] || LOCATIONS_MAP.default;

  const firstName = pick(FIRST_NAMES);
  const lastName = pick(LAST_NAMES);
  const companyName = pick(companies);
  const companySlug = companyName.toLowerCase().replace(/[^a-z0-9]/g, '');
  const domain = pick(DOMAINS);

  return {
    companyName,
    contactName: `${firstName} ${lastName}`,
    email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${companySlug}${domain}`,
    phone: `+1 (${Math.floor(200 + Math.random() * 800)}) ${Math.floor(200 + Math.random() * 800)}-${Math.floor(1000 + Math.random() * 9000)}`,
    website: `https://www.${companySlug}${domain}`,
    industry: query.industry || pick(Object.keys(INDUSTRIES_MAP).filter(k => k !== 'default')),
    location: pick(locations),
    companySize: query.companySize || pick(COMPANY_SIZES),
    title: pick(TITLES),
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

  const resultCount = 5 + Math.floor(Math.random() * 6);
  const results: Lead[] = [];
  const usedCompanies = new Set<string>();

  for (let i = 0; i < resultCount; i++) {
    let lead = generateLead(query);
    let attempts = 0;
    while (usedCompanies.has(lead.companyName) && attempts < 10) {
      lead = generateLead(query);
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
