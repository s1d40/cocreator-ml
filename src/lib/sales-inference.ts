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
    case '51-100':
      return 75;
    case 'RANGO_50_PLUS':
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
 * Converts numeric quantity to Mercado Libre stock range code.
 */
export function quantityToStockRange(qty: number): string {
  if (qty <= 5) return 'RANGO_1_5';
  if (qty <= 25) return 'RANGO_6_25';
  if (qty <= 50) return 'RANGO_26_50';
  if (qty <= 100) return 'RANGO_51_100';
  return 'RANGO_100_PLUS';
}

/**
 * Adjusts base daily sales demand based on price elasticity of demand.
 * Formula: % Delta Q = - Elasticity * (% Delta P)
 * Where elasticity is expressed as a positive coefficient magnitude (e.g. 1.2 or 1.5).
 */
export function adjustDemandForElasticity(
  baseDailyUnits: number,
  basePrice: number,
  newPrice: number,
  elasticity: number = 1.2
): number {
  if (basePrice <= 0 || newPrice <= 0 || baseDailyUnits <= 0) {
    return baseDailyUnits;
  }

  const priceRatioDelta = (newPrice - basePrice) / basePrice;
  // If price increases (priceRatioDelta > 0), demand decreases. If price drops, demand increases.
  const demandChangePercent = -1 * elasticity * priceRatioDelta;
  const adjustedUnits = baseDailyUnits * (1 + demandChangePercent);

  return Math.max(0.01, adjustedUnits);
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

  // Conversion multipliers
  const estimatedSalesFromReviews = reviewVel * 30;
  const estimatedSalesFromQuestions = questionVel * 10;

  // Combine indicators using weighted ensemble
  let baseDailyUnits = 0;

  if (historicalSnapshots && historicalSnapshots.length >= 2 && stockInfo.totalDelta > 0) {
    baseDailyUnits =
      stockInfo.estimatedDailyUnits * 0.6 +
      estimatedSalesFromReviews * 0.2 +
      estimatedSalesFromQuestions * 0.2;
  } else if (itemData.soldQuantity && itemData.dateCreated) {
    const created = new Date(itemData.dateCreated).getTime();
    const days = Math.max(1, (Date.now() - created) / (1000 * 60 * 60 * 24));
    const avgDaily = itemData.soldQuantity / days;
    baseDailyUnits = avgDaily * (0.5 + 0.5 * rankingWeight);
  } else {
    const benchmarkUnits = 20 * rankingWeight;
    baseDailyUnits = Math.max(0.1, benchmarkUnits);
  }

  const estimatedDailyUnits = Number(Math.max(0.1, baseDailyUnits).toFixed(2));
  const estimatedMonthlyUnits = Math.round(estimatedDailyUnits * 30);
  const price = itemData.price || 0;
  const estimatedMonthlyRevenue = Number((estimatedMonthlyUnits * price).toFixed(2));

  let confidence = 40;
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

// Monte Carlo Simulation & Out-of-Stock Risk Types & Functions
export type SimulationHorizon = 15 | 30 | 60 | 90 | 180;
export type ConfidenceIntervalLevel = 80 | 90 | 95;

export interface MonteCarloOptions {
  baseDailyUnits: number;
  unitPrice: number;
  horizonDays: SimulationHorizon;
  confidenceInterval: ConfidenceIntervalLevel;
  currentStock: number;
  elasticity?: number;
  basePrice?: number; // Reference price for elasticity calculation
  simulationsCount?: number;
}

export interface MonteCarloDailyData {
  day: number;
  dayLabel: string;
  meanUnits: number;
  medianUnits: number;
  lowerBoundUnits: number;
  upperBoundUnits: number;
  meanRevenue: number;
  medianRevenue: number;
  lowerBoundRevenue: number;
  upperBoundRevenue: number;
  stockoutRiskPercent: number;
}

export interface OutOfStockRiskEstimate {
  stockoutProbability: number; // 0% - 100%
  estimatedDaysToStockout: number | null; // Days until stock depletes or null if safe
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  recommendation: string;
}

export interface MonteCarloResult {
  dailyProjections: MonteCarloDailyData[];
  totalExpectedRevenue: number;
  totalExpectedUnits: number;
  lowerBoundRevenue: number;
  upperBoundRevenue: number;
  outOfStockRisk: OutOfStockRiskEstimate;
}

/**
 * Standard Box-Muller transformation to generate normally distributed random numbers.
 */
function randomNormal(mean: number, stdDev: number): number {
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  const num = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  return mean + num * stdDev;
}

/**
 * Helper to compute percentile value from sorted numeric array.
 */
function getPercentile(sortedValues: number[], percentile: number): number {
  if (sortedValues.length === 0) return 0;
  const index = (percentile / 100) * (sortedValues.length - 1);
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  const weight = index - lower;
  if (upper >= sortedValues.length) return sortedValues[sortedValues.length - 1];
  return sortedValues[lower] * (1 - weight) + sortedValues[upper] * weight;
}

/**
 * Runs Monte Carlo simulation for sales volume projections and out-of-stock risk estimation.
 */
export function runMonteCarloSimulation(options: MonteCarloOptions): MonteCarloResult {
  const {
    baseDailyUnits,
    unitPrice,
    horizonDays = 90,
    confidenceInterval = 90,
    currentStock,
    elasticity = 1.2,
    basePrice,
    simulationsCount = 1000,
  } = options;

  // Apply price elasticity if basePrice and unitPrice differ
  const effectiveDailyUnits = basePrice
    ? adjustDemandForElasticity(baseDailyUnits, basePrice, unitPrice, elasticity)
    : baseDailyUnits;

  // Daily standard deviation (~25% volatility + baseline uncertainty)
  const dailyStdDev = Math.max(0.2, effectiveDailyUnits * 0.25);

  // Set percentile bounds based on confidence interval
  let lowerPercentile = 5;
  let upperPercentile = 95;
  if (confidenceInterval === 80) {
    lowerPercentile = 10;
    upperPercentile = 90;
  } else if (confidenceInterval === 95) {
    lowerPercentile = 2.5;
    upperPercentile = 97.5;
  }

  // Storage for simulation paths: N simulations, each with cumulative daily values
  const cumulativeUnitsPaths: number[][] = Array.from({ length: simulationsCount }, () => []);
  const stockoutDays: (number | null)[] = new Array(simulationsCount).fill(null);

  // Run Monte Carlo Iterations
  for (let sim = 0; sim < simulationsCount; sim++) {
    let remainingStock = currentStock;
    let accumulatedUnits = 0;

    for (let d = 1; d <= horizonDays; d++) {
      // Sample daily demand using stochastic normal distribution
      const sampledDaily = Math.max(0, randomNormal(effectiveDailyUnits, dailyStdDev));
      accumulatedUnits += sampledDaily;

      if (remainingStock > 0) {
        remainingStock -= sampledDaily;
        if (remainingStock <= 0 && stockoutDays[sim] === null) {
          stockoutDays[sim] = d;
        }
      }

      cumulativeUnitsPaths[sim].push(accumulatedUnits);
    }
  }

  // Determine step size for chart points based on horizon
  const step = Math.max(1, Math.floor(horizonDays / 15));
  const dailyProjections: MonteCarloDailyData[] = [];

  for (let day = step; day <= horizonDays; day += step) {
    const dayIndex = day - 1;
    // Extract values across all simulation paths for day
    const dayUnitsList = cumulativeUnitsPaths.map((path) => path[dayIndex]).sort((a, b) => a - b);

    const meanUnits = dayUnitsList.reduce((acc, v) => acc + v, 0) / simulationsCount;
    const medianUnits = getPercentile(dayUnitsList, 50);
    const lowerUnits = getPercentile(dayUnitsList, lowerPercentile);
    const upperUnits = getPercentile(dayUnitsList, upperPercentile);

    // Calculate how many simulation paths suffered stockout on or before this day
    const stockoutsCount = stockoutDays.filter((sd) => sd !== null && sd <= day).length;
    const stockoutRiskPercent = Number(((stockoutsCount / simulationsCount) * 100).toFixed(1));

    dailyProjections.push({
      day,
      dayLabel: `Dia ${day}`,
      meanUnits: Math.round(meanUnits),
      medianUnits: Math.round(medianUnits),
      lowerBoundUnits: Math.round(lowerUnits),
      upperBoundUnits: Math.round(upperUnits),
      meanRevenue: Number((meanUnits * unitPrice).toFixed(2)),
      medianRevenue: Number((medianUnits * unitPrice).toFixed(2)),
      lowerBoundRevenue: Number((lowerUnits * unitPrice).toFixed(2)),
      upperBoundRevenue: Number((upperUnits * unitPrice).toFixed(2)),
      stockoutRiskPercent,
    });
  }

  // Overall horizon stockout probability
  const totalStockoutCount = stockoutDays.filter((sd) => sd !== null).length;
  const stockoutProbability = Number(((totalStockoutCount / simulationsCount) * 100).toFixed(1));

  // Average days to stockout (for runs that stock out) or linear calculation
  const stockoutDaysList = stockoutDays.filter((sd): sd is number => sd !== null);
  const avgStockoutDayFromSim = stockoutDaysList.length > 0
    ? stockoutDaysList.reduce((a, b) => a + b, 0) / stockoutDaysList.length
    : null;

  const estimatedDaysToStockout = currentStock > 0 && effectiveDailyUnits > 0
    ? Number(Math.min(horizonDays, Math.max(1, currentStock / effectiveDailyUnits)).toFixed(1))
    : 0;

  // Stockout Risk Level & Recommendation
  let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'LOW';
  let recommendation = 'Estoque confortável para o período da simulação.';

  if (stockoutProbability > 70) {
    riskLevel = 'CRITICAL';
    recommendation = `Risco altíssimo (${stockoutProbability}%). Reabastecimento urgente necessário em ~${estimatedDaysToStockout} dias.`;
  } else if (stockoutProbability > 40) {
    riskLevel = 'HIGH';
    recommendation = `Risco elevado de ruptura. Planeje compra de reposição antes do dia ${Math.round(estimatedDaysToStockout)}.`;
  } else if (stockoutProbability > 15) {
    riskLevel = 'MEDIUM';
    recommendation = `Atenção recomendada. Probabilidade moderada (${stockoutProbability}%) de ficar sem estoque no final do horizonte.`;
  }

  const finalDayProjection = dailyProjections[dailyProjections.length - 1];

  return {
    dailyProjections,
    totalExpectedRevenue: finalDayProjection ? finalDayProjection.meanRevenue : 0,
    totalExpectedUnits: finalDayProjection ? finalDayProjection.meanUnits : 0,
    lowerBoundRevenue: finalDayProjection ? finalDayProjection.lowerBoundRevenue : 0,
    upperBoundRevenue: finalDayProjection ? finalDayProjection.upperBoundRevenue : 0,
    outOfStockRisk: {
      stockoutProbability,
      estimatedDaysToStockout: avgStockoutDayFromSim ? Number(avgStockoutDayFromSim.toFixed(1)) : estimatedDaysToStockout,
      riskLevel,
      recommendation,
    },
  };
}
