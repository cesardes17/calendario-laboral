/**
 * WorkCycleConfigurator Component
 *
 * UI component for work cycle configuration (HU-003, HU-004, HU-005, HU-006)
 * Implements:
 * - Mode selection: Weekly or Parts-based
 * - Weekly mode: 7-day checkbox grid (Mon-Sun) [HU-004]
 * - Parts mode: Dynamic part configuration with work/rest days [HU-005]
 * - Predefined templates for common cycles (4-2, 6-3, 6-2, 6-3-6-3-6-3-6-2) [HU-006]
 * - Automatic switch to "Custom" when template is modified
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
  const [selectedTemplate, setSelectedTemplate] = useState<string>('custom');

  const dayNames = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
  const dayNamesShort = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

  // Predefined templates for common work cycles
  const templates = {
    custom: { name: 'Personalizado', parts: [] as CyclePart[] },
    '4-2': { name: '4-2 (Trabaja 4, descansa 2)', parts: [{ workDays: 4, restDays: 2 }] },
    '6-3': { name: '6-3 (Trabaja 6, descansa 3)', parts: [{ workDays: 6, restDays: 3 }] },
    '6-2': { name: '6-2 (Trabaja 6, descansa 2)', parts: [{ workDays: 6, restDays: 2 }] },
    '6-3-6-3-6-3-6-2': {
      name: '6-3-6-3-6-3-6-2 (Ciclo de 4 partes)',
      parts: [
        { workDays: 6, restDays: 3 },
        { workDays: 6, restDays: 3 },
        { workDays: 6, restDays: 3 },
        { workDays: 6, restDays: 2 },
      ],
    },
  };

  // Handle mode change
  const handleModeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const mode = event.target.value as CycleMode;
    setSelectedMode(mode);
  };

  // Handle template selection
  const handleTemplateChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const templateKey = event.target.value;
    setSelectedTemplate(templateKey);

    if (templateKey !== 'custom') {
      const template = templates[templateKey as keyof typeof templates];
      if (template && template.parts.length > 0) {
        const newParts = [...template.parts];
        setParts(newParts);
        configureParts(newParts);
      }
    }
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

    // Mark as custom when user modifies a template
    if (selectedTemplate !== 'custom') {
      setSelectedTemplate('custom');
    }

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
    // Mark as custom when user adds a part
    if (selectedTemplate !== 'custom') {
      setSelectedTemplate('custom');
    }
    const newParts = [...parts, { workDays: 6, restDays: 3 }];
    setParts(newParts);
    configureParts(newParts);
  };

  // Remove part
  const handleRemovePart = (index: number) => {
    if (parts.length > 1) {
      // Mark as custom when user removes a part
      if (selectedTemplate !== 'custom') {
        setSelectedTemplate('custom');
      }
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
  const prevValidRef = React.useRef<boolean | null>(null);
  const prevCycleRef = React.useRef<WorkCycle | null>(null);

  useEffect(() => {
    // Only notify if the values actually changed
    if (prevValidRef.current !== state.isValid) {
      onConfigurationChange?.(state.isValid);
      prevValidRef.current = state.isValid;
    }

    if (state.isValid && state.cycle && prevCycleRef.current !== state.cycle) {
      onCycleConfigured?.(state.cycle);
      prevCycleRef.current = state.cycle;
    }
  }, [state.isValid, state.cycle, onConfigurationChange, onCycleConfigured]);

  return (
    <div className={`work-cycle-configurator ${className}`}>
      {/* Mode Selection */}
      <fieldset className="mb-6">
        <legend className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
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
              className="mt-1 mr-3 h-4 w-4 text-blue-600 dark:text-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400"
            />
            <div>
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Semanal (7 días)</span>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
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
              className="mt-1 mr-3 h-4 w-4 text-blue-600 dark:text-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400"
            />
            <div>
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Por partes (bloques)</span>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
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
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Selecciona los días que trabajas:
          </label>

          <div className="grid grid-cols-7 gap-2">
            {dayNamesShort.map((dayShort, index) => (
              <div key={index} className="flex flex-col items-center">
                <span className="text-xs text-gray-600 dark:text-gray-400 mb-1">{dayShort}</span>
                <button
                  type="button"
                  onClick={() => handleWeeklyDayToggle(index)}
                  className={`
                    w-10 h-10 rounded-lg border-2 transition-colors
                    ${
                      weeklyMask[index]
                        ? 'bg-blue-500 dark:bg-blue-600 border-blue-600 dark:border-blue-500 text-white'
                        : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-400 dark:text-gray-500'
                    }
                    hover:border-blue-400 dark:hover:border-blue-400
                  `}
                  title={dayNames[index]}
                >
                  {weeklyMask[index] ? '✓' : ''}
                </button>
              </div>
            ))}
          </div>

          <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
            Días de trabajo marcados:{' '}
            <strong>{weeklyMask.filter((d) => d).length} de 7</strong>
          </p>
        </div>
      )}

      {/* Parts Mode Configuration */}
      {selectedMode === CycleMode.PARTS && (
        <div className="mb-4 pl-7 space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            Define tus bloques de trabajo/descanso (se repetirán indefinidamente):
          </p>

          {/* Template selector */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Usar plantilla:
            </label>
            <select
              value={selectedTemplate}
              onChange={handleTemplateChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
            >
              <option value="custom">Personalizado</option>
              <option value="4-2">4-2 (Trabaja 4, descansa 2)</option>
              <option value="6-3">6-3 (Trabaja 6, descansa 3)</option>
              <option value="6-2">6-2 (Trabaja 6, descansa 2)</option>
              <option value="6-3-6-3-6-3-6-2">6-3-6-3-6-3-6-2 (Ciclo de 4 partes)</option>
            </select>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Selecciona un ciclo común o configura uno personalizado
            </p>
          </div>

          {parts.map((part, index) => (
            <div
              key={index}
              className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600"
            >
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Parte {index + 1}:</span>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={part.workDays || ''}
                  onChange={(e) => handlePartChange(index, 'workDays', e.target.value)}
                  className="w-16 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm text-center bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                  placeholder="6"
                />
                <span className="text-xs text-gray-600 dark:text-gray-400">días trabajo</span>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={part.restDays || ''}
                  onChange={(e) => handlePartChange(index, 'restDays', e.target.value)}
                  className="w-16 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm text-center bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                  placeholder="3"
                />
                <span className="text-xs text-gray-600 dark:text-gray-400">días descanso</span>
              </div>

              {parts.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemovePart(index)}
                  className="ml-auto text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 text-sm"
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
            className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
          >
            + Añadir otra parte
          </button>

          <div className="p-3 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg">
            <p className="text-xs text-blue-900 dark:text-blue-300">
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
            <p key={index} className="text-sm text-red-600 dark:text-red-400 mb-1">
              {error}
            </p>
          ))}
        </div>
      )}

      {/* Success indicator */}
      {state.isValid && state.cycle && selectedMode && (
        <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 rounded-lg">
          <p className="text-sm text-green-900 dark:text-green-300">
            ✓ <strong>{state.cycle.getDisplayText()}</strong>
          </p>
          <p className="text-xs text-green-700 dark:text-green-400 mt-1">{state.cycle.getDescription()}</p>
        </div>
      )}
    </div>
  );
};
