import { CompetitorItem } from '../types/competitor';

export interface QuestionProductDetails {
  brand?: string;
  model?: string;
  voltage?: string;
  warranty?: string;
  inStock?: boolean;
  fullShipping?: boolean;
  invoiceProvided?: boolean;
  compatibility?: string;
  attributes?: Record<string, string>;
}

export interface Question {
  id: string;
  buyerName: string;
  buyerAvatar?: string;
  productTitle: string;
  productImage: string;
  productMlId?: string;
  questionText: string;
  createdAt: string;
  status: 'unanswered' | 'answered';
  answerText?: string;
  answeredAt?: string;
  category: string;
  productDetails?: QuestionProductDetails;
}

export const MOCK_QUESTIONS: Question[] = [
  {
    id: 'q-101',
    buyerName: 'Alex Morgan',
    productTitle: 'Teclado Mecânico Ergonômico Sem Fio (RGB Backlit)',
    productMlId: 'MLB-1002341',
    productImage: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=150&q=80',
    questionText: 'Este teclado é compatível com macOS nativamente, incluindo os atalhos de mídia?',
    createdAt: new Date(Date.now() - 8 * 60 * 1000).toISOString(), // 8 minutes ago
    status: 'unanswered',
    category: 'Compatibilidade',
    productDetails: {
      brand: 'ApexTech',
      model: 'K-950 Wireless',
      voltage: 'Bivolt Automático (Recarregável via USB-C)',
      warranty: '12 meses de garantia oficial',
      inStock: true,
      fullShipping: true,
      invoiceProvided: true,
      compatibility: 'Windows, macOS, Linux, iOS e Android (Bluetooth 5.1 / Dongle 2.4Ghz)',
      attributes: {
        'Conexão': 'Bluetooth 5.1 / 2.4GHz / USB-C',
        'Bateria': '4000mAh (Até 200h sem RGB)',
        'Switches': 'Gateron Pro Yellow Hot-Swappable',
      },
    },
  },
  {
    id: 'q-102',
    buyerName: 'Samantha Lee',
    productTitle: 'Monitor Gamer Ultrawide 34" Curvo 144Hz 1ms',
    productMlId: 'MLB-2005819',
    productImage: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=150&q=80',
    questionText: 'Vem com cabo DisplayPort na caixa ou apenas HDMI? Emite nota fiscal para CNPJ?',
    createdAt: new Date(Date.now() - 42 * 60 * 1000).toISOString(), // 42 minutes ago
    status: 'unanswered',
    category: 'Conteúdo da Embalagem & NF',
    productDetails: {
      brand: 'ApexTech',
      model: 'Vision34X',
      voltage: '110V/220V (Bivolt automático)',
      warranty: '12 meses com fabricante',
      inStock: true,
      fullShipping: true,
      invoiceProvided: true,
      compatibility: 'PC, Mac, PS5, Xbox Series X (DisplayPort 1.4 / HDMI 2.0)',
      attributes: {
        'Conteúdo da Caixa': 'Monitor 34", Fonte de Alimentação, Cabo DisplayPort 1.4, Cabo HDMI 2.0 e Manual',
        'Resolução': '3440 x 1440 UWQHD',
        'Painel': 'VA Curvo 1500R',
      },
    },
  },
  {
    id: 'q-103',
    buyerName: 'David Chen',
    productTitle: 'Fone de Ouvido Bluetooth com Cancelamento de Ruído (ANC)',
    productMlId: 'MLB-3094812',
    productImage: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=150&q=80',
    questionText: 'Quanto tempo dura a bateria com o Cancelamento de Ruído (ANC) ativado continuamente?',
    createdAt: '2026-08-24T18:45:00Z',
    status: 'answered',
    answerText: 'Olá David! A bateria dura até 30 horas contínuas com o ANC ligado, e até 40 horas com o ANC desligado. Além disso, conta com carregamento rápido via USB-C!',
    answeredAt: '2026-08-24T19:20:00Z',
    category: 'Especificações',
    productDetails: {
      brand: 'ApexTech',
      model: 'SilencePro 500',
      voltage: '5V USB-C',
      warranty: '6 meses',
      inStock: true,
      fullShipping: true,
      invoiceProvided: true,
      compatibility: 'Universal Bluetooth 5.2',
    },
  },
  {
    id: 'q-104',
    buyerName: 'Elena Rostova',
    productTitle: 'Docking Station USB-C Dual 4K Display Power Delivery 100W',
    productMlId: 'MLB-4018239',
    productImage: 'https://images.unsplash.com/photo-1544652478-6653e09f18a2?auto=format&fit=crop&w=150&q=80',
    questionText: 'Tem pronta entrega no envio Full? Consegue carregar um MacBook Pro de 16 polegadas?',
    createdAt: new Date(Date.now() - 125 * 60 * 1000).toISOString(), // 2h 5m ago
    status: 'unanswered',
    category: 'Pronta Entrega & Energia',
    productDetails: {
      brand: 'ApexTech',
      model: 'DockMax Dual 4K',
      voltage: '100W PD 3.0 Passthrough',
      warranty: '12 meses',
      inStock: true,
      fullShipping: true,
      invoiceProvided: true,
      compatibility: 'MacBook Pro/Air M1/M2/M3, Windows Laptops com Thunderbolt 3/4 ou USB-C 3.2 Gen2',
      attributes: {
        'Saída de Energia': 'Até 100W Power Delivery',
        'Portas': '2x HDMI 4K@60Hz, 1x DisplayPort, 3x USB-A 3.1, 1x USB-C Data, Gigabit Ethernet',
      },
    },
  },
  {
    id: 'q-105',
    buyerName: 'Marcus Vance',
    productTitle: 'Teclado Mecânico Ergonômico Sem Fio (RGB Backlit)',
    productMlId: 'MLB-1002341',
    productImage: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=150&q=80',
    questionText: 'Os switches são hot-swappable ou soldados na placa?',
    createdAt: '2026-08-23T16:00:00Z',
    status: 'answered',
    answerText: 'Olá Marcus, os switches são hot-swappable de 5 pinos, permitindo trocar facilmente por switches Cherry MX, Gateron ou Kailh sem necessidade de solda.',
    answeredAt: '2026-08-23T16:45:00Z',
    category: 'Especificações',
    productDetails: {
      brand: 'ApexTech',
      model: 'K-950 Wireless',
      voltage: 'Bivolt Automático',
      warranty: '12 meses',
      inStock: true,
      fullShipping: true,
      invoiceProvided: true,
    },
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

export const MOCK_COMPETITORS: CompetitorItem[] = [
  {
    id: 'comp-1',
    mlbId: 'MLB3849102834',
    title: 'Teclado Mecânico RGB Wireless Ergônomico Switch Red',
    sellerNickname: 'TECH_GURU_STORE',
    sellerReputation: 'platinum',
    price: 349.90,
    originalPrice: 399.90,
    listingType: 'gold_pro',
    shippingType: 'fulfillment',
    buyBoxStatus: 'winning',
    thumbnail: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=150&q=80',
    stockRange: 'RANGO_26_50',
    lastUpdated: '2026-08-25T16:45:00Z',
    priceHistory: [
      { date: '19 Aug', price: 389.90 },
      { date: '21 Aug', price: 379.90 },
      { date: '23 Aug', price: 359.90 },
      { date: '25 Aug', price: 349.90 },
    ],
  },
  {
    id: 'comp-2',
    mlbId: 'MLB2918471029',
    title: 'Monitor Gamer Curved 34-inch 144Hz 1ms UltraWide QHD',
    sellerNickname: 'ELECTRO_WORLD_BR',
    sellerReputation: 'gold',
    price: 1899.00,
    originalPrice: 2199.00,
    listingType: 'gold_special',
    shippingType: 'cross_docking',
    buyBoxStatus: 'competing',
    thumbnail: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=150&q=80',
    stockRange: 'RANGO_6_25',
    lastUpdated: '2026-08-25T14:20:00Z',
    priceHistory: [
      { date: '19 Aug', price: 1799.00 },
      { date: '21 Aug', price: 1849.00 },
      { date: '23 Aug', price: 1899.00 },
      { date: '25 Aug', price: 1899.00 },
    ],
  },
  {
    id: 'comp-3',
    mlbId: 'MLB1029384756',
    title: 'Fone de Ouvido Bluetooth ANC Sem Fio Over-Ear 30h Bateria',
    sellerNickname: 'AUDIO_PRO_SHOP',
    sellerReputation: 'leader',
    price: 289.00,
    originalPrice: 299.00,
    listingType: 'gold_pro',
    shippingType: 'fulfillment',
    buyBoxStatus: 'lost',
    thumbnail: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=150&q=80',
    stockRange: 'RANGO_51_100',
    lastUpdated: '2026-08-25T18:10:00Z',
    priceHistory: [
      { date: '19 Aug', price: 319.00 },
      { date: '21 Aug', price: 299.00 },
      { date: '23 Aug', price: 295.00 },
      { date: '25 Aug', price: 289.00 },
    ],
  },
  {
    id: 'comp-4',
    mlbId: 'MLB9483726150',
    title: 'Docking Station USB-C Dual 4K HDMI 100W Power Delivery',
    sellerNickname: 'HUB_DIRECT_OFFICIAL',
    sellerReputation: 'none',
    price: 459.99,
    listingType: 'gold_special',
    shippingType: 'self_service',
    buyBoxStatus: 'not_applicable',
    thumbnail: 'https://images.unsplash.com/photo-1544652478-6653e09f18a2?auto=format&fit=crop&w=150&q=80',
    stockRange: 'RANGO_1_5',
    lastUpdated: '2026-08-24T12:00:00Z',
    priceHistory: [
      { date: '19 Aug', price: 459.99 },
      { date: '21 Aug', price: 459.99 },
      { date: '23 Aug', price: 459.99 },
      { date: '25 Aug', price: 459.99 },
    ],
  },
];
