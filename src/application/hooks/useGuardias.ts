import { useState, useCallback } from 'react';
import { Guardia } from '@/src/core/domain/guardia';
import { Year } from '@/src/core/domain/year';
import {
  addGuardia as addGuardiaUseCase,
  removeGuardia as removeGuardiaUseCase,
  updateGuardia as updateGuardiaUseCase,
} from '@/src/core/usecases/manageGuardias.usecase';

/**
 * Custom hook for managing guardias (on-call shifts)
 *
 * Provides state management and operations for guardias.
 * Integrates with domain layer use cases for business logic.
 *
 * Note: Guardias are only applicable for weekly cycles (modo: 'semanal')
 * and can only be assigned to rest days or holidays.
 *
 * @param year - The selected year (required for validation)
 * @returns Guardia management interface
 *
 * @example
 * ```typescript
 * const { guardias, addGuardia, removeGuardia, error } = useGuardias(year);
 *
 * const handleAdd = () => {
 *   const guardia = Guardia.create({
 *     date: new Date(),
 *     hours: 12,
 *     description: 'Guardia de fin de semana'
 *   });
 *   if (guardia.isSuccess()) {
 *     addGuardia(guardia.getValue());
 *   }
 * };
 * ```
 */
export function useGuardias(year: Year | null) {
  const [guardias, setGuardias] = useState<Guardia[]>([]);
  const [error, setError] = useState<string | null>(null);

  /**
   * Add a new guardia
   */
  const addGuardia = useCallback(
    (guardia: Guardia): boolean => {
      if (!year) {
        setError('Debe seleccionar un año primero');
        return false;
      }

      const result = addGuardiaUseCase(guardia, guardias, year);

      if (result.isFailure()) {
        setError(result.errorValue());
        return false;
      }

      setGuardias(result.getValue());
      setError(null);
      return true;
    },
    [guardias, year]
  );

  /**
   * Remove a guardia by date
   */
  const removeGuardia = useCallback(
    (date: Date): boolean => {
      const result = removeGuardiaUseCase(date, guardias);

      if (result.isFailure()) {
        setError(result.errorValue());
        return false;
      }

      setGuardias(result.getValue());
      setError(null);
      return true;
    },
    [guardias]
  );

  /**
   * Update an existing guardia
   */
  const updateGuardia = useCallback(
    (originalDate: Date, updatedGuardia: Guardia): boolean => {
      if (!year) {
        setError('Debe seleccionar un año primero');
        return false;
      }

      const result = updateGuardiaUseCase(
        originalDate,
        updatedGuardia,
        guardias,
        year
      );

      if (result.isFailure()) {
        setError(result.errorValue());
        return false;
      }

      setGuardias(result.getValue());
      setError(null);
      return true;
    },
    [guardias, year]
  );

  /**
   * Clear the error message
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Get the count of guardias
   */
  const getCount = useCallback((): number => {
    return guardias.length;
  }, [guardias]);

  /**
   * Check if a date is a guardia
   */
  const isGuardia = useCallback(
    (date: Date): boolean => {
      return guardias.some((g) => g.isOnDate(date));
    },
    [guardias]
  );

  /**
   * Find a guardia by date
   */
  const findByDate = useCallback(
    (date: Date): Guardia | undefined => {
      return guardias.find((g) => g.isOnDate(date));
    },
    [guardias]
  );

  /**
   * Get total hours from all guardias
   */
  const getTotalHours = useCallback((): number => {
    return guardias.reduce((sum, g) => sum + g.hours, 0);
  }, [guardias]);

  /**
   * Reset all guardias
   */
  const reset = useCallback(() => {
    setGuardias([]);
    setError(null);
  }, []);

  return {
    guardias,
    setGuardias,
    addGuardia,
    removeGuardia,
    updateGuardia,
    error,
    clearError,
    getCount,
    isGuardia,
    findByDate,
    getTotalHours,
    reset,
  };
}
