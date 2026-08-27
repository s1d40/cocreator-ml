export interface PriceHistoryPoint {
  date: string;
  price: number;
}

export interface CompetitorItem {
  id: string;
  mlbId: string;
  title: string;
  sellerNickname: string;
  sellerReputation: 'platinum' | 'gold' | 'leader' | 'none';
  price: number;
  originalPrice?: number;
  listingType: 'gold_special' | 'gold_pro'; // Classico vs Premium
  shippingType: 'fulfillment' | 'cross_docking' | 'xd_drop_off' | 'self_service'; // Full, Flex, etc.
  buyBoxStatus: 'winning' | 'competing' | 'lost' | 'not_applicable';
  thumbnail: string;
  stockRange: string; // RANGO_6_25, RANGO_26_50, etc.
  lastUpdated: string;
  priceHistory: PriceHistoryPoint[];
}
