/**
 * CalendarConfigPage
 *
 * Main page for configuring the work calendar
 * Implements:
 * - HU-001: Year selection
 * - HU-002: Employment status (contract start or cycle offset)
 */

'use client';

import React, { useState } from 'react';
import { YearSelector } from '../components/year-selector';
import { EmploymentStatusSelector } from '../components/employment-status-selector';
import { Year } from '@/src/core/domain/year';

export const CalendarConfigPage: React.FC = () => {
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [yearObject, setYearObject] = useState<Year | null>(null);
  const [employmentStatusValid, setEmploymentStatusValid] = useState(false);

  const handleYearChange = (year: number) => {
    setSelectedYear(year);
    const yearResult = Year.create(year);
    if (yearResult.isSuccess()) {
      setYearObject(yearResult.getValue());
    }
    console.log('Year selected:', year);
  };

  const handleEmploymentStatusChange = (isValid: boolean) => {
    setEmploymentStatusValid(isValid);
    console.log('Employment status valid:', isValid);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Generador de Calendario Laboral
          </h1>
          <p className="text-gray-600">
            Configura tu calendario laboral personalizado por ciclos
          </p>
        </header>

        <div className="bg-white rounded-lg shadow-md p-6">
          {/* HU-001: Year Selection */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              1. Año de Referencia
            </h2>

            <YearSelector
              onYearChange={handleYearChange}
              className="mb-4"
            />

            {selectedYear && (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  ✓ <strong>Año seleccionado:</strong> {selectedYear}
                </p>
              </div>
            )}
          </div>

          {/* HU-002: Employment Status */}
          {yearObject && (
            <div className="mb-8 border-t pt-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                2. Situación Laboral
              </h2>

              <EmploymentStatusSelector
                year={yearObject}
                onConfigurationChange={handleEmploymentStatusChange}
                className="mb-4"
              />

              {employmentStatusValid && (
                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-800">
                    ✓ <strong>Situación laboral configurada correctamente</strong>
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Next Steps */}
          <div className="border-t pt-6">
            <p className="text-sm text-gray-500">
              <strong>Próximos pasos:</strong> configuración del ciclo de trabajo, vacaciones, festivos...
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
