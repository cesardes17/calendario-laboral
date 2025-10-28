/**
 * Tests for SelectYear Use Case
 *
 * Following TDD approach - RED phase
 * Tests business logic for year selection
 */

import { SelectYearUseCase } from '../selectYear.usecase';

describe('SelectYearUseCase', () => {
  let useCase: SelectYearUseCase;

  beforeEach(() => {
    useCase = new SelectYearUseCase();
  });

  describe('execute', () => {
    it('should successfully select a valid year', () => {
      const result = useCase.execute(2025);

      expect(result.isSuccess()).toBe(true);
      expect(result.getValue().value).toBe(2025);
    });

    it('should return current year by default when no parameter provided', () => {
      const currentYear = new Date().getFullYear();
      const result = useCase.execute();

      expect(result.isSuccess()).toBe(true);
      expect(result.getValue().value).toBe(currentYear);
    });

    it('should fail when year is invalid', () => {
      const result = useCase.execute(999);

      expect(result.isFailure()).toBe(true);
      expect(result.errorValue()).toContain('4 dígitos');
    });

    it('should fail when year is out of valid range', () => {
      const currentYear = new Date().getFullYear();
      const outOfRangeYear = currentYear + 10;
      const result = useCase.execute(outOfRangeYear);

      expect(result.isFailure()).toBe(true);
      expect(result.errorValue()).toContain('rango válido');
    });
  });

  describe('validateYear', () => {
    it('should validate a year within acceptable range', () => {
      const currentYear = new Date().getFullYear();
      const result = useCase.validateYear(currentYear);

      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should return validation error for invalid year', () => {
      const result = useCase.validateYear(999);

      expect(result.isValid).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error).toContain('4 dígitos');
    });

    it('should return year range information', () => {
      const currentYear = new Date().getFullYear();
      const minYear = currentYear - 2;
      const maxYear = currentYear + 5;

      const range = useCase.getYearRange();

      expect(range.min).toBe(minYear);
      expect(range.max).toBe(maxYear);
      expect(range.current).toBe(currentYear);
    });
  });
});
