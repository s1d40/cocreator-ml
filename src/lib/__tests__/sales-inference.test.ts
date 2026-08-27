import assert from 'assert';
import {
  parseStockRangeValue,
  quantityToStockRange,
  adjustDemandForElasticity,
  calculateZipfRankingWeight,
  calculateStockTransitionDelta,
  calculateEstimatedSales,
  runMonteCarloSimulation,
  StockSnapshot,
  ItemData,
} from '../sales-inference';

// Helper assertion function
function expect(actual: any) {
  return {
    toBe(expected: any) {
      assert.strictEqual(actual, expected);
    },
    toBeGreaterThan(expected: number) {
      assert(actual > expected, `${actual} should be > ${expected}`);
    },
    toBeGreaterThanOrEqual(expected: number) {
      assert(actual >= expected, `${actual} should be >= ${expected}`);
    },
    toBeLessThan(expected: number) {
      assert(actual < expected, `${actual} should be < ${expected}`);
    },
  };
}

console.log('Running sales-inference.test.ts...');

// 1. parseStockRangeValue
expect(parseStockRangeValue('RANGO_6_25', 12)).toBe(12);
expect(parseStockRangeValue('RANGO_1_5')).toBe(3);
expect(parseStockRangeValue('RANGO_6_25')).toBe(15.5);
expect(parseStockRangeValue('RANGO_26_50')).toBe(38);
expect(parseStockRangeValue('RANGO_50_PLUS')).toBe(75);
expect(parseStockRangeValue(undefined)).toBe(10);
expect(parseStockRangeValue('15')).toBe(15);
console.log('✓ parseStockRangeValue tests passed');

// 2. quantityToStockRange
expect(quantityToStockRange(4)).toBe('RANGO_1_5');
expect(quantityToStockRange(20)).toBe('RANGO_6_25');
expect(quantityToStockRange(45)).toBe('RANGO_26_50');
expect(quantityToStockRange(90)).toBe('RANGO_51_100');
expect(quantityToStockRange(150)).toBe('RANGO_100_PLUS');
console.log('✓ quantityToStockRange tests passed');

// 3. adjustDemandForElasticity
const baseDemand = 10;
const priceIncreaseDemand = adjustDemandForElasticity(baseDemand, 100, 120, 1.5);
expect(priceIncreaseDemand).toBeLessThan(baseDemand);
const priceDecreaseDemand = adjustDemandForElasticity(baseDemand, 100, 80, 1.5);
expect(priceDecreaseDemand).toBeGreaterThan(baseDemand);
console.log('✓ adjustDemandForElasticity tests passed');

// 4. calculateZipfRankingWeight
const weight1 = calculateZipfRankingWeight(1);
const weight10 = calculateZipfRankingWeight(10);
expect(weight1).toBe(1.0);
expect(weight10).toBeLessThan(weight1);
expect(calculateZipfRankingWeight(undefined)).toBe(0.5);
expect(calculateZipfRankingWeight(0)).toBe(0.5);
console.log('✓ calculateZipfRankingWeight tests passed');

// 5. calculateStockTransitionDelta
const itemDataDelta: ItemData = { mlbId: 'MLB123', price: 100 };
const snapshotsDelta: StockSnapshot[] = [
  { timestamp: '2026-08-01T00:00:00Z', stockRange: 'RANGO_26_50', availableQuantity: 40, price: 100 },
  { timestamp: '2026-08-03T00:00:00Z', stockRange: 'RANGO_6_25', availableQuantity: 20, price: 100 },
];
const resultDelta = calculateStockTransitionDelta(itemDataDelta, snapshotsDelta);
expect(resultDelta.totalDelta).toBe(20);
expect(resultDelta.periodDays).toBe(2);
expect(resultDelta.estimatedDailyUnits).toBe(10);
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
expect(estimate.mlbId).toBe('MLB987654321');
expect(estimate.estimatedDailyUnits).toBeGreaterThan(0);
expect(estimate.estimatedMonthlyUnits).toBe(estimate.estimatedDailyUnits * 30);
expect(estimate.estimatedMonthlyRevenue).toBe(estimate.estimatedMonthlyUnits * 2500);
expect(estimate.confidenceScore).toBeGreaterThanOrEqual(40);
expect(estimate.indicators.stockTransitionDelta).toBe(6);
expect(estimate.indicators.questionVelocityScore).toBe(2);
expect(estimate.indicators.reviewVelocityScore).toBe(0.6);
console.log('✓ calculateEstimatedSales tests passed');

// 7. runMonteCarloSimulation
const mcResult = runMonteCarloSimulation({
  baseDailyUnits: 8,
  unitPrice: 200,
  horizonDays: 60,
  confidenceInterval: 95,
  currentStock: 100,
  elasticity: 1.2,
  simulationsCount: 500,
});

expect(mcResult.dailyProjections.length).toBeGreaterThan(0);
expect(mcResult.lowerBoundRevenue).toBeLessThan(mcResult.totalExpectedRevenue + 1);
expect(mcResult.upperBoundRevenue).toBeGreaterThan(mcResult.totalExpectedRevenue - 1);
assert(mcResult.outOfStockRisk.stockoutProbability >= 0 && mcResult.outOfStockRisk.stockoutProbability <= 100);
console.log('✓ runMonteCarloSimulation tests passed');

console.log('sales-inference.test.ts completed successfully!');
