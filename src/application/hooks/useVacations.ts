import { useState, useCallback, useMemo } from 'react';
import { VacationPeriod } from '@/src/core/domain/vacationPeriod';
import { Year } from '@/src/core/domain/year';
import {
  addVacationPeriod as addVacationPeriodUseCase,
  removeVacationPeriod as removeVacationPeriodUseCase,
  updateVacationPeriod as updateVacationPeriodUseCase,
  getTotalVacationDays,
  detectOverlaps,
  unifyVacationPeriods,
  type OverlapInfo,
} from '@/src/core/usecases/manageVacations.usecase';

/**
 * Custom hook for managing vacation periods
 *
 * Provides state management and operations for vacation periods.
 * Integrates with domain layer use cases for business logic.
 *
 * @param year - The selected year (required for validation)
 * @returns Vacation management interface
 *
 * @example
 * ```typescript
 * const { vacations, addVacation, removeVacation, totalDays, error } = useVacations(year);
 *
 * const handleAdd = () => {
 *   const vacation = VacationPeriod.create({
 *     startDate: new Date(2025, 6, 15),
 *     endDate: new Date(2025, 6, 31),
 *     description: 'Verano'
 *   });
 *   if (vacation.isSuccess()) {
 *     addVacation(vacation.getValue());
 *   }
 * };
 * ```
 */
export function useVacations(year: Year | null) {
  const [vacations, setVacations] = useState<VacationPeriod[]>([]);
  const [error, setError] = useState<string | null>(null);

  /**
   * Get total vacation days (accounting for overlaps)
   */
  const totalDays = useMemo(() => {
    return getTotalVacationDays(vacations);
  }, [vacations]);

  /**
   * Get the count of vacation periods
   */
  const getCount = useCallback((): number => {
    return vacations.length;
  }, [vacations]);

  /**
   * Add a new vacation period
   * Returns true on success, false on failure (check error for details)
   */
  const addVacation = useCallback(
    (period: VacationPeriod): boolean => {
      if (!year) {
        setError('Debe seleccionar un año primero');
        return false;
      }

      const result = addVacationPeriodUseCase(period, vacations, year);

      if (result.isFailure()) {
        setError(result.errorValue());
        return false;
      }

      setVacations(result.getValue());
      setError(null);
      return true;
    },
    [vacations, year]
  );

  /**
   * Remove a vacation period by index
   */
  const removeVacation = useCallback(
    (index: number): boolean => {
      const result = removeVacationPeriodUseCase(index, vacations);

      if (result.isFailure()) {
        setError(result.errorValue());
        return false;
      }

      setVacations(result.getValue());
      setError(null);
      return true;
    },
    [vacations]
  );

  /**
   * Update an existing vacation period
   */
  const updateVacation = useCallback(
    (index: number, updatedPeriod: VacationPeriod): boolean => {
      if (!year) {
        setError('Debe seleccionar un año primero');
        return false;
      }

      const result = updateVacationPeriodUseCase(
        index,
        updatedPeriod,
        vacations,
        year
      );

      if (result.isFailure()) {
        setError(result.errorValue());
        return false;
      }

      setVacations(result.getValue());
      setError(null);
      return true;
    },
    [vacations, year]
  );

  /**
   * Check for overlaps with a new period
   * Useful for showing warnings before adding/updating
   */
  const checkOverlaps = useCallback(
    (period: VacationPeriod): OverlapInfo[] => {
      return detectOverlaps(period, vacations);
    },
    [vacations]
  );

  /**
   * Unify all vacation periods (merge overlapping/contiguous periods)
   * Returns the unified list but does NOT update state
   */
  const getUnifiedVacations = useCallback((): VacationPeriod[] => {
    return unifyVacationPeriods(vacations);
  }, [vacations]);

  /**
   * Apply unification (actually update state with unified periods)
   */
  const applyUnification = useCallback(() => {
    const unified = unifyVacationPeriods(vacations);
    setVacations(unified);
    setError(null);
  }, [vacations]);

  /**
   * Check if a date falls within any vacation period
   */
  const isVacationDay = useCallback(
    (date: Date): boolean => {
      return vacations.some((v) => v.includesDate(date));
    },
    [vacations]
  );

  /**
   * Find vacation period by date
   */
  const findByDate = useCallback(
    (date: Date): VacationPeriod | undefined => {
      return vacations.find((v) => v.includesDate(date));
    },
    [vacations]
  );

  /**
   * Clear the error message
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Reset all vacation periods
   */
  const reset = useCallback(() => {
    setVacations([]);
    setError(null);
  }, []);

  return {
    // State
    vacations,
    setVacations,
    error,
    totalDays,

    // Operations
    addVacation,
    removeVacation,
    updateVacation,

    // Utility
    checkOverlaps,
    getUnifiedVacations,
    applyUnification,
    isVacationDay,
    findByDate,
    getCount,
    clearError,
    reset,
  };
}
