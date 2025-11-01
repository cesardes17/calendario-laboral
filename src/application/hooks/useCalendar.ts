/**
 * useCalendar Hook
 *
 * Manages calendar generation and month navigation
 * Supports NoContratado days (HU-020) based on contract start configuration
 * Applies weekly work cycle pattern (HU-021) if configured
 * Applies parts-based work cycle pattern (HU-022) if configured
 * Applies vacation periods with priority (HU-023)
 */

import { useState, useEffect, useMemo } from 'react';
import { Year, CalendarDay, EmploymentStatus, ContractStartDate, EmploymentStatusType, WorkCycle, CycleMode, CycleOffset, CycleDayType, VacationPeriod, Holiday, WorkingHours } from '@/src/core/domain';
import { GenerateAnnualCalendarUseCase, ApplyWeeklyCycleToDaysUseCase, ApplyPartsCycleToDaysUseCase, ApplyVacationsToDaysUseCase, ApplyHolidaysToDaysUseCase } from '@/src/core/usecases';

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

        const year = yearResult.getValue();

        // Load contract start configuration from localStorage (HU-020)
        let employmentStatus: EmploymentStatus | undefined;
        let contractStartDate: ContractStartDate | undefined;

        try {
          const savedConfig = localStorage.getItem('calendarWizardData');
          if (savedConfig) {
            const wizardData = JSON.parse(savedConfig);
            const contractStart = wizardData.contractStart;

            if (contractStart?.statusType === EmploymentStatusType.STARTED_THIS_YEAR) {
              // Create EmploymentStatus value object
              const statusResult = EmploymentStatus.create(EmploymentStatusType.STARTED_THIS_YEAR);
              if (statusResult.isSuccess()) {
                employmentStatus = statusResult.getValue();

                // Create ContractStartDate value object if date is provided
                if (contractStart.contractStartDate) {
                  const startDate = new Date(contractStart.contractStartDate);
                  const dateResult = ContractStartDate.create(startDate, year);
                  if (dateResult.isSuccess()) {
                    contractStartDate = dateResult.getValue();
                  }
                }
              }
            }
          }
        } catch (storageError) {
          // Continue without contract start config if there's an error reading from localStorage
          console.warn('Failed to load contract start configuration:', storageError);
        }

        // Generate calendar with optional contract start configuration
        const useCase = new GenerateAnnualCalendarUseCase();
        const result = useCase.execute({
          year,
          employmentStatus,
          contractStartDate,
        });

        if (!result.isSuccess()) {
          setError(result.errorValue());
          setIsLoading(false);
          return;
        }

        const calendar = result.getValue();
        const finalDays = calendar.days;

        // Apply work cycle pattern if configured (HU-021, HU-022)
        try {
          const savedConfig = localStorage.getItem('calendarWizardData');
          if (savedConfig) {
            const wizardData = JSON.parse(savedConfig);
            const workCycleData = wizardData.workCycle;

            if (workCycleData) {
              // Apply WEEKLY mode cycle (HU-021)
              if (workCycleData.mode === CycleMode.WEEKLY) {
                const weeklyMask = workCycleData.data?.weeklyMask;

                if (weeklyMask && Array.isArray(weeklyMask) && weeklyMask.length === 7) {
                  const workCycleResult = WorkCycle.createWeekly(weeklyMask as [boolean, boolean, boolean, boolean, boolean, boolean, boolean]);
                  if (workCycleResult.isSuccess()) {
                    const workCycle = workCycleResult.getValue();
                    const applyCycleUseCase = new ApplyWeeklyCycleToDaysUseCase();
                    const applyCycleResult = applyCycleUseCase.execute({
                      days: finalDays,
                      workCycle,
                    });

                    if (!applyCycleResult.isSuccess()) {
                      console.warn('Failed to apply weekly cycle:', applyCycleResult.errorValue());
                    }
                    // Note: finalDays is mutated in place by the use case
                  }
                }
              }
              // Apply PARTS mode cycle (HU-022)
              else if (workCycleData.mode === CycleMode.PARTS) {
                const parts = workCycleData.data?.parts;

                if (parts && Array.isArray(parts) && parts.length > 0) {
                  const workCycleResult = WorkCycle.createParts(parts);
                  if (workCycleResult.isSuccess()) {
                    const workCycle = workCycleResult.getValue();

                    // Get cycle offset if user was already working
                    let cycleOffset: CycleOffset | undefined;
                    const contractStartConfig = wizardData.contractStart;

                    if (contractStartConfig?.statusType === EmploymentStatusType.WORKED_BEFORE) {
                      const offsetData = contractStartConfig.cycleOffset;
                      if (offsetData) {
                        // Convert string dayType to enum
                        const dayType = offsetData.dayType === 'WORK' || offsetData.dayType === 'Trabajo'
                          ? CycleDayType.WORK
                          : CycleDayType.REST;

                        const offsetResult = CycleOffset.create(
                          offsetData.partNumber,
                          offsetData.dayWithinPart,
                          dayType
                        );

                        if (offsetResult.isSuccess()) {
                          cycleOffset = offsetResult.getValue();
                        }
                      }
                    }

                    const applyCycleUseCase = new ApplyPartsCycleToDaysUseCase();
                    const applyCycleResult = applyCycleUseCase.execute({
                      days: finalDays,
                      workCycle,
                      cycleOffset,
                      contractStartDate: contractStartDate?.value,
                    });

                    if (!applyCycleResult.isSuccess()) {
                      console.warn('Failed to apply parts cycle:', applyCycleResult.errorValue());
                    }
                    // Note: finalDays is mutated in place by the use case
                  }
                }
              }
            }
          }
        } catch (cycleError) {
          // Continue without cycle application if there's an error
          console.warn('Failed to apply work cycle:', cycleError);
        }

        // Apply vacation periods if configured (HU-023)
        // Vacations have priority 2 (after NoContratado, before everything else)
        try {
          const savedConfig = localStorage.getItem('calendarWizardData');
          if (savedConfig) {
            const wizardData = JSON.parse(savedConfig);
            const vacationsData = wizardData.vacations;

            if (vacationsData && Array.isArray(vacationsData) && vacationsData.length > 0) {
              // Restore VacationPeriod value objects from stored data
              const vacationPeriods: VacationPeriod[] = [];

              for (const vacationData of vacationsData) {
                const vacationResult = VacationPeriod.create({
                  startDate: new Date(vacationData.startDate),
                  endDate: new Date(vacationData.endDate),
                  description: vacationData.description,
                });

                if (vacationResult.isSuccess()) {
                  vacationPeriods.push(vacationResult.getValue());
                }
              }

              // Apply vacations to days
              if (vacationPeriods.length > 0) {
                const applyVacationsUseCase = new ApplyVacationsToDaysUseCase();
                const applyVacationsResult = applyVacationsUseCase.execute({
                  days: finalDays,
                  vacationPeriods,
                });

                if (!applyVacationsResult.isSuccess()) {
                  console.warn('Failed to apply vacations:', applyVacationsResult.errorValue());
                }
                // Note: finalDays is mutated in place by the use case
              }
            }
          }
        } catch (vacationError) {
          // Continue without vacation application if there's an error
          console.warn('Failed to apply vacations:', vacationError);
        }

        // Apply holidays if configured (HU-024 / SCRUM-36)
        // Holidays have priority 3 (after NoContratado and Vacaciones, before everything else)
        try {
          const savedConfig = localStorage.getItem('calendarWizardData');
          if (savedConfig) {
            const wizardData = JSON.parse(savedConfig);
            const holidaysData = wizardData.holidays;
            const workingHoursData = wizardData.workingHours;

            if (holidaysData && Array.isArray(holidaysData) && holidaysData.length > 0) {
              // Restore Holiday value objects from stored data
              const holidays: Holiday[] = [];

              for (const holidayData of holidaysData) {
                const holidayResult = Holiday.fromObject({
                  date: holidayData.date,
                  name: holidayData.name,
                  worked: holidayData.worked,
                });

                if (holidayResult.isSuccess()) {
                  holidays.push(holidayResult.getValue());
                }
              }

              // Get working hours configuration (needed for worked holidays)
              let workingHours = WorkingHours.default();
              if (workingHoursData) {
                workingHours = WorkingHours.create({
                  weekday: workingHoursData.weekday,
                  saturday: workingHoursData.saturday,
                  sunday: workingHoursData.sunday,
                  holiday: workingHoursData.holiday,
                });
              }

              // Apply holidays to days
              if (holidays.length > 0) {
                const applyHolidaysUseCase = new ApplyHolidaysToDaysUseCase();
                const applyHolidaysResult = applyHolidaysUseCase.execute({
                  days: finalDays,
                  holidays,
                  workingHours,
                });

                if (!applyHolidaysResult.isSuccess()) {
                  console.warn('Failed to apply holidays:', applyHolidaysResult.errorValue());
                }
                // Note: finalDays is mutated in place by the use case
              }
            }
          }
        } catch (holidayError) {
          // Continue without holiday application if there's an error
          console.warn('Failed to apply holidays:', holidayError);
        }

        setDays(finalDays);
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
