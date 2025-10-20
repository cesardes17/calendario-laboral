/**
 * useYearSelection Hook
 *
 * Application layer hook for managing year selection state in UI components.
 * Coordinates between UI and use cases, following Clean Architecture principles.
 */

'use client';

import { useState, useCallback, useMemo } from 'react';
import { SelectYearUseCase, YearRange } from '@/src/core/usecases/select-year.usecase';

export interface UseYearSelectionReturn {
  selectedYear: number;
  error: string | null;
  isValid: boolean;
  yearRange: YearRange;
  selectYear: (year: number) => void;
  resetToCurrentYear: () => void;
}

/**
 * Hook for managing year selection state
 * @param initialYear - Optional initial year, defaults to current year
 * @returns Year selection state and actions
 */
export function useYearSelection(initialYear?: number): UseYearSelectionReturn {
  const useCase = useMemo(() => new SelectYearUseCase(), []);
  const yearRange = useMemo(() => useCase.getYearRange(), [useCase]);

  // Initialize state
  const [state, setState] = useState<{
    selectedYear: number;
    error: string | null;
    isValid: boolean;
  }>(() => {
    // Try to use provided initial year, fall back to current if invalid
    if (initialYear !== undefined) {
      const result = useCase.execute(initialYear);
      if (result.isSuccess()) {
        return {
          selectedYear: result.getValue().value,
          error: null,
          isValid: true,
        };
      } else {
        // If initial year is invalid, use current year but keep the error
        return {
          selectedYear: yearRange.current,
          error: result.errorValue(),
          isValid: false,
        };
      }
    }

    // No initial year provided, use current
    return {
      selectedYear: yearRange.current,
      error: null,
      isValid: true,
    };
  });

  /**
   * Selects a new year with validation
   */
  const selectYear = useCallback(
    (year: number) => {
      const result = useCase.execute(year);

      if (result.isSuccess()) {
        setState({
          selectedYear: result.getValue().value,
          error: null,
          isValid: true,
        });
      } else {
        setState((prev) => ({
          selectedYear: prev.selectedYear, // Keep previous valid year
          error: result.errorValue(),
          isValid: false,
        }));
      }
    },
    [useCase]
  );

  /**
   * Resets selection to current year
   */
  const resetToCurrentYear = useCallback(() => {
    setState({
      selectedYear: yearRange.current,
      error: null,
      isValid: true,
    });
  }, [yearRange]);

  return {
    selectedYear: state.selectedYear,
    error: state.error,
    isValid: state.isValid,
    yearRange,
    selectYear,
    resetToCurrentYear,
  };
}
