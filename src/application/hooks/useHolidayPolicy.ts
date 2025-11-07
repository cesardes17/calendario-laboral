/**
 * @file useHolidayPolicy.ts
 * @description React hook para gestionar la política de trabajo en festivos
 */

'use client';

import { useState, useCallback } from 'react';
import { HolidayPolicy, HolidayPolicyType } from '@/src/core/domain/holidayPolicy';

/**
 * Valor de retorno del hook
 */
export interface UseHolidayPolicyReturn {
  // Estado
  holidayPolicy: HolidayPolicy;
  respectsHolidays: boolean;
  canWorkHolidays: boolean;

  // Acciones
  setPolicy: (type: HolidayPolicyType) => void;
  togglePolicy: () => void;
  reset: () => void;
  loadFromJSON: (json: string) => boolean;
}

/**
 * Hook personalizado para gestionar la política de trabajo en festivos
 *
 * Determina si el trabajador respeta festivos (nunca trabaja) o puede trabajarlos
 * según lo que indique su ciclo laboral.
 *
 * @param initialType - Tipo de política inicial (opcional, default: TRABAJAR_FESTIVOS)
 * @returns Estado y acciones para gestionar la política de festivos
 *
 * @example
 * ```tsx
 * const { holidayPolicy, respectsHolidays, togglePolicy } = useHolidayPolicy();
 *
 * <label>
 *   <input
 *     type="checkbox"
 *     checked={respectsHolidays}
 *     onChange={togglePolicy}
 *   />
 *   Respeto festivos (no trabajo en días festivos)
 * </label>
 * ```
 */
export function useHolidayPolicy(
  initialType?: HolidayPolicyType
): UseHolidayPolicyReturn {
  const [holidayPolicy, setHolidayPolicy] = useState<HolidayPolicy>(() => {
    if (initialType) {
      const result = HolidayPolicy.create(initialType);
      return result.isSuccess() ? result.getValue() : HolidayPolicy.default();
    }
    return HolidayPolicy.default();
  });

  /**
   * Establece una política específica
   */
  const setPolicy = useCallback((type: HolidayPolicyType) => {
    const result = HolidayPolicy.create(type);
    if (result.isSuccess()) {
      setHolidayPolicy(result.getValue());
    } else {
      console.error('Error al establecer política de festivos:', result.errorValue());
    }
  }, []);

  /**
   * Alterna entre respetar festivos y trabajar festivos
   * Útil para checkboxes o toggles en la UI
   */
  const togglePolicy = useCallback(() => {
    setHolidayPolicy((prev) => {
      const newType = prev.respectsHolidays()
        ? HolidayPolicyType.TRABAJAR_FESTIVOS
        : HolidayPolicyType.RESPETAR_FESTIVOS;
      return HolidayPolicy.create(newType).getValue();
    });
  }, []);

  /**
   * Resetea a la política por defecto (TRABAJAR_FESTIVOS)
   */
  const reset = useCallback(() => {
    setHolidayPolicy(HolidayPolicy.default());
  }, []);

  /**
   * Carga la política desde JSON (para deserialización desde localStorage)
   * @param json - String JSON con el tipo de política
   * @returns true si la carga fue exitosa, false si hubo error
   */
  const loadFromJSON = useCallback((json: string): boolean => {
    const result = HolidayPolicy.fromJSON(json);
    if (result.isSuccess()) {
      setHolidayPolicy(result.getValue());
      return true;
    } else {
      console.error('Error al cargar política de festivos desde JSON:', result.errorValue());
      return false;
    }
  }, []);

  return {
    // Estado
    holidayPolicy,
    respectsHolidays: holidayPolicy.respectsHolidays(),
    canWorkHolidays: holidayPolicy.canWorkHolidays(),

    // Acciones
    setPolicy,
    togglePolicy,
    reset,
    loadFromJSON,
  };
}
