/**
 * @file use-workingHours.ts
 * @description React hook para gestionar la configuración de horas por tipo de día
 */

'use client';

import { useState, useCallback } from 'react';
import { ConfigureWorkingHoursUseCase } from '@/src/core/usecases';
import { WorkingHours, type WorkingHoursConfig } from '@/src/core/domain';

/**
 * Estado de validación para un campo de horas
 */
interface HoursValidation {
  isValid: boolean;
  error?: string;
}

/**
 * Estado del hook
 */
interface UseWorkingHoursState {
  workingHours: WorkingHours;
  weekdayInput: string;
  saturdayInput: string;
  sundayInput: string;
  holidayInput: string;
  weekdayValidation: HoursValidation;
  saturdayValidation: HoursValidation;
  sundayValidation: HoursValidation;
  holidayValidation: HoursValidation;
}

/**
 * Valor de retorno del hook
 */
export interface UseWorkingHoursReturn {
  // Estado
  workingHours: WorkingHours;
  weekdayInput: string;
  saturdayInput: string;
  sundayInput: string;
  holidayInput: string;
  weekdayValidation: HoursValidation;
  saturdayValidation: HoursValidation;
  sundayValidation: HoursValidation;
  holidayValidation: HoursValidation;
  isValid: boolean;

  // Acciones
  updateWeekdayHours: (value: string) => void;
  updateSaturdayHours: (value: string) => void;
  updateSundayHours: (value: string) => void;
  updateHolidayHours: (value: string) => void;
  reset: () => void;
  loadFromConfig: (config: WorkingHoursConfig) => void;
}

const useCase = new ConfigureWorkingHoursUseCase();

/**
 * Formatea un número a string con 2 decimales para mostrar en inputs
 */
function formatHoursForDisplay(hours: number): string {
  return hours.toFixed(2);
}

/**
 * Valida y parsea una entrada de horas
 */
function validateAndParseHours(input: string): { value: number; validation: HoursValidation } {
  // Permitir string vacío
  if (input.trim() === '') {
    return {
      value: 0,
      validation: { isValid: false, error: 'Este campo es requerido' },
    };
  }

  // Parsear el número
  const value = parseFloat(input);

  // Validar que sea un número
  if (isNaN(value) || !isFinite(value)) {
    return {
      value: 0,
      validation: { isValid: false, error: 'Debe ser un número válido' },
    };
  }

  // Validar rango
  if (value < 0) {
    return {
      value,
      validation: { isValid: false, error: 'No puede ser negativo' },
    };
  }

  if (value > 24) {
    return {
      value,
      validation: { isValid: false, error: 'No puede superar 24 horas' },
    };
  }

  return {
    value,
    validation: { isValid: true },
  };
}

/**
 * Hook personalizado para gestionar la configuración de horas por tipo de día
 *
 * Implementa HU-010: Definir horas por tipo de día
 *
 * @param initialConfig - Configuración inicial (opcional)
 * @returns Estado y acciones para gestionar las horas
 */
export function useWorkingHours(
  initialConfig?: Partial<WorkingHoursConfig>
): UseWorkingHoursReturn {
  const [state, setState] = useState<UseWorkingHoursState>(() => {
    const workingHours = initialConfig
      ? WorkingHours.create(initialConfig)
      : WorkingHours.default();

    return {
      workingHours,
      weekdayInput: formatHoursForDisplay(workingHours.getHours('weekday')),
      saturdayInput: formatHoursForDisplay(workingHours.getHours('saturday')),
      sundayInput: formatHoursForDisplay(workingHours.getHours('sunday')),
      holidayInput: formatHoursForDisplay(workingHours.getHours('holiday')),
      weekdayValidation: { isValid: true },
      saturdayValidation: { isValid: true },
      sundayValidation: { isValid: true },
      holidayValidation: { isValid: true },
    };
  });

  /**
   * Actualiza las horas para días laborables (L-V)
   */
  const updateWeekdayHours = useCallback((value: string) => {
    const { value: hours, validation } = validateAndParseHours(value);

    setState((prev) => {
      if (!validation.isValid) {
        return {
          ...prev,
          weekdayInput: value,
          weekdayValidation: validation,
        };
      }

      const result = useCase.updateSingleDayType('weekday', hours, prev.workingHours);

      if (result.isFailure()) {
        return {
          ...prev,
          weekdayInput: value,
          weekdayValidation: { isValid: false, error: result.errorValue() },
        };
      }

      return {
        ...prev,
        workingHours: result.getValue(),
        weekdayInput: value,
        weekdayValidation: { isValid: true },
      };
    });
  }, []);

  /**
   * Actualiza las horas para sábados
   */
  const updateSaturdayHours = useCallback((value: string) => {
    const { value: hours, validation } = validateAndParseHours(value);

    setState((prev) => {
      if (!validation.isValid) {
        return {
          ...prev,
          saturdayInput: value,
          saturdayValidation: validation,
        };
      }

      const result = useCase.updateSingleDayType('saturday', hours, prev.workingHours);

      if (result.isFailure()) {
        return {
          ...prev,
          saturdayInput: value,
          saturdayValidation: { isValid: false, error: result.errorValue() },
        };
      }

      return {
        ...prev,
        workingHours: result.getValue(),
        saturdayInput: value,
        saturdayValidation: { isValid: true },
      };
    });
  }, []);

  /**
   * Actualiza las horas para domingos
   */
  const updateSundayHours = useCallback((value: string) => {
    const { value: hours, validation } = validateAndParseHours(value);

    setState((prev) => {
      if (!validation.isValid) {
        return {
          ...prev,
          sundayInput: value,
          sundayValidation: validation,
        };
      }

      const result = useCase.updateSingleDayType('sunday', hours, prev.workingHours);

      if (result.isFailure()) {
        return {
          ...prev,
          sundayInput: value,
          sundayValidation: { isValid: false, error: result.errorValue() },
        };
      }

      return {
        ...prev,
        workingHours: result.getValue(),
        sundayInput: value,
        sundayValidation: { isValid: true },
      };
    });
  }, []);

  /**
   * Actualiza las horas para festivos trabajados
   */
  const updateHolidayHours = useCallback((value: string) => {
    const { value: hours, validation } = validateAndParseHours(value);

    setState((prev) => {
      if (!validation.isValid) {
        return {
          ...prev,
          holidayInput: value,
          holidayValidation: validation,
        };
      }

      const result = useCase.updateSingleDayType('holiday', hours, prev.workingHours);

      if (result.isFailure()) {
        return {
          ...prev,
          holidayInput: value,
          holidayValidation: { isValid: false, error: result.errorValue() },
        };
      }

      return {
        ...prev,
        workingHours: result.getValue(),
        holidayInput: value,
        holidayValidation: { isValid: true },
      };
    });
  }, []);

  /**
   * Resetea a valores por defecto
   */
  const reset = useCallback(() => {
    const result = useCase.reset();

    if (result.isSuccess()) {
      const workingHours = result.getValue();
      setState({
        workingHours,
        weekdayInput: formatHoursForDisplay(workingHours.getHours('weekday')),
        saturdayInput: formatHoursForDisplay(workingHours.getHours('saturday')),
        sundayInput: formatHoursForDisplay(workingHours.getHours('sunday')),
        holidayInput: formatHoursForDisplay(workingHours.getHours('holiday')),
        weekdayValidation: { isValid: true },
        saturdayValidation: { isValid: true },
        sundayValidation: { isValid: true },
        holidayValidation: { isValid: true },
      });
    }
  }, []);

  /**
   * Carga configuración desde un objeto
   */
  const loadFromConfig = useCallback((config: WorkingHoursConfig) => {
    const result = useCase.loadFromConfig(config);

    if (result.isSuccess()) {
      const workingHours = result.getValue();
      setState({
        workingHours,
        weekdayInput: formatHoursForDisplay(workingHours.getHours('weekday')),
        saturdayInput: formatHoursForDisplay(workingHours.getHours('saturday')),
        sundayInput: formatHoursForDisplay(workingHours.getHours('sunday')),
        holidayInput: formatHoursForDisplay(workingHours.getHours('holiday')),
        weekdayValidation: { isValid: true },
        saturdayValidation: { isValid: true },
        sundayValidation: { isValid: true },
        holidayValidation: { isValid: true },
      });
    }
  }, []);

  /**
   * Verifica si todas las validaciones son correctas
   */
  const isValid =
    state.weekdayValidation.isValid &&
    state.saturdayValidation.isValid &&
    state.sundayValidation.isValid &&
    state.holidayValidation.isValid;

  return {
    // Estado
    workingHours: state.workingHours,
    weekdayInput: state.weekdayInput,
    saturdayInput: state.saturdayInput,
    sundayInput: state.sundayInput,
    holidayInput: state.holidayInput,
    weekdayValidation: state.weekdayValidation,
    saturdayValidation: state.saturdayValidation,
    sundayValidation: state.sundayValidation,
    holidayValidation: state.holidayValidation,
    isValid,

    // Acciones
    updateWeekdayHours,
    updateSaturdayHours,
    updateSundayHours,
    updateHolidayHours,
    reset,
    loadFromConfig,
  };
}
