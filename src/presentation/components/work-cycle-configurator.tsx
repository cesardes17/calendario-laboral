/**
 * WorkCycleConfigurator Component
 *
 * UI component for work cycle configuration (HU-003)
 * Implements:
 * - Mode selection: Weekly or Parts-based
 * - Weekly mode: 7-day checkbox grid (Mon-Sun)
 * - Parts mode: Dynamic part configuration with work/rest days
 * - Validation and error display
 * - Visual feedback
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useWorkCycle } from '@/src/application/hooks/use-work-cycle';
import { CycleMode, WeeklyMask, CyclePart, WorkCycle } from '@/src/core/domain/work-cycle';

export interface WorkCycleConfiguratorProps {
  /**
   * Callback when configuration is complete and valid
   */
  onConfigurationChange?: (isValid: boolean) => void;

  /**
   * Callback when cycle is configured (returns the cycle object)
   */
  onCycleConfigured?: (cycle: WorkCycle) => void;

  /**
   * Additional CSS classes
   */
  className?: string;
}

export const WorkCycleConfigurator: React.FC<WorkCycleConfiguratorProps> = ({
  onConfigurationChange,
  onCycleConfigured,
  className = '',
}) => {
  const { state, configureWeekly, configureParts } = useWorkCycle();

  // Local state for mode selection
  const [selectedMode, setSelectedMode] = useState<CycleMode | null>(null);

  // Local state for weekly mode
  const [weeklyMask, setWeeklyMask] = useState<WeeklyMask>([
    true,
    true,
    true,
    true,
    true,
    false,
    false,
  ]);

  // Local state for parts mode
  const [parts, setParts] = useState<CyclePart[]>([{ workDays: 4, restDays: 2 }]);

  const dayNames = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
  const dayNamesShort = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

  // Handle mode change
  const handleModeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const mode = event.target.value as CycleMode;
    setSelectedMode(mode);
  };

  // Handle weekly checkbox toggle
  const handleWeeklyDayToggle = (dayIndex: number) => {
    const newMask = [...weeklyMask] as WeeklyMask;
    newMask[dayIndex] = !newMask[dayIndex];
    setWeeklyMask(newMask);

    // Auto-configure when user toggles
    configureWeekly(newMask);
  };

  // Handle part input change
  const handlePartChange = (index: number, field: 'workDays' | 'restDays', value: string) => {
    const newParts = [...parts];

    // Allow empty string for easier editing
    if (value === '') {
      newParts[index] = {
        ...newParts[index],
        [field]: 0,
      };
      setParts(newParts);
      return;
    }

    const numValue = parseInt(value, 10);

    if (!isNaN(numValue) && numValue >= 0) {
      newParts[index] = {
        ...newParts[index],
        [field]: numValue,
      };
      setParts(newParts);

      // Auto-configure when user changes values (only if valid)
      if (numValue > 0) {
        configureParts(newParts);
      }
    }
  };

  // Add new part
  const handleAddPart = () => {
    const newParts = [...parts, { workDays: 6, restDays: 3 }];
    setParts(newParts);
    configureParts(newParts);
  };

  // Remove part
  const handleRemovePart = (index: number) => {
    if (parts.length > 1) {
      const newParts = parts.filter((_, i) => i !== index);
      setParts(newParts);
      configureParts(newParts);
    }
  };

  // Initialize configuration when mode changes
  useEffect(() => {
    if (selectedMode === CycleMode.WEEKLY) {
      configureWeekly(weeklyMask);
    } else if (selectedMode === CycleMode.PARTS) {
      configureParts(parts);
    }
  }, [selectedMode]); // eslint-disable-line react-hooks/exhaustive-deps

  // Notify parent of validation state changes
  useEffect(() => {
    onConfigurationChange?.(state.isValid);
    if (state.isValid && state.cycle) {
      onCycleConfigured?.(state.cycle);
    }
  }, [state.isValid, state.cycle, onConfigurationChange, onCycleConfigured]);

  return (
    <div className={`work-cycle-configurator ${className}`}>
      {/* Mode Selection */}
      <fieldset className="mb-6">
        <legend className="block text-sm font-medium text-gray-700 mb-3">
          ¿Cómo es tu patrón de trabajo?
        </legend>

        {/* Radio button: Weekly */}
        <div className="mb-3">
          <label className="flex items-start cursor-pointer">
            <input
              type="radio"
              name="cycle-mode"
              value={CycleMode.WEEKLY}
              checked={selectedMode === CycleMode.WEEKLY}
              onChange={handleModeChange}
              className="mt-1 mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500"
            />
            <div>
              <span className="text-sm font-medium text-gray-900">Semanal (7 días)</span>
              <p className="text-xs text-gray-500 mt-1">
                Repites el mismo patrón cada semana. Por ejemplo: L-V trabajas, S-D descansas.
              </p>
            </div>
          </label>
        </div>

        {/* Radio button: Parts */}
        <div>
          <label className="flex items-start cursor-pointer">
            <input
              type="radio"
              name="cycle-mode"
              value={CycleMode.PARTS}
              checked={selectedMode === CycleMode.PARTS}
              onChange={handleModeChange}
              className="mt-1 mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500"
            />
            <div>
              <span className="text-sm font-medium text-gray-900">Por partes (bloques)</span>
              <p className="text-xs text-gray-500 mt-1">
                Defines bloques de trabajo/descanso que se repiten. Por ejemplo: 4 días trabajo,
                2 días descanso (4-2).
              </p>
            </div>
          </label>
        </div>
      </fieldset>

      {/* Weekly Mode Configuration */}
      {selectedMode === CycleMode.WEEKLY && (
        <div className="mb-4 pl-7">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Selecciona los días que trabajas:
          </label>

          <div className="grid grid-cols-7 gap-2">
            {dayNamesShort.map((dayShort, index) => (
              <div key={index} className="flex flex-col items-center">
                <span className="text-xs text-gray-600 mb-1">{dayShort}</span>
                <button
                  type="button"
                  onClick={() => handleWeeklyDayToggle(index)}
                  className={`
                    w-10 h-10 rounded-lg border-2 transition-colors
                    ${
                      weeklyMask[index]
                        ? 'bg-blue-500 border-blue-600 text-white'
                        : 'bg-white border-gray-300 text-gray-400'
                    }
                    hover:border-blue-400
                  `}
                  title={dayNames[index]}
                >
                  {weeklyMask[index] ? '✓' : ''}
                </button>
              </div>
            ))}
          </div>

          <p className="mt-3 text-xs text-gray-500">
            Días de trabajo marcados:{' '}
            <strong>{weeklyMask.filter((d) => d).length} de 7</strong>
          </p>
        </div>
      )}

      {/* Parts Mode Configuration */}
      {selectedMode === CycleMode.PARTS && (
        <div className="mb-4 pl-7 space-y-4">
          <p className="text-sm text-gray-600 mb-3">
            Define tus bloques de trabajo/descanso (se repetirán indefinidamente):
          </p>

          {parts.map((part, index) => (
            <div
              key={index}
              className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200"
            >
              <span className="text-sm font-medium text-gray-700">Parte {index + 1}:</span>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={part.workDays || ''}
                  onChange={(e) => handlePartChange(index, 'workDays', e.target.value)}
                  className="w-16 px-2 py-1 border border-gray-300 rounded text-sm text-center"
                  placeholder="6"
                />
                <span className="text-xs text-gray-600">días trabajo</span>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={part.restDays || ''}
                  onChange={(e) => handlePartChange(index, 'restDays', e.target.value)}
                  className="w-16 px-2 py-1 border border-gray-300 rounded text-sm text-center"
                  placeholder="3"
                />
                <span className="text-xs text-gray-600">días descanso</span>
              </div>

              {parts.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemovePart(index)}
                  className="ml-auto text-red-600 hover:text-red-800 text-sm"
                  title="Eliminar parte"
                >
                  ✕
                </button>
              )}
            </div>
          ))}

          <button
            type="button"
            onClick={handleAddPart}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            + Añadir otra parte
          </button>

          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-xs text-blue-900">
              <strong>Ejemplo:</strong> Si defines 6-3, 6-2, trabajarás 6 días, descansarás 3,
              trabajarás 6, descansarás 2, y así sucesivamente.
            </p>
          </div>
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
      {state.isValid && state.cycle && selectedMode && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-900">
            ✓ <strong>{state.cycle.getDisplayText()}</strong>
          </p>
          <p className="text-xs text-green-700 mt-1">{state.cycle.getDescription()}</p>
        </div>
      )}
    </div>
  );
};
