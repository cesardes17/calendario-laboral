/**
 * EmploymentStatusSelector Component
 *
 * UI component for employment status selection (HU-002)
 * Implements:
 * - Radio buttons for "Started this year" vs "Worked before"
 * - Conditional inputs based on selection:
 *   - Contract start date picker (if started this year)
 *   - Cycle offset inputs (if worked before)
 * - Error display for validation
 * - Clear visual feedback and help text
 */

'use client';

import React from 'react';
import { useEmploymentStatus } from '@/src/application/hooks/use-employment-status';
import { EmploymentStatusType } from '@/src/core/domain/employment-status';
import { CycleDayType } from '@/src/core/domain/cycle-offset';
import { Year } from '@/src/core/domain/year';
import { WorkCycle } from '@/src/core/domain/work-cycle';
import { ConfigureWorkCycleUseCase } from '@/src/core/usecases/configure-work-cycle.usecase';

export interface EmploymentStatusSelectorProps {
  /**
   * The year context for validation
   */
  year: Year;

  /**
   * The configured work cycle (for validating offset)
   */
  workCycle: WorkCycle;

  /**
   * Callback when configuration is complete and valid
   */
  onConfigurationChange?: (isValid: boolean) => void;

  /**
   * Additional CSS classes
   */
  className?: string;
}

export const EmploymentStatusSelector: React.FC<EmploymentStatusSelectorProps> = ({
  year,
  workCycle,
  onConfigurationChange,
  className = '',
}) => {
  const cycleUseCase = React.useMemo(() => new ConfigureWorkCycleUseCase(), []);
  const {
    state,
    selectStatus,
    setContractStartDate,
    setCycleOffset,
    validateConfiguration,
  } = useEmploymentStatus();

  // Local state for form inputs
  const [contractDateInput, setContractDateInput] = React.useState('');
  const [partNumberInput, setPartNumberInput] = React.useState('');
  const [dayWithinPartInput, setDayWithinPartInput] = React.useState('');
  const [dayTypeInput, setDayTypeInput] = React.useState<CycleDayType>(CycleDayType.WORK);

  // Handle status selection
  const handleStatusChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const statusType = event.target.value as EmploymentStatusType;
    selectStatus(statusType);

    // Clear inputs when changing status
    setContractDateInput('');
    setPartNumberInput('');
    setDayWithinPartInput('');
    setDayTypeInput(CycleDayType.WORK);
  };

  // Handle contract date input
  const handleContractDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const dateString = event.target.value;
    setContractDateInput(dateString);

    if (dateString) {
      const date = new Date(dateString);
      setContractStartDate(date, year);
    }
  };

  // Handle cycle offset inputs
  const handlePartNumberChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;
    setPartNumberInput(value);
    // Reset day when part changes
    setDayWithinPartInput('');
    if (value) {
      // Don't update offset yet, wait for day selection
    }
  };

  const handleDayWithinPartChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;
    setDayWithinPartInput(value);

    // Auto-detect day type based on selected day
    if (value && partNumberInput) {
      const partNum = parseInt(partNumberInput, 10);
      const dayNum = parseInt(value, 10);
      const part = workCycle.getPart(partNum);

      if (part) {
        // If day is within work days range, it's WORK, otherwise REST
        const autoDetectedType = dayNum <= part.workDays ? CycleDayType.WORK : CycleDayType.REST;
        setDayTypeInput(autoDetectedType);
        updateCycleOffset(partNumberInput, value, autoDetectedType);
      }
    }
  };


  const updateCycleOffset = (partStr: string, dayStr: string, type: CycleDayType) => {
    if (partStr && dayStr) {
      const partNumber = parseInt(partStr, 10);
      const dayWithinPart = parseInt(dayStr, 10);

      if (!isNaN(partNumber) && !isNaN(dayWithinPart)) {
        // Validate offset against the configured cycle
        const offsetValidation = cycleUseCase.validateOffsetForCycle(
          workCycle,
          partNumber,
          dayWithinPart
        );

        if (offsetValidation.isValid) {
          setCycleOffset(partNumber, dayWithinPart, type);
        }
        // Note: errors will be shown through state.errors from the use case
      }
    }
  };

  // Get cycle information for contextual help
  const cycleInfo = React.useMemo(() => cycleUseCase.getCycleInfo(workCycle), [workCycle, cycleUseCase]);

  // Auto-validate for weekly mode when "worked before" is selected
  React.useEffect(() => {
    if (
      state.status?.type === EmploymentStatusType.WORKED_BEFORE &&
      cycleInfo.mode === 'weekly' &&
      year
    ) {
      // For weekly mode, offset is automatic, so mark as valid immediately
      const validation = validateConfiguration(year, true);
      onConfigurationChange?.(validation.isValid);
    }
  }, [state.status, cycleInfo.mode, year, validateConfiguration, onConfigurationChange]);

  // Validate and notify parent on state changes
  React.useEffect(() => {
    if (state.status && year) {
      const isWeeklyCycle = cycleInfo.mode === 'weekly';
      const validation = validateConfiguration(year, isWeeklyCycle);
      onConfigurationChange?.(validation.isValid);
    }
  }, [state.status, state.contractStartDate, state.cycleOffset, cycleInfo.mode, year, validateConfiguration, onConfigurationChange]);

  return (
    <div className={`employment-status-selector ${className}`}>
      <fieldset className="mb-6">
        <legend className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          ¿Empezaste a trabajar este año ({year.value})?
        </legend>

        {/* Radio button: Started this year */}
        <div className="mb-3">
          <label className="flex items-start cursor-pointer">
            <input
              type="radio"
              name="employment-status"
              value={EmploymentStatusType.STARTED_THIS_YEAR}
              checked={state.status?.type === EmploymentStatusType.STARTED_THIS_YEAR}
              onChange={handleStatusChange}
              className="mt-1 mr-3 h-4 w-4 text-blue-600 dark:text-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400"
            />
            <div>
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                Sí, empecé este año
              </span>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Indica la fecha exacta en que comenzó tu contrato. Los días anteriores
                aparecerán como &apos;No contratado&apos;
              </p>
            </div>
          </label>
        </div>

        {/* Radio button: Worked before */}
        <div>
          <label className="flex items-start cursor-pointer">
            <input
              type="radio"
              name="employment-status"
              value={EmploymentStatusType.WORKED_BEFORE}
              checked={state.status?.type === EmploymentStatusType.WORKED_BEFORE}
              onChange={handleStatusChange}
              className="mt-1 mr-3 h-4 w-4 text-blue-600 dark:text-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400"
            />
            <div>
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                No, ya trabajaba antes
              </span>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Indica en qué punto de tu ciclo laboral te encontrabas el 1 de enero
                para continuar correctamente
              </p>
            </div>
          </label>
        </div>
      </fieldset>

      {/* Conditional: Contract start date input */}
      {state.status?.type === EmploymentStatusType.STARTED_THIS_YEAR && (
        <div className="mb-4 pl-7">
          <label
            htmlFor="contract-date"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            Fecha de inicio del contrato
          </label>
          <input
            type="date"
            id="contract-date"
            value={contractDateInput}
            onChange={handleContractDateChange}
            min={`${year.value}-01-01`}
            max={`${year.value}-12-31`}
            className={`
              w-full px-4 py-2 border rounded-lg
              focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400
              text-gray-900 dark:text-gray-100
              transition-colors duration-200
              ${state.errors.length > 0 ? 'border-red-500 dark:border-red-400 bg-red-50 dark:bg-red-950' : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800'}
            `}
            aria-describedby={state.errors.length > 0 ? 'contract-date-error' : undefined}
          />
        </div>
      )}

      {/* Conditional: Cycle offset inputs */}
      {state.status?.type === EmploymentStatusType.WORKED_BEFORE && (
        <div className="mb-4 pl-7 space-y-4">
          <div className="p-3 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg mb-4">
            <p className="text-sm text-blue-900 dark:text-blue-300 font-medium mb-1">
              Tu ciclo configurado: {workCycle.getDisplayText()}
            </p>
            <p className="text-xs text-blue-700 dark:text-blue-400">
              {cycleInfo.mode === 'parts' && cycleInfo.totalParts > 0
                ? `Tu ciclo tiene ${cycleInfo.totalParts} parte${cycleInfo.totalParts > 1 ? 's' : ''}`
                : 'Ciclo semanal (repetición cada 7 días)'}
            </p>
          </div>

          {/* Weekly mode: Automatic offset calculation */}
          {cycleInfo.mode === 'weekly' && (
            <div className="p-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
              <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">
                ℹ️ Continuidad del ciclo
              </h4>
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                El 1 de enero de {year.value} es{' '}
                <strong className="text-blue-600 dark:text-blue-400">
                  {new Date(year.value, 0, 1).toLocaleDateString('es-ES', { weekday: 'long' }).toUpperCase()}
                </strong>
              </p>
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                Según tu patrón semanal, ese día será:{' '}
                <strong className={
                  workCycle.isWorkDayOnDate(new Date(year.value, 0, 1))
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-orange-600 dark:text-orange-400'
                }>
                  {workCycle.isWorkDayOnDate(new Date(year.value, 0, 1)) ? '✓ DÍA DE TRABAJO' : '✗ DÍA DE DESCANSO'}
                </strong>
              </p>
              <p className="text-xs text-green-700 dark:text-green-400 mt-3 italic">
                ✓ Tu calendario continuará correctamente desde el 1 de enero
              </p>
            </div>
          )}

          {/* Parts mode: Manual offset configuration */}
          {cycleInfo.mode === 'parts' && (
            <>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                Indica en qué punto del ciclo te encontrabas el 1 de enero:
              </p>

          {/* Part number */}
          <div>
            <label
              htmlFor="part-number"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Número de parte
            </label>
            <select
              id="part-number"
              value={partNumberInput}
              onChange={handlePartNumberChange}
              className={`
                w-full px-4 py-2 border rounded-lg
                focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400
                text-gray-900 dark:text-gray-100
                transition-colors duration-200
                ${state.errors.length > 0 ? 'border-red-500 dark:border-red-400 bg-red-50 dark:bg-red-950' : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800'}
              `}
            >
              <option value="">Selecciona una parte...</option>
              {cycleInfo.mode === 'parts' &&
                Array.from({ length: cycleInfo.totalParts }, (_, i) => i + 1).map((partNum) => {
                  const part = workCycle.getPart(partNum);
                  return (
                    <option key={partNum} value={partNum}>
                      Parte {partNum}
                      {part ? ` (${part.workDays} trabajo + ${part.restDays} descanso)` : ''}
                    </option>
                  );
                })}
            </select>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              {cycleInfo.mode === 'parts' && cycleInfo.totalParts > 0
                ? `Tu ciclo tiene ${cycleInfo.totalParts} parte${cycleInfo.totalParts > 1 ? 's' : ''}`
                : 'Selecciona la parte del ciclo'}
            </p>
          </div>

          {/* Day within part */}
          <div>
            <label
              htmlFor="day-within-part"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Día dentro de la parte
            </label>
            <select
              id="day-within-part"
              value={dayWithinPartInput}
              onChange={handleDayWithinPartChange}
              disabled={!partNumberInput}
              className={`
                w-full px-4 py-2 border rounded-lg
                focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400
                text-gray-900 dark:text-gray-100
                transition-colors duration-200
                ${!partNumberInput ? 'bg-gray-100 dark:bg-gray-800 cursor-not-allowed' : ''}
                ${state.errors.length > 0 ? 'border-red-500 dark:border-red-400 bg-red-50 dark:bg-red-950' : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800'}
              `}
            >
              <option value="">
                {partNumberInput ? 'Selecciona un día...' : 'Primero selecciona una parte'}
              </option>
              {partNumberInput &&
                (() => {
                  const partNum = parseInt(partNumberInput, 10);
                  const part = workCycle.getPart(partNum);
                  if (part) {
                    const options = [];
                    // Generate work days options
                    for (let i = 1; i <= part.workDays; i++) {
                      options.push(
                        <option key={`work-${i}`} value={i}>
                          Día {i} (Trabajo)
                        </option>
                      );
                    }
                    // Generate rest days options
                    for (let i = 1; i <= part.restDays; i++) {
                      options.push(
                        <option key={`rest-${i}`} value={part.workDays + i}>
                          Día {part.workDays + i} (Descanso)
                        </option>
                      );
                    }
                    return options;
                  }
                  return null;
                })()}
            </select>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              {partNumberInput && cycleInfo.parts
                ? (() => {
                    const partNum = parseInt(partNumberInput, 10);
                    const part = workCycle.getPart(partNum);
                    if (part) {
                      const totalDays = part.workDays + part.restDays;
                      return `La parte ${partNum} tiene ${totalDays} días: ${part.workDays} de trabajo, luego ${part.restDays} de descanso`;
                    }
                    return 'Selecciona el día específico';
                  })()
                : 'Primero selecciona una parte'}
            </p>
          </div>

              {/* Example display */}
              {state.cycleOffset && (
                <div className="p-3 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg">
                  <p className="text-sm text-blue-900 dark:text-blue-300">
                    <strong>Ejemplo:</strong> {state.cycleOffset.getDisplayText()}
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Error display */}
      {state.errors.length > 0 && (
        <div className="mt-4" role="alert">
          {state.errors.map((error, index) => (
            <p key={index} className="text-sm text-red-600 dark:text-red-400 mb-1">
              {error}
            </p>
          ))}
        </div>
      )}

      {/* Success indicator */}
      {state.isValid && state.status && (
        <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 rounded-lg">
          <p className="text-sm text-green-900 dark:text-green-300">
            ✓ Configuración válida
          </p>
        </div>
      )}
    </div>
  );
};
