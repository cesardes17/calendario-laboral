/**
 * Calculate Day Hours Use Case (HU-025 / SCRUM-37)
 *
 * Calculates the worked hours for a calendar day based on its state
 * and the configured working hours per day type.
 *
 * Business Rules:
 * - Only 'Trabajo' and 'FestivoTrabajado' states result in worked hours
 * - 'Trabajo' days use different hours based on day of week
 * - 'FestivoTrabajado' always uses holiday hours regardless of day of week
 * - All other states (NoContratado, Descanso, Vacaciones, Festivo) = 0 hours
 * - Hours are rounded to 2 decimals (handled by WorkingHours value object)
 */

import { CalendarDay, EstadoDia, Result, WorkingHours } from '../domain';

/**
 * Input for calculating day hours
 */
export interface CalculateDayHoursInput {
  /** The calendar day to calculate hours for */
  day: CalendarDay;

  /** The working hours configuration */
  workingHours: WorkingHours;
}

/**
 * Output of the hours calculation
 */
export interface CalculateDayHoursOutput {
  /** The calculated hours for the day */
  hours: number;

  /** The day state that was used for calculation */
  estado: EstadoDia | null;

  /** The day of week (for debugging/logging) */
  diaSemana: number;
}

/**
 * Use Case: Calculate Day Hours
 *
 * Assigns the correct hours to a calendar day based on its state and day type.
 *
 * Hour Assignment Rules (from HU-025):
 * ```
 * Estado              | Día semana | Horas asignadas
 * --------------------|------------|----------------
 * NoContratado        | Cualquiera | 0
 * Vacaciones          | Cualquiera | 0
 * Festivo             | Cualquiera | 0
 * Descanso            | Cualquiera | 0
 * Trabajo             | L-V (1-5)  | workingHours.weekday
 * Trabajo             | Sábado (6) | workingHours.saturday
 * Trabajo             | Domingo (0)| workingHours.sunday
 * FestivoTrabajado    | Cualquiera | workingHours.holiday
 * ```
 *
 * @example
 * ```typescript
 * const useCase = new CalculateDayHoursUseCase();
 * const workingHours = WorkingHours.create({
 *   weekday: 8.0,
 *   saturday: 6.0,
 *   sunday: 0.0,
 *   holiday: 10.0
 * });
 *
 * // Thursday work day
 * const result1 = useCase.execute({
 *   day: { estado: 'Trabajo', diaSemana: 4, ... },
 *   workingHours
 * });
 * // result1.getValue().hours === 8.0
 *
 * // Saturday work day
 * const result2 = useCase.execute({
 *   day: { estado: 'Trabajo', diaSemana: 6, ... },
 *   workingHours
 * });
 * // result2.getValue().hours === 6.0
 *
 * // Worked holiday (any day)
 * const result3 = useCase.execute({
 *   day: { estado: 'FestivoTrabajado', diaSemana: 1, ... },
 *   workingHours
 * });
 * // result3.getValue().hours === 10.0
 *
 * // Vacation day
 * const result4 = useCase.execute({
 *   day: { estado: 'Vacaciones', diaSemana: 2, ... },
 *   workingHours
 * });
 * // result4.getValue().hours === 0
 * ```
 */
export class CalculateDayHoursUseCase {
  /**
   * Executes the use case to calculate hours for a day
   *
   * @param input - Contains the day and working hours configuration
   * @returns Result containing the calculated hours or error message
   */
  public execute(input: CalculateDayHoursInput): Result<CalculateDayHoursOutput> {
    try {
      const { day, workingHours } = input;
      const { estado, diaSemana } = day;

      // Calculate hours based on day state
      const hours = this.calculateHours(estado, diaSemana, workingHours);

      return Result.ok<CalculateDayHoursOutput>({
        hours,
        estado,
        diaSemana,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      return Result.fail<CalculateDayHoursOutput>(
        `Error al calcular horas del día: ${errorMessage}`
      );
    }
  }

  /**
   * Calculates hours based on day state and day of week
   *
   * @param estado - The state of the day (null if not yet determined)
   * @param diaSemana - Day of week (0=Sunday, 1=Monday, ..., 6=Saturday)
   * @param workingHours - Working hours configuration
   * @returns The calculated hours (0 for non-working states)
   */
  private calculateHours(
    estado: EstadoDia | null,
    diaSemana: number,
    workingHours: WorkingHours
  ): number {
    // If no state assigned yet, assume 0 hours
    if (estado === null) {
      return 0;
    }

    // States that always result in 0 hours
    if (
      estado === 'NoContratado' ||
      estado === 'Descanso' ||
      estado === 'Vacaciones' ||
      estado === 'Festivo'
    ) {
      return 0;
    }

    // Worked holiday: always uses holiday hours regardless of day of week
    if (estado === 'FestivoTrabajado') {
      return workingHours.getHours('holiday');
    }

    // Work day: hours depend on day of week
    if (estado === 'Trabajo') {
      return this.getHoursForWorkDay(diaSemana, workingHours);
    }

    // Fallback: this should never happen if EstadoDia type is exhaustive
    return 0;
  }

  /**
   * Gets the appropriate hours for a work day based on day of week
   *
   * @param diaSemana - Day of week (0=Sunday, 1=Monday, ..., 6=Saturday)
   * @param workingHours - Working hours configuration
   * @returns The hours for this day type
   */
  private getHoursForWorkDay(diaSemana: number, workingHours: WorkingHours): number {
    // Sunday (0)
    if (diaSemana === 0) {
      return workingHours.getHours('sunday');
    }

    // Saturday (6)
    if (diaSemana === 6) {
      return workingHours.getHours('saturday');
    }

    // Monday-Friday (1-5)
    return workingHours.getHours('weekday');
  }
}
