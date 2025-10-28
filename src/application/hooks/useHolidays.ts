import { useState, useCallback } from 'react';
import { Holiday } from '@/src/core/domain/holiday';
import { Year } from '@/src/core/domain/year';
import {
  addHoliday as addHolidayUseCase,
  removeHoliday as removeHolidayUseCase,
  updateHoliday as updateHolidayUseCase,
} from '@/src/core/usecases/manageHolidays.usecase';

/**
 * Custom hook for managing holidays
 *
 * Provides state management and operations for holidays (festivos).
 * Integrates with domain layer use cases for business logic.
 *
 * @param year - The selected year (required for validation)
 * @returns Holiday management interface
 *
 * @example
 * ```typescript
 * const { holidays, addHoliday, removeHoliday, error } = useHolidays(year);
 *
 * const handleAdd = () => {
 *   const holiday = Holiday.create({ date: new Date(), name: 'Test' });
 *   if (holiday.isSuccess()) {
 *     addHoliday(holiday.getValue());
 *   }
 * };
 * ```
 */
export function useHolidays(year: Year | null) {
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [error, setError] = useState<string | null>(null);

  /**
   * Add a new holiday
   */
  const addHoliday = useCallback(
    (holiday: Holiday): boolean => {
      if (!year) {
        setError('Debe seleccionar un año primero');
        return false;
      }

      const result = addHolidayUseCase(holiday, holidays, year);

      if (result.isFailure()) {
        setError(result.errorValue());
        return false;
      }

      setHolidays(result.getValue());
      setError(null);
      return true;
    },
    [holidays, year]
  );

  /**
   * Remove a holiday by date
   */
  const removeHoliday = useCallback(
    (date: Date): boolean => {
      const result = removeHolidayUseCase(date, holidays);

      if (result.isFailure()) {
        setError(result.errorValue());
        return false;
      }

      setHolidays(result.getValue());
      setError(null);
      return true;
    },
    [holidays]
  );

  /**
   * Update an existing holiday
   */
  const updateHoliday = useCallback(
    (originalDate: Date, updatedHoliday: Holiday): boolean => {
      if (!year) {
        setError('Debe seleccionar un año primero');
        return false;
      }

      const result = updateHolidayUseCase(
        originalDate,
        updatedHoliday,
        holidays,
        year
      );

      if (result.isFailure()) {
        setError(result.errorValue());
        return false;
      }

      setHolidays(result.getValue());
      setError(null);
      return true;
    },
    [holidays, year]
  );

  /**
   * Clear the error message
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Get the count of holidays
   */
  const getCount = useCallback((): number => {
    return holidays.length;
  }, [holidays]);


  /**
   * Check if a date is a holiday
   */
  const isHoliday = useCallback(
    (date: Date): boolean => {
      return holidays.some((h) => h.isOnDate(date));
    },
    [holidays]
  );

  /**
   * Find a holiday by date
   */
  const findByDate = useCallback(
    (date: Date): Holiday | undefined => {
      return holidays.find((h) => h.isOnDate(date));
    },
    [holidays]
  );

  /**
   * Reset all holidays
   */
  const reset = useCallback(() => {
    setHolidays([]);
    setError(null);
  }, []);

  return {
    holidays,
    addHoliday,
    removeHoliday,
    updateHoliday,
    error,
    clearError,
    getCount,
    isHoliday,
    findByDate,
    reset,
  };
}
