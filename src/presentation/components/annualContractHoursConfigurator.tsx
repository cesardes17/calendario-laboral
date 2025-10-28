/**
 * @file annualContractHoursconfigurator.tsx
 * @description Componente para configurar las horas anuales de convenio
 */

'use client';

import React, { useState } from 'react';
import { useAnnualContractHours } from '@/src/application/hooks';
import {
  COMMON_ANNUAL_HOURS_EXAMPLES,
  WarningType,
} from '@/src/core/domain/annualContractHours';

export interface AnnualContractHoursConfiguratorProps {
  /**
   * Callback cuando las horas son válidas
   */
  onValidHours?: (annualHours: number) => void;

  /**
   * Callback cuando las horas cambian (incluso si son inválidas)
   */
  onHoursChange?: (annualHours: number | null) => void;

  /**
   * Horas iniciales
   */
  initialHours?: number;
}

export function AnnualContractHoursConfigurator({
  onValidHours,
  onHoursChange,
  initialHours,
}: AnnualContractHoursConfiguratorProps) {
  const {
    annualHours,
    annualInput,
    weeklyInput,
    annualError,
    weeklyError,
    warning,
    setAnnualHours,
    setWeeklyHours,
    applyWeeklyCalculation,
    isValid,
  } = useAnnualContractHours();

  const [showCalculator, setShowCalculator] = useState(false);

  // Cargar horas iniciales si se proporcionan
  React.useEffect(() => {
    if (initialHours !== undefined) {
      setAnnualHours(initialHours.toString());
    }
  }, [initialHours, setAnnualHours]);

  // Notificar cambios válidos
  React.useEffect(() => {
    if (isValid() && annualHours && onValidHours) {
      onValidHours(annualHours.getValue());
    }
  }, [annualHours, isValid, onValidHours]);

  // Notificar todos los cambios
  React.useEffect(() => {
    if (onHoursChange) {
      onHoursChange(annualHours?.getValue() ?? null);
    }
  }, [annualHours, onHoursChange]);

  const handleAnnualInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAnnualHours(e.target.value);
  };

  const handleWeeklyInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setWeeklyHours(e.target.value);
  };

  const handleUseCalculatedValue = () => {
    applyWeeklyCalculation();
    setShowCalculator(false);
  };

  const renderWarning = () => {
    if (!warning || warning.type === WarningType.NONE) return null;

    const warningStyles =
      warning.type === WarningType.UNUSUALLY_LOW
        ? 'bg-yellow-50 dark:bg-yellow-950/30 text-yellow-800 dark:text-yellow-200 border-yellow-200 dark:border-yellow-800'
        : 'bg-orange-50 dark:bg-orange-950/30 text-orange-800 dark:text-orange-200 border-orange-200 dark:border-orange-800';

    return (
      <div className={`mt-2 p-3 border rounded-md ${warningStyles}`}>
        <p className="text-sm font-medium">⚠️ Valor inusual</p>
        <p className="text-sm mt-1">{warning.message}</p>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Input principal de horas anuales */}
      <div>
        <label
          htmlFor="annual-hours"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          Horas anuales según convenio
        </label>
        <input
          id="annual-hours"
          type="text"
          inputMode="decimal"
          value={annualInput}
          onChange={handleAnnualInputChange}
          placeholder="Ej: 1752"
          className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white ${
            annualError
              ? 'border-red-300 dark:border-red-700'
              : 'border-gray-300 dark:border-gray-600'
          }`}
          aria-invalid={!!annualError}
          aria-describedby={
            annualError ? 'annual-hours-error' : 'annual-hours-help'
          }
        />
        {annualError && (
          <p id="annual-hours-error" className="mt-1 text-sm text-red-600 dark:text-red-400">
            {annualError}
          </p>
        )}
        {!annualError && annualHours && (
          <p id="annual-hours-help" className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Equivalente a {annualHours.toWeeklyHours()} horas/semana
          </p>
        )}
      </div>

      {/* Advertencia de valor inusual */}
      {renderWarning()}

      {/* Botón para mostrar calculadora */}
      {!showCalculator && (
        <button
          type="button"
          onClick={() => setShowCalculator(true)}
          className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
        >
          📊 Calcular desde horas semanales
        </button>
      )}

      {/* Calculadora auxiliar */}
      {showCalculator && (
        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Calculadora de horas semanales
            </h3>
            <button
              type="button"
              onClick={() => setShowCalculator(false)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              aria-label="Cerrar calculadora"
            >
              ✕
            </button>
          </div>

          <div className="space-y-3">
            <div>
              <label
                htmlFor="weekly-hours"
                className="block text-sm text-gray-600 dark:text-gray-400 mb-1"
              >
                Horas semanales
              </label>
              <input
                id="weekly-hours"
                type="text"
                inputMode="decimal"
                value={weeklyInput}
                onChange={handleWeeklyInputChange}
                placeholder="Ej: 40"
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-900 dark:text-white ${
                  weeklyError
                    ? 'border-red-300 dark:border-red-700'
                    : 'border-gray-300 dark:border-gray-600'
                }`}
                aria-invalid={!!weeklyError}
                aria-describedby={
                  weeklyError ? 'weekly-hours-error' : undefined
                }
              />
              {weeklyError && (
                <p id="weekly-hours-error" className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {weeklyError}
                </p>
              )}
            </div>

            {/* Ejemplos comunes */}
            <div className="space-y-1">
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                Ejemplos comunes:
              </p>
              {COMMON_ANNUAL_HOURS_EXAMPLES.map((example) => (
                <button
                  key={example.weeklyHours}
                  type="button"
                  onClick={() => setWeeklyHours(example.weeklyHours.toString())}
                  className="block w-full text-left px-2 py-1 text-xs text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                >
                  {example.weeklyHours}h/semana = {example.annualHours}h/año
                  <span className="text-gray-400 dark:text-gray-500 ml-1">
                    ({example.description})
                  </span>
                </button>
              ))}
            </div>

            {/* Botón para usar el valor calculado */}
            <button
              type="button"
              onClick={handleUseCalculatedValue}
              disabled={!weeklyInput || !!weeklyError}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:cursor-not-allowed disabled:text-gray-500 dark:disabled:text-gray-400 font-medium text-sm"
            >
              Usar este valor
            </button>
          </div>
        </div>
      )}

      {/* Información adicional */}
      <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
        <p>
          💡 Las horas de convenio se usan para calcular si has trabajado más o
          menos horas de las establecidas en tu contrato.
        </p>
        <p>
          📌 Consulta tu convenio colectivo o contrato laboral para conocer el
          número exacto de horas anuales.
        </p>
      </div>
    </div>
  );
}
