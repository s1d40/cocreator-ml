export interface StockSnapshot {
  timestamp: string | Date;
  availableQuantity?: number; // Exact quantity if known or available
  stockRange?: string; // e.g., 'RANGO_1_5', 'RANGO_6_25', 'RANGO_26_50', 'RANGO_50_PLUS', or exact string
  price: number;
  questionsCount?: number;
  reviewsCount?: number;
}

export interface ItemData {
  mlbId: string;
  title?: string;
  price: number;
  category_id?: string;
  categoryRanking?: number; // e.g., 1 to N position in category
  totalCategoryItems?: number; // Total items in category for Zipf calculation
  availableQuantity?: number;
  stockRange?: string;
  questionsCount?: number;
  reviewsCount?: number;
  soldQuantity?: number; // Total historic sold quantity
  dateCreated?: string | Date;
}

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

/**
 * Maps standard Mercado Libre stock range representations or string codes to average/midpoint numeric estimates.
 */
export function parseStockRangeValue(range?: string, exactQty?: number): number {
  if (typeof exactQty === 'number' && !isNaN(exactQty)) {
    return exactQty;
  }
  if (!range) return 10; // Default fallback

  const upperRange = range.toUpperCase().trim();
  switch (upperRange) {
    case 'RANGO_1_5':
    case '1-5':
      return 3;
    case 'RANGO_6_25':
    case '6-25':
      return 15.5;
    case 'RANGO_26_50':
    case '26-50':
      return 38;
    case 'RANGO_51_100':
    case 'RANGO_50_PLUS':
    case '51-100':
    case '50+':
      return 75;
    case 'RANGO_100_PLUS':
    case '100+':
      return 150;
    default: {
      const parsed = parseFloat(range);
      return !isNaN(parsed) ? parsed : 10;
    }
  }
}

/**
 * Estimates sales volume based on category ranking using Zipf's Law (power law distribution).
 * Zipf's Law states relative sales weight S(r) ~ 1 / (r ^ s), where r is rank and s ~ 1.
 */
export function calculateZipfRankingWeight(rank?: number, totalCategoryItems: number = 100): number {
  if (!rank || rank <= 0) return 0.5; // Default neutral weight

  // Exponent s typically ~ 0.8 to 1.0 for e-commerce categories
  const s = 0.85;
  const zipfFactor = 1 / Math.pow(rank, s);

  // Normalize relative to top item weight (rank 1 = 1.0)
  return Math.min(1.0, Math.max(0.05, zipfFactor));
}

/**
 * Calculates stock transition delta over historical snapshots.
 * Decreases in stock (unless replenished) indicate sales.
 */
export function calculateStockTransitionDelta(
  itemData: ItemData,
  snapshots: StockSnapshot[]
): { estimatedDailyUnits: number; totalDelta: number; periodDays: number } {
  if (!snapshots || snapshots.length < 2) {
    // If no snapshots, fall back to historical sold_quantity / listing age if available
    if (itemData.soldQuantity && itemData.dateCreated) {
      const created = new Date(itemData.dateCreated).getTime();
      const now = Date.now();
      const days = Math.max(1, (now - created) / (1000 * 60 * 60 * 24));
      const daily = itemData.soldQuantity / days;
      return { estimatedDailyUnits: daily, totalDelta: itemData.soldQuantity, periodDays: days };
    }
    return { estimatedDailyUnits: 0, totalDelta: 0, periodDays: 1 };
  }

  // Sort snapshots by timestamp ascending
  const sorted = [...snapshots].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  const start = sorted[0];
  const end = sorted[sorted.length - 1];
  const startTime = new Date(start.timestamp).getTime();
  const endTime = new Date(end.timestamp).getTime();
  const periodDays = Math.max(0.1, (endTime - startTime) / (1000 * 60 * 60 * 24));

  let accumulatedSales = 0;

  for (let i = 0; i < sorted.length - 1; i++) {
    const prev = sorted[i];
    const next = sorted[i + 1];

    const prevQty = parseStockRangeValue(prev.stockRange, prev.availableQuantity);
    const nextQty = parseStockRangeValue(next.stockRange, next.availableQuantity);

    if (prevQty > nextQty) {
      // Stock decrease -> estimated sale units
      accumulatedSales += prevQty - nextQty;
    }
    // If nextQty > prevQty, stock was replenished, so no positive delta from sale in this gap.
  }

  const estimatedDailyUnits = accumulatedSales / periodDays;
  return { estimatedDailyUnits, totalDelta: accumulatedSales, periodDays };
}

/**
 * Calculates question velocity score per day and normalized relative index.
 */
export function calculateQuestionVelocity(snapshots: StockSnapshot[]): number {
  if (!snapshots || snapshots.length < 2) return 0.5;

  const sorted = [...snapshots].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  const start = sorted[0];
  const end = sorted[sorted.length - 1];
  const startTime = new Date(start.timestamp).getTime();
  const endTime = new Date(end.timestamp).getTime();
  const periodDays = Math.max(0.1, (endTime - startTime) / (1000 * 60 * 60 * 24));

  const questionsDelta = (end.questionsCount || 0) - (start.questionsCount || 0);
  const questionsPerDay = Math.max(0, questionsDelta) / periodDays;

  // Conversion heuristic: ~5-15% of questions convert to sales
  // Normalized score (0.0 to 2.0+)
  return questionsPerDay;
}

/**
 * Calculates review velocity score per day and normalized relative index.
 */
export function calculateReviewVelocity(snapshots: StockSnapshot[]): number {
  if (!snapshots || snapshots.length < 2) return 0.5;

  const sorted = [...snapshots].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  const start = sorted[0];
  const end = sorted[sorted.length - 1];
  const startTime = new Date(start.timestamp).getTime();
  const endTime = new Date(end.timestamp).getTime();
  const periodDays = Math.max(0.1, (endTime - startTime) / (1000 * 60 * 60 * 24));

  const reviewsDelta = (end.reviewsCount || 0) - (start.reviewsCount || 0);
  const reviewsPerDay = Math.max(0, reviewsDelta) / periodDays;

  // Organic review conversion rate ~2-5% of buyers leave reviews
  return reviewsPerDay;
}

/**
 * Main inference calculation function required by Task 02.
 */
export function calculateEstimatedSales(
  itemData: ItemData,
  historicalSnapshots: StockSnapshot[] = []
): SalesEstimate {
  const stockInfo = calculateStockTransitionDelta(itemData, historicalSnapshots);
  const questionVel = calculateQuestionVelocity(historicalSnapshots);
  const reviewVel = calculateReviewVelocity(historicalSnapshots);
  const rankingWeight = calculateZipfRankingWeight(itemData.categoryRanking, itemData.totalCategoryItems);

  // Conversion multipliers:
  // - Review velocity multiplier: ~20 to 40 sales per review
  const estimatedSalesFromReviews = reviewVel * 30;

  // - Question velocity multiplier: ~8 to 15 sales per question
  const estimatedSalesFromQuestions = questionVel * 10;

  // Combine indicators using weighted ensemble
  let baseDailyUnits = 0;

  if (historicalSnapshots && historicalSnapshots.length >= 2 && stockInfo.totalDelta > 0) {
    // Primary weight on stock transition delta if snapshots exist
    baseDailyUnits =
      stockInfo.estimatedDailyUnits * 0.6 +
      estimatedSalesFromReviews * 0.2 +
      estimatedSalesFromQuestions * 0.2;
  } else if (itemData.soldQuantity && itemData.dateCreated) {
    // Fallback on overall historic average adjusted by ranking weight
    const created = new Date(itemData.dateCreated).getTime();
    const days = Math.max(1, (Date.now() - created) / (1000 * 60 * 60 * 24));
    const avgDaily = itemData.soldQuantity / days;
    baseDailyUnits = avgDaily * (0.5 + 0.5 * rankingWeight);
  } else {
    // Synthetic estimation based on Zipf ranking weight & price point
    // High rank (rank 1) ~ 15-30 units/day for active ML listing
    const benchmarkUnits = 20 * rankingWeight;
    baseDailyUnits = Math.max(0.1, benchmarkUnits);
  }

  // Ensure positive daily units estimate
  const estimatedDailyUnits = Number(Math.max(0.1, baseDailyUnits).toFixed(2));
  const estimatedMonthlyUnits = Math.round(estimatedDailyUnits * 30);
  const price = itemData.price || 0;
  const estimatedMonthlyRevenue = Number((estimatedMonthlyUnits * price).toFixed(2));

  // Calculate Confidence Score (0% - 100%) based on available data quality
  let confidence = 40; // Base confidence
  if (historicalSnapshots && historicalSnapshots.length >= 2) confidence += 30;
  if (historicalSnapshots && historicalSnapshots.length >= 5) confidence += 15;
  if (itemData.categoryRanking) confidence += 10;
  if (itemData.soldQuantity) confidence += 5;

  const confidenceScore = Math.min(98, confidence);

  return {
    mlbId: itemData.mlbId,
    estimatedDailyUnits,
    estimatedMonthlyUnits,
    estimatedMonthlyRevenue,
    confidenceScore,
    indicators: {
      stockTransitionDelta: Number(stockInfo.estimatedDailyUnits.toFixed(2)),
      questionVelocityScore: Number(questionVel.toFixed(2)),
      reviewVelocityScore: Number(reviewVel.toFixed(2)),
      rankingWeight: Number(rankingWeight.toFixed(2)),
    },
  };
}
