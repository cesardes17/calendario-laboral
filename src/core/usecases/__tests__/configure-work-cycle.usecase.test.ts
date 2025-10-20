/**
 * Tests for ConfigureWorkCycle Use Case
 *
 * Following TDD approach
 * Tests business logic for work cycle configuration
 */

import { ConfigureWorkCycleUseCase } from '../configure-work-cycle.usecase';
import { CycleMode, WeeklyMask, CyclePart } from '../../domain/work-cycle';

describe('ConfigureWorkCycleUseCase', () => {
  let useCase: ConfigureWorkCycleUseCase;

  beforeEach(() => {
    useCase = new ConfigureWorkCycleUseCase();
  });

  describe('configureWeekly', () => {
    it('should configure a valid weekly cycle', () => {
      const mask: WeeklyMask = [true, true, true, true, true, false, false];
      const result = useCase.configureWeekly(mask);

      expect(result.isSuccess()).toBe(true);
      expect(result.getValue().mode).toBe(CycleMode.WEEKLY);
    });

    it('should fail with invalid weekly mask', () => {
      const mask: WeeklyMask = [false, false, false, false, false, false, false];
      const result = useCase.configureWeekly(mask);

      expect(result.isFailure()).toBe(true);
      expect(result.errorValue()).toContain('al menos un día trabajado');
    });

    it('should accept non-conventional weekly patterns', () => {
      const mask: WeeklyMask = [true, false, true, false, true, false, true];
      const result = useCase.configureWeekly(mask);

      expect(result.isSuccess()).toBe(true);
    });
  });

  describe('configureParts', () => {
    it('should configure a valid single part cycle', () => {
      const parts: CyclePart[] = [{ workDays: 4, restDays: 2 }];
      const result = useCase.configureParts(parts);

      expect(result.isSuccess()).toBe(true);
      expect(result.getValue().mode).toBe(CycleMode.PARTS);
    });

    it('should configure a valid multiple parts cycle', () => {
      const parts: CyclePart[] = [
        { workDays: 6, restDays: 3 },
        { workDays: 6, restDays: 3 },
        { workDays: 6, restDays: 3 },
        { workDays: 6, restDays: 2 },
      ];
      const result = useCase.configureParts(parts);

      expect(result.isSuccess()).toBe(true);
    });

    it('should fail with empty parts array', () => {
      const parts: CyclePart[] = [];
      const result = useCase.configureParts(parts);

      expect(result.isFailure()).toBe(true);
    });

    it('should fail with zero work days', () => {
      const parts: CyclePart[] = [{ workDays: 0, restDays: 2 }];
      const result = useCase.configureParts(parts);

      expect(result.isFailure()).toBe(true);
    });

    it('should fail with zero rest days', () => {
      const parts: CyclePart[] = [{ workDays: 4, restDays: 0 }];
      const result = useCase.configureParts(parts);

      expect(result.isFailure()).toBe(true);
    });
  });

  describe('validateWeeklyMask', () => {
    it('should validate correct weekly mask', () => {
      const mask: WeeklyMask = [true, true, true, true, true, false, false];
      const validation = useCase.validateWeeklyMask(mask);

      expect(validation.isValid).toBe(true);
      expect(validation.errors).toEqual([]);
    });

    it('should return errors for all-rest weekly mask', () => {
      const mask: WeeklyMask = [false, false, false, false, false, false, false];
      const validation = useCase.validateWeeklyMask(mask);

      expect(validation.isValid).toBe(false);
      expect(validation.errors.length).toBeGreaterThan(0);
    });
  });

  describe('validateParts', () => {
    it('should validate correct parts', () => {
      const parts: CyclePart[] = [{ workDays: 4, restDays: 2 }];
      const validation = useCase.validateParts(parts);

      expect(validation.isValid).toBe(true);
      expect(validation.errors).toEqual([]);
    });

    it('should return errors for empty parts', () => {
      const parts: CyclePart[] = [];
      const validation = useCase.validateParts(parts);

      expect(validation.isValid).toBe(false);
      expect(validation.errors.length).toBeGreaterThan(0);
    });

    it('should return errors for invalid work days', () => {
      const parts: CyclePart[] = [{ workDays: 0, restDays: 2 }];
      const validation = useCase.validateParts(parts);

      expect(validation.isValid).toBe(false);
      expect(validation.errors.length).toBeGreaterThan(0);
    });

    it('should return errors for invalid rest days', () => {
      const parts: CyclePart[] = [{ workDays: 4, restDays: -1 }];
      const validation = useCase.validateParts(parts);

      expect(validation.isValid).toBe(false);
      expect(validation.errors.length).toBeGreaterThan(0);
    });

    it('should validate multiple parts correctly', () => {
      const parts: CyclePart[] = [
        { workDays: 6, restDays: 3 },
        { workDays: 6, restDays: 2 },
      ];
      const validation = useCase.validateParts(parts);

      expect(validation.isValid).toBe(true);
      expect(validation.errors).toEqual([]);
    });

    it('should detect errors in any part of multiple parts', () => {
      const parts: CyclePart[] = [
        { workDays: 6, restDays: 3 },
        { workDays: 0, restDays: 2 }, // Invalid
      ];
      const validation = useCase.validateParts(parts);

      expect(validation.isValid).toBe(false);
      expect(validation.errors.length).toBeGreaterThan(0);
    });
  });

  describe('getCycleInfo', () => {
    it('should get info for weekly cycle', () => {
      const mask: WeeklyMask = [true, true, true, true, true, false, false];
      const cycle = useCase.configureWeekly(mask).getValue();
      const info = useCase.getCycleInfo(cycle);

      expect(info.mode).toBe('weekly');
      expect(info.description).toContain('5 días');
    });

    it('should get info for parts cycle', () => {
      const parts: CyclePart[] = [{ workDays: 4, restDays: 2 }];
      const cycle = useCase.configureParts(parts).getValue();
      const info = useCase.getCycleInfo(cycle);

      expect(info.mode).toBe('parts');
      expect(info.description).toContain('4-2');
      expect(info.totalParts).toBe(1);
    });

    it('should get info for multiple parts cycle', () => {
      const parts: CyclePart[] = [
        { workDays: 6, restDays: 3 },
        { workDays: 6, restDays: 2 },
      ];
      const cycle = useCase.configureParts(parts).getValue();
      const info = useCase.getCycleInfo(cycle);

      expect(info.totalParts).toBe(2);
    });
  });
});
