/**
 * Tests for WorkCycle Value Object
 *
 * Following TDD approach
 * Tests the work cycle configuration (weekly or parts-based)
 */

import { WorkCycle, CycleMode, WeeklyMask, CyclePart } from '../work-cycle';

describe('WorkCycle Value Object', () => {
  describe('Weekly Mode Creation', () => {
    it('should create a valid weekly cycle with work days', () => {
      // Monday to Friday work, Saturday and Sunday rest
      const mask: WeeklyMask = [true, true, true, true, true, false, false];
      const cycle = WorkCycle.createWeekly(mask);

      expect(cycle.isSuccess()).toBe(true);
      expect(cycle.getValue().mode).toBe(CycleMode.WEEKLY);
      expect(cycle.getValue().isWeekly()).toBe(true);
      expect(cycle.getValue().isParts()).toBe(false);
    });

    it('should fail when weekly mask has no work days', () => {
      const mask: WeeklyMask = [false, false, false, false, false, false, false];
      const cycle = WorkCycle.createWeekly(mask);

      expect(cycle.isFailure()).toBe(true);
      expect(cycle.errorValue()).toContain('al menos un día trabajado');
    });

    it('should fail when weekly mask has incorrect length', () => {
      const mask = [true, true, true] as unknown as WeeklyMask;
      const cycle = WorkCycle.createWeekly(mask);

      expect(cycle.isFailure()).toBe(true);
      expect(cycle.errorValue()).toContain('7 días');
    });

    it('should accept all days as work days', () => {
      const mask: WeeklyMask = [true, true, true, true, true, true, true];
      const cycle = WorkCycle.createWeekly(mask);

      expect(cycle.isSuccess()).toBe(true);
    });

    it('should accept non-conventional patterns', () => {
      // Example: maternity schedule - Mon-Thu and Sun work, Fri-Sat rest
      const mask: WeeklyMask = [true, true, true, true, false, false, true];
      const cycle = WorkCycle.createWeekly(mask);

      expect(cycle.isSuccess()).toBe(true);
    });
  });

  describe('Parts Mode Creation', () => {
    it('should create a valid single part cycle (4-2)', () => {
      const parts: CyclePart[] = [{ workDays: 4, restDays: 2 }];
      const cycle = WorkCycle.createParts(parts);

      expect(cycle.isSuccess()).toBe(true);
      expect(cycle.getValue().mode).toBe(CycleMode.PARTS);
      expect(cycle.getValue().isParts()).toBe(true);
      expect(cycle.getValue().isWeekly()).toBe(false);
    });

    it('should create a valid multiple parts cycle (6-3, 6-3, 6-3, 6-2)', () => {
      const parts: CyclePart[] = [
        { workDays: 6, restDays: 3 },
        { workDays: 6, restDays: 3 },
        { workDays: 6, restDays: 3 },
        { workDays: 6, restDays: 2 },
      ];
      const cycle = WorkCycle.createParts(parts);

      expect(cycle.isSuccess()).toBe(true);
    });

    it('should fail when parts array is empty', () => {
      const parts: CyclePart[] = [];
      const cycle = WorkCycle.createParts(parts);

      expect(cycle.isFailure()).toBe(true);
      expect(cycle.errorValue()).toContain('al menos una parte');
    });

    it('should fail when work days is zero', () => {
      const parts: CyclePart[] = [{ workDays: 0, restDays: 2 }];
      const cycle = WorkCycle.createParts(parts);

      expect(cycle.isFailure()).toBe(true);
      expect(cycle.errorValue()).toContain('mayor que 0');
    });

    it('should fail when rest days is zero', () => {
      const parts: CyclePart[] = [{ workDays: 4, restDays: 0 }];
      const cycle = WorkCycle.createParts(parts);

      expect(cycle.isFailure()).toBe(true);
      expect(cycle.errorValue()).toContain('mayor que 0');
    });

    it('should fail when work days is negative', () => {
      const parts: CyclePart[] = [{ workDays: -1, restDays: 2 }];
      const cycle = WorkCycle.createParts(parts);

      expect(cycle.isFailure()).toBe(true);
      expect(cycle.errorValue()).toContain('mayor que 0');
    });

    it('should fail when rest days is negative', () => {
      const parts: CyclePart[] = [{ workDays: 4, restDays: -1 }];
      const cycle = WorkCycle.createParts(parts);

      expect(cycle.isFailure()).toBe(true);
      expect(cycle.errorValue()).toContain('mayor que 0');
    });

    it('should accept large work/rest day values', () => {
      const parts: CyclePart[] = [{ workDays: 20, restDays: 10 }];
      const cycle = WorkCycle.createParts(parts);

      expect(cycle.isSuccess()).toBe(true);
    });
  });

  describe('Cycle Information', () => {
    it('should provide weekly mask for weekly mode', () => {
      const mask: WeeklyMask = [true, true, true, true, true, false, false];
      const cycle = WorkCycle.createWeekly(mask).getValue();

      expect(cycle.getWeeklyMask()).toEqual(mask);
    });

    it('should return null weekly mask for parts mode', () => {
      const parts: CyclePart[] = [{ workDays: 4, restDays: 2 }];
      const cycle = WorkCycle.createParts(parts).getValue();

      expect(cycle.getWeeklyMask()).toBeNull();
    });

    it('should provide parts for parts mode', () => {
      const parts: CyclePart[] = [
        { workDays: 6, restDays: 3 },
        { workDays: 6, restDays: 2 },
      ];
      const cycle = WorkCycle.createParts(parts).getValue();

      expect(cycle.getParts()).toEqual(parts);
    });

    it('should return null parts for weekly mode', () => {
      const mask: WeeklyMask = [true, true, true, true, true, false, false];
      const cycle = WorkCycle.createWeekly(mask).getValue();

      expect(cycle.getParts()).toBeNull();
    });

    it('should calculate total parts count', () => {
      const parts: CyclePart[] = [
        { workDays: 6, restDays: 3 },
        { workDays: 6, restDays: 3 },
        { workDays: 6, restDays: 2 },
      ];
      const cycle = WorkCycle.createParts(parts).getValue();

      expect(cycle.getTotalParts()).toBe(3);
    });

    it('should return 1 for weekly mode total parts', () => {
      const mask: WeeklyMask = [true, true, true, true, true, false, false];
      const cycle = WorkCycle.createWeekly(mask).getValue();

      // Weekly mode can be thought of as 1 repeating "part"
      expect(cycle.getTotalParts()).toBe(1);
    });

    it('should get specific part by index (1-based)', () => {
      const parts: CyclePart[] = [
        { workDays: 6, restDays: 3 },
        { workDays: 4, restDays: 2 },
      ];
      const cycle = WorkCycle.createParts(parts).getValue();

      expect(cycle.getPart(1)).toEqual({ workDays: 6, restDays: 3 });
      expect(cycle.getPart(2)).toEqual({ workDays: 4, restDays: 2 });
      expect(cycle.getPart(3)).toBeNull(); // Out of range
    });

    it('should count work days in weekly mode', () => {
      const mask: WeeklyMask = [true, true, true, true, true, false, false];
      const cycle = WorkCycle.createWeekly(mask).getValue();

      expect(cycle.getWorkDaysInWeek()).toBe(5);
    });

    it('should return 0 work days for parts mode', () => {
      const parts: CyclePart[] = [{ workDays: 4, restDays: 2 }];
      const cycle = WorkCycle.createParts(parts).getValue();

      expect(cycle.getWorkDaysInWeek()).toBe(0); // Not applicable for parts mode
    });
  });

  describe('Display Information', () => {
    it('should provide display text for weekly mode', () => {
      const mask: WeeklyMask = [true, true, true, true, true, false, false];
      const cycle = WorkCycle.createWeekly(mask).getValue();

      const displayText = cycle.getDisplayText();
      expect(displayText).toContain('Semanal');
      expect(displayText).toContain('5 días');
    });

    it('should provide display text for single part', () => {
      const parts: CyclePart[] = [{ workDays: 4, restDays: 2 }];
      const cycle = WorkCycle.createParts(parts).getValue();

      const displayText = cycle.getDisplayText();
      expect(displayText).toContain('4-2');
    });

    it('should provide display text for multiple parts', () => {
      const parts: CyclePart[] = [
        { workDays: 6, restDays: 3 },
        { workDays: 6, restDays: 2 },
      ];
      const cycle = WorkCycle.createParts(parts).getValue();

      const displayText = cycle.getDisplayText();
      expect(displayText).toContain('6-3');
      expect(displayText).toContain('6-2');
    });
  });

  describe('Equality', () => {
    it('should consider two weekly cycles with same mask as equal', () => {
      const mask: WeeklyMask = [true, true, true, true, true, false, false];
      const cycle1 = WorkCycle.createWeekly(mask).getValue();
      const cycle2 = WorkCycle.createWeekly(mask).getValue();

      expect(cycle1.equals(cycle2)).toBe(true);
    });

    it('should consider two parts cycles with same parts as equal', () => {
      const parts: CyclePart[] = [{ workDays: 4, restDays: 2 }];
      const cycle1 = WorkCycle.createParts(parts).getValue();
      const cycle2 = WorkCycle.createParts(parts).getValue();

      expect(cycle1.equals(cycle2)).toBe(true);
    });

    it('should consider cycles with different modes as not equal', () => {
      const mask: WeeklyMask = [true, true, true, true, true, false, false];
      const parts: CyclePart[] = [{ workDays: 5, restDays: 2 }];
      const cycle1 = WorkCycle.createWeekly(mask).getValue();
      const cycle2 = WorkCycle.createParts(parts).getValue();

      expect(cycle1.equals(cycle2)).toBe(false);
    });
  });
});
