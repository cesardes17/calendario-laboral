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
  const handlePartNumberChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setPartNumberInput(value);
    updateCycleOffset(value, dayWithinPartInput, dayTypeInput);
  };

  const handleDayWithinPartChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setDayWithinPartInput(value);
    updateCycleOffset(partNumberInput, value, dayTypeInput);
  };

  const handleDayTypeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value as CycleDayType;
    setDayTypeInput(value);
    updateCycleOffset(partNumberInput, dayWithinPartInput, value);
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

  // Validate and notify parent on state changes
  React.useEffect(() => {
    if (state.status) {
      const validation = validateConfiguration(year);
      onConfigurationChange?.(validation.isValid);
    }
  }, [state, year, validateConfiguration, onConfigurationChange]);

  return (
    <div className={`employment-status-selector ${className}`}>
      <fieldset className="mb-6">
        <legend className="block text-sm font-medium text-gray-700 mb-3">
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
              className="mt-1 mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500"
            />
            <div>
              <span className="text-sm font-medium text-gray-900">
                Sí, empecé este año
              </span>
              <p className="text-xs text-gray-500 mt-1">
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
              className="mt-1 mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500"
            />
            <div>
              <span className="text-sm font-medium text-gray-900">
                No, ya trabajaba antes
              </span>
              <p className="text-xs text-gray-500 mt-1">
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
            className="block text-sm font-medium text-gray-700 mb-2"
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
              focus:outline-none focus:ring-2 focus:ring-blue-500
              ${state.errors.length > 0 ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white'}
            `}
            aria-describedby={state.errors.length > 0 ? 'contract-date-error' : undefined}
          />
        </div>
      )}

      {/* Conditional: Cycle offset inputs */}
      {state.status?.type === EmploymentStatusType.WORKED_BEFORE && (
        <div className="mb-4 pl-7 space-y-4">
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg mb-4">
            <p className="text-sm text-blue-900 font-medium mb-1">
              Tu ciclo configurado: {workCycle.getDisplayText()}
            </p>
            <p className="text-xs text-blue-700">
              {cycleInfo.mode === 'parts' && cycleInfo.totalParts > 0
                ? `Tu ciclo tiene ${cycleInfo.totalParts} parte${cycleInfo.totalParts > 1 ? 's' : ''}`
                : 'Ciclo semanal (no usa partes)'}
            </p>
          </div>

          <p className="text-sm text-gray-600 mb-3">
            Indica en qué punto del ciclo te encontrabas el 1 de enero:
          </p>

          {/* Part number */}
          <div>
            <label
              htmlFor="part-number"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Número de parte
            </label>
            <input
              type="number"
              id="part-number"
              min="1"
              max={cycleInfo.mode === 'parts' ? cycleInfo.totalParts : undefined}
              value={partNumberInput}
              onChange={handlePartNumberChange}
              placeholder="Ej: 3"
              className={`
                w-full px-4 py-2 border rounded-lg
                focus:outline-none focus:ring-2 focus:ring-blue-500
                ${state.errors.length > 0 ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white'}
              `}
            />
            <p className="mt-1 text-xs text-gray-500">
              {cycleInfo.mode === 'parts' && cycleInfo.totalParts > 0
                ? `Tu ciclo tiene ${cycleInfo.totalParts} parte${cycleInfo.totalParts > 1 ? 's' : ''} (1-${cycleInfo.totalParts})`
                : 'Número de la parte del ciclo (empezando desde 1)'}
            </p>
          </div>

          {/* Day within part */}
          <div>
            <label
              htmlFor="day-within-part"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Día dentro de la parte
            </label>
            <input
              type="number"
              id="day-within-part"
              min="1"
              value={dayWithinPartInput}
              onChange={handleDayWithinPartChange}
              placeholder="Ej: 4"
              className={`
                w-full px-4 py-2 border rounded-lg
                focus:outline-none focus:ring-2 focus:ring-blue-500
                ${state.errors.length > 0 ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white'}
              `}
            />
            <p className="mt-1 text-xs text-gray-500">
              {partNumberInput && cycleInfo.parts
                ? (() => {
                    const partNum = parseInt(partNumberInput, 10);
                    const part = workCycle.getPart(partNum);
                    if (part) {
                      const totalDays = part.workDays + part.restDays;
                      return `La parte ${partNum} tiene ${totalDays} días (${part.workDays} trabajo + ${part.restDays} descanso)`;
                    }
                    return 'Día dentro de esa parte (empezando desde 1)';
                  })()
                : 'Día dentro de esa parte (empezando desde 1)'}
            </p>
          </div>

          {/* Day type */}
          <div>
            <label
              htmlFor="day-type"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Tipo de día
            </label>
            <select
              id="day-type"
              value={dayTypeInput}
              onChange={handleDayTypeChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white
                         focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={CycleDayType.WORK}>Trabajo</option>
              <option value={CycleDayType.REST}>Descanso</option>
            </select>
            <p className="mt-1 text-xs text-gray-500">
              Si el 1 de enero era día de trabajo o descanso
            </p>
          </div>

          {/* Example display */}
          {state.cycleOffset && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-900">
                <strong>Ejemplo:</strong> {state.cycleOffset.getDisplayText()}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Error display */}
      {state.errors.length > 0 && (
        <div className="mt-4" role="alert">
          {state.errors.map((error, index) => (
            <p key={index} className="text-sm text-red-600 mb-1">
              {error}
            </p>
          ))}
        </div>
      )}

      {/* Success indicator */}
      {state.isValid && state.status && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-900">
            ✓ Configuración válida
          </p>
        </div>
      )}
    </div>
  );
};
