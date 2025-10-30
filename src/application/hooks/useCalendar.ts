/**
 * useCalendar Hook
 *
 * Manages calendar generation and month navigation
 */

import { useState, useEffect, useMemo } from 'react';
import { Year, CalendarDay } from '@/src/core/domain';
import { GenerateAnnualCalendarUseCase } from '@/src/core/usecases';

export interface UseCalendarOptions {
  /** Initial year to display */
  year?: number;
}

export interface UseCalendarReturn {
  /** All days of the year */
  days: CalendarDay[];

  /** Current month being displayed (1-12) */
  currentMonth: number;

  /** Days of the current month */
  currentMonthDays: CalendarDay[];

  /** The year */
  year: number;

  /** Whether the year is a leap year */
  isLeapYear: boolean;

  /** Navigate to next month */
  nextMonth: () => void;

  /** Navigate to previous month */
  previousMonth: () => void;

  /** Go to specific month */
  goToMonth: (month: number) => void;

  /** Whether currently viewing first month */
  isFirstMonth: boolean;

  /** Whether currently viewing last month */
  isLastMonth: boolean;

  /** Loading state */
  isLoading: boolean;

  /** Error message if any */
  error: string | null;
}

/**
 * Hook to manage calendar generation and navigation
 *
 * @param options - Configuration options
 * @returns Calendar state and navigation functions
 *
 * @example
 * ```tsx
 * function CalendarView() {
 *   const {
 *     currentMonthDays,
 *     currentMonth,
 *     nextMonth,
 *     previousMonth,
 *   } = useCalendar({ year: 2025 });
 *
 *   return (
 *     <div>
 *       <button onClick={previousMonth}>Previous</button>
 *       <span>Month {currentMonth}</span>
 *       <button onClick={nextMonth}>Next</button>
 *       {currentMonthDays.map(day => <DayCell key={day.fecha.toISOString()} day={day} />)}
 *     </div>
 *   );
 * }
 * ```
 */
export function useCalendar(options: UseCalendarOptions = {}): UseCalendarReturn {
  const [currentMonth, setCurrentMonth] = useState<number>(new Date().getMonth() + 1); // 1-12
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [days, setDays] = useState<CalendarDay[]>([]);

  // Use provided year or current year
  const yearValue = options.year ?? new Date().getFullYear();

  // Generate calendar on mount or year change
  useEffect(() => {
    const generateCalendar = () => {
      try {
        setIsLoading(true);
        setError(null);

        // Create Year value object
        const yearResult = Year.create(yearValue);
        if (!yearResult.isSuccess()) {
          setError(yearResult.errorValue());
          setIsLoading(false);
          return;
        }

        // Generate calendar
        const useCase = new GenerateAnnualCalendarUseCase();
        const result = useCase.execute({ year: yearResult.getValue() });

        if (!result.isSuccess()) {
          setError(result.errorValue());
          setIsLoading(false);
          return;
        }

        const calendar = result.getValue();
        setDays(calendar.days);
        setIsLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
        setIsLoading(false);
      }
    };

    generateCalendar();
  }, [yearValue]);

  // Get days for current month
  const currentMonthDays = useMemo(() => {
    return days.filter((day) => day.mes === currentMonth);
  }, [days, currentMonth]);

  // Check if leap year
  const isLeapYear = useMemo(() => {
    const yearResult = Year.create(yearValue);
    return yearResult.isSuccess() && yearResult.getValue().isLeapYear();
  }, [yearValue]);

  // Navigation functions
  const nextMonth = () => {
    if (currentMonth < 12) {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const previousMonth = () => {
    if (currentMonth > 1) {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const goToMonth = (month: number) => {
    if (month >= 1 && month <= 12) {
      setCurrentMonth(month);
    }
  };

  return {
    days,
    currentMonth,
    currentMonthDays,
    year: yearValue,
    isLeapYear,
    nextMonth,
    previousMonth,
    goToMonth,
    isFirstMonth: currentMonth === 1,
    isLastMonth: currentMonth === 12,
    isLoading,
    error,
  };
}
