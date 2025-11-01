/**
 * Calculate Weekly Distribution Use Case (HU-028 / SCRUM-40)
 *
 * Calculates the distribution of worked days across the days of the week.
 * Provides counts, percentages, and analysis of weekly work patterns.
 *
 * This use case performs efficient single-pass calculation of weekly distribution.
 */

import {
  CalendarDay,
  DistribucionSemanal,
  createEmptyWeeklyDistribution,
  WEEKDAY_NAMES_MAP,
  WeekdayName,
  Result,
} from '../domain';

/**
 * Input for calculating weekly distribution
 */
export interface CalculateWeeklyDistributionInput {
  /** The calendar days to analyze */
  days: CalendarDay[];
}

/**
 * Use Case: Calculate Weekly Distribution
 *
 * Analyzes a calendar and calculates the distribution of worked days
 * across the seven days of the week.
 *
 * Business Rules (from HU-028):
 * - Only count days with estado = 'Trabajo' or 'FestivoTrabajado'
 * - Exclude all other states: Descanso, Vacaciones, Festivo, NoContratado, null
 * - Generate array with 7 positions [L, M, X, J, V, S, D]
 * - Calculate percentages over total worked days
 * - Identify most and least worked weekdays
 * - Single iteration for efficiency
 *
 * @example
 * ```typescript
 * const useCase = new CalculateWeeklyDistributionUseCase();
 * const result = useCase.execute({ days: calendar.days });
 *
 * if (result.isSuccess) {
 *   const dist = result.getValue();
 *   console.log(`Lunes trabajados: ${dist.diasPorSemana.lunes}`);
 *   console.log(`Día más trabajado: ${dist.diaMasTrabajado}`);
 * }
 * ```
 */
export class CalculateWeeklyDistributionUseCase {
  /**
   * Executes the use case to calculate weekly distribution
   *
   * @param input - Contains the calendar days to analyze
   * @returns Result containing distribution or error message
   */
  public execute(input: CalculateWeeklyDistributionInput): Result<DistribucionSemanal> {
    try {
      const { days } = input;

      // Validate input
      if (!days || days.length === 0) {
        return Result.fail<DistribucionSemanal>(
          'No se proporcionaron días para calcular distribución semanal'
        );
      }

      // Initialize distribution
      const distribution = createEmptyWeeklyDistribution();

      // Count array for the 7 weekdays (0=Sunday, 1=Monday, ..., 6=Saturday)
      const counts: number[] = [0, 0, 0, 0, 0, 0, 0];

      // Single-pass counting of worked days by weekday
      let totalWorkedDays = 0;

      for (const day of days) {
        // Only count work days (Trabajo or FestivoTrabajado)
        if (day.estado === 'Trabajo' || day.estado === 'FestivoTrabajado') {
          const weekday = day.diaSemana; // 0=Sunday, 1=Monday, ..., 6=Saturday
          counts[weekday]++;
          totalWorkedDays++;
        }
      }

      // Map counts array to named object
      distribution.diasPorSemana = {
        lunes: counts[1],
        martes: counts[2],
        miercoles: counts[3],
        jueves: counts[4],
        viernes: counts[5],
        sabado: counts[6],
        domingo: counts[0],
      };

      distribution.totalDiasTrabajados = totalWorkedDays;

      // Calculate percentages
      if (totalWorkedDays > 0) {
        distribution.porcentajes = {
          lunes: this.calculatePercentage(counts[1], totalWorkedDays),
          martes: this.calculatePercentage(counts[2], totalWorkedDays),
          miercoles: this.calculatePercentage(counts[3], totalWorkedDays),
          jueves: this.calculatePercentage(counts[4], totalWorkedDays),
          viernes: this.calculatePercentage(counts[5], totalWorkedDays),
          sabado: this.calculatePercentage(counts[6], totalWorkedDays),
          domingo: this.calculatePercentage(counts[0], totalWorkedDays),
        };
      } else {
        // No worked days, all percentages are 0
        distribution.porcentajes = {
          lunes: 0,
          martes: 0,
          miercoles: 0,
          jueves: 0,
          viernes: 0,
          sabado: 0,
          domingo: 0,
        };
      }

      // Find most and least worked weekdays
      if (totalWorkedDays > 0) {
        const { max, min } = this.findMaxMinWeekdays(counts);
        distribution.diaMasTrabajado = max;
        distribution.diaMenosTrabajado = min;
      } else {
        // No worked days
        distribution.diaMasTrabajado = '';
        distribution.diaMenosTrabajado = '';
      }

      return Result.ok<DistribucionSemanal>(distribution);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      return Result.fail<DistribucionSemanal>(
        `Error al calcular distribución semanal: ${errorMessage}`
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

  /**
   * Finds the weekdays with maximum and minimum worked days
   *
   * @param counts - Array of counts for each weekday [Sun, Mon, Tue, Wed, Thu, Fri, Sat]
   * @returns Object with max and min weekday names
   */
  private findMaxMinWeekdays(counts: number[]): { max: string; min: string } {
    let maxIndex = 0;
    let minIndex = 0;
    let maxCount = counts[0];
    let minCount = counts[0];

    // Find max and min indices
    for (let i = 1; i < counts.length; i++) {
      if (counts[i] > maxCount) {
        maxCount = counts[i];
        maxIndex = i;
      }
      if (counts[i] < minCount) {
        minCount = counts[i];
        minIndex = i;
      }
    }

    // Convert indices to weekday names
    const max = WEEKDAY_NAMES_MAP[maxIndex] as WeekdayName;
    const min = WEEKDAY_NAMES_MAP[minIndex] as WeekdayName;

    return { max, min };
  }
}
