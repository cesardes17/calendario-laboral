/**
 * Apply Vacations to Days Use Case (HU-023)
 *
 * Applies vacation periods to calendar days, overriding any previous state
 * except "NoContratado" which has the highest priority.
 *
 * Business Rules:
 * - Vacations are applied AFTER the work cycle
 * - Vacations have priority 2 (only "NoContratado" is higher)
 * - Vacations override: Work, Rest, Holiday, Worked Holiday
 * - Vacations DO NOT override: NoContratado
 * - Vacation days have horasTrabajadas = 0
 * - If vacation period has description, it's saved to the day
 */

import { CalendarDay, VacationPeriod, Result } from '../domain';

/**
 * Input for applying vacations to calendar days
 */
export interface ApplyVacationsToDaysInput {
  /** Array of calendar days to process */
  days: CalendarDay[];

  /** Array of vacation periods to apply */
  vacationPeriods: VacationPeriod[];
}

/**
 * Output of the vacation application process
 */
export interface ApplyVacationsToDaysOutput {
  /** Number of days marked as 'Vacaciones' */
  vacationDaysMarked: number;

  /** Number of vacation periods processed */
  periodsProcessed: number;

  /** Total days processed (days that were eligible for vacation marking) */
  totalDaysProcessed: number;

  /** Breakdown by previous state */
  stateChanges: {
    fromWork: number;
    fromRest: number;
    fromHoliday: number;
    fromWorkedHoliday: number;
    fromNull: number;
  };
}

/**
 * Use Case: Apply Vacations to Days
 *
 * Applies vacation periods to all calendar days that fall within those periods.
 * Respects the state priority hierarchy defined in HU-023.
 *
 * Business Rules (from HU-023):
 * - For each vacation period, iterate all days between start and end (inclusive)
 * - Override the current state with 'Vacaciones' (unless NoContratado)
 * - Set horasTrabajadas = 0
 * - Save description from vacation period (if exists)
 * - Vacations prevail over: Work, Rest, Holiday, Worked Holiday
 * - Vacations DO NOT prevail over: NoContratado
 * - If there are overlapping periods, result is the same (all are vacations)
 *
 * Priority Order (highest to lowest):
 * 1. NoContratado
 * 2. Vacaciones ← This use case
 * 3. Festivo / FestivoTrabajado
 * 4. Descanso
 * 5. Trabajo
 *
 * @example
 * ```typescript
 * const vacation = VacationPeriod.create({
 *   startDate: new Date(2025, 6, 15), // July 15
 *   endDate: new Date(2025, 6, 31),   // July 31
 *   description: 'Vacaciones de verano'
 * });
 * const useCase = new ApplyVacationsToDaysUseCase();
 *
 * const result = useCase.execute({
 *   days,
 *   vacationPeriods: [vacation.getValue()]
 * });
 *
 * if (result.isSuccess) {
 *   const output = result.getValue();
 *   console.log(`Marked ${output.vacationDaysMarked} vacation days`);
 * }
 * ```
 */
export class ApplyVacationsToDaysUseCase {
  /**
   * Executes the use case to apply vacations to calendar days
   *
   * @param input - Contains the days array and vacation periods
   * @returns Result containing statistics or error message
   */
  public execute(input: ApplyVacationsToDaysInput): Result<ApplyVacationsToDaysOutput> {
    try {
      const { days, vacationPeriods } = input;

      // Initialize counters
      let vacationDaysMarked = 0;
      let totalDaysProcessed = 0;
      const stateChanges = {
        fromWork: 0,
        fromRest: 0,
        fromHoliday: 0,
        fromWorkedHoliday: 0,
        fromNull: 0,
      };

      // If no vacation periods, nothing to do
      if (vacationPeriods.length === 0) {
        return Result.ok<ApplyVacationsToDaysOutput>({
          vacationDaysMarked: 0,
          periodsProcessed: 0,
          totalDaysProcessed: 0,
          stateChanges,
        });
      }

      // Apply each vacation period
      for (const period of vacationPeriods) {
        // Iterate through all calendar days
        for (const day of days) {
          // Check if this day falls within the vacation period
          if (!period.includesDate(day.fecha)) {
            continue;
          }

          // Skip days that are "NoContratado" (highest priority)
          // Cannot be on vacation before being contracted
          if (day.estado === 'NoContratado') {
            continue;
          }

          // Track the previous state for statistics
          const previousState = day.estado;

          // Apply vacation state
          day.estado = 'Vacaciones';
          day.horasTrabajadas = 0;

          // Add description if the vacation period has one
          if (period.hasDescription()) {
            day.descripcion = period.description;
          }

          // Update statistics
          vacationDaysMarked++;
          totalDaysProcessed++;

          // Track state changes for reporting
          switch (previousState) {
            case 'Trabajo':
              stateChanges.fromWork++;
              break;
            case 'Descanso':
              stateChanges.fromRest++;
              break;
            case 'Festivo':
              stateChanges.fromHoliday++;
              break;
            case 'FestivoTrabajado':
              stateChanges.fromWorkedHoliday++;
              break;
            case null:
              stateChanges.fromNull++;
              break;
            // Vacaciones stays as Vacaciones (overlapping periods case)
          }
        }
      }

      return Result.ok<ApplyVacationsToDaysOutput>({
        vacationDaysMarked,
        periodsProcessed: vacationPeriods.length,
        totalDaysProcessed,
        stateChanges,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      return Result.fail<ApplyVacationsToDaysOutput>(
        `Error al aplicar vacaciones: ${errorMessage}`
      );
    }
  }
}
