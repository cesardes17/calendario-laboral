/**
 * Generate Annual Calendar Use Case (HU-019, HU-020)
 *
 * Generates a complete annual calendar with all days of the selected year.
 * Each day contains complete information needed for subsequent business logic.
 *
 * HU-020: Marks days as "NoContratado" before contract start date if applicable.
 */

import { Year, CalendarDay, WEEKDAY_NAMES, MONTH_NAMES, Result, EmploymentStatus, ContractStartDate } from '../domain';
import { getISOWeekNumber, getDaysInMonth, createDate } from '../../infrastructure/utils/dateUtils';

/**
 * Input for generating an annual calendar
 */
export interface GenerateAnnualCalendarInput {
  /** The year for which to generate the calendar */
  year: Year;

  /** Employment status (optional) - determines if "NoContratado" days apply */
  employmentStatus?: EmploymentStatus;

  /** Contract start date (optional) - required if employmentStatus is STARTED_THIS_YEAR */
  contractStartDate?: ContractStartDate;
}

/**
 * Output of the calendar generation process
 */
export interface GenerateAnnualCalendarOutput {
  /** Array of all days in the year (365 or 366) */
  days: CalendarDay[];

  /** The year for which the calendar was generated */
  year: number;

  /** Whether the year is a leap year */
  isLeapYear: boolean;

  /** Total number of days in the year */
  totalDays: number;
}

/**
 * Use Case: Generate Annual Calendar
 *
 * Creates a complete calendar for a given year with all necessary
 * information for each day. This is the base for all calendar operations.
 *
 * Business Rules (from HU-019):
 * - Generate all days from January 1 to December 31
 * - Handle leap years correctly (366 days vs 365 days)
 * - Calculate ISO week numbers
 * - Initialize all days with null state and 0 hours
 * - Provide complete date information for each day
 *
 * @example
 * ```typescript
 * const useCase = new GenerateAnnualCalendarUseCase();
 * const yearResult = Year.create(2025);
 *
 * if (yearResult.isSuccess) {
 *   const result = useCase.execute({ year: yearResult.getValue() });
 *
 *   if (result.isSuccess) {
 *     const calendar = result.getValue();
 *     console.log(`Generated ${calendar.totalDays} days for ${calendar.year}`);
 *     console.log(`Is leap year: ${calendar.isLeapYear}`);
 *   }
 * }
 * ```
 */
export class GenerateAnnualCalendarUseCase {
  /**
   * Executes the use case to generate an annual calendar
   *
   * @param input - Contains the year for which to generate the calendar
   * @returns Result containing the generated calendar or error message
   */
  public execute(input: GenerateAnnualCalendarInput): Result<GenerateAnnualCalendarOutput> {
    try {
      const { year, employmentStatus, contractStartDate } = input;
      const yearValue = year.value;
      const days: CalendarDay[] = [];

      // Validate contract start configuration (HU-020)
      if (employmentStatus?.isStartedThisYear() && !contractStartDate) {
        return Result.fail<GenerateAnnualCalendarOutput>(
          'Debe proporcionar una fecha de inicio de contrato si empezó este año'
        );
      }

      // Generate all days for the year
      for (let month = 1; month <= 12; month++) {
        const daysInMonth = getDaysInMonth(yearValue, month);

        for (let day = 1; day <= daysInMonth; day++) {
          const fecha = createDate(yearValue, month, day);
          const calendarDay = this.createCalendarDay(fecha, month, day);
          days.push(calendarDay);
        }
      }

      // Apply "NoContratado" status to days before contract start (HU-020)
      if (employmentStatus?.isStartedThisYear() && contractStartDate) {
        this.markNotContractedDays(days, contractStartDate);
      }

      // Validate that we generated the correct number of days
      const expectedDays = year.getDaysInYear();
      if (days.length !== expectedDays) {
        return Result.fail<GenerateAnnualCalendarOutput>(
          `Error generando calendario: se esperaban ${expectedDays} días pero se generaron ${days.length}`
        );
      }

      return Result.ok<GenerateAnnualCalendarOutput>({
        days,
        year: yearValue,
        isLeapYear: year.isLeapYear(),
        totalDays: days.length,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      return Result.fail<GenerateAnnualCalendarOutput>(
        `Error al generar el calendario anual: ${errorMessage}`
      );
    }
  }

  /**
   * Creates a CalendarDay object with all required information
   *
   * @param fecha - The date object for this day
   * @param month - The month number (1-12)
   * @param day - The day of the month (1-31)
   * @returns A complete CalendarDay object
   */
  private createCalendarDay(fecha: Date, month: number, day: number): CalendarDay {
    const diaSemana = fecha.getDay(); // 0 = Sunday, 6 = Saturday
    const numeroSemana = getISOWeekNumber(fecha);

    return {
      fecha,
      diaSemana,
      nombreDia: WEEKDAY_NAMES[diaSemana],
      diaNumero: day,
      mes: month,
      nombreMes: MONTH_NAMES[month - 1], // Month names array is 0-indexed
      numeroSemana,
      estado: null, // Initially no state assigned
      horasTrabajadas: 0, // Initially no hours worked
      descripcion: undefined,
      metadata: undefined,
    };
  }

  /**
   * Marks days before the contract start date as "NoContratado" (HU-020)
   *
   * Business Rules:
   * - Only days before the contract start date are marked
   * - The contract start date itself is NOT marked as NoContratado
   * - NoContratado days have estado: 'NoContratado' and horasTrabajadas: 0
   * - These days have maximum priority and cannot be overwritten
   *
   * @param days - Array of calendar days to process (mutated in place)
   * @param contractStartDate - The contract start date
   */
  private markNotContractedDays(days: CalendarDay[], contractStartDate: ContractStartDate): void {
    const startDate = contractStartDate.value;
    const startTime = startDate.getTime();

    for (const day of days) {
      const dayTime = day.fecha.getTime();

      // Mark as NoContratado if the day is before the contract start date
      if (dayTime < startTime) {
        day.estado = 'NoContratado';
        day.horasTrabajadas = 0;
      }
    }
  }
}
