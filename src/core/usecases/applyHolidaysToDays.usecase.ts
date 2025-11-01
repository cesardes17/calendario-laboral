/**
 * Apply Holidays to Days Use Case (HU-024 / SCRUM-36)
 *
 * Applies holidays to calendar days, overriding previous states according
 * to the priority hierarchy, except "NoContratado" and "Vacaciones" which
 * have higher priority.
 *
 * Business Rules:
 * - Holidays are applied AFTER vacations
 * - Holidays have priority 3 (after NoContratado and Vacaciones)
 * - Holidays override: Work, Rest
 * - Holidays DO NOT override: NoContratado, Vacaciones
 * - Worked holidays have horasTrabajadas calculated based on day type
 * - Non-worked holidays have horasTrabajadas = 0
 */

import { CalendarDay, Holiday, Result, WorkingHours } from '../domain';

/**
 * Input for applying holidays to calendar days
 */
export interface ApplyHolidaysToDaysInput {
  /** Array of calendar days to process */
  days: CalendarDay[];

  /** Array of holidays to apply */
  holidays: Holiday[];

  /** Working hours configuration for calculating hours on worked holidays */
  workingHours: WorkingHours;
}

/**
 * Output of the holiday application process
 */
export interface ApplyHolidaysToDaysOutput {
  /** Number of days marked as 'Festivo' (non-worked holidays) */
  holidayDaysMarked: number;

  /** Number of days marked as 'FestivoTrabajado' (worked holidays) */
  workedHolidayDaysMarked: number;

  /** Total holidays processed */
  holidaysProcessed: number;

  /** Total days processed */
  totalDaysProcessed: number;

  /** Breakdown by previous state */
  stateChanges: {
    fromWork: number;
    fromRest: number;
    fromNull: number;
  };
}

/**
 * Use Case: Apply Holidays to Days
 *
 * Applies configured holidays to all calendar days that match those holiday dates.
 * Respects the state priority hierarchy defined in HU-024.
 *
 * Business Rules (from HU-024):
 * - For each holiday, locate the day in the calendar
 * - If the day is "NoContratado": do nothing (NoContratado prevails)
 * - If the day is "Vacaciones": do nothing (Vacaciones prevails)
 * - If the holiday is marked as "worked":
 *     - Estado: 'FestivoTrabajado'
 *     - Calculate hours based on day type + holiday hours
 * - If the holiday is NOT marked as worked:
 *     - Estado: 'Festivo'
 *     - Horas trabajadas: 0
 * - Holidays prevail over: Work, Rest (from cycle)
 * - Holidays DO NOT prevail over: NoContratado, Vacaciones
 *
 * Priority Order (highest to lowest):
 * 1. NoContratado
 * 2. Vacaciones
 * 3. Festivo / FestivoTrabajado ← This use case
 * 4. Descanso
 * 5. Trabajo
 *
 * @example
 * ```typescript
 * const holiday = Holiday.create({
 *   date: new Date(2025, 0, 1), // January 1
 *   name: 'Año Nuevo',
 *   worked: false
 * });
 * const workingHours = WorkingHours.default();
 * const useCase = new ApplyHolidaysToDaysUseCase();
 *
 * const result = useCase.execute({
 *   days,
 *   holidays: [holiday.getValue()],
 *   workingHours
 * });
 *
 * if (result.isSuccess) {
 *   const output = result.getValue();
 *   console.log(`Marked ${output.holidayDaysMarked} non-worked holidays`);
 *   console.log(`Marked ${output.workedHolidayDaysMarked} worked holidays`);
 * }
 * ```
 */
export class ApplyHolidaysToDaysUseCase {
  /**
   * Executes the use case to apply holidays to calendar days
   *
   * @param input - Contains the days array, holidays, and working hours configuration
   * @returns Result containing statistics or error message
   */
  public execute(input: ApplyHolidaysToDaysInput): Result<ApplyHolidaysToDaysOutput> {
    try {
      const { days, holidays, workingHours } = input;

      // Initialize counters
      let holidayDaysMarked = 0;
      let workedHolidayDaysMarked = 0;
      let totalDaysProcessed = 0;
      const stateChanges = {
        fromWork: 0,
        fromRest: 0,
        fromNull: 0,
      };

      // If no holidays, nothing to do
      if (holidays.length === 0) {
        return Result.ok<ApplyHolidaysToDaysOutput>({
          holidayDaysMarked: 0,
          workedHolidayDaysMarked: 0,
          holidaysProcessed: 0,
          totalDaysProcessed: 0,
          stateChanges,
        });
      }

      // Apply each holiday
      for (const holiday of holidays) {
        // Find the day in the calendar that matches this holiday date
        const day = days.find((d) => holiday.isOnDate(d.fecha));

        // Skip if the day is not found in the calendar (shouldn't happen for valid years)
        if (!day) {
          continue;
        }

        // Skip days that are "NoContratado" (highest priority)
        // Cannot be a holiday before being contracted
        if (day.estado === 'NoContratado') {
          continue;
        }

        // Skip days that are "Vacaciones" (priority 2)
        // Vacaciones prevail over holidays
        if (day.estado === 'Vacaciones') {
          continue;
        }

        // Track the previous state for statistics
        const previousState = day.estado;

        // Apply holiday state based on whether it was worked or not
        if (holiday.isWorked()) {
          // Worked holiday - calculate hours based on day type
          day.estado = 'FestivoTrabajado';
          day.horasTrabajadas = this.calculateWorkedHolidayHours(day.fecha, workingHours);
          workedHolidayDaysMarked++;
        } else {
          // Non-worked holiday - no hours worked
          day.estado = 'Festivo';
          day.horasTrabajadas = 0;
          holidayDaysMarked++;
        }

        // Add holiday name as description if available
        if (holiday.hasName()) {
          day.descripcion = holiday.name;
        }

        // Update statistics
        totalDaysProcessed++;

        // Track state changes for reporting
        switch (previousState) {
          case 'Trabajo':
            stateChanges.fromWork++;
            break;
          case 'Descanso':
            stateChanges.fromRest++;
            break;
          case null:
            stateChanges.fromNull++;
            break;
          // Festivo/FestivoTrabajado stays as is (duplicate holiday case)
        }
      }

      return Result.ok<ApplyHolidaysToDaysOutput>({
        holidayDaysMarked,
        workedHolidayDaysMarked,
        holidaysProcessed: holidays.length,
        totalDaysProcessed,
        stateChanges,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      return Result.fail<ApplyHolidaysToDaysOutput>(
        `Error al aplicar festivos: ${errorMessage}`
      );
    }
  }

  /**
   * Calculate hours worked on a holiday based on the day type
   *
   * Business Rules:
   * - Monday-Friday: use holiday hours (or weekday hours if not specified)
   * - Saturday: use holiday hours (or saturday hours if not specified)
   * - Sunday: use holiday hours (or sunday hours if not specified)
   * - Always use the holiday hours from WorkingHours configuration
   *
   * @param date - The date of the holiday
   * @param workingHours - Working hours configuration
   * @returns The number of hours worked on this holiday
   */
  private calculateWorkedHolidayHours(date: Date, workingHours: WorkingHours): number {
    // For worked holidays, always use the holiday hours from configuration
    // This is independent of what day of the week it is
    return workingHours.getHours('holiday');
  }
}
