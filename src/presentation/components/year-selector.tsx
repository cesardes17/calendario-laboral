/**
 * YearSelector Component
 *
 * UI component for year selection (HU-001)
 * Implements:
 * - Year selector as first field
 * - Current year selected by default
 * - Valid range: current - 2 to current + 5
 * - Error display for validation
 * - Clear visual feedback
 */

'use client';

import React from 'react';
import { useYearSelection } from '@/src/application/hooks/use-year-selection';

export interface YearSelectorProps {
  /**
   * Initial year to select (optional)
   */
  initialYear?: number;

  /**
   * Callback when year is selected
   */
  onYearChange?: (year: number) => void;

  /**
   * Additional CSS classes
   */
  className?: string;
}

export const YearSelector: React.FC<YearSelectorProps> = ({
  initialYear,
  onYearChange,
  className = '',
}) => {
  const {
    selectedYear,
    error,
    isValid,
    yearRange,
    selectYear,
  } = useYearSelection(initialYear);

  // Generate year options for the select dropdown
  const yearOptions = React.useMemo(() => {
    const options = [];
    for (let year = yearRange.min; year <= yearRange.max; year++) {
      options.push(year);
    }
    return options;
  }, [yearRange]);

  const handleYearChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const year = parseInt(event.target.value, 10);
    selectYear(year);

    if (onYearChange && !error) {
      onYearChange(year);
    }
  };

  return (
    <div className={`year-selector ${className}`}>
      <label
        htmlFor="year-select"
        className="block text-sm font-medium text-gray-700 mb-2"
      >
        Año de referencia
      </label>

      <select
        id="year-select"
        value={selectedYear}
        onChange={handleYearChange}
        className={`
          w-full px-4 py-2 border rounded-lg
          focus:outline-none focus:ring-2 focus:ring-blue-500
          ${!isValid ? 'border-red-500' : 'border-gray-300'}
          ${!isValid ? 'bg-red-50' : 'bg-white'}
        `}
        aria-label="Seleccionar año"
        aria-invalid={!isValid}
        aria-describedby={error ? 'year-error' : undefined}
      >
        {yearOptions.map((year) => (
          <option key={year} value={year}>
            {year}
          </option>
        ))}
      </select>

      {error && (
        <p
          id="year-error"
          className="mt-2 text-sm text-red-600"
          role="alert"
        >
          {error}
        </p>
      )}

      <p className="mt-1 text-xs text-gray-500">
        Rango válido: {yearRange.min} - {yearRange.max}
      </p>
    </div>
  );
};
