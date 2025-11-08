/**
 * Apply Guardias to Days Use Case
 *
 * Applies guardias (on-call shifts) to calendar days, overriding previous states according
 * to the priority hierarchy. Guardias can only be applied on rest days or holidays.
 *
 * Business Rules:
 * - Guardias are applied AFTER holidays but BEFORE processing
 * - Guardias have priority 3 (after NoContratado and Vacaciones)
 * - Guardias can ONLY be applied to: Rest days or Holidays
 * - Guardias override: Descanso, Festivo, FestivoTrabajado
 * - Guardias DO NOT override: NoContratado, Vacaciones
 * - Guardias are ONLY applicable for weekly cycles (modo: 'semanal')
 * - Each guardia specifies its own hours worked
 */

import { CalendarDay, Guardia, Result } from '../domain';

/**
 * Input for applying guardias to calendar days
 */
export interface ApplyGuardiasToDaysInput {
  /** Array of calendar days to process */
  days: CalendarDay[];

  /** Array of guardias to apply */
  guardias: Guardia[];
}

/**
 * Output of the guardia application process
 */
export interface ApplyGuardiasToDaysOutput {
  /** Number of days marked as 'Guardia' */
  guardiaDaysMarked: number;

  /** Total guardias processed */
  guardiasProcessed: number;

  /** Total hours from all guardias */
  totalGuardiaHours: number;

  /** Total days processed */
  totalDaysProcessed: number;

  /** Breakdown by previous state */
  stateChanges: {
    fromRest: number;
    fromHoliday: number;
    fromWorkedHoliday: number;
    skipped: number; // Days that couldn't be marked as guardia (wrong state)
  };
}

/**
 * Use Case: Apply Guardias to Days
 *
 * Applies configured guardias to all calendar days that match those guardia dates.
 * Respects the state priority hierarchy and business rules.
 *
 * Business Rules:
 * - For each guardia, locate the day in the calendar
 * - If the day is "NoContratado": skip (NoContratado prevails)
 * - If the day is "Vacaciones": skip (Vacaciones prevails)
 * - If the day is "Descanso", "Festivo", or "FestivoTrabajado":
 *   → Estado: 'Guardia'
 *   → Horas trabajadas: from guardia.hours
 *   → Descripcion: from guardia.description (if provided)
 * - If the day is "Trabajo" or null: skip (guardias only on rest/holiday days)
 *
 * Priority Order (highest to lowest):
 * 1. NoContratado
 * 2. Vacaciones
 * 3. Guardia ← This use case
 * 4. Festivo / FestivoTrabajado
 * 5. Descanso
 * 6. Trabajo
 *
 * @example
 * ```typescript
 * const guardia = Guardia.create({
 *   date: new Date(2025, 0, 1),
 *   hours: 12,
 *   description: 'Guardia de fin de semana'
 * });
 *
 * const useCase = new ApplyGuardiasToDaysUseCase();
 * const result = useCase.execute({
 *   days: calendarDays,
 *   guardias: [guardia.getValue()]
 * });
 *
 * if (result.isSuccess()) {
 *   const output = result.getValue();
 *   console.log(`Marked ${output.guardiaDaysMarked} days as guardias`);
 *   console.log(`Total hours: ${output.totalGuardiaHours}`);
 * }
 * ```
 */
export class ApplyGuardiasToDaysUseCase {
  /**
   * Executes the use case to apply guardias to calendar days
   *
   * @param input - Contains the days and guardias to process
   * @returns Result containing statistics about the operation or error message
   */
  public execute(input: ApplyGuardiasToDaysInput): Result<ApplyGuardiasToDaysOutput> {
    try {
      const { days, guardias } = input;

      // Initialize counters
      let guardiaDaysMarked = 0;
      let totalGuardiaHours = 0;
      const stateChanges = {
        fromRest: 0,
        fromHoliday: 0,
        fromWorkedHoliday: 0,
        skipped: 0,
      };

      // Process each guardia
      for (const guardia of guardias) {
        // Find the calendar day that matches this guardia date
        const day = this.findDayByDate(days, guardia.date);

        if (!day) {
          // Guardia date doesn't exist in the calendar (shouldn't happen if validated)
          stateChanges.skipped++;
          continue;
        }

        // Apply guardia according to priority rules
        const applied = this.applyGuardia(day, guardia, stateChanges);

        if (applied) {
          guardiaDaysMarked++;
          totalGuardiaHours += guardia.hours;
        }
      }

      return Result.ok<ApplyGuardiasToDaysOutput>({
        guardiaDaysMarked,
        guardiasProcessed: guardias.length,
        totalGuardiaHours,
        totalDaysProcessed: days.length,
        stateChanges,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      return Result.fail<ApplyGuardiasToDaysOutput>(
        `Error al aplicar guardias: ${errorMessage}`
      );
    }
  }

  /**
   * Finds a calendar day by date
   *
   * @param days - Array of calendar days
   * @param date - Date to find
   * @returns The calendar day or undefined if not found
   */
  private findDayByDate(days: CalendarDay[], date: Date): CalendarDay | undefined {
    return days.find(
      (day) =>
        day.fecha.getFullYear() === date.getFullYear() &&
        day.fecha.getMonth() === date.getMonth() &&
        day.fecha.getDate() === date.getDate()
    );
  }

  /**
   * Applies a guardia to a calendar day following business rules
   *
   * @param day - The calendar day to modify
   * @param guardia - The guardia to apply
   * @param stateChanges - Counter object for tracking state changes
   * @returns true if guardia was applied, false otherwise
   */
  private applyGuardia(
    day: CalendarDay,
    guardia: Guardia,
    stateChanges: ApplyGuardiasToDaysOutput['stateChanges']
  ): boolean {
    const currentState = day.estado;

    // Priority 1: NoContratado - Do not override
    if (currentState === 'NoContratado') {
      stateChanges.skipped++;
      return false;
    }

    // Priority 2: Vacaciones - Do not override
    if (currentState === 'Vacaciones') {
      stateChanges.skipped++;
      return false;
    }

    // Can only apply guardia on rest days or holidays
    if (
      currentState === 'Descanso' ||
      currentState === 'Festivo' ||
      currentState === 'FestivoTrabajado'
    ) {
      // Track where the guardia is coming from
      if (currentState === 'Descanso') {
        stateChanges.fromRest++;
      } else if (currentState === 'Festivo') {
        stateChanges.fromHoliday++;
      } else if (currentState === 'FestivoTrabajado') {
        stateChanges.fromWorkedHoliday++;
      }

      // Apply guardia
      day.estado = 'Guardia';
      day.horasTrabajadas = guardia.hours;

      // Add description if provided
      if (guardia.hasDescription()) {
        day.descripcion = guardia.description;
      }

      return true;
    }

    // Cannot apply guardia to work days or null state
    stateChanges.skipped++;
    return false;
  }
}
