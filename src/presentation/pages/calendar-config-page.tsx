/**
 * CalendarConfigPage
 *
 * Main page for configuring the work calendar
 * Implements HU-001: Year selection as the first step
 */

'use client';

import React, { useState } from 'react';
import { YearSelector } from '../components/year-selector';

export const CalendarConfigPage: React.FC = () => {
  const [selectedYear, setSelectedYear] = useState<number | null>(null);

  const handleYearChange = (year: number) => {
    setSelectedYear(year);
    console.log('Year selected:', year);
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
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Configuración Inicial
            </h2>

            <YearSelector
              onYearChange={handleYearChange}
              className="mb-6"
            />

            {selectedYear && (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Año seleccionado:</strong> {selectedYear}
                </p>
              </div>
            )}
          </div>

          <div className="border-t pt-6">
            <p className="text-sm text-gray-500">
              Próximos pasos: configuración del ciclo de trabajo, vacaciones, festivos...
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
