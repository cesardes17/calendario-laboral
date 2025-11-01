/**
 * Calculate Day Statistics Use Case (HU-027 / SCRUM-39)
 *
 * Calculates statistical summaries of calendar days grouped by state.
 * Provides counts, derived totals, and percentages for analysis and display.
 *
 * This use case performs efficient single-pass calculation of all statistics.
 */

import {
  CalendarDay,
  EstadisticasDias,
  createEmptyStatistics,
  Result,
} from '../domain';

/**
 * Input for calculating day statistics
 */
export interface CalculateDayStatisticsInput {
  /** The calendar days to analyze */
  days: CalendarDay[];
}

/**
 * Use Case: Calculate Day Statistics
 *
 * Analyzes a calendar and calculates comprehensive statistics including:
 * - Count of days by each state
 * - Derived totals (working days, non-working days, effective days)
 * - Percentages over effective days
 *
 * Business Rules (from HU-027):
 * - Count days grouped by state: Trabajo, Descanso, Vacaciones, Festivo, FestivoTrabajado, NoContratado
 * - Total working days = Trabajo + FestivoTrabajado
 * - Total non-working days = Descanso + Vacaciones + Festivo
 * - Total days = sum of all state counts
 * - Effective days = Total days - NoContratado
 * - Percentages calculated over effective days
 * - All counts must sum to total days in year (365/366)
 * - Calculations use single iteration for efficiency
 *
 * @example
 * ```typescript
 * const useCase = new CalculateDayStatisticsUseCase();
 * const result = useCase.execute({ days: calendar.days });
 *
 * if (result.isSuccess) {
 *   const stats = result.getValue();
 *   console.log(`Días trabajados: ${stats.diasTrabajados}`);
 *   console.log(`Porcentaje trabajo: ${stats.porcentajeTrabajo.toFixed(2)}%`);
 * }
 * ```
 */
export class CalculateDayStatisticsUseCase {
  /**
   * Executes the use case to calculate day statistics
   *
   * @param input - Contains the calendar days to analyze
   * @returns Result containing statistics or error message
   */
  public execute(input: CalculateDayStatisticsInput): Result<EstadisticasDias> {
    try {
      const { days } = input;

      // Validate input
      if (!days || days.length === 0) {
        return Result.fail<EstadisticasDias>(
          'No se proporcionaron días para calcular estadísticas'
        );
      }

      // Initialize statistics
      const stats = createEmptyStatistics();

      // Single-pass counting of days by state
      for (const day of days) {
        switch (day.estado) {
          case 'Trabajo':
            stats.diasTrabajados++;
            break;
          case 'Descanso':
            stats.diasDescanso++;
            break;
          case 'Vacaciones':
            stats.diasVacaciones++;
            break;
          case 'Festivo':
            stats.diasFestivos++;
            break;
          case 'FestivoTrabajado':
            stats.diasFestivosTrabajados++;
            break;
          case 'NoContratado':
            stats.diasNoContratados++;
            break;
          case null:
            // Days with null state are not counted (calendar might not be complete)
            // This is not an error, just skip them
            break;
          default:
            // Should never happen with TypeScript, but handle unknown states gracefully
            return Result.fail<EstadisticasDias>(
              `Estado desconocido encontrado: ${day.estado}`
            );
        }
      }

      // Calculate derived totals
      stats.totalDiasLaborables = stats.diasTrabajados + stats.diasFestivosTrabajados;
      stats.totalDiasNoLaborables = stats.diasDescanso + stats.diasVacaciones + stats.diasFestivos;
      stats.totalDiasAnio = days.length;
      stats.diasEfectivos = stats.totalDiasAnio - stats.diasNoContratados;

      // Validate that all days are accounted for
      const totalCounted =
        stats.diasTrabajados +
        stats.diasDescanso +
        stats.diasVacaciones +
        stats.diasFestivos +
        stats.diasFestivosTrabajados +
        stats.diasNoContratados;

      const daysWithNullState = days.filter(day => day.estado === null).length;
      const expectedTotal = totalCounted + daysWithNullState;

      if (expectedTotal !== stats.totalDiasAnio) {
        return Result.fail<EstadisticasDias>(
          `Error en el conteo de días: se contaron ${totalCounted} días con estado + ${daysWithNullState} sin estado, pero el total es ${stats.totalDiasAnio}`
        );
      }

      // Calculate percentages over effective days
      if (stats.diasEfectivos > 0) {
        stats.porcentajeTrabajo = this.calculatePercentage(
          stats.diasTrabajados + stats.diasFestivosTrabajados,
          stats.diasEfectivos
        );
        stats.porcentajeDescanso = this.calculatePercentage(
          stats.diasDescanso,
          stats.diasEfectivos
        );
        stats.porcentajeVacaciones = this.calculatePercentage(
          stats.diasVacaciones,
          stats.diasEfectivos
        );
      } else {
        // If no effective days, all percentages are 0
        stats.porcentajeTrabajo = 0;
        stats.porcentajeDescanso = 0;
        stats.porcentajeVacaciones = 0;
      }

      return Result.ok<EstadisticasDias>(stats);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      return Result.fail<EstadisticasDias>(
        `Error al calcular estadísticas de días: ${errorMessage}`
      );
    }
  }

  /**
   * Calculates percentage with 2 decimal precision
   *
   * @param part - The partial count
   * @param total - The total count
   * @returns Percentage rounded to 2 decimals
   */
  private calculatePercentage(part: number, total: number): number {
    if (total === 0) {
      return 0;
    }
    return Math.round((part / total) * 10000) / 100; // Round to 2 decimals
  }
}
