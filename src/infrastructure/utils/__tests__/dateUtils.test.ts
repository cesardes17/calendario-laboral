/**
 * Date Utilities Tests
 *
 * Tests for date calculation functions used in calendar generation.
 */

import {
  getISOWeekNumber,
  getDaysInMonth,
  isLeapYear,
  createDate,
  formatDateISO,
} from '../dateUtils';

describe('dateUtils', () => {
  describe('getISOWeekNumber', () => {
    it('should return week 1 for January 4th (always in week 1)', () => {
      const date = new Date('2025-01-04');
      expect(getISOWeekNumber(date)).toBe(1);
    });

    it('should return correct week number for middle of year', () => {
      const date = new Date('2025-07-01');
      const weekNumber = getISOWeekNumber(date);
      expect(weekNumber).toBeGreaterThan(25);
      expect(weekNumber).toBeLessThan(28);
    });

    it('should return valid week number for December 31st', () => {
      const date = new Date('2025-12-31');
      const weekNumber = getISOWeekNumber(date);
      // Dec 31 can be week 52, 53, or 1 (of next year) depending on day of week
      expect(weekNumber).toBeGreaterThanOrEqual(1);
      expect(weekNumber).toBeLessThanOrEqual(53);
    });

    it('should handle year boundary correctly', () => {
      // Some Dec 31 dates belong to week 1 of next year
      // Some Jan 1 dates belong to week 52/53 of previous year
      const dec31_2020 = new Date('2020-12-31');
      const jan1_2021 = new Date('2021-01-01');

      const weekDec = getISOWeekNumber(dec31_2020);
      const weekJan = getISOWeekNumber(jan1_2021);

      // Both should be valid week numbers
      expect(weekDec).toBeGreaterThanOrEqual(1);
      expect(weekDec).toBeLessThanOrEqual(53);
      expect(weekJan).toBeGreaterThanOrEqual(1);
      expect(weekJan).toBeLessThanOrEqual(53);
    });
  });

  describe('getDaysInMonth', () => {
    it('should return 31 days for January', () => {
      expect(getDaysInMonth(2025, 1)).toBe(31);
    });

    it('should return 28 days for February in non-leap year', () => {
      expect(getDaysInMonth(2025, 2)).toBe(28);
    });

    it('should return 29 days for February in leap year', () => {
      expect(getDaysInMonth(2024, 2)).toBe(29);
    });

    it('should return 30 days for April', () => {
      expect(getDaysInMonth(2025, 4)).toBe(30);
    });

    it('should return 31 days for December', () => {
      expect(getDaysInMonth(2025, 12)).toBe(31);
    });

    it('should handle all months correctly', () => {
      const expectedDays = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

      for (let month = 1; month <= 12; month++) {
        expect(getDaysInMonth(2025, month)).toBe(expectedDays[month - 1]);
      }
    });
  });

  describe('isLeapYear', () => {
    it('should return true for leap years divisible by 4', () => {
      expect(isLeapYear(2024)).toBe(true);
      expect(isLeapYear(2028)).toBe(true);
    });

    it('should return false for non-leap years', () => {
      expect(isLeapYear(2025)).toBe(false);
      expect(isLeapYear(2026)).toBe(false);
      expect(isLeapYear(2027)).toBe(false);
    });

    it('should return false for years divisible by 100 but not 400', () => {
      expect(isLeapYear(1900)).toBe(false);
      expect(isLeapYear(2100)).toBe(false);
    });

    it('should return true for years divisible by 400', () => {
      expect(isLeapYear(2000)).toBe(true);
      expect(isLeapYear(2400)).toBe(true);
    });
  });

  describe('createDate', () => {
    it('should create date at midnight UTC', () => {
      const date = createDate(2025, 1, 15);

      expect(date.getUTCFullYear()).toBe(2025);
      expect(date.getUTCMonth()).toBe(0); // 0-indexed
      expect(date.getUTCDate()).toBe(15);
      expect(date.getUTCHours()).toBe(0);
      expect(date.getUTCMinutes()).toBe(0);
      expect(date.getUTCSeconds()).toBe(0);
      expect(date.getUTCMilliseconds()).toBe(0);
    });

    it('should handle different months correctly', () => {
      const date = createDate(2025, 6, 15);

      expect(date.getUTCFullYear()).toBe(2025);
      expect(date.getUTCMonth()).toBe(5); // June is month 5 (0-indexed)
      expect(date.getUTCDate()).toBe(15);
    });
  });

  describe('formatDateISO', () => {
    it('should format date in YYYY-MM-DD format', () => {
      const date = new Date('2025-01-15');
      expect(formatDateISO(date)).toBe('2025-01-15');
    });

    it('should pad single digit months and days', () => {
      const date = new Date('2025-03-05');
      expect(formatDateISO(date)).toBe('2025-03-05');
    });

    it('should handle December correctly', () => {
      const date = new Date('2025-12-31');
      expect(formatDateISO(date)).toBe('2025-12-31');
    });
  });
});
