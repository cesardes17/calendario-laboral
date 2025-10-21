/**
 * CalendarConfigPage
 *
 * Main page for configuring the work calendar
 * Implements (in order):
 * - HU-003: Work cycle configuration
 * - HU-001: Year selection
 * - HU-002: Employment status (contract start or cycle offset)
 */

'use client';

import React, { useState } from 'react';
import { WorkCycleConfigurator } from '../components/work-cycle-configurator';
import { YearSelector } from '../components/year-selector';
import { EmploymentStatusSelector } from '../components/employment-status-selector';
import { WorkingHoursConfigurator } from '../components/working-hours-configurator';
import { ThemeToggle } from '../components/theme-toggle';
import { Year } from '@/src/core/domain/year';
import { WorkCycle } from '@/src/core/domain/work-cycle';
import type { WorkingHoursConfig } from '@/src/core/domain';

export const CalendarConfigPage: React.FC = () => {
  const [workCycle, setWorkCycle] = useState<WorkCycle | null>(null);
  const [workCycleValid, setWorkCycleValid] = useState(false);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [yearObject, setYearObject] = useState<Year | null>(null);
  const [employmentStatusValid, setEmploymentStatusValid] = useState(false);
  const [workingHoursConfig, setWorkingHoursConfig] = useState<WorkingHoursConfig | null>(null);

  const handleWorkCycleConfigured = React.useCallback((cycle: WorkCycle) => {
    setWorkCycle(cycle);
    console.log('Work cycle configured:', cycle.getDisplayText());
  }, []);

  const handleWorkCycleValidationChange = React.useCallback((isValid: boolean) => {
    setWorkCycleValid(isValid);
    console.log('Work cycle valid:', isValid);
  }, []);

  const handleYearChange = React.useCallback((year: number) => {
    setSelectedYear(year);
    const yearResult = Year.create(year);
    if (yearResult.isSuccess()) {
      setYearObject(yearResult.getValue());
    }
    console.log('Year selected:', year);
  }, []);

  const handleEmploymentStatusChange = React.useCallback((isValid: boolean) => {
    setEmploymentStatusValid(isValid);
    console.log('Employment status valid:', isValid);
  }, []);

  const handleWorkingHoursChange = React.useCallback((config: WorkingHoursConfig) => {
    setWorkingHoursConfig(config);
    console.log('Working hours configured:', config);
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-8 px-4 transition-colors duration-200">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">
              Generador de Calendario Laboral
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Configura tu calendario laboral personalizado por ciclos
            </p>
          </div>
          <ThemeToggle />
        </header>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 transition-colors duration-200">
          {/* HU-003: Work Cycle Configuration */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
              1. Ciclo de Trabajo
            </h2>

            <WorkCycleConfigurator
              onConfigurationChange={handleWorkCycleValidationChange}
              onCycleConfigured={handleWorkCycleConfigured}
              className="mb-4"
            />
          </div>

          {/* HU-001: Year Selection */}
          {workCycleValid && (
            <div className="mb-8 border-t border-gray-200 dark:border-gray-700 pt-8">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
                2. Año de Referencia
              </h2>

              <YearSelector
                onYearChange={handleYearChange}
                className="mb-4"
              />

              {selectedYear && (
                <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg">
                  <p className="text-sm text-blue-800 dark:text-blue-300">
                    ✓ <strong>Año seleccionado:</strong> {selectedYear}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* HU-002: Employment Status */}
          {yearObject && workCycle && (
            <div className="mb-8 border-t border-gray-200 dark:border-gray-700 pt-8">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
                3. Situación Laboral
              </h2>

              <EmploymentStatusSelector
                year={yearObject}
                workCycle={workCycle}
                onConfigurationChange={handleEmploymentStatusChange}
                className="mb-4"
              />

              {employmentStatusValid && (
                <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 rounded-lg">
                  <p className="text-sm text-green-800 dark:text-green-300">
                    ✓ <strong>Situación laboral configurada correctamente</strong>
                  </p>
                </div>
              )}
            </div>
          )}

          {/* HU-010: Working Hours Configuration */}
          {employmentStatusValid && (
            <div className="mb-8 border-t border-gray-200 dark:border-gray-700 pt-8">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
                4. Horas de Trabajo
              </h2>

              <WorkingHoursConfigurator
                onChange={handleWorkingHoursChange}
                showResetButton
              />

              {workingHoursConfig && (
                <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 rounded-lg">
                  <p className="text-sm text-green-800 dark:text-green-300">
                    ✓ <strong>Horas configuradas:</strong> L-V: {workingHoursConfig.weekday}h, Sáb: {workingHoursConfig.saturday}h, Dom: {workingHoursConfig.sunday}h, Festivo: {workingHoursConfig.holiday}h
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Next Steps */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              <strong>Próximos pasos:</strong> vacaciones, festivos...
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
