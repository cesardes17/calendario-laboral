/**
 * @file workingHoursconfigurator.tsx
 * @description Componente para configurar horas de trabajo por tipo de día
 * Implementa HU-010: Definir horas por tipo de día
 */

'use client';

import React from 'react';
import { useWorkingHours, type UseWorkingHoursReturn } from '@/src/application/hooks';
import type { WorkingHoursConfig } from '@/src/core/domain';

/**
 * Props del componente de campo de horas
 */
interface HoursInputFieldProps {
  label: string;
  emoji: string;
  tooltip: string;
  value: string;
  onChange: (value: string) => void;
  isValid: boolean;
  error?: string;
}

/**
 * Campo individual para configurar horas
 */
function HoursInputField({
  label,
  emoji,
  tooltip,
  value,
  onChange,
  isValid,
  error,
}: HoursInputFieldProps) {
  return (
    <div className="mb-6">
      <label className="block mb-2">
        <span className="text-base font-medium text-gray-700 dark:text-gray-200">
          {emoji} {label}
        </span>
      </label>

      <div className="flex items-center gap-2">
        <input
          type="text"
          inputMode="decimal"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`
            w-24 px-3 py-2
            text-lg font-medium text-center
            border rounded-lg
            focus:outline-none focus:ring-2 focus:ring-offset-1
            transition-colors
            ${
              isValid
                ? 'border-gray-300 dark:border-gray-600 focus:ring-blue-500 dark:focus:ring-blue-400'
                : 'border-red-500 dark:border-red-400 focus:ring-red-500 dark:focus:ring-red-400'
            }
            bg-white dark:bg-gray-800
            text-gray-900 dark:text-gray-100
          `}
          placeholder="0.00"
          aria-label={label}
          aria-invalid={!isValid}
          aria-describedby={`${label}-tooltip ${!isValid ? `${label}-error` : ''}`}
        />
        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
          horas/día
        </span>
      </div>

      <p
        id={`${label}-tooltip`}
        className="mt-1 text-sm text-gray-500 dark:text-gray-400"
      >
        {tooltip}
      </p>

      {!isValid && error && (
        <p
          id={`${label}-error`}
          className="mt-1 text-sm text-red-600 dark:text-red-400"
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  );
}

/**
 * Props del componente principal
 */
export interface WorkingHoursConfiguratorProps {
  /**
   * Configuración inicial (opcional)
   */
  initialConfig?: Partial<WorkingHoursConfig>;

  /**
   * Callback cuando la configuración es válida y cambia
   */
  onChange?: (config: WorkingHoursConfig) => void;

  /**
   * Mostrar botón de reset
   */
  showResetButton?: boolean;
}

/**
 * Componente para configurar horas de trabajo por tipo de día
 *
 * Características:
 * - 4 campos para diferentes tipos de día (L-V, Sábado, Domingo, Festivo)
 * - Validación en tiempo real (0-24 horas, decimales permitidos)
 * - Tooltips explicativos
 * - Formato automático a 2 decimales
 * - Accesibilidad (ARIA labels, roles, etc.)
 * - Tema claro/oscuro
 *
 * @example
 * ```tsx
 * <WorkingHoursConfigurator
 *   initialConfig={{ weekday: 7.5, saturday: 6 }}
 *   onChange={(config) => console.log(config)}
 *   showResetButton
 * />
 * ```
 */
export function WorkingHoursConfigurator({
  initialConfig,
  onChange,
  showResetButton = false,
}: WorkingHoursConfiguratorProps) {
  const {
    workingHours,
    weekdayInput,
    saturdayInput,
    sundayInput,
    holidayInput,
    weekdayValidation,
    saturdayValidation,
    sundayValidation,
    holidayValidation,
    isValid,
    updateWeekdayHours,
    updateSaturdayHours,
    updateSundayHours,
    updateHolidayHours,
    reset,
  } = useWorkingHours(initialConfig);

  // Notificar cambios al padre cuando la configuración es válida
  React.useEffect(() => {
    if (isValid && onChange) {
      onChange(workingHours.toJSON());
    }
  }, [workingHours, isValid, onChange]);

  return (
    <div className="w-full">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Define tus horas de trabajo por tipo de día
        </h3>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Especifica cuántas horas trabajas según el tipo de día para calcular
          correctamente tu balance anual
        </p>
      </div>

      <div className="space-y-2">
        <HoursInputField
          label="Lunes a Viernes"
          emoji="📅"
          tooltip="Horas que trabajas en días laborables normales"
          value={weekdayInput}
          onChange={updateWeekdayHours}
          isValid={weekdayValidation.isValid}
          error={weekdayValidation.error}
        />

        <HoursInputField
          label="Sábado"
          emoji="📅"
          tooltip="Horas cuando trabajas en sábado (si aplica según tu ciclo)"
          value={saturdayInput}
          onChange={updateSaturdayHours}
          isValid={saturdayValidation.isValid}
          error={saturdayValidation.error}
        />

        <HoursInputField
          label="Domingo"
          emoji="📅"
          tooltip="Horas cuando trabajas en domingo (si aplica según tu ciclo)"
          value={sundayInput}
          onChange={updateSundayHours}
          isValid={sundayValidation.isValid}
          error={sundayValidation.error}
        />

        <HoursInputField
          label="Festivo trabajado"
          emoji="🎉"
          tooltip="Horas cuando trabajas un día festivo oficial"
          value={holidayInput}
          onChange={updateHolidayHours}
          isValid={holidayValidation.isValid}
          error={holidayValidation.error}
        />
      </div>

      {showResetButton && (
        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={reset}
            className="
              px-4 py-2
              text-sm font-medium
              text-gray-700 dark:text-gray-200
              bg-white dark:bg-gray-800
              border border-gray-300 dark:border-gray-600
              rounded-lg
              hover:bg-gray-50 dark:hover:bg-gray-700
              focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
              transition-colors
            "
          >
            Restaurar valores por defecto
          </button>
        </div>
      )}

      {!isValid && (
        <div
          className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
          role="alert"
        >
          <p className="text-sm text-red-800 dark:text-red-200">
            Por favor, corrige los errores antes de continuar
          </p>
        </div>
      )}
    </div>
  );
}

// Export para facilitar testing
export { useWorkingHours };
export type { UseWorkingHoursReturn };
