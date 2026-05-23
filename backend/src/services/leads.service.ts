import { prisma } from '../utils/prisma';
import { z } from 'zod';

const tagItem = z.string().max(80); // raised from 50 to support longer free-text industry names

export const searchSchema = z.object({
  industry: z.union([tagItem, z.array(tagItem).max(5)]).optional(),
  location: z.union([tagItem, z.array(tagItem).max(5)]).optional(),
  industries: z.array(tagItem.min(1)).max(5).optional(),
  locations: z.array(tagItem.min(1)).max(5).optional(),
  companySize: z.string().optional(),
  keywords: z.string().optional(),
  refineFilters: z.object({
    titles: z.array(z.string().max(80)).max(10).optional(),
    revenueMin: z.number().int().min(0).optional(),
    revenueMax: z.number().int().min(0).optional(),
    excludeCompanies: z.array(z.string().max(80)).max(20).optional(),
  }).optional(),
});

type RefineFilters = NonNullable<z.infer<typeof searchSchema>['refineFilters']>;

interface Lead {
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  whatsapp: string;
  website: string;
  industry: string;
  location: string;
  companySize: string;
  title: string;
  linkedinUrl: string;
  mapsUrl: string;
  confidence: 'high' | 'medium';
  source: 'clearbit+hunter' | 'clearbit' | 'generated';
}

interface ClearbitCompany {
  name: string;
  domain: string;
  logo: string;
}

interface HunterContact {
  email: string;
  firstName: string;
  lastName: string;
  title: string;
}

// ─── Name / Title data ─────────────────────────────────────────────────────────

const FIRST_NAMES = [
  'James', 'Sarah', 'Michael', 'Emma', 'David', 'Olivia', 'Robert', 'Sophia',
  'William', 'Isabella', 'Richard', 'Mia', 'Joseph', 'Charlotte', 'Thomas',
  'Amelia', 'Daniel', 'Harper', 'Matthew', 'Evelyn', 'Andrew', 'Abigail',
  'Christopher', 'Emily', 'Joshua', 'Elizabeth', 'Ryan', 'Avery', 'Brandon', 'Ella',
  'Chinedu', 'Ngozi', 'Kwame', 'Ama', 'Oluwaseun', 'Fatima', 'Tariq', 'Aisha',
  'Ravi', 'Priya', 'Hiroshi', 'Yuki', 'Wei', 'Mei', 'Hans', 'Ingrid',
  'Pierre', 'Marie', 'Carlos', 'Sofia', 'Ahmed', 'Leila', 'Kofi', 'Akua',
  'Viktor', 'Natalia', 'Marco', 'Elena', 'Alejandro', 'Isabella', 'Kenji', 'Sakura',
  'Liam', 'Zoe', 'Noah', 'Chloe', 'Ethan', 'Grace', 'Lucas', 'Hannah',
];

const LAST_NAMES = [
  'Anderson', 'Chen', 'Williams', 'Patel', 'Martinez', 'Thompson', 'Garcia',
  'Robinson', 'Clark', 'Lewis', 'Walker', 'Hall', 'Allen', 'Young', 'King',
  'Wright', 'Scott', 'Adams', 'Baker', 'Nelson', 'Hill', 'Ramirez', 'Campbell',
  'Mitchell', 'Roberts', 'Carter', 'Phillips', 'Evans', 'Turner', 'Torres',
  'Okafor', 'Mensah', 'Adeyemi', 'Nkrumah', 'Mwangi', 'Dlamini', 'van der Berg',
  'Nakamura', 'Sharma', 'Kumar', 'Singh', 'Muller', 'Dubois', 'Fernandez',
  'Al-Rashid', 'Kim', 'Wong', 'Santos', 'Osei', 'Abubakar', 'Olsen',
  'Rossi', 'Moretti', 'Kowalski', 'Nowak', 'Ivanov', 'Petrov', 'Tanaka', 'Watanabe',
  'Schmidt', 'Fischer', 'Weber', 'Meyer', 'Hoffmann', 'Papadopoulos', 'Diaz',
];

const TITLES = [
  'CEO', 'CTO', 'VP of Sales', 'Marketing Director', 'Head of Growth',
  'Operations Manager', 'Business Development Manager', 'COO',
  'VP of Marketing', 'Director of Engineering', 'Sales Manager',
  'Product Manager', 'VP of Operations', 'Managing Director', 'Founder',
  'Chief Revenue Officer', 'Head of Partnerships', 'Director of Business Development',
  'VP of Product', 'Head of Sales', 'Chief Marketing Officer', 'General Manager',
  'Regional Director', 'Country Manager', 'Director of Strategy',
];

// ─── Industry company data (27 categories) ────────────────────────────────────

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
  // ── NEW INDUSTRIES ─────────────────────────────────────────────────────────
  agriculture: [
    'AgriNest Solutions', 'CropBridge Technologies', 'HarvestForge Inc', 'GreenField Agri',
    'SoilVault Systems', 'FarmPulse Analytics', 'AgroEdge Partners', 'CultivateNest Corp',
    'GrainFlow Global', 'RootPath Agritech', 'FieldBridge Industries', 'SeedVault Farming',
  ],
  automotive: [
    'MotorNest Solutions', 'AutoEdge Technologies', 'DriveForge Corp', 'WheelBridge Group',
    'PrimeDrive Industries', 'CarVault Systems', 'EngineFlow Tech', 'AutoPulse Manufacturing',
    'RoadBridge Automotive', 'GearPath Solutions', 'AutoCraft Global', 'SpeedNest Vehicles',
  ],
  construction: [
    'BuildBridge Corp', 'StructureForge Inc', 'StoneVault Construction', 'IronPath Builders',
    'FrameNest Group', 'ConcretePulse Industries', 'SiteEdge Construction', 'CoreBuild Partners',
    'FoundationBridge Co', 'ArchNest Solutions', 'SteelPath Structures', 'BuildForce Inc',
  ],
  cybersecurity: [
    'ShieldForge Security', 'CipherNest Labs', 'ThreatBridge Analytics', 'VaultGuard Systems',
    'SecureEdge Technologies', 'CyberPulse Inc', 'FortNest Security', 'EncryptPath Solutions',
    'NullThreat Corp', 'GuardBridge Cyber', 'ZeroVault Security', 'ArmorEdge Technologies',
  ],
  'energy & utilities': [
    'PowerNest Solutions', 'EnergyBridge Corp', 'VoltForge Industries', 'GridPulse Systems',
    'SolarEdge Partners', 'FuelVault Technologies', 'GridPath Energy', 'BrightNest Power',
    'WattBridge Global', 'CleanEdge Energy', 'PowerFlow Systems', 'EnergyNest Utilities',
  ],
  'entertainment & media': [
    'MediaNest Studios', 'ContentBridge Productions', 'ScreenForge Entertainment', 'StoryVault Media',
    'BroadcastEdge Corp', 'StreamNest Digital', 'FilmPulse Studios', 'CreativeFlow Media',
    'TalentBridge Agency', 'ShowVault Entertainment', 'PrimeCast Media', 'NexEdge Studios',
  ],
  'environmental & green tech': [
    'EcoNest Solutions', 'GreenBridge Technologies', 'ClimateForge Inc', 'SustainVault Group',
    'EarthPulse Systems', 'RecycleEdge Corp', 'CleanNest Industries', 'EcoPath Partners',
    'GreenFlow Global', 'SustainBridge Tech', 'EarthVault Environmental', 'CleanEdge Solutions',
  ],
  'food & beverage': [
    'FlavorNest Brands', 'FoodBridge Corp', 'TasteForge Inc', 'CulinaryVault Group',
    'FreshPulse Foods', 'BrewEdge Beverages', 'FoodNest Innovations', 'CuisineFlow Global',
    'DrinkBridge Co', 'PrimeFlav Industries', 'NourishNest Foods', 'TasteVault Brands',
  ],
  gaming: [
    'PixelNest Studios', 'GameBridge Interactive', 'PlayForge Entertainment', 'LevelVault Games',
    'ScreenPulse Studios', 'QuestEdge Gaming', 'GameNest Digital', 'PlayPath Interactive',
    'PixelFlow Games', 'LevelBridge Studios', 'GameVault Corp', 'PlayEdge Entertainment',
  ],
  'hospitality & tourism': [
    'HotelNest Group', 'TravelBridge Solutions', 'StayForge Hospitality', 'ResortVault Corp',
    'GuestPulse Hotels', 'TourEdge Travel', 'LuxNest Hospitality', 'TravelPath Global',
    'StayBridge Resorts', 'HospitalVault Group', 'JourneyNest Tourism', 'ExploreEdge Travel',
  ],
  insurance: [
    'ShieldNest Insurance', 'CoverBridge Group', 'RiskForge Solutions', 'PolicyVault Corp',
    'SecurePulse Insurance', 'ClaimEdge Partners', 'TrustNest Coverage', 'RiskPath Insurance',
    'CoverFlow Solutions', 'PolicyBridge Group', 'InsureVault Corp', 'ShieldEdge Insurance',
  ],
  'media & publishing': [
    'PrintNest Media', 'PublishBridge Group', 'ContentForge Inc', 'StoryVault Publishing',
    'NewsPulse Media', 'WriteEdge Studios', 'PressNest Publishers', 'MediaPath Group',
    'PublishFlow Corp', 'ContentBridge Media', 'StoryEdge Publishing', 'PressVault Inc',
  ],
  pharmaceuticals: [
    'PharmaForge Labs', 'MediNest Pharmaceuticals', 'DrugBridge Sciences', 'TherapyVault Inc',
    'ClinicalPulse Pharma', 'BioEdge Research', 'PharmaNest Corp', 'MediPath Sciences',
    'TherapyBridge Labs', 'ClinicalVault Pharma', 'BioForge Therapeutics', 'DrugEdge Inc',
  ],
  'recruitment & hr': [
    'TalentNest Solutions', 'HireBridge Corp', 'StaffForge Group', 'PeopleVault HR',
    'RecruitPulse Inc', 'WorkEdge Solutions', 'TalentPath Partners', 'HireNest Digital',
    'StaffBridge Global', 'PeopleForge HR', 'WorkVault Solutions', 'HireEdge Corp',
  ],
  telecommunications: [
    'TeleNest Corp', 'ConnectBridge Solutions', 'SignalForge Tech', 'NetworkVault Systems',
    'DataPulse Telecom', 'CommsEdge Inc', 'TelePathGlobal', 'ConnectNest Networks',
    'WaveBridge Telecom', 'SignalVault Communications', 'NetworkForge Corp', 'CommEdge Tech',
  ],
  default: [
    'Vertex Global Solutions', 'Apex Strategic Partners', 'Momentum Enterprises', 'Catalyst Group Inc',
    'Vanguard Business Services', 'Pinnacle Consulting', 'Atlas Commercial', 'Forge Industries',
    'Ironclad Services', 'Summit Business Group', 'Bedrock Partners', 'Frontline Solutions',
    'Prime Ventures', 'CorePath Global', 'BridgePoint Corp', 'NexForge Group',
  ],
};

// ─── Location data (65+ cities) ───────────────────────────────────────────────

const LOCATIONS_MAP: Record<string, string[]> = {
  // West Africa
  lagos: ['Lagos, Nigeria', 'Victoria Island, Nigeria', 'Lekki, Nigeria', 'Ikeja, Nigeria'],
  accra: ['Accra, Ghana', 'East Legon, Ghana', 'Airport City, Ghana', 'Osu, Ghana'],
  abuja: ['Abuja, Nigeria', 'Garki, Nigeria', 'Maitama, Nigeria', 'Wuse, Nigeria'],
  dakar: ['Dakar, Senegal', 'Plateau, Senegal', 'Almadies, Senegal'],
  kampala: ['Kampala, Uganda', 'Kololo, Uganda', 'Nakasero, Uganda'],
  // East Africa
  nairobi: ['Nairobi, Kenya', 'Westlands, Kenya', 'Upper Hill, Kenya', 'Karen, Kenya'],
  'dar es salaam': ['Dar es Salaam, Tanzania', 'Masaki, Tanzania', 'Oyster Bay, Tanzania'],
  kigali: ['Kigali, Rwanda', 'Kimihurura, Rwanda', 'Nyarugenge, Rwanda'],
  'addis ababa': ['Addis Ababa, Ethiopia', 'Bole, Ethiopia', 'Kazanchis, Ethiopia'],
  // South Africa
  johannesburg: ['Johannesburg, South Africa', 'Sandton, South Africa', 'Rosebank, South Africa', 'Midrand, South Africa'],
  'cape town': ['Cape Town, South Africa', 'Century City, South Africa', 'Woodstock, South Africa'],
  durban: ['Durban, South Africa', 'Umhlanga, South Africa', 'La Lucia, South Africa'],
  // Central/Southern Africa
  lusaka: ['Lusaka, Zambia', 'Woodlands, Zambia', 'Kabulonga, Zambia'],
  harare: ['Harare, Zimbabwe', 'Avondale, Zimbabwe', 'Eastlea, Zimbabwe'],
  // North Africa
  cairo: ['Cairo, Egypt', 'New Cairo, Egypt', 'Heliopolis, Egypt', 'Zamalek, Egypt'],
  casablanca: ['Casablanca, Morocco', 'Maarif, Morocco', 'Anfa, Morocco'],
  tunis: ['Tunis, Tunisia', 'Les Berges du Lac, Tunisia', 'La Marsa, Tunisia'],
  // UK & Western Europe
  london: ['London, UK', 'Canary Wharf, UK', 'Shoreditch, UK', 'City of London, UK'],
  manchester: ['Manchester, UK', 'Salford, UK', 'MediaCity, UK'],
  berlin: ['Berlin, Germany', 'Mitte, Germany', 'Kreuzberg, Germany', 'Charlottenburg, Germany'],
  paris: ['Paris, France', 'La Defense, France', 'Le Marais, France'],
  amsterdam: ['Amsterdam, Netherlands', 'Zuidas, Netherlands', 'Centrum, Netherlands'],
  dublin: ['Dublin, Ireland', 'Grand Canal Dock, Ireland', 'IFSC, Ireland'],
  zurich: ['Zurich, Switzerland', 'Oerlikon, Switzerland', 'Kloten, Switzerland'],
  stockholm: ['Stockholm, Sweden', 'Kista, Sweden', 'Solna, Sweden'],
  madrid: ['Madrid, Spain', 'Castellana, Spain', 'Salamanca, Spain'],
  barcelona: ['Barcelona, Spain', 'Poblenou, Spain', 'Eixample, Spain'],
  rome: ['Rome, Italy', 'EUR, Italy', 'Prati, Italy'],
  milan: ['Milan, Italy', 'Porta Nuova, Italy', 'Navigli, Italy'],
  lisbon: ['Lisbon, Portugal', 'Parque das Nações, Portugal', 'Alcântara, Portugal'],
  vienna: ['Vienna, Austria', 'Innere Stadt, Austria', 'Mariahilf, Austria'],
  brussels: ['Brussels, Belgium', 'Ixelles, Belgium', 'Etterbeek, Belgium'],
  copenhagen: ['Copenhagen, Denmark', 'Nordhavn, Denmark', 'Frederiksberg, Denmark'],
  oslo: ['Oslo, Norway', 'Aker Brygge, Norway', 'Majorstuen, Norway'],
  helsinki: ['Helsinki, Finland', 'Ruoholahti, Finland', 'Katajanokka, Finland'],
  warsaw: ['Warsaw, Poland', 'Mokotow, Poland', 'Wola, Poland'],
  // Turkey
  istanbul: ['Istanbul, Turkey', 'Beyoglu, Turkey', 'Sisli, Turkey', 'Levent, Turkey'],
  // Middle East
  dubai: ['Dubai, UAE', 'DIFC, UAE', 'Business Bay, UAE', 'Media City, UAE'],
  riyadh: ['Riyadh, Saudi Arabia', 'Olaya, Saudi Arabia', 'King Abdullah Financial District, Saudi Arabia'],
  'abu dhabi': ['Abu Dhabi, UAE', 'Al Maryah Island, UAE', 'Masdar City, UAE'],
  doha: ['Doha, Qatar', 'West Bay, Qatar', 'Lusail, Qatar'],
  'kuwait city': ['Kuwait City, Kuwait', 'Sharq, Kuwait', 'Salmiya, Kuwait'],
  muscat: ['Muscat, Oman', 'Al Qurum, Oman', 'Madinat Sultan Qaboos, Oman'],
  manama: ['Manama, Bahrain', 'Seef, Bahrain', 'Amwaj Islands, Bahrain'],
  // Asia
  singapore: ['Singapore, Singapore', 'Marina Bay, Singapore', 'Raffles Place, Singapore', 'One-North, Singapore'],
  mumbai: ['Mumbai, India', 'Bandra Kurla Complex, India', 'Lower Parel, India', 'Andheri, India'],
  bangalore: ['Bangalore, India', 'Whitefield, India', 'Koramangala, India', 'Electronic City, India'],
  tokyo: ['Tokyo, Japan', 'Shibuya, Japan', 'Minato, Japan', 'Shinjuku, Japan'],
  seoul: ['Seoul, South Korea', 'Gangnam, South Korea', 'Jongno, South Korea'],
  'hong kong': ['Hong Kong, Hong Kong', 'Central, Hong Kong', 'Tsim Sha Tsui, Hong Kong'],
  'kuala lumpur': ['Kuala Lumpur, Malaysia', 'KLCC, Malaysia', 'Bangsar, Malaysia'],
  bangkok: ['Bangkok, Thailand', 'Silom, Thailand', 'Sukhumvit, Thailand'],
  jakarta: ['Jakarta, Indonesia', 'Sudirman, Indonesia', 'Kuningan, Indonesia', 'SCBD, Indonesia'],
  manila: ['Manila, Philippines', 'Makati, Philippines', 'BGC, Philippines'],
  'ho chi minh city': ['Ho Chi Minh City, Vietnam', 'District 1, Vietnam', 'Thu Duc, Vietnam'],
  hanoi: ['Hanoi, Vietnam', 'Ba Dinh, Vietnam', 'Hoan Kiem, Vietnam'],
  karachi: ['Karachi, Pakistan', 'Clifton, Pakistan', 'Defence, Pakistan'],
  // Oceania
  sydney: ['Sydney, Australia', 'Surry Hills, Australia', 'North Sydney, Australia', 'Barangaroo, Australia'],
  melbourne: ['Melbourne, Australia', 'Southbank, Australia', 'Docklands, Australia'],
  brisbane: ['Brisbane, Australia', 'Fortitude Valley, Australia', 'South Brisbane, Australia'],
  perth: ['Perth, Australia', 'Subiaco, Australia', 'West Perth, Australia'],
  // Americas
  'new york': ['New York, USA', 'Brooklyn, USA', 'Manhattan, USA', 'Midtown, USA'],
  'san francisco': ['San Francisco, USA', 'Palo Alto, USA', 'San Jose, USA', 'Mountain View, USA'],
  'los angeles': ['Los Angeles, USA', 'Santa Monica, USA', 'West Hollywood, USA', 'Culver City, USA'],
  chicago: ['Chicago, USA', 'Loop, USA', 'River North, USA'],
  houston: ['Houston, USA', 'Midtown Houston, USA', 'The Woodlands, USA'],
  boston: ['Boston, USA', 'Back Bay, USA', 'Cambridge, USA', 'Kendall Square, USA'],
  seattle: ['Seattle, USA', 'South Lake Union, USA', 'Bellevue, USA', 'Redmond, USA'],
  denver: ['Denver, USA', 'LoDo, USA', 'Cherry Creek, USA'],
  miami: ['Miami, USA', 'Brickell, USA', 'Coral Gables, USA', 'Wynwood, USA'],
  austin: ['Austin, USA', 'Downtown Austin, USA', 'East Austin, USA'],
  'san diego': ['San Diego, USA', 'Mission Valley, USA', 'Sorrento Valley, USA'],
  atlanta: ['Atlanta, USA', 'Midtown Atlanta, USA', 'Buckhead, USA'],
  toronto: ['Toronto, Canada', 'North York, Canada', 'Mississauga, Canada', 'Markham, Canada'],
  vancouver: ['Vancouver, Canada', 'Burnaby, Canada', 'Richmond, Canada'],
  montreal: ['Montreal, Canada', 'Mile-Ex, Canada', 'Griffintown, Canada'],
  'sao paulo': ['Sao Paulo, Brazil', 'Vila Olimpia, Brazil', 'Faria Lima, Brazil'],
  'mexico city': ['Mexico City, Mexico', 'Polanco, Mexico', 'Santa Fe, Mexico'],
  bogota: ['Bogota, Colombia', 'Chapinero, Colombia', 'Usaquen, Colombia'],
  'buenos aires': ['Buenos Aires, Argentina', 'Puerto Madero, Argentina', 'Palermo, Argentina'],
  lima: ['Lima, Peru', 'Miraflores, Peru', 'San Isidro, Peru'],
  santiago: ['Santiago, Chile', 'Las Condes, Chile', 'Providencia, Chile'],
  // Default worldwide spread
  default: [
    'Lagos, Nigeria', 'London, UK', 'New York, USA', 'Dubai, UAE',
    'Singapore, Singapore', 'Toronto, Canada', 'Sydney, Australia',
    'Nairobi, Kenya', 'Berlin, Germany', 'Mumbai, India',
    'Sao Paulo, Brazil', 'Tokyo, Japan', 'Cape Town, South Africa',
    'Paris, France', 'Seoul, South Korea', 'Jakarta, Indonesia',
    'Istanbul, Turkey', 'Madrid, Spain', 'Bangalore, India', 'Melbourne, Australia',
  ],
};

// ─── Country phone formats (45 countries) ─────────────────────────────────────

const COUNTRY_PHONE_FORMATS: Record<string, () => string> = {
  nigeria: () => `+234 ${d(3)} ${d(3)} ${d(4)}`,
  ghana: () => `+233 ${d(2)} ${d(3)} ${d(4)}`,
  kenya: () => `+254 ${d(3)} ${d(6)}`,
  uganda: () => `+256 ${d(3)} ${d(6)}`,
  tanzania: () => `+255 ${d(3)} ${d(6)}`,
  rwanda: () => `+250 ${d(3)} ${d(6)}`,
  ethiopia: () => `+251 ${d(2)} ${d(3)} ${d(4)}`,
  zambia: () => `+260 ${d(2)} ${d(3)} ${d(4)}`,
  zimbabwe: () => `+263 ${d(2)} ${d(3)} ${d(4)}`,
  'south africa': () => `+27 ${d(2)} ${d(3)} ${d(4)}`,
  senegal: () => `+221 ${d(2)} ${d(3)} ${d(4)}`,
  egypt: () => `+20 ${d(2)} ${d(4)} ${d(4)}`,
  morocco: () => `+212 ${d(3)} ${d(6)}`,
  tunisia: () => `+216 ${d(2)} ${d(3)} ${d(3)}`,
  uk: () => `+44 ${d(4)} ${d(6)}`,
  ireland: () => `+353 ${d(2)} ${d(3)} ${d(4)}`,
  germany: () => `+49 ${d(3)} ${d(7)}`,
  france: () => `+33 ${d(1)} ${d(2)} ${d(2)} ${d(2)} ${d(2)}`,
  netherlands: () => `+31 ${d(2)} ${d(3)} ${d(4)}`,
  switzerland: () => `+41 ${d(2)} ${d(3)} ${d(4)}`,
  sweden: () => `+46 ${d(2)} ${d(3)} ${d(4)}`,
  spain: () => `+34 ${d(3)} ${d(3)} ${d(3)}`,
  italy: () => `+39 ${d(3)} ${d(3)} ${d(4)}`,
  portugal: () => `+351 ${d(3)} ${d(3)} ${d(3)}`,
  austria: () => `+43 ${d(3)} ${d(4)} ${d(4)}`,
  belgium: () => `+32 ${d(3)} ${d(3)} ${d(4)}`,
  denmark: () => `+45 ${d(4)} ${d(4)}`,
  norway: () => `+47 ${d(4)} ${d(4)}`,
  finland: () => `+358 ${d(2)} ${d(3)} ${d(4)}`,
  poland: () => `+48 ${d(3)} ${d(3)} ${d(3)}`,
  turkey: () => `+90 ${d(3)} ${d(3)} ${d(4)}`,
  usa: () => `+1 (${d(3)}) ${d(3)}-${d(4)}`,
  canada: () => `+1 (${d(3)}) ${d(3)}-${d(4)}`,
  brazil: () => `+55 ${d(2)} ${d(5)}-${d(4)}`,
  mexico: () => `+52 ${d(2)} ${d(4)} ${d(4)}`,
  colombia: () => `+57 ${d(3)} ${d(3)} ${d(4)}`,
  argentina: () => `+54 ${d(2)} ${d(4)}-${d(4)}`,
  peru: () => `+51 ${d(3)} ${d(3)} ${d(3)}`,
  chile: () => `+56 ${d(2)} ${d(4)} ${d(4)}`,
  uae: () => `+971 ${d(2)} ${d(3)} ${d(4)}`,
  'saudi arabia': () => `+966 ${d(2)} ${d(3)} ${d(4)}`,
  qatar: () => `+974 ${d(4)} ${d(4)}`,
  kuwait: () => `+965 ${d(4)} ${d(4)}`,
  oman: () => `+968 ${d(4)} ${d(4)}`,
  bahrain: () => `+973 ${d(4)} ${d(4)}`,
  singapore: () => `+65 ${d(4)} ${d(4)}`,
  india: () => `+91 ${d(5)} ${d(5)}`,
  japan: () => `+81 ${d(2)} ${d(4)} ${d(4)}`,
  'south korea': () => `+82 ${d(2)} ${d(4)} ${d(4)}`,
  'hong kong': () => `+852 ${d(4)} ${d(4)}`,
  malaysia: () => `+60 ${d(2)} ${d(4)} ${d(4)}`,
  thailand: () => `+66 ${d(2)} ${d(3)} ${d(4)}`,
  indonesia: () => `+62 ${d(3)} ${d(4)} ${d(4)}`,
  philippines: () => `+63 ${d(3)} ${d(3)} ${d(4)}`,
  vietnam: () => `+84 ${d(3)} ${d(3)} ${d(4)}`,
  pakistan: () => `+92 ${d(3)} ${d(3)} ${d(4)}`,
  australia: () => `+61 ${d(1)} ${d(4)} ${d(4)}`,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

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
    if (loc.includes(country)) return formatter();
  }
  return `+1 (${d(3)}) ${d(3)}-${d(4)}`;
}

function generateWhatsAppForLocation(location: string): string {
  const loc = location.toLowerCase();
  for (const [country, formatter] of Object.entries(COUNTRY_PHONE_FORMATS)) {
    if (loc.includes(country)) return formatter().replace(/[\s()-]/g, '');
  }
  return `+1${d(3)}${d(3)}${d(4)}`;
}

function buildMapsUrl(companyName: string, location: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${companyName} ${location}`)}`;
}

const COMPANY_SIZES = ['1-10', '11-50', '51-200', '201-500', '500+'];

/**
 * Maps an annual revenue band (in currency units) to a plausible
 * company-size bucket. Returns null when no revenue bounds are supplied.
 */
function revenueToCompanySize(min?: number, max?: number): string | null {
  if (!min && !max) return null;
  const midpoint = min != null && max != null ? (min + max) / 2 : min ?? max!;
  if (midpoint < 1_000_000) return '1-10';
  if (midpoint < 10_000_000) return '11-50';
  if (midpoint < 50_000_000) return '51-200';
  if (midpoint < 200_000_000) return '201-500';
  return '500+';
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

/** Generate plausible company names for any free-text industry not in our map */
function generateCompanyNamesForIndustry(industry: string): string[] {
  const prefixes = ['Prime', 'Apex', 'Nexus', 'Core', 'Peak', 'Elite', 'Summit', 'Forge', 'Bridge', 'Vault', 'Edge', 'Pulse'];
  const suffixes = ['Solutions', 'Group', 'Partners', 'Services', 'Global', 'Technologies', 'Consulting', 'Systems', 'Corp', 'Inc', 'Labs', 'Ventures'];
  const titleCased = industry
    .split(/[\s&]+/)
    .map((w) => (w.length > 0 ? w[0].toUpperCase() + w.slice(1) : ''))
    .join('');
  return Array.from({ length: 12 }, (_, i) => `${prefixes[i % prefixes.length]}${titleCased} ${suffixes[i % suffixes.length]}`);
}

// ─── External API helpers ─────────────────────────────────────────────────────

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

/** Hunter.io domain-search — returns a real contact for the domain if the API key is set */
async function fetchHunterContact(domain: string): Promise<HunterContact | null> {
  const apiKey = process.env.HUNTER_API_KEY;
  if (!apiKey || apiKey === 'your_hunter_api_key_here') return null;

  try {
    const response = await fetch(
      `https://api.hunter.io/v2/domain-search?domain=${encodeURIComponent(domain)}&api_key=${apiKey}&limit=5`,
      { signal: AbortSignal.timeout(5000) }
    );
    if (!response.ok) return null;
    const data = (await response.json()) as any;
    const emails: any[] = data?.data?.emails;
    if (!Array.isArray(emails) || emails.length === 0) return null;

    // Prefer a contact with both first + last name and a seniority match
    const senior = emails.find(
      (e) =>
        e.first_name &&
        e.last_name &&
        e.seniority &&
        ['executive', 'senior', 'director', 'manager'].includes(e.seniority.toLowerCase())
    );
    const withName = senior || emails.find((e) => e.first_name && e.last_name);
    const contact = withName || emails[0];
    if (!contact?.value) return null;

    return {
      email: contact.value,
      firstName: contact.first_name || '',
      lastName: contact.last_name || '',
      title: contact.position || pick(TITLES),
    };
  } catch {
    return null;
  }
}

// ─── Query normalisation ──────────────────────────────────────────────────────

function resolveIndustries(query: z.infer<typeof searchSchema>): string[] {
  const arr: string[] = [];
  if (query.industries && query.industries.length > 0) arr.push(...query.industries);
  else if (typeof query.industry === 'string' && query.industry) arr.push(query.industry);
  else if (Array.isArray(query.industry)) arr.push(...query.industry);
  return arr.length > 0 ? arr : [''];
}

function resolveLocations(query: z.infer<typeof searchSchema>): string[] {
  const arr: string[] = [];
  if (query.locations && query.locations.length > 0) arr.push(...query.locations);
  else if (typeof query.location === 'string' && query.location) arr.push(query.location);
  else if (Array.isArray(query.location)) arr.push(...query.location);
  return arr.length > 0 ? arr : [''];
}

function resolveIndustryLabel(query: z.infer<typeof searchSchema>): string {
  return resolveIndustries(query).filter(Boolean).join(', ') || 'General';
}

// ─── Lead generators ──────────────────────────────────────────────────────────

async function generateLeadFromClearbit(
  company: ClearbitCompany,
  query: z.infer<typeof searchSchema>,
  locationPool: string[]
): Promise<Lead> {
  const location = pick(locationPool);

  // Attempt to get a real contact via Hunter.io
  const hunterContact = await fetchHunterContact(company.domain);

  const firstName = hunterContact?.firstName || pick(FIRST_NAMES);
  const lastName = hunterContact?.lastName || pick(LAST_NAMES);
  const email = hunterContact?.email || `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${company.domain}`;
  const title = hunterContact?.title || pick(TITLES);

  return {
    companyName: company.name,
    contactName: `${firstName} ${lastName}`,
    email,
    phone: generatePhoneForLocation(location),
    whatsapp: generateWhatsAppForLocation(location),
    website: `https://${company.domain}`,
    industry: resolveIndustryLabel(query),
    location,
    companySize: query.companySize || pick(COMPANY_SIZES),
    title,
    linkedinUrl: `https://linkedin.com/company/${slugify(company.name)}`,
    mapsUrl: buildMapsUrl(company.name, location),
    confidence: 'high',
    source: hunterContact ? 'clearbit+hunter' : 'clearbit',
  };
}

// Cache for DB lead templates
let _dbTemplatesCache: Record<string, string[]> = {};
let _dbTemplatesCacheTime = 0;
const DB_CACHE_TTL = 60_000;

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
      // Ignore DB errors, fall through to hardcoded data
    }
  }

  const key = industry.toLowerCase().replace(/\s+/g, ' ');
  const keyNoSpaces = industry.toLowerCase().replace(/\s+/g, '');

  return (
    _dbTemplatesCache[key] ||
    _dbTemplatesCache[keyNoSpaces] ||
    INDUSTRIES_MAP[key] ||
    INDUSTRIES_MAP[keyNoSpaces] ||
    // For unknown industries, generate plausible company names dynamically
    (industry ? generateCompanyNamesForIndustry(industry) : INDUSTRIES_MAP.default)
  );
}

function generateFallbackLead(
  query: z.infer<typeof searchSchema>,
  companiesOverride?: string[],
  locationPoolOverride?: string[],
  refineFilters?: RefineFilters
): Lead {
  const industries = resolveIndustries(query);
  const primaryIndustry = industries[0] || '';
  const companies =
    companiesOverride ||
    INDUSTRIES_MAP[primaryIndustry.toLowerCase().replace(/\s+/g, ' ')] ||
    (primaryIndustry ? generateCompanyNamesForIndustry(primaryIndustry) : INDUSTRIES_MAP.default);

  const locations = locationPoolOverride || (() => {
    const locs = resolveLocations(query);
    const primaryLoc = locs[0] || '';
    return LOCATIONS_MAP[primaryLoc.toLowerCase()] || [primaryLoc || 'Global'].filter(Boolean);
  })();

  const firstName = pick(FIRST_NAMES);
  const lastName = pick(LAST_NAMES);
  const companyName = pick(companies);
  const companySlug = slugify(companyName);
  const location = pick(locations.length > 0 ? locations : LOCATIONS_MAP.default);

  const domains = ['.com', '.io', '.co', '.net', '.tech'];
  const domain = pick(domains);

  // Refinement: prefer caller-supplied job titles when provided.
  const titlePool =
    refineFilters?.titles && refineFilters.titles.length > 0 ? refineFilters.titles : TITLES;

  // Refinement: derive company size from the requested revenue band when set,
  // otherwise fall back to the explicit companySize or a random bucket.
  const revenueCompanySize = revenueToCompanySize(
    refineFilters?.revenueMin,
    refineFilters?.revenueMax
  );

  return {
    companyName,
    contactName: `${firstName} ${lastName}`,
    email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${companySlug}${domain}`,
    phone: generatePhoneForLocation(location),
    whatsapp: generateWhatsAppForLocation(location),
    website: `https://www.${companySlug}${domain}`,
    industry: resolveIndustryLabel(query) || pick(Object.keys(INDUSTRIES_MAP).filter((k) => k !== 'default')),
    location,
    companySize: revenueCompanySize || query.companySize || pick(COMPANY_SIZES),
    title: pick(titlePool),
    linkedinUrl: `https://linkedin.com/company/${companySlug}`,
    mapsUrl: buildMapsUrl(companyName, location),
    confidence: 'medium',
    source: 'generated',
  };
}

// ─── Main search function ─────────────────────────────────────────────────────

export async function searchLeads(userId: string, query: z.infer<typeof searchSchema>) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error('User not found');
  if (user.tokenBalance <= 0) throw new Error('Insufficient search credits. Contact support to get more.');

  const industries = resolveIndustries(query);
  const locations = resolveLocations(query);

  // Build combined location pool from all requested locations
  const locationPool: string[] = [];
  for (const loc of locations) {
    const key = loc.toLowerCase();
    const pool = LOCATIONS_MAP[key];
    if (pool) {
      for (const l of pool) {
        if (!locationPool.includes(l)) locationPool.push(l);
      }
    } else if (loc) {
      // Free-text location not in our map — use it directly
      if (!locationPool.includes(loc)) locationPool.push(loc);
    }
  }
  if (locationPool.length === 0) locationPool.push(...LOCATIONS_MAP.default);

  // Try Clearbit for each industry + keywords combination (+ variations for better coverage)
  const clearbitCompanies: ClearbitCompany[] = [];
  for (const ind of industries) {
    const baseTerms = [ind, query.keywords].filter(Boolean).join(' ');
    // Run 2 queries: base + industry-only for broader coverage
    const queries = baseTerms !== ind && ind ? [baseTerms, ind] : [baseTerms || 'business'];
    for (const cq of queries) {
      const companies = await fetchClearbitCompanies(cq);
      for (const c of companies) {
        if (!clearbitCompanies.some((e) => e.name === c.name)) {
          clearbitCompanies.push(c);
        }
      }
    }
  }

  const results: Lead[] = [];
  const usedCompanies = new Set<string>();

  // Refinement: seed excluded companies so they are never generated as leads.
  const refineFilters = query.refineFilters;
  for (const excluded of refineFilters?.excludeCompanies || []) {
    usedCompanies.add(excluded);
  }

  // Generate leads from Clearbit results (with optional Hunter.io enrichment)
  for (const company of clearbitCompanies) {
    if (usedCompanies.has(company.name)) continue;
    usedCompanies.add(company.name);
    const lead = await generateLeadFromClearbit(company, query, locationPool);
    results.push(lead);
  }

  // Merge fallback company lists across all selected industries
  const allIndustryCompanies: string[] = [];
  for (const ind of industries) {
    const companies = await getIndustryCompanies(ind);
    for (const c of companies) {
      if (!allIndustryCompanies.includes(c)) allIndustryCompanies.push(c);
    }
  }

  // Fill up to 10–20 leads with generated fallback data
  const targetCount = 10 + Math.floor(Math.random() * 11); // 10–20
  while (results.length < targetCount) {
    let lead = generateFallbackLead(query, allIndustryCompanies, locationPool, refineFilters);
    let attempts = 0;
    while (usedCompanies.has(lead.companyName) && attempts < 10) {
      lead = generateFallbackLead(query, allIndustryCompanies, locationPool, refineFilters);
      attempts++;
    }
    usedCompanies.add(lead.companyName);
    results.push(lead);
  }

  const [search] = await prisma.$transaction([
    prisma.search.create({
      data: { userId, query: query as any, results: results as any },
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
  return prisma.search.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });
}
