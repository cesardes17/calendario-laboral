/**
 * Tests for useYearSelection Hook
 *
 * Following TDD approach - RED phase
 * Tests React hook for year selection UI logic
 */

import { renderHook, act } from '@testing-library/react';
import { useYearSelection } from '../use-year-selection';

describe('useYearSelection', () => {
  describe('Initial state', () => {
    it('should initialize with current year', () => {
      const { result } = renderHook(() => useYearSelection());
      const currentYear = new Date().getFullYear();

      expect(result.current.selectedYear).toBe(currentYear);
      expect(result.current.error).toBeNull();
      expect(result.current.isValid).toBe(true);
    });

    it('should initialize with provided year if valid', () => {
      const { result } = renderHook(() => useYearSelection(2025));

      expect(result.current.selectedYear).toBe(2025);
      expect(result.current.error).toBeNull();
      expect(result.current.isValid).toBe(true);
    });

    it('should initialize with current year if provided year is invalid', () => {
      const { result } = renderHook(() => useYearSelection(999));
      const currentYear = new Date().getFullYear();

      expect(result.current.selectedYear).toBe(currentYear);
      expect(result.current.error).toBeDefined();
      expect(result.current.isValid).toBe(false);
    });
  });

  describe('selectYear function', () => {
    it('should update year when valid year is selected', () => {
      const { result } = renderHook(() => useYearSelection());

      act(() => {
        result.current.selectYear(2026);
      });

      expect(result.current.selectedYear).toBe(2026);
      expect(result.current.error).toBeNull();
      expect(result.current.isValid).toBe(true);
    });

    it('should set error when invalid year is selected', () => {
      const { result } = renderHook(() => useYearSelection());
      const previousYear = result.current.selectedYear;

      act(() => {
        result.current.selectYear(999);
      });

      expect(result.current.selectedYear).toBe(previousYear);
      expect(result.current.error).toBeDefined();
      expect(result.current.error).toContain('4 dígitos');
      expect(result.current.isValid).toBe(false);
    });

    it('should set error when year is out of range', () => {
      const { result } = renderHook(() => useYearSelection());
      const currentYear = new Date().getFullYear();
      const previousYear = result.current.selectedYear;

      act(() => {
        result.current.selectYear(currentYear + 10);
      });

      expect(result.current.selectedYear).toBe(previousYear);
      expect(result.current.error).toBeDefined();
      expect(result.current.error).toContain('rango válido');
      expect(result.current.isValid).toBe(false);
    });

    it('should clear previous error when valid year is selected', () => {
      const { result } = renderHook(() => useYearSelection());

      // Set error first
      act(() => {
        result.current.selectYear(999);
      });

      expect(result.current.error).toBeDefined();

      // Select valid year
      act(() => {
        result.current.selectYear(2025);
      });

      expect(result.current.error).toBeNull();
      expect(result.current.isValid).toBe(true);
    });
  });

  describe('Year range information', () => {
    it('should provide year range information', () => {
      const { result } = renderHook(() => useYearSelection());
      const currentYear = new Date().getFullYear();

      expect(result.current.yearRange.min).toBe(currentYear - 2);
      expect(result.current.yearRange.max).toBe(currentYear + 5);
      expect(result.current.yearRange.current).toBe(currentYear);
    });
  });

  describe('resetToCurrentYear function', () => {
    it('should reset to current year', () => {
      const { result } = renderHook(() => useYearSelection(2025));
      const currentYear = new Date().getFullYear();

      act(() => {
        result.current.resetToCurrentYear();
      });

      expect(result.current.selectedYear).toBe(currentYear);
      expect(result.current.error).toBeNull();
      expect(result.current.isValid).toBe(true);
    });

    it('should clear any existing errors when resetting', () => {
      const { result } = renderHook(() => useYearSelection());
      const currentYear = new Date().getFullYear();

      // Set an error first
      act(() => {
        result.current.selectYear(999);
      });

      expect(result.current.error).toBeDefined();

      // Reset to current year
      act(() => {
        result.current.resetToCurrentYear();
      });

      expect(result.current.selectedYear).toBe(currentYear);
      expect(result.current.error).toBeNull();
      expect(result.current.isValid).toBe(true);
    });
  });
});
