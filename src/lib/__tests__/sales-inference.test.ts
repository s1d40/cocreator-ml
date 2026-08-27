import {
  parseStockRangeValue,
  calculateZipfRankingWeight,
  calculateStockTransitionDelta,
  calculateQuestionVelocity,
  calculateReviewVelocity,
  calculateEstimatedSales,
  StockSnapshot,
  ItemData,
} from '../sales-inference';

describe('Sales Inference Engine (src/lib/sales-inference.ts)', () => {
  describe('parseStockRangeValue', () => {
    it('returns exact quantity if provided as number', () => {
      expect(parseStockRangeValue('RANGO_6_25', 12)).toBe(12);
    });

    it('parses range strings to midpoint estimates', () => {
      expect(parseStockRangeValue('RANGO_1_5')).toBe(3);
      expect(parseStockRangeValue('RANGO_6_25')).toBe(15.5);
      expect(parseStockRangeValue('RANGO_26_50')).toBe(38);
      expect(parseStockRangeValue('RANGO_50_PLUS')).toBe(75);
    });

    it('handles custom or undefined inputs gracefully', () => {
      expect(parseStockRangeValue(undefined)).toBe(10);
      expect(parseStockRangeValue('15')).toBe(15);
    });
  });

  describe('calculateZipfRankingWeight', () => {
    it('gives top category rank 1 highest weight', () => {
      const weight1 = calculateZipfRankingWeight(1);
      const weight10 = calculateZipfRankingWeight(10);
      expect(weight1).toBe(1.0);
      expect(weight10).toBeLessThan(weight1);
    });

    it('returns default weight for missing or zero rank', () => {
      expect(calculateZipfRankingWeight(undefined)).toBe(0.5);
      expect(calculateZipfRankingWeight(0)).toBe(0.5);
    });
  });

  describe('calculateStockTransitionDelta', () => {
    it('calculates transition stock delta across snapshots', () => {
      const itemData: ItemData = { mlbId: 'MLB123', price: 100 };
      const snapshots: StockSnapshot[] = [
        { timestamp: '2026-08-01T00:00:00Z', stockRange: 'RANGO_26_50', availableQuantity: 40, price: 100 },
        { timestamp: '2026-08-03T00:00:00Z', stockRange: 'RANGO_6_25', availableQuantity: 20, price: 100 },
      ];

      const result = calculateStockTransitionDelta(itemData, snapshots);
      // Delta = 40 - 20 = 20 units over 2 days => 10 units/day
      expect(result.totalDelta).toBe(20);
      expect(result.periodDays).toBe(2);
      expect(result.estimatedDailyUnits).toBe(10);
    });
  });

  describe('calculateEstimatedSales', () => {
    it('produces a comprehensive SalesEstimate object', () => {
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
      expect(estimate.indicators.stockTransitionDelta).toBe(6); // (45-15)/5 days = 6 units/day
      expect(estimate.indicators.questionVelocityScore).toBe(2); // (20-10)/5 days = 2 questions/day
      expect(estimate.indicators.reviewVelocityScore).toBe(0.6); // (8-5)/5 days = 0.6 reviews/day
    });
  });
});
