import { useState, useCallback } from 'react';
import { TurnoExtra } from '@/src/core/domain/turnoExtra';
import { Year } from '@/src/core/domain/year';
import {
  addExtraShift as addExtraShiftUseCase,
  removeExtraShift as removeExtraShiftUseCase,
  updateExtraShift as updateExtraShiftUseCase,
} from '@/src/core/usecases/manageExtraShifts.usecase';

/**
 * Custom hook for managing extra shifts (turnos extras)
 *
 * Provides state management and operations for extra shifts.
 * Integrates with domain layer use cases for business logic.
 *
 * Note: Extra shifts can be assigned to ANY day (unlike guardias)
 * and add hours on top of the base hours for that day.
 *
 * @param year - The selected year (required for validation)
 * @returns Extra shift management interface
 *
 * @example
 * ```typescript
 * const { extraShifts, addExtraShift, removeExtraShift, error } = useExtraShifts(year);
 *
 * const handleAdd = () => {
 *   const extraShift = TurnoExtra.create({
 *     date: new Date(),
 *     hours: 8,
 *     description: 'Cubriendo turno de tarde'
 *   });
 *   if (extraShift.isSuccess()) {
 *     addExtraShift(extraShift.getValue());
 *   }
 * };
 * ```
 */
export function useExtraShifts(year: Year | null) {
  const [extraShifts, setExtraShifts] = useState<TurnoExtra[]>([]);
  const [error, setError] = useState<string | null>(null);

  /**
   * Add a new extra shift
   */
  const addExtraShift = useCallback(
    (extraShift: TurnoExtra): boolean => {
      if (!year) {
        setError('Debe seleccionar un año primero');
        return false;
      }

      const result = addExtraShiftUseCase(extraShift, extraShifts, year);

      if (result.isFailure()) {
        setError(result.errorValue());
        return false;
      }

      setExtraShifts(result.getValue());
      setError(null);
      return true;
    },
    [extraShifts, year]
  );

  /**
   * Remove an extra shift by date
   */
  const removeExtraShift = useCallback(
    (date: Date): boolean => {
      const result = removeExtraShiftUseCase(date, extraShifts);

      if (result.isFailure()) {
        setError(result.errorValue());
        return false;
      }

      setExtraShifts(result.getValue());
      setError(null);
      return true;
    },
    [extraShifts]
  );

  /**
   * Update an existing extra shift
   */
  const updateExtraShift = useCallback(
    (originalDate: Date, updatedExtraShift: TurnoExtra): boolean => {
      if (!year) {
        setError('Debe seleccionar un año primero');
        return false;
      }

      const result = updateExtraShiftUseCase(
        originalDate,
        updatedExtraShift,
        extraShifts,
        year
      );

      if (result.isFailure()) {
        setError(result.errorValue());
        return false;
      }

      setExtraShifts(result.getValue());
      setError(null);
      return true;
    },
    [extraShifts, year]
  );

  /**
   * Clear the error message
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Get the count of extra shifts
   */
  const getCount = useCallback((): number => {
    return extraShifts.length;
  }, [extraShifts]);

  /**
   * Check if a date has an extra shift
   */
  const hasExtraShift = useCallback(
    (date: Date): boolean => {
      return extraShifts.some((es) => es.isOnDate(date));
    },
    [extraShifts]
  );

  /**
   * Find an extra shift by date
   */
  const findByDate = useCallback(
    (date: Date): TurnoExtra | undefined => {
      return extraShifts.find((es) => es.isOnDate(date));
    },
    [extraShifts]
  );

  /**
   * Get total hours from all extra shifts
   */
  const getTotalHours = useCallback((): number => {
    return extraShifts.reduce((sum, es) => sum + es.hours, 0);
  }, [extraShifts]);

  /**
   * Reset all extra shifts
   */
  const reset = useCallback(() => {
    setExtraShifts([]);
    setError(null);
  }, []);

  return {
    extraShifts,
    setExtraShifts,
    addExtraShift,
    removeExtraShift,
    updateExtraShift,
    error,
    clearError,
    getCount,
    hasExtraShift,
    findByDate,
    getTotalHours,
    reset,
  };
}
