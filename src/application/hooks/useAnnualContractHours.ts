/**
 * @file use-annualContractHours.ts
 * @description Hook de React para gestionar la configuración de horas de convenio anual
 */

'use client';

import { useState, useCallback, useMemo } from 'react';
import {
  ConfigureAnnualContractHoursUseCase,
} from '@/src/core/usecases';
import type { AnnualContractHours } from '@/src/core/domain';
import { ANNUAL_CONTRACT_HOURS_CONSTRAINTS } from '@/src/core/domain/annualContractHours';

export interface AnnualContractHoursState {
  annualHours: AnnualContractHours | null;
  annualInput: string;
  weeklyInput: string;
  annualError: string | null;
  weeklyError: string | null;
  warning: { type: string; message?: string } | null;
  isDefault: boolean;
}

export interface AnnualContractHoursActions {
  setAnnualHours: (value: string) => void;
  setWeeklyHours: (value: string) => void;
  applyWeeklyCalculation: () => void;
  reset: () => void;
  loadFromConfig: (annualHours: number) => void;
  getFormattedAnnualHours: () => string;
  getFormattedWeeklyHours: () => string;
  isValid: () => boolean;
}

export type UseAnnualContractHoursReturn = AnnualContractHoursState &
  AnnualContractHoursActions;

/**
 * Hook para gestionar las horas de convenio anual
 *
 * Funcionalidades:
 * - Configuración directa de horas anuales
 * - Calculadora para convertir horas semanales a anuales
 * - Validación en tiempo real
 * - Sistema de advertencias para valores inusuales
 * - Gestión de estado de errores
 */
export function useAnnualContractHours(): UseAnnualContractHoursReturn {
  const useCase = useMemo(
    () => new ConfigureAnnualContractHoursUseCase(),
    []
  );

  const [state, setState] = useState<AnnualContractHoursState>(() => {
    const defaultHours = useCase.reset().getValue();
    return {
      annualHours: defaultHours,
      annualInput: defaultHours.getValue().toString(),
      weeklyInput: '',
      annualError: null,
      weeklyError: null,
      warning: defaultHours.getWarning(),
      isDefault: true,
    };
  });

  /**
   * Actualiza el input de horas anuales con validación
   */
  const setAnnualHours = useCallback(
    (value: string) => {
      const trimmed = value.trim();

      // Permitir campo vacío
      if (trimmed === '') {
        setState((prev) => ({
          ...prev,
          annualInput: '',
          annualHours: null,
          annualError: null,
          warning: null,
          isDefault: false,
        }));
        return;
      }

      const numValue = parseFloat(trimmed);

      // Validar entrada
      if (isNaN(numValue)) {
        setState((prev) => ({
          ...prev,
          annualInput: trimmed,
          annualHours: null,
          annualError: 'Debe ser un número válido',
          warning: null,
          isDefault: false,
        }));
        return;
      }

      // Intentar crear el value object
      const validation = useCase.validate(numValue);

      if (!validation.isValid) {
        setState((prev) => ({
          ...prev,
          annualInput: trimmed,
          annualHours: null,
          annualError: validation.error || 'Valor inválido',
          warning: null,
          isDefault: false,
        }));
        return;
      }

      // Valor válido
      const result = useCase.execute(numValue);
      if (result.isSuccess()) {
        const hours = result.getValue();
        setState((prev) => ({
          ...prev,
          annualInput: trimmed,
          annualHours: hours,
          annualError: null,
          warning: hours.getWarning(),
          isDefault:
            numValue === ANNUAL_CONTRACT_HOURS_CONSTRAINTS.DEFAULT,
        }));
      }
    },
    [useCase]
  );

  /**
   * Actualiza el input de horas semanales con validación
   */
  const setWeeklyHours = useCallback(
    (value: string) => {
      const trimmed = value.trim();

      // Permitir campo vacío
      if (trimmed === '') {
        setState((prev) => ({
          ...prev,
          weeklyInput: '',
          weeklyError: null,
        }));
        return;
      }

      const numValue = parseFloat(trimmed);

      // Validar entrada
      if (isNaN(numValue)) {
        setState((prev) => ({
          ...prev,
          weeklyInput: trimmed,
          weeklyError: 'Debe ser un número válido',
        }));
        return;
      }

      // Validar sin crear instancia
      const validation = useCase.validateWeekly(numValue);

      if (!validation.isValid) {
        setState((prev) => ({
          ...prev,
          weeklyInput: trimmed,
          weeklyError: validation.error || 'Valor inválido',
        }));
        return;
      }

      // Valor válido - no actualizamos annualHours aún
      setState((prev) => ({
        ...prev,
        weeklyInput: trimmed,
        weeklyError: null,
      }));
    },
    [useCase]
  );

  /**
   * Usa el cálculo de horas semanales para actualizar las anuales
   */
  const applyWeeklyCalculation = useCallback(() => {
    const trimmed = state.weeklyInput.trim();

    if (trimmed === '') {
      return;
    }

    const numValue = parseFloat(trimmed);

    if (isNaN(numValue)) {
      return;
    }

    const result = useCase.executeFromWeekly(numValue);

    if (result.isSuccess()) {
      const hours = result.getValue();
      const annualValue = hours.getValue();

      setState((prev) => ({
        ...prev,
        annualHours: hours,
        annualInput: annualValue.toString(),
        annualError: null,
        warning: hours.getWarning(),
        isDefault:
          annualValue === ANNUAL_CONTRACT_HOURS_CONSTRAINTS.DEFAULT,
      }));
    }
  }, [state.weeklyInput, useCase]);

  /**
   * Resetea a valores por defecto
   */
  const reset = useCallback(() => {
    const result = useCase.reset();
    if (result.isSuccess()) {
      const hours = result.getValue();
      setState({
        annualHours: hours,
        annualInput: hours.getValue().toString(),
        weeklyInput: '',
        annualError: null,
        weeklyError: null,
        warning: hours.getWarning(),
        isDefault: true,
      });
    }
  }, [useCase]);

  /**
   * Carga desde una configuración guardada
   */
  const loadFromConfig = useCallback(
    (annualHours: number) => {
      const result = useCase.loadFromConfig(annualHours);

      if (result.isSuccess()) {
        const hours = result.getValue();
        setState({
          annualHours: hours,
          annualInput: annualHours.toString(),
          weeklyInput: '',
          annualError: null,
          weeklyError: null,
          warning: hours.getWarning(),
          isDefault:
            annualHours === ANNUAL_CONTRACT_HOURS_CONSTRAINTS.DEFAULT,
        });
      }
    },
    [useCase]
  );

  /**
   * Obtiene las horas anuales formateadas
   */
  const getFormattedAnnualHours = useCallback((): string => {
    if (!state.annualHours) return '';
    return state.annualHours.getValue().toString();
  }, [state.annualHours]);

  /**
   * Obtiene las horas semanales equivalentes formateadas
   */
  const getFormattedWeeklyHours = useCallback((): string => {
    if (!state.annualHours) return '';
    return state.annualHours.toWeeklyHours().toString();
  }, [state.annualHours]);

  /**
   * Verifica si la configuración actual es válida
   */
  const isValid = useCallback((): boolean => {
    return state.annualHours !== null && state.annualError === null;
  }, [state.annualHours, state.annualError]);

  return {
    ...state,
    setAnnualHours,
    setWeeklyHours,
    applyWeeklyCalculation,
    reset,
    loadFromConfig,
    getFormattedAnnualHours,
    getFormattedWeeklyHours,
    isValid,
  };
}
