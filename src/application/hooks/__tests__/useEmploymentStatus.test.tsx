/**
 * Tests for useEmploymentStatus Hook
 *
 * Following TDD approach
 * Tests React hook for employment status UI logic
 */

import { renderHook, act } from '@testing-library/react';
import { useEmploymentStatus } from '../useEmploymentStatus';
import { EmploymentStatusType } from '@/src/core/domain/employmentStatus';
import { CycleDayType } from '@/src/core/domain/cycleOffset';
import { Year } from '@/src/core/domain/year';

describe('useEmploymentStatus', () => {
  describe('Initial state', () => {
    it('should initialize with null values', () => {
      const { result } = renderHook(() => useEmploymentStatus());

      expect(result.current.state.status).toBeNull();
      expect(result.current.state.contractStartDate).toBeNull();
      expect(result.current.state.cycleOffset).toBeNull();
      expect(result.current.state.errors).toEqual([]);
      expect(result.current.state.isValid).toBe(false);
    });
  });

  describe('selectStatus function', () => {
    it('should select STARTED_THIS_YEAR status', () => {
      const { result } = renderHook(() => useEmploymentStatus());

      act(() => {
        result.current.selectStatus(EmploymentStatusType.STARTED_THIS_YEAR);
      });

      expect(result.current.state.status).not.toBeNull();
      expect(result.current.state.status?.type).toBe(EmploymentStatusType.STARTED_THIS_YEAR);
      expect(result.current.state.errors).toEqual([]);
      expect(result.current.state.contractStartDate).toBeNull();
      expect(result.current.state.cycleOffset).toBeNull();
    });

    it('should select WORKED_BEFORE status', () => {
      const { result } = renderHook(() => useEmploymentStatus());

      act(() => {
        result.current.selectStatus(EmploymentStatusType.WORKED_BEFORE);
      });

      expect(result.current.state.status).not.toBeNull();
      expect(result.current.state.status?.type).toBe(EmploymentStatusType.WORKED_BEFORE);
      expect(result.current.state.errors).toEqual([]);
    });

    it('should clear dependent data when changing status', () => {
      const { result } = renderHook(() => useEmploymentStatus());
      const yearResult = Year.create(2025);
      const year = yearResult.getValue();

      // First select STARTED_THIS_YEAR and set contract date
      act(() => {
        result.current.selectStatus(EmploymentStatusType.STARTED_THIS_YEAR);
      });

      act(() => {
        result.current.setContractStartDate(new Date(2025, 5, 6), year);
      });

      expect(result.current.state.contractStartDate).not.toBeNull();

      // Change to WORKED_BEFORE - should clear contract date
      act(() => {
        result.current.selectStatus(EmploymentStatusType.WORKED_BEFORE);
      });

      expect(result.current.state.contractStartDate).toBeNull();
      expect(result.current.state.cycleOffset).toBeNull();
    });
  });

  describe('setContractStartDate function', () => {
    it('should set valid contract start date', () => {
      const { result } = renderHook(() => useEmploymentStatus());
      const yearResult = Year.create(2025);
      const year = yearResult.getValue();
      const date = new Date(2025, 5, 6); // June 6, 2025

      act(() => {
        result.current.setContractStartDate(date, year);
      });

      expect(result.current.state.contractStartDate).not.toBeNull();
      expect(result.current.state.contractStartDate?.value.getFullYear()).toBe(2025);
      expect(result.current.state.contractStartDate?.value.getMonth()).toBe(5);
      expect(result.current.state.contractStartDate?.value.getDate()).toBe(6);
      expect(result.current.state.errors).toEqual([]);
      expect(result.current.state.isValid).toBe(true);
    });

    it('should set error when date is outside year', () => {
      const { result } = renderHook(() => useEmploymentStatus());
      const yearResult = Year.create(2025);
      const year = yearResult.getValue();
      const date = new Date(2024, 5, 6); // Wrong year

      act(() => {
        result.current.setContractStartDate(date, year);
      });

      expect(result.current.state.contractStartDate).toBeNull();
      expect(result.current.state.errors.length).toBeGreaterThan(0);
      expect(result.current.state.errors[0]).toContain('2025');
      expect(result.current.state.isValid).toBe(false);
    });

    it('should set error when date is invalid', () => {
      const { result } = renderHook(() => useEmploymentStatus());
      const yearResult = Year.create(2025);
      const year = yearResult.getValue();
      const date = new Date('invalid');

      act(() => {
        result.current.setContractStartDate(date, year);
      });

      expect(result.current.state.contractStartDate).toBeNull();
      expect(result.current.state.errors.length).toBeGreaterThan(0);
      expect(result.current.state.isValid).toBe(false);
    });

    it('should clear previous errors when valid date is set', () => {
      const { result } = renderHook(() => useEmploymentStatus());
      const yearResult = Year.create(2025);
      const year = yearResult.getValue();

      // Set invalid date first
      act(() => {
        result.current.setContractStartDate(new Date('invalid'), year);
      });

      expect(result.current.state.errors.length).toBeGreaterThan(0);

      // Set valid date
      act(() => {
        result.current.setContractStartDate(new Date(2025, 5, 6), year);
      });

      expect(result.current.state.errors).toEqual([]);
      expect(result.current.state.isValid).toBe(true);
    });
  });

  describe('setCycleOffset function', () => {
    it('should set valid cycle offset', () => {
      const { result } = renderHook(() => useEmploymentStatus());

      act(() => {
        result.current.setCycleOffset(3, 4, CycleDayType.WORK);
      });

      expect(result.current.state.cycleOffset).not.toBeNull();
      expect(result.current.state.cycleOffset?.partNumber).toBe(3);
      expect(result.current.state.cycleOffset?.dayWithinPart).toBe(4);
      expect(result.current.state.cycleOffset?.dayType).toBe(CycleDayType.WORK);
      expect(result.current.state.errors).toEqual([]);
      expect(result.current.state.isValid).toBe(true);
    });

    it('should set error when part number is invalid', () => {
      const { result } = renderHook(() => useEmploymentStatus());

      act(() => {
        result.current.setCycleOffset(0, 4, CycleDayType.WORK);
      });

      expect(result.current.state.cycleOffset).toBeNull();
      expect(result.current.state.errors.length).toBeGreaterThan(0);
      expect(result.current.state.errors[0]).toContain('parte');
      expect(result.current.state.isValid).toBe(false);
    });

    it('should set error when day within part is invalid', () => {
      const { result } = renderHook(() => useEmploymentStatus());

      act(() => {
        result.current.setCycleOffset(3, 0, CycleDayType.WORK);
      });

      expect(result.current.state.cycleOffset).toBeNull();
      expect(result.current.state.errors.length).toBeGreaterThan(0);
      expect(result.current.state.errors[0]).toContain('día');
      expect(result.current.state.isValid).toBe(false);
    });

    it('should accept REST day type', () => {
      const { result } = renderHook(() => useEmploymentStatus());

      act(() => {
        result.current.setCycleOffset(2, 5, CycleDayType.REST);
      });

      expect(result.current.state.cycleOffset).not.toBeNull();
      expect(result.current.state.cycleOffset?.dayType).toBe(CycleDayType.REST);
      expect(result.current.state.errors).toEqual([]);
    });

    it('should clear previous errors when valid offset is set', () => {
      const { result } = renderHook(() => useEmploymentStatus());

      // Set invalid offset first
      act(() => {
        result.current.setCycleOffset(0, 4, CycleDayType.WORK);
      });

      expect(result.current.state.errors.length).toBeGreaterThan(0);

      // Set valid offset
      act(() => {
        result.current.setCycleOffset(3, 4, CycleDayType.WORK);
      });

      expect(result.current.state.errors).toEqual([]);
      expect(result.current.state.isValid).toBe(true);
    });
  });

  describe('validateConfiguration function', () => {
    it('should return error when no status is selected', () => {
      const { result } = renderHook(() => useEmploymentStatus());
      const yearResult = Year.create(2025);
      const year = yearResult.getValue();

      let validation;
      act(() => {
        validation = result.current.validateConfiguration(year);
      });

      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Debe seleccionar una situación laboral');
    });

    it('should validate STARTED_THIS_YEAR requires contract date', () => {
      const { result } = renderHook(() => useEmploymentStatus());
      const yearResult = Year.create(2025);
      const year = yearResult.getValue();

      act(() => {
        result.current.selectStatus(EmploymentStatusType.STARTED_THIS_YEAR);
      });

      let validation;
      act(() => {
        validation = result.current.validateConfiguration(year);
      });

      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Debe proporcionar una fecha de inicio de contrato');
    });

    it('should validate WORKED_BEFORE requires cycle offset', () => {
      const { result } = renderHook(() => useEmploymentStatus());
      const yearResult = Year.create(2025);
      const year = yearResult.getValue();

      act(() => {
        result.current.selectStatus(EmploymentStatusType.WORKED_BEFORE);
      });

      let validation;
      act(() => {
        validation = result.current.validateConfiguration(year);
      });

      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Debe proporcionar el offset del ciclo');
    });

    it('should validate successfully with STARTED_THIS_YEAR and contract date', () => {
      const { result } = renderHook(() => useEmploymentStatus());
      const yearResult = Year.create(2025);
      const year = yearResult.getValue();

      act(() => {
        result.current.selectStatus(EmploymentStatusType.STARTED_THIS_YEAR);
      });

      act(() => {
        result.current.setContractStartDate(new Date(2025, 5, 6), year);
      });

      let validation;
      act(() => {
        validation = result.current.validateConfiguration(year);
      });

      expect(validation.isValid).toBe(true);
      expect(validation.errors).toEqual([]);
    });

    it('should validate successfully with WORKED_BEFORE and cycle offset', () => {
      const { result } = renderHook(() => useEmploymentStatus());
      const yearResult = Year.create(2025);
      const year = yearResult.getValue();

      act(() => {
        result.current.selectStatus(EmploymentStatusType.WORKED_BEFORE);
      });

      act(() => {
        result.current.setCycleOffset(3, 4, CycleDayType.WORK);
      });

      let validation;
      act(() => {
        validation = result.current.validateConfiguration(year);
      });

      expect(validation.isValid).toBe(true);
      expect(validation.errors).toEqual([]);
    });
  });

  describe('reset function', () => {
    it('should reset all state to initial values', () => {
      const { result } = renderHook(() => useEmploymentStatus());
      const yearResult = Year.create(2025);
      const year = yearResult.getValue();

      // Set some values
      act(() => {
        result.current.selectStatus(EmploymentStatusType.STARTED_THIS_YEAR);
      });

      act(() => {
        result.current.setContractStartDate(new Date(2025, 5, 6), year);
      });

      expect(result.current.state.status).not.toBeNull();
      expect(result.current.state.contractStartDate).not.toBeNull();

      // Reset
      act(() => {
        result.current.reset();
      });

      expect(result.current.state.status).toBeNull();
      expect(result.current.state.contractStartDate).toBeNull();
      expect(result.current.state.cycleOffset).toBeNull();
      expect(result.current.state.errors).toEqual([]);
      expect(result.current.state.isValid).toBe(false);
    });
  });
});
