# TASK 01: Competitor Radar & Live Price History Tracker

## 🎯 Goal
Implement the Competitor Radar and Buy Box tracking module in `src/components/CompetitorRadar.tsx`, allowing users to monitor rival Mercado Libre listings by MLB ID, URL, or category, track price changes over time, and receive Buy Box win/loss alerts.

---

## 📂 Deliverables

### 1. Types & Data Models (`src/types/competitor.ts`)
```typescript
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
  priceHistory: { date: string; price: number }[];
}
```

### 2. Competitor Radar Component (`src/components/CompetitorRadar.tsx`)
*   Search bar to add new competitor listing via MLB URL or MLB ID (e.g. `MLB123456789`).
*   Comparison table showing:
    *   Item title & thumbnail
    *   Seller Nickname & Reputation Badge
    *   Price & Listing Type (Clássico / Premium)
    *   Shipping method badge (⚡ FULL, 📦 FLEX)
    *   Buy Box indicator (🏆 Ganhando / ⚠️ Concorrendo / ❌ Perdendo)
    *   Price variation trend (📈 Subiu / 📉 Caiu)
*   Interactive mini price history chart.
