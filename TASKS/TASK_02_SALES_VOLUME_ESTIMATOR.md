# TASK 02: Stochastic Sales Volume Estimator & Revenue Engine

## 🎯 Goal
Implement the Sales Volume Estimator engine in `src/components/SalesEstimator.tsx` and `src/lib/sales-inference.ts` that uses probabilistic models, stock range transitions (`RANGO_6_25`, `RANGO_26_50`), and review/question velocity to estimate competitor sales volumes and daily/monthly revenue.

---

## 📂 Deliverables

### 1. Statistical Inference Engine (`src/lib/sales-inference.ts`)
*   Implement transition-based stock delta calculation for referential ranges.
*   Implement Zipf's law category ranking estimation.
*   Function:
```typescript
export interface SalesEstimate {
  mlbId: string;
  estimatedDailyUnits: number;
  estimatedMonthlyUnits: number;
  estimatedMonthlyRevenue: number;
  confidenceScore: number; // 0% to 100%
  indicators: {
    stockTransitionDelta: number;
    questionVelocityScore: number;
    reviewVelocityScore: number;
    rankingWeight: number;
  };
}

export function calculateEstimatedSales(itemData: any, historicalSnapshots: any[]): SalesEstimate;
```

### 2. Sales Estimator Dashboard (`src/components/SalesEstimator.tsx`)
*   KPI Cards:
    *   Faturamento Mensal Estimado (R$)
    *   Unidades Vendidas / Mês
    *   Ticket Médio
    *   Velocidade de Conversão Diária
*   Revenue projections chart over 30/60/90 days.
