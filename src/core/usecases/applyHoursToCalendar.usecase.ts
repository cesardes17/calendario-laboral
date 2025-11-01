/**
 * Apply Hours to Calendar Use Case (HU-025 / SCRUM-37)
 *
 * Calculates and applies the worked hours to all days in the calendar
 * based on their state and the configured working hours.
 *
 * This use case should be executed after all day states have been
 * determined (after cycle, vacations, and holidays have been applied).
 */

import { CalendarDay, WorkingHours, Result } from '../domain';
import { CalculateDayHoursUseCase } from './calculateDayHours.usecase';

/**
 * Input for applying hours to calendar
 */
export interface ApplyHoursToCalendarInput {
  /** Array of calendar days (states should already be assigned) */
  days: CalendarDay[];

  /** Working hours configuration */
  workingHours: WorkingHours;
}

/**
 * Output with calculated metrics
 */
export interface ApplyHoursToCalendarOutput {
  /** Array of days with updated horasTrabajadas field */
  days: CalendarDay[];

  /** Total worked hours in the year */
  totalHours: number;

  /** Number of days with worked hours (Trabajo + FestivoTrabajado) */
  workDaysCount: number;

  /** Number of regular work days (Trabajo only) */
  regularWorkDays: number;

  /** Number of worked holidays (FestivoTrabajado only) */
  workedHolidaysCount: number;

  /** Average hours per work day */
  averageHoursPerWorkDay: number;
}

/**
 * Use Case: Apply Hours to Calendar
 *
 * Iterates through all calendar days and assigns the correct worked hours
 * based on each day's state and day of week.
 *
 * This use case:
 * - Mutates the horasTrabajadas field of each CalendarDay
 * - Calculates summary metrics
 * - Should be called after all day states are finalized
 *
 * @example
 * ```typescript
 * const useCase = new ApplyHoursToCalendarUseCase();
 * const workingHours = WorkingHours.create({ weekday: 8, saturday: 6, sunday: 0, holiday: 10 });
 *
 * const result = useCase.execute({
 *   days: calendarDays, // Array from GenerateAnnualCalendarUseCase (after applying states)
 *   workingHours
 * });
 *
 * if (result.isSuccess()) {
 *   const output = result.getValue();
 *   console.log(`Total hours: ${output.totalHours}`);
 *   console.log(`Work days: ${output.workDaysCount}`);
 *   console.log(`Average: ${output.averageHoursPerWorkDay}h/day`);
 * }
 * ```
 */
export class ApplyHoursToCalendarUseCase {
  private calculateDayHours: CalculateDayHoursUseCase;

  constructor() {
    this.calculateDayHours = new CalculateDayHoursUseCase();
  }

  /**
   * Executes the use case to apply hours to all calendar days
   *
   * @param input - Contains the calendar days and working hours configuration
   * @returns Result containing the updated days and metrics
   */
  public execute(input: ApplyHoursToCalendarInput): Result<ApplyHoursToCalendarOutput> {
    try {
      const { days, workingHours } = input;

      // Validate input
      if (!days || days.length === 0) {
        return Result.fail<ApplyHoursToCalendarOutput>(
          'El calendario no puede estar vacío'
        );
      }

      // Initialize metrics
      let totalHours = 0;
      let workDaysCount = 0;
      let regularWorkDays = 0;
      let workedHolidaysCount = 0;

      // Apply hours to each day
      for (const day of days) {
        const result = this.calculateDayHours.execute({ day, workingHours });

        if (result.isFailure()) {
          return Result.fail<ApplyHoursToCalendarOutput>(
            `Error calculando horas para el día ${day.diaNumero}/${day.mes}: ${result.errorValue()}`
          );
        }

        const { hours } = result.getValue();
        day.horasTrabajadas = hours;

        // Update metrics
        totalHours += hours;

        if (hours > 0) {
          workDaysCount++;

          if (day.estado === 'Trabajo') {
            regularWorkDays++;
          } else if (day.estado === 'FestivoTrabajado') {
            workedHolidaysCount++;
          }
        }
      }

      // Calculate average (avoid division by zero)
      const averageHoursPerWorkDay = workDaysCount > 0
        ? this.roundToTwoDecimals(totalHours / workDaysCount)
        : 0;

      return Result.ok<ApplyHoursToCalendarOutput>({
        days,
        totalHours: this.roundToTwoDecimals(totalHours),
        workDaysCount,
        regularWorkDays,
        workedHolidaysCount,
        averageHoursPerWorkDay,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      return Result.fail<ApplyHoursToCalendarOutput>(
        `Error al aplicar horas al calendario: ${errorMessage}`
      );
    }
  }

  /**
   * Rounds a number to 2 decimal places
   */
  private roundToTwoDecimals(value: number): number {
    return Math.round(value * 100) / 100;
  }
}
