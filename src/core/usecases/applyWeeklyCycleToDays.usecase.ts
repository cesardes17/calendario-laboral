/**
 * Apply Weekly Cycle to Days Use Case (HU-021)
 *
 * Applies the weekly work/rest pattern to all calendar days.
 * Only applies to days that are not "NoContratado".
 *
 * Business Rules:
 * - Only applies if cycle mode is WEEKLY
 * - Respects state priority (never overrides NoContratado)
 * - Pattern repeats automatically every week based on day of week
 * - No offset calculation needed (implicit by weekday)
 */

import { CalendarDay, WorkCycle, Result } from '../domain';

/**
 * Input for applying weekly cycle to calendar days
 */
export interface ApplyWeeklyCycleToDaysInput {
  /** Array of calendar days to process */
  days: CalendarDay[];

  /** The work cycle configuration (must be WEEKLY mode) */
  workCycle: WorkCycle;
}

/**
 * Output of the weekly cycle application process
 */
export interface ApplyWeeklyCycleToDaysOutput {
  /** Number of days marked as 'Trabajo' */
  workDaysMarked: number;

  /** Number of days marked as 'Descanso' */
  restDaysMarked: number;

  /** Total days processed */
  totalDaysProcessed: number;
}

/**
 * Use Case: Apply Weekly Cycle to Days
 *
 * Applies a 7-day weekly pattern to all calendar days according to the mask.
 * The pattern repeats automatically based on the day of the week.
 *
 * Business Rules (from HU-021):
 * - Only applies to WEEKLY mode cycles
 * - Converts day-of-week to mask index: Mon=0, Tue=1, ..., Sun=6
 * - If mask[dayIndex] === true → estado: 'Trabajo'
 * - If mask[dayIndex] === false → estado: 'Descanso'
 * - Never overrides 'NoContratado' days
 * - Pattern applies from first eligible day (after contract start if applicable)
 *
 * @example
 * ```typescript
 * // Weekly mask: [T, T, T, T, T, F, F] = Mon-Fri work, Sat-Sun rest
 * const workCycle = WorkCycle.createWeekly([true, true, true, true, true, false, false]);
 * const useCase = new ApplyWeeklyCycleToDaysUseCase();
 *
 * const result = useCase.execute({ days, workCycle: workCycle.getValue() });
 *
 * if (result.isSuccess) {
 *   const output = result.getValue();
 *   console.log(`Marked ${output.workDaysMarked} work days and ${output.restDaysMarked} rest days`);
 * }
 * ```
 */
export class ApplyWeeklyCycleToDaysUseCase {
  /**
   * Executes the use case to apply weekly cycle to calendar days
   *
   * @param input - Contains the days array and work cycle configuration
   * @returns Result containing statistics or error message
   */
  public execute(input: ApplyWeeklyCycleToDaysInput): Result<ApplyWeeklyCycleToDaysOutput> {
    try {
      const { days, workCycle } = input;

      // Validate that cycle is in WEEKLY mode
      if (!workCycle.isWeekly()) {
        return Result.fail<ApplyWeeklyCycleToDaysOutput>(
          'Este use case solo aplica para ciclos en modo WEEKLY'
        );
      }

      // Get the weekly mask
      const weeklyMask = workCycle.getWeeklyMask();
      if (!weeklyMask) {
        return Result.fail<ApplyWeeklyCycleToDaysOutput>(
          'No se pudo obtener la máscara semanal del ciclo'
        );
      }

      // Apply the weekly pattern to all eligible days
      let workDaysMarked = 0;
      let restDaysMarked = 0;
      let totalDaysProcessed = 0;

      for (const day of days) {
        // Skip days that are already marked as "NoContratado"
        // These days have the highest priority and should never be overridden
        if (day.estado === 'NoContratado') {
          continue;
        }

        // Apply the weekly pattern based on the day of the week
        const isWorkDay = this.isWorkDayInWeeklyPattern(day.fecha, weeklyMask);

        if (isWorkDay) {
          day.estado = 'Trabajo';
          workDaysMarked++;
        } else {
          day.estado = 'Descanso';
          restDaysMarked++;
        }

        totalDaysProcessed++;
      }

      return Result.ok<ApplyWeeklyCycleToDaysOutput>({
        workDaysMarked,
        restDaysMarked,
        totalDaysProcessed,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      return Result.fail<ApplyWeeklyCycleToDaysOutput>(
        `Error al aplicar el ciclo semanal: ${errorMessage}`
      );
    }
  }

  /**
   * Determines if a date is a work day according to the weekly mask
   *
   * Conversion logic:
   * - date.getDay() returns: 0=Sunday, 1=Monday, 2=Tuesday, ..., 6=Saturday
   * - Weekly mask format: [Mon, Tue, Wed, Thu, Fri, Sat, Sun] (indices 0-6)
   * - Conversion: maskIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1
   *
   * @param date - The date to check
   * @param weeklyMask - The 7-day boolean mask
   * @returns true if it's a work day, false if it's a rest day
   */
  private isWorkDayInWeeklyPattern(
    date: Date,
    weeklyMask: [boolean, boolean, boolean, boolean, boolean, boolean, boolean]
  ): boolean {
    // Get day of week from Date (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
    const dayOfWeek = date.getDay();

    // Convert to mask index (0 = Monday, 1 = Tuesday, ..., 6 = Sunday)
    const maskIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

    // Return the mask value at this position
    return weeklyMask[maskIndex];
  }
}
