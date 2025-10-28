/**
 * Tests for ContractStartDate Value Object
 *
 * Following TDD approach - RED phase
 * Tests business logic for contract start date validation
 */

import { ContractStartDate } from '../contractStartDate';
import { Year } from '../year';

describe('ContractStartDate Value Object', () => {
  const testYear = Year.create(2025).getValue();

  describe('Creation and validation', () => {
    it('should create a valid ContractStartDate within the year', () => {
      const date = new Date('2025-06-15');
      const contractDate = ContractStartDate.create(date, testYear);

      expect(contractDate.isSuccess()).toBe(true);
      expect(contractDate.getValue().value).toEqual(date);
    });

    it('should fail when date is before the year starts', () => {
      const date = new Date('2024-12-31');
      const contractDate = ContractStartDate.create(date, testYear);

      expect(contractDate.isFailure()).toBe(true);
      expect(contractDate.errorValue()).toContain('dentro del año');
    });

    it('should fail when date is after the year ends', () => {
      const date = new Date('2026-01-01');
      const contractDate = ContractStartDate.create(date, testYear);

      expect(contractDate.isFailure()).toBe(true);
      expect(contractDate.errorValue()).toContain('dentro del año');
    });

    it('should accept January 1st as valid start date', () => {
      const date = new Date('2025-01-01');
      const contractDate = ContractStartDate.create(date, testYear);

      expect(contractDate.isSuccess()).toBe(true);
    });

    it('should accept December 31st as valid start date', () => {
      const date = new Date('2025-12-31');
      const contractDate = ContractStartDate.create(date, testYear);

      expect(contractDate.isSuccess()).toBe(true);
    });

    it('should fail when date is invalid', () => {
      const date = new Date('invalid');
      const contractDate = ContractStartDate.create(date, testYear);

      expect(contractDate.isFailure()).toBe(true);
      expect(contractDate.errorValue()).toContain('válida');
    });
  });

  describe('Days before contract', () => {
    it('should calculate days before contract starts (mid-year)', () => {
      const date = new Date('2025-06-15');
      const contractDate = ContractStartDate.create(date, testYear);

      // From Jan 1 to June 14 (inclusive)
      const daysBefore = contractDate.getValue().getDaysBeforeContract();

      // Jan(31) + Feb(28) + Mar(31) + Apr(30) + May(31) + 14 days of June = 165 days
      expect(daysBefore).toBe(165);
    });

    it('should return 0 days before contract when starting on January 1st', () => {
      const date = new Date('2025-01-01');
      const contractDate = ContractStartDate.create(date, testYear);

      expect(contractDate.getValue().getDaysBeforeContract()).toBe(0);
    });

    it('should return correct days for December 31st', () => {
      const date = new Date('2025-12-31');
      const contractDate = ContractStartDate.create(date, testYear);

      // All days of the year minus the last day
      expect(contractDate.getValue().getDaysBeforeContract()).toBe(364);
    });
  });

  describe('Date formatting', () => {
    it('should return ISO string format', () => {
      const date = new Date('2025-06-15');
      const contractDate = ContractStartDate.create(date, testYear);

      expect(contractDate.getValue().toISOString()).toContain('2025-06-15');
    });

    it('should return localized date string', () => {
      const date = new Date('2025-06-15');
      const contractDate = ContractStartDate.create(date, testYear);

      const localString = contractDate.getValue().toLocaleDateString();
      expect(localString).toBeTruthy();
    });
  });

  describe('Comparison', () => {
    it('should return true when comparing equal dates', () => {
      const date1 = new Date('2025-06-15');
      const date2 = new Date('2025-06-15');
      const contractDate1 = ContractStartDate.create(date1, testYear);
      const contractDate2 = ContractStartDate.create(date2, testYear);

      expect(contractDate1.getValue().equals(contractDate2.getValue())).toBe(true);
    });

    it('should return false when comparing different dates', () => {
      const date1 = new Date('2025-06-15');
      const date2 = new Date('2025-07-20');
      const contractDate1 = ContractStartDate.create(date1, testYear);
      const contractDate2 = ContractStartDate.create(date2, testYear);

      expect(contractDate1.getValue().equals(contractDate2.getValue())).toBe(false);
    });

    it('should check if date is before another', () => {
      const date1 = new Date('2025-06-15');
      const date2 = new Date('2025-07-20');
      const contractDate1 = ContractStartDate.create(date1, testYear);
      const contractDate2 = ContractStartDate.create(date2, testYear);

      expect(contractDate1.getValue().isBefore(contractDate2.getValue())).toBe(true);
      expect(contractDate2.getValue().isBefore(contractDate1.getValue())).toBe(false);
    });

    it('should check if date is after another', () => {
      const date1 = new Date('2025-07-20');
      const date2 = new Date('2025-06-15');
      const contractDate1 = ContractStartDate.create(date1, testYear);
      const contractDate2 = ContractStartDate.create(date2, testYear);

      expect(contractDate1.getValue().isAfter(contractDate2.getValue())).toBe(true);
      expect(contractDate2.getValue().isAfter(contractDate1.getValue())).toBe(false);
    });
  });
});
