import assert from 'assert';
import {
  parseStockRangeValue,
  quantityToStockRange,
  adjustDemandForElasticity,
  calculateZipfRankingWeight,
  calculateStockTransitionDelta,
  calculateEstimatedSales,
  runMonteCarloSimulation,
  ItemData,
  StockSnapshot,
} from '../sales-inference';

console.log('Running Sales Inference Engine unit tests...');

// 1. parseStockRangeValue
assert.strictEqual(parseStockRangeValue('RANGO_6_25', 12), 12);
assert.strictEqual(parseStockRangeValue('RANGO_1_5'), 3);
assert.strictEqual(parseStockRangeValue('RANGO_6_25'), 15.5);
assert.strictEqual(parseStockRangeValue('RANGO_26_50'), 38);
assert.strictEqual(parseStockRangeValue('RANGO_50_PLUS'), 75);
assert.strictEqual(parseStockRangeValue(undefined), 10);
console.log('✓ parseStockRangeValue tests passed');

// 2. quantityToStockRange
assert.strictEqual(quantityToStockRange(3), 'RANGO_1_5');
assert.strictEqual(quantityToStockRange(15), 'RANGO_6_25');
assert.strictEqual(quantityToStockRange(40), 'RANGO_26_50');
assert.strictEqual(quantityToStockRange(80), 'RANGO_51_100');
assert.strictEqual(quantityToStockRange(200), 'RANGO_100_PLUS');
console.log('✓ quantityToStockRange tests passed');

// 3. adjustDemandForElasticity
const baseDemand = 10;
const priceIncreaseDemand = adjustDemandForElasticity(baseDemand, 100, 120, 1.5);
assert(priceIncreaseDemand < baseDemand, 'Higher price should reduce demand');
const priceDecreaseDemand = adjustDemandForElasticity(baseDemand, 100, 80, 1.5);
assert(priceDecreaseDemand > baseDemand, 'Lower price should increase demand');
console.log('✓ adjustDemandForElasticity tests passed');

// 4. calculateZipfRankingWeight
const weight1 = calculateZipfRankingWeight(1);
const weight10 = calculateZipfRankingWeight(10);
assert.strictEqual(weight1, 1.0);
assert(weight10 < weight1, 'Rank 10 should have less weight than rank 1');
assert.strictEqual(calculateZipfRankingWeight(undefined), 0.5);
assert.strictEqual(calculateZipfRankingWeight(0), 0.5);
console.log('✓ calculateZipfRankingWeight tests passed');

// 5. calculateStockTransitionDelta
const itemDataDelta: ItemData = { mlbId: 'MLB123', price: 100 };
const snapshotsDelta: StockSnapshot[] = [
  { timestamp: '2026-08-01T00:00:00Z', stockRange: 'RANGO_26_50', availableQuantity: 40, price: 100 },
  { timestamp: '2026-08-03T00:00:00Z', stockRange: 'RANGO_6_25', availableQuantity: 20, price: 100 },
];
const resultDelta = calculateStockTransitionDelta(itemDataDelta, snapshotsDelta);
assert.strictEqual(resultDelta.totalDelta, 20);
assert.strictEqual(resultDelta.periodDays, 2);
assert.strictEqual(resultDelta.estimatedDailyUnits, 10);
console.log('✓ calculateStockTransitionDelta tests passed');

// 6. calculateEstimatedSales
const itemData: ItemData = {
  mlbId: 'MLB987654321',
  title: 'Smartphone Flagship 256GB',
  price: 2500,
  categoryRanking: 3,
  totalCategoryItems: 50,
};

const snapshots: StockSnapshot[] = [
  {
    timestamp: '2026-08-01T00:00:00Z',
    stockRange: 'RANGO_26_50',
    availableQuantity: 45,
    price: 2500,
    questionsCount: 10,
    reviewsCount: 5,
  },
  {
    timestamp: '2026-08-06T00:00:00Z',
    stockRange: 'RANGO_6_25',
    availableQuantity: 15,
    price: 2500,
    questionsCount: 20,
    reviewsCount: 8,
  },
];

const estimate = calculateEstimatedSales(itemData, snapshots);
assert.strictEqual(estimate.mlbId, 'MLB987654321');
assert(estimate.estimatedDailyUnits > 0);
assert.strictEqual(estimate.estimatedMonthlyUnits, estimate.estimatedDailyUnits * 30);
assert.strictEqual(estimate.estimatedMonthlyRevenue, estimate.estimatedMonthlyUnits * 2500);
assert(estimate.confidenceScore >= 40);
assert.strictEqual(estimate.indicators.stockTransitionDelta, 6);
assert.strictEqual(estimate.indicators.questionVelocityScore, 2);
assert.strictEqual(estimate.indicators.reviewVelocityScore, 0.6);
console.log('✓ calculateEstimatedSales tests passed');

// 7. runMonteCarloSimulation & Out-of-Stock Risk
const mcResult = runMonteCarloSimulation({
  baseDailyUnits: 5,
  unitPrice: 100,
  horizonDays: 30,
  confidenceInterval: 90,
  currentStock: 50, // 10 days of stock for 30-day horizon -> high stockout risk
  elasticity: 1.2,
  simulationsCount: 500,
});

assert(mcResult.dailyProjections.length > 0, 'Should generate daily projection data points');
assert(mcResult.lowerBoundRevenue <= mcResult.totalExpectedRevenue, 'Lower bound <= mean revenue');
assert(mcResult.upperBoundRevenue >= mcResult.totalExpectedRevenue, 'Upper bound >= mean revenue');
assert(mcResult.outOfStockRisk.stockoutProbability > 80, 'Stock of 50 for 5 units/day over 30 days should have high stockout probability');
assert(mcResult.outOfStockRisk.riskLevel === 'CRITICAL' || mcResult.outOfStockRisk.riskLevel === 'HIGH');
console.log('✓ runMonteCarloSimulation tests passed');

console.log('ALL SALES INFERENCE TESTS PASSED SUCCESSFULLY!');
