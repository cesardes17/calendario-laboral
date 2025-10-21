/**
 * Tests for CycleOffset Value Object
 *
 * Following TDD approach - RED phase
 * Tests business logic for cycle offset when user worked before the year
 */

import { CycleOffset, CycleDayType } from '../cycle-offset';

describe('CycleOffset Value Object', () => {
  describe('Creation and validation', () => {
    it('should create a valid CycleOffset with WORK day type', () => {
      const offset = CycleOffset.create(1, 3, CycleDayType.WORK);

      expect(offset.isSuccess()).toBe(true);
      expect(offset.getValue().partNumber).toBe(1);
      expect(offset.getValue().dayWithinPart).toBe(3);
      expect(offset.getValue().dayType).toBe(CycleDayType.WORK);
    });

    it('should create a valid CycleOffset with REST day type', () => {
      const offset = CycleOffset.create(2, 1, CycleDayType.REST);

      expect(offset.isSuccess()).toBe(true);
      expect(offset.getValue().dayType).toBe(CycleDayType.REST);
    });

    it('should fail when part number is less than 1', () => {
      const offset = CycleOffset.create(0, 1, CycleDayType.WORK);

      expect(offset.isFailure()).toBe(true);
      expect(offset.errorValue()).toContain('La parte debe ser mayor o igual a 1');
    });

    it('should fail when day within part is less than 1', () => {
      const offset = CycleOffset.create(1, 0, CycleDayType.WORK);

      expect(offset.isFailure()).toBe(true);
      expect(offset.errorValue()).toContain('El día dentro de la parte debe ser mayor o igual a 1');
    });

    it('should fail when day type is invalid', () => {
      const offset = CycleOffset.create(1, 1, 'INVALID' as unknown as CycleDayType);

      expect(offset.isFailure()).toBe(true);
      expect(offset.errorValue()).toContain('tipo de día válido');
    });

    it('should accept large part numbers', () => {
      const offset = CycleOffset.create(10, 5, CycleDayType.WORK);

      expect(offset.isSuccess()).toBe(true);
    });

    it('should accept large day numbers within part', () => {
      const offset = CycleOffset.create(1, 30, CycleDayType.WORK);

      expect(offset.isSuccess()).toBe(true);
    });
  });

  describe('Type checking methods', () => {
    it('should return true for isWorkDay when type is WORK', () => {
      const offset = CycleOffset.create(1, 1, CycleDayType.WORK);

      expect(offset.getValue().isWorkDay()).toBe(true);
      expect(offset.getValue().isRestDay()).toBe(false);
    });

    it('should return true for isRestDay when type is REST', () => {
      const offset = CycleOffset.create(1, 1, CycleDayType.REST);

      expect(offset.getValue().isRestDay()).toBe(true);
      expect(offset.getValue().isWorkDay()).toBe(false);
    });
  });

  describe('Display text', () => {
    it('should return correct display text for work day', () => {
      const offset = CycleOffset.create(2, 4, CycleDayType.WORK);

      const displayText = offset.getValue().getDisplayText();
      expect(displayText).toContain('Parte 2');
      expect(displayText).toContain('día 4');
      expect(displayText).toContain('trabajo');
    });

    it('should return correct display text for rest day', () => {
      const offset = CycleOffset.create(1, 2, CycleDayType.REST);

      const displayText = offset.getValue().getDisplayText();
      expect(displayText).toContain('Parte 1');
      expect(displayText).toContain('día 2');
      expect(displayText).toContain('descanso');
    });
  });

  describe('Equality comparison', () => {
    it('should return true when all properties match', () => {
      const offset1 = CycleOffset.create(2, 3, CycleDayType.WORK);
      const offset2 = CycleOffset.create(2, 3, CycleDayType.WORK);

      expect(offset1.getValue().equals(offset2.getValue())).toBe(true);
    });

    it('should return false when part number differs', () => {
      const offset1 = CycleOffset.create(1, 3, CycleDayType.WORK);
      const offset2 = CycleOffset.create(2, 3, CycleDayType.WORK);

      expect(offset1.getValue().equals(offset2.getValue())).toBe(false);
    });

    it('should return false when day within part differs', () => {
      const offset1 = CycleOffset.create(2, 3, CycleDayType.WORK);
      const offset2 = CycleOffset.create(2, 4, CycleDayType.WORK);

      expect(offset1.getValue().equals(offset2.getValue())).toBe(false);
    });

    it('should return false when day type differs', () => {
      const offset1 = CycleOffset.create(2, 3, CycleDayType.WORK);
      const offset2 = CycleOffset.create(2, 3, CycleDayType.REST);

      expect(offset1.getValue().equals(offset2.getValue())).toBe(false);
    });
  });

  describe('toString', () => {
    it('should return string representation', () => {
      const offset = CycleOffset.create(3, 5, CycleDayType.WORK);

      const str = offset.getValue().toString();
      expect(str).toContain('3');
      expect(str).toContain('5');
      expect(str).toContain('WORK');
    });
  });
});
