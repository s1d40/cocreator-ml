export interface Question {
  id: string;
  buyerName: string;
  buyerAvatar?: string;
  productTitle: string;
  productImage: string;
  questionText: string;
  createdAt: string;
  status: 'unanswered' | 'answered';
  answerText?: string;
  answeredAt?: string;
  category: string;
}

export interface AdCampaign {
  id: string;
  name: string;
  status: 'active' | 'paused' | 'ended';
  budget: number;
  spent: number;
  impressions: number;
  clicks: number;
  ctr: number; // percentage
  conversions: number;
  conversionRate: number; // percentage
  sales: number;
  acos: number; // Advertising Cost of Sales percentage
}

export interface AdDailyMetric {
  date: string;
  impressions: number;
  clicks: number;
  spend: number;
  sales: number;
}

export interface SellerReputation {
  sellerName: string;
  level: string;
  reputationScore: number; // e.g., 98.4%
  totalOrders: number;
  completedOrders: number;
  canceledOrdersBySeller: number;
  claimRate: number; // percentage
  responseTimeHours: number;
  responseRate: number; // percentage
  ratingBreakdown: {
    stars: number;
    count: number;
    percentage: number;
  }[];
  monthlyPerformance: {
    month: string;
    score: number;
    salesCount: number;
    claimCount: number;
  }[];
}

export const MOCK_QUESTIONS: Question[] = [
  {
    id: 'q-101',
    buyerName: 'Alex Morgan',
    productTitle: 'Ergonomic Wireless Mechanical Keyboard (RGB Backlit)',
    productImage: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=150&q=80',
    questionText: 'Is this keyboard compatible with macOS out of the box, including keybindings?',
    createdAt: '2026-08-25T14:30:00Z',
    status: 'unanswered',
    category: 'Compatibility',
  },
  {
    id: 'q-102',
    buyerName: 'Samantha Lee',
    productTitle: 'Ultra Wide 34-inch Curved Gaming Monitor 144Hz',
    productImage: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=150&q=80',
    questionText: 'Does the package include a DisplayPort cable or only HDMI?',
    createdAt: '2026-08-25T11:15:00Z',
    status: 'unanswered',
    category: 'Package Content',
  },
  {
    id: 'q-103',
    buyerName: 'David Chen',
    productTitle: 'Noise-Canceling Wireless Over-Ear Headphones',
    productImage: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=150&q=80',
    questionText: 'How long does the battery last with Active Noise Cancellation (ANC) switched on constantly?',
    createdAt: '2026-08-24T18:45:00Z',
    status: 'answered',
    answerText: 'Hi David! The battery lasts up to 30 hours continuously with ANC enabled, and up to 40 hours with ANC turned off.',
    answeredAt: '2026-08-24T19:20:00Z',
    category: 'Specifications',
  },
  {
    id: 'q-104',
    buyerName: 'Elena Rostova',
    productTitle: 'USB-C Docking Station Dual 4K Display',
    productImage: 'https://images.unsplash.com/photo-1544652478-6653e09f18a2?auto=format&fit=crop&w=150&q=80',
    questionText: 'Can this dock deliver at least 85W power delivery to charge a 16-inch MacBook Pro?',
    createdAt: '2026-08-24T09:10:00Z',
    status: 'answered',
    answerText: 'Yes Elena! It supports up to 100W Power Delivery (PD 3.0), which comfortably powers a 16-inch MBP.',
    answeredAt: '2026-08-24T10:05:00Z',
    category: 'Power & Charging',
  },
  {
    id: 'q-105',
    buyerName: 'Marcus Vance',
    productTitle: 'Ergonomic Wireless Mechanical Keyboard (RGB Backlit)',
    productImage: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=150&q=80',
    questionText: 'Are the switches hot-swappable or soldered onto the PCB?',
    createdAt: '2026-08-23T16:00:00Z',
    status: 'answered',
    answerText: 'Hello Marcus, the switches are 5-pin hot-swappable, so you can easily swap Cherry MX, Gateron, or Kailh switches.',
    answeredAt: '2026-08-23T16:45:00Z',
    category: 'Specifications',
  },
];

export const MOCK_CAMPAIGNS: AdCampaign[] = [
  {
    id: 'camp-01',
    name: 'Summer Electronics Flash Promo',
    status: 'active',
    budget: 1500,
    spent: 1120.50,
    impressions: 145000,
    clicks: 4820,
    ctr: 3.32,
    conversions: 312,
    conversionRate: 6.47,
    sales: 15600.00,
    acos: 7.18,
  },
  {
    id: 'camp-02',
    name: 'Mechanical Keyboards Search Ads',
    status: 'active',
    budget: 800,
    spent: 645.20,
    impressions: 89000,
    clicks: 3100,
    ctr: 3.48,
    conversions: 185,
    conversionRate: 5.96,
    sales: 8325.00,
    acos: 7.75,
  },
  {
    id: 'camp-03',
    name: 'Gaming Accessories Retargeting',
    status: 'active',
    budget: 500,
    spent: 420.00,
    impressions: 42000,
    clicks: 1680,
    ctr: 4.00,
    conversions: 142,
    conversionRate: 8.45,
    sales: 5680.00,
    acos: 7.39,
  },
  {
    id: 'camp-04',
    name: 'Monitors & Docks Clearance',
    status: 'paused',
    budget: 1000,
    spent: 980.00,
    impressions: 110000,
    clicks: 2750,
    ctr: 2.50,
    conversions: 98,
    conversionRate: 3.56,
    sales: 4900.00,
    acos: 20.00,
  },
];

export const MOCK_DAILY_METRICS: AdDailyMetric[] = [
  { date: 'Aug 19', impressions: 22000, clicks: 710, spend: 180, sales: 2100 },
  { date: 'Aug 20', impressions: 28000, clicks: 920, spend: 230, sales: 2950 },
  { date: 'Aug 21', impressions: 31000, clicks: 1050, spend: 260, sales: 3400 },
  { date: 'Aug 22', impressions: 35000, clicks: 1210, spend: 310, sales: 4100 },
  { date: 'Aug 23', impressions: 42000, clicks: 1480, spend: 380, sales: 4900 },
  { date: 'Aug 24', impressions: 48000, clicks: 1650, spend: 410, sales: 5600 },
  { date: 'Aug 25', impressions: 51000, clicks: 1720, spend: 440, sales: 6100 },
];

export const MOCK_SELLER_REPUTATION: SellerReputation = {
  sellerName: 'Apex Tech Direct',
  level: 'Top Rated Seller (Gold Tier)',
  reputationScore: 98.6,
  totalOrders: 3450,
  completedOrders: 3412,
  canceledOrdersBySeller: 4,
  claimRate: 0.28,
  responseTimeHours: 1.4,
  responseRate: 99.2,
  ratingBreakdown: [
    { stars: 5, count: 2890, percentage: 84.7 },
    { stars: 4, count: 410, percentage: 12.0 },
    { stars: 3, count: 72, percentage: 2.1 },
    { stars: 2, count: 25, percentage: 0.7 },
    { stars: 1, count: 15, percentage: 0.4 },
  ],
  monthlyPerformance: [
    { month: 'Mar', score: 96.5, salesCount: 420, claimCount: 3 },
    { month: 'Apr', score: 97.2, salesCount: 480, claimCount: 2 },
    { month: 'May', score: 97.8, salesCount: 510, claimCount: 2 },
    { month: 'Jun', score: 98.1, salesCount: 590, claimCount: 1 },
    { month: 'Jul', score: 98.4, salesCount: 650, claimCount: 1 },
    { month: 'Aug', score: 98.6, salesCount: 800, claimCount: 1 },
  ],
};
