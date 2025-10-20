/**
 * Tests for useWorkCycle Hook
 *
 * Following TDD approach
 * Tests React hook for work cycle configuration UI logic
 */

import { renderHook, act } from '@testing-library/react';
import { useWorkCycle } from '../use-work-cycle';
import { CycleMode, WeeklyMask, CyclePart } from '@/src/core/domain/work-cycle';

describe('useWorkCycle', () => {
  describe('Initial state', () => {
    it('should initialize with null cycle', () => {
      const { result } = renderHook(() => useWorkCycle());

      expect(result.current.state.cycle).toBeNull();
      expect(result.current.state.mode).toBeNull();
      expect(result.current.state.errors).toEqual([]);
      expect(result.current.state.isValid).toBe(false);
    });
  });

  describe('configureWeekly function', () => {
    it('should configure valid weekly cycle', () => {
      const { result } = renderHook(() => useWorkCycle());
      const mask: WeeklyMask = [true, true, true, true, true, false, false];

      act(() => {
        result.current.configureWeekly(mask);
      });

      expect(result.current.state.cycle).not.toBeNull();
      expect(result.current.state.mode).toBe(CycleMode.WEEKLY);
      expect(result.current.state.errors).toEqual([]);
      expect(result.current.state.isValid).toBe(true);
    });

    it('should set error when weekly mask is invalid', () => {
      const { result } = renderHook(() => useWorkCycle());
      const mask: WeeklyMask = [false, false, false, false, false, false, false];

      act(() => {
        result.current.configureWeekly(mask);
      });

      expect(result.current.state.cycle).toBeNull();
      expect(result.current.state.mode).toBe(CycleMode.WEEKLY);
      expect(result.current.state.errors.length).toBeGreaterThan(0);
      expect(result.current.state.isValid).toBe(false);
    });

    it('should accept non-conventional weekly patterns', () => {
      const { result } = renderHook(() => useWorkCycle());
      const mask: WeeklyMask = [true, false, true, false, true, false, true];

      act(() => {
        result.current.configureWeekly(mask);
      });

      expect(result.current.state.cycle).not.toBeNull();
      expect(result.current.state.isValid).toBe(true);
    });

    it('should clear previous errors when valid mask is set', () => {
      const { result } = renderHook(() => useWorkCycle());
      const invalidMask: WeeklyMask = [false, false, false, false, false, false, false];
      const validMask: WeeklyMask = [true, true, true, true, true, false, false];

      // Set invalid first
      act(() => {
        result.current.configureWeekly(invalidMask);
      });

      expect(result.current.state.errors.length).toBeGreaterThan(0);

      // Set valid
      act(() => {
        result.current.configureWeekly(validMask);
      });

      expect(result.current.state.errors).toEqual([]);
      expect(result.current.state.isValid).toBe(true);
    });
  });

  describe('configureParts function', () => {
    it('should configure valid single part cycle', () => {
      const { result } = renderHook(() => useWorkCycle());
      const parts: CyclePart[] = [{ workDays: 4, restDays: 2 }];

      act(() => {
        result.current.configureParts(parts);
      });

      expect(result.current.state.cycle).not.toBeNull();
      expect(result.current.state.mode).toBe(CycleMode.PARTS);
      expect(result.current.state.errors).toEqual([]);
      expect(result.current.state.isValid).toBe(true);
    });

    it('should configure valid multiple parts cycle', () => {
      const { result } = renderHook(() => useWorkCycle());
      const parts: CyclePart[] = [
        { workDays: 6, restDays: 3 },
        { workDays: 6, restDays: 2 },
      ];

      act(() => {
        result.current.configureParts(parts);
      });

      expect(result.current.state.cycle).not.toBeNull();
      expect(result.current.state.isValid).toBe(true);
    });

    it('should set error when parts are empty', () => {
      const { result } = renderHook(() => useWorkCycle());
      const parts: CyclePart[] = [];

      act(() => {
        result.current.configureParts(parts);
      });

      expect(result.current.state.cycle).toBeNull();
      expect(result.current.state.errors.length).toBeGreaterThan(0);
      expect(result.current.state.isValid).toBe(false);
    });

    it('should set error when work days is zero', () => {
      const { result } = renderHook(() => useWorkCycle());
      const parts: CyclePart[] = [{ workDays: 0, restDays: 2 }];

      act(() => {
        result.current.configureParts(parts);
      });

      expect(result.current.state.cycle).toBeNull();
      expect(result.current.state.errors.length).toBeGreaterThan(0);
      expect(result.current.state.isValid).toBe(false);
    });

    it('should set error when rest days is zero', () => {
      const { result } = renderHook(() => useWorkCycle());
      const parts: CyclePart[] = [{ workDays: 4, restDays: 0 }];

      act(() => {
        result.current.configureParts(parts);
      });

      expect(result.current.state.cycle).toBeNull();
      expect(result.current.state.errors.length).toBeGreaterThan(0);
      expect(result.current.state.isValid).toBe(false);
    });

    it('should clear previous errors when valid parts are set', () => {
      const { result } = renderHook(() => useWorkCycle());
      const invalidParts: CyclePart[] = [];
      const validParts: CyclePart[] = [{ workDays: 4, restDays: 2 }];

      // Set invalid first
      act(() => {
        result.current.configureParts(invalidParts);
      });

      expect(result.current.state.errors.length).toBeGreaterThan(0);

      // Set valid
      act(() => {
        result.current.configureParts(validParts);
      });

      expect(result.current.state.errors).toEqual([]);
      expect(result.current.state.isValid).toBe(true);
    });
  });

  describe('validateWeeklyMask function', () => {
    it('should validate correct weekly mask', () => {
      const { result } = renderHook(() => useWorkCycle());
      const mask: WeeklyMask = [true, true, true, true, true, false, false];

      let validation;
      act(() => {
        validation = result.current.validateWeeklyMask(mask);
      });

      expect(validation.isValid).toBe(true);
      expect(validation.errors).toEqual([]);
    });

    it('should return errors for invalid weekly mask', () => {
      const { result } = renderHook(() => useWorkCycle());
      const mask: WeeklyMask = [false, false, false, false, false, false, false];

      let validation;
      act(() => {
        validation = result.current.validateWeeklyMask(mask);
      });

      expect(validation.isValid).toBe(false);
      expect(validation.errors.length).toBeGreaterThan(0);
    });

    it('should not modify state when validating', () => {
      const { result } = renderHook(() => useWorkCycle());
      const mask: WeeklyMask = [true, true, true, true, true, false, false];

      act(() => {
        result.current.validateWeeklyMask(mask);
      });

      // State should remain initial
      expect(result.current.state.cycle).toBeNull();
      expect(result.current.state.errors).toEqual([]);
    });
  });

  describe('validateParts function', () => {
    it('should validate correct parts', () => {
      const { result } = renderHook(() => useWorkCycle());
      const parts: CyclePart[] = [{ workDays: 4, restDays: 2 }];

      let validation;
      act(() => {
        validation = result.current.validateParts(parts);
      });

      expect(validation.isValid).toBe(true);
      expect(validation.errors).toEqual([]);
    });

    it('should return errors for invalid parts', () => {
      const { result } = renderHook(() => useWorkCycle());
      const parts: CyclePart[] = [];

      let validation;
      act(() => {
        validation = result.current.validateParts(parts);
      });

      expect(validation.isValid).toBe(false);
      expect(validation.errors.length).toBeGreaterThan(0);
    });

    it('should not modify state when validating', () => {
      const { result } = renderHook(() => useWorkCycle());
      const parts: CyclePart[] = [{ workDays: 4, restDays: 2 }];

      act(() => {
        result.current.validateParts(parts);
      });

      // State should remain initial
      expect(result.current.state.cycle).toBeNull();
      expect(result.current.state.errors).toEqual([]);
    });
  });

  describe('reset function', () => {
    it('should reset all state to initial values', () => {
      const { result } = renderHook(() => useWorkCycle());
      const mask: WeeklyMask = [true, true, true, true, true, false, false];

      // Set some values
      act(() => {
        result.current.configureWeekly(mask);
      });

      expect(result.current.state.cycle).not.toBeNull();
      expect(result.current.state.isValid).toBe(true);

      // Reset
      act(() => {
        result.current.reset();
      });

      expect(result.current.state.cycle).toBeNull();
      expect(result.current.state.mode).toBeNull();
      expect(result.current.state.errors).toEqual([]);
      expect(result.current.state.isValid).toBe(false);
    });
  });

  describe('Mode switching', () => {
    it('should switch from weekly to parts mode', () => {
      const { result } = renderHook(() => useWorkCycle());
      const mask: WeeklyMask = [true, true, true, true, true, false, false];
      const parts: CyclePart[] = [{ workDays: 4, restDays: 2 }];

      // Configure weekly first
      act(() => {
        result.current.configureWeekly(mask);
      });

      expect(result.current.state.mode).toBe(CycleMode.WEEKLY);

      // Switch to parts
      act(() => {
        result.current.configureParts(parts);
      });

      expect(result.current.state.mode).toBe(CycleMode.PARTS);
      expect(result.current.state.cycle).not.toBeNull();
    });

    it('should switch from parts to weekly mode', () => {
      const { result } = renderHook(() => useWorkCycle());
      const parts: CyclePart[] = [{ workDays: 4, restDays: 2 }];
      const mask: WeeklyMask = [true, true, true, true, true, false, false];

      // Configure parts first
      act(() => {
        result.current.configureParts(parts);
      });

      expect(result.current.state.mode).toBe(CycleMode.PARTS);

      // Switch to weekly
      act(() => {
        result.current.configureWeekly(mask);
      });

      expect(result.current.state.mode).toBe(CycleMode.WEEKLY);
      expect(result.current.state.cycle).not.toBeNull();
    });
  });
});
