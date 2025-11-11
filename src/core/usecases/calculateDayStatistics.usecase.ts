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
  WEEKDAY_NAMES_MAP,
  type WeekdayName,
  TurnoExtra,
} from "../domain";
import { CalculateHoursBalanceUseCase } from "./calculateHoursBalance.usecase";

/**
 * Input for calculating day statistics
 */
export interface CalculateDayStatisticsInput {
  /** The calendar days to analyze */
  days: CalendarDay[];

  /** Optional annual contract hours for balance calculation */
  horasConvenio?: number;

  /** Optional list of extra shifts to track separately in statistics */
  extraShifts?: TurnoExtra[];
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
      const { days, horasConvenio, extraShifts = [] } = input;

      // Validate input
      if (!days || days.length === 0) {
        return Result.fail<EstadisticasDias>(
          "No se proporcionaron días para calcular estadísticas"
        );
      }

      // Initialize statistics
      const stats = createEmptyStatistics();
      let totalHorasTrabajadas = 0;

      // Process extra shifts statistics
      stats.diasTurnosExtras = extraShifts.length;
      stats.horasTurnosExtras = extraShifts.reduce(
        (sum, shift) => sum + shift.hours,
        0
      );
      stats.desgloseHorasPorTipo.turnosExtras = stats.horasTurnosExtras;

      // Count extra shifts by weekday
      for (const extraShift of extraShifts) {
        const dayOfWeek = extraShift.date.getDay(); // 0=Sunday, 1=Monday, ..., 6=Saturday
        const weekdayName = WEEKDAY_NAMES_MAP[dayOfWeek] as WeekdayName;
        if (weekdayName) {
          stats.distribucionSemanal.turnosExtrasPorSemana[weekdayName]++;
        }
      }

      // Arrays for monthly statistics (12 months)
      const horasPorMes = Array(12).fill(0);
      const diasTrabajadosPorMes = Array(12).fill(0);

      // Single-pass counting of days by state, weekday distribution, hours, and monthly stats
      for (const day of days) {
        // Count by state
        switch (day.estado) {
          case "Trabajo":
            stats.diasTrabajados++;
            this.incrementWeekdayDistribution(stats, day.diaSemana);
            totalHorasTrabajadas += day.horasTrabajadas;
            this.incrementHoursByDayType(stats, day);
            // Monthly statistics (mes is 1-indexed, array is 0-indexed)
            horasPorMes[day.mes - 1] += day.horasTrabajadas;
            diasTrabajadosPorMes[day.mes - 1]++;
            break;
          case "Guardia":
            // Guardias count separately with their specified hours
            // Note: Guardias are NOT included in desgloseHorasPorTipo to avoid double-counting
            stats.diasGuardias++;
            stats.horasGuardias += day.horasTrabajadas;
            this.incrementWeekdayDistribution(stats, day.diaSemana);
            totalHorasTrabajadas += day.horasTrabajadas;
            // Monthly statistics (mes is 1-indexed, array is 0-indexed)
            horasPorMes[day.mes - 1] += day.horasTrabajadas;
            diasTrabajadosPorMes[day.mes - 1]++;
            break;
          case "Descanso":
            stats.diasDescanso++;
            break;
          case "Vacaciones":
            stats.diasVacaciones++;
            break;
          case "Festivo":
            stats.diasFestivos++;
            break;
          case "FestivoTrabajado":
            stats.diasFestivosTrabajados++;
            this.incrementWeekdayDistribution(stats, day.diaSemana);
            totalHorasTrabajadas += day.horasTrabajadas;
            this.incrementHoursByDayType(stats, day);
            // Monthly statistics (mes is 1-indexed, array is 0-indexed)
            horasPorMes[day.mes - 1] += day.horasTrabajadas;
            diasTrabajadosPorMes[day.mes - 1]++;
            break;
          case "NoContratado":
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
      stats.totalDiasLaborables =
        stats.diasTrabajados +
        stats.diasGuardias +
        stats.diasFestivosTrabajados;
      stats.totalDiasNoLaborables =
        stats.diasDescanso + stats.diasVacaciones + stats.diasFestivos;
      stats.totalDiasAnio = days.length;
      stats.diasEfectivos = stats.totalDiasAnio - stats.diasNoContratados;

      // Validate that all days are accounted for
      const totalCounted =
        stats.diasTrabajados +
        stats.diasGuardias +
        stats.diasDescanso +
        stats.diasVacaciones +
        stats.diasFestivos +
        stats.diasFestivosTrabajados +
        stats.diasNoContratados;

      const daysWithNullState = days.filter(
        (day) => day.estado === null
      ).length;
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

      // Calculate weekly distribution percentages and analysis
      this.finalizeWeeklyDistribution(stats);

      // Calculate hours balance if contract hours provided
      if (horasConvenio !== undefined && horasConvenio > 0) {
        // Calculate proportional contract hours based on effective days
        // If someone started mid-year, they should only fulfill proportional hours
        const horasConvenioProporcional =
          (horasConvenio * stats.diasEfectivos) / stats.totalDiasAnio;

        const balanceUseCase = new CalculateHoursBalanceUseCase();
        const balanceResult = balanceUseCase.execute({
          horasTrabajadas: totalHorasTrabajadas,
          horasConvenio: horasConvenioProporcional,
        });

        if (balanceResult.isSuccess()) {
          stats.balanceHoras = balanceResult.getValue();
        }
      }

      // Calculate averages
      if (stats.totalDiasLaborables > 0) {
        stats.promedioHorasPorDiaTrabajado =
          Math.round((totalHorasTrabajadas / stats.totalDiasLaborables) * 100) /
          100;
      }

      // Calculate average hours per week (52 weeks in a year)

      stats.promedioHorasPorSemana = Math.round(
        ((totalHorasTrabajadas /
          ((stats.totalDiasAnio - stats.diasNoContratados) / 7)) *
          100) /
          100
      );

      // Assign monthly statistics
      stats.estadisticasMensuales.horasPorMes = horasPorMes;
      stats.estadisticasMensuales.diasTrabajadosPorMes = diasTrabajadosPorMes;

      return Result.ok<EstadisticasDias>(stats);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Error desconocido";
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

  /**
   * Increments the weekday distribution count for worked days
   *
   * @param stats - The statistics object to update
   * @param diaSemana - Day of week (0=Sunday, 1=Monday, ..., 6=Saturday)
   */
  private incrementWeekdayDistribution(
    stats: EstadisticasDias,
    diaSemana: number
  ): void {
    const weekdayName = WEEKDAY_NAMES_MAP[diaSemana] as WeekdayName;
    if (weekdayName) {
      stats.distribucionSemanal.diasPorSemana[weekdayName]++;
      stats.distribucionSemanal.totalDiasTrabajados++;
    }
  }

  /**
   * Increments hours by day type (Mon-Fri, Sat, Sun, Holidays)
   *
   * @param stats - The statistics object to update
   * @param day - The calendar day
   */
  private incrementHoursByDayType(
    stats: EstadisticasDias,
    day: CalendarDay
  ): void {
    const { diaSemana, horasTrabajadas, estado } = day;

    if (estado === "FestivoTrabajado") {
      stats.desgloseHorasPorTipo.festivosTrabajados += horasTrabajadas;
    } else if (diaSemana === 0) {
      // Sunday
      stats.desgloseHorasPorTipo.domingos += horasTrabajadas;
    } else if (diaSemana === 6) {
      // Saturday
      stats.desgloseHorasPorTipo.sabados += horasTrabajadas;
    } else {
      // Monday-Friday (1-5)
      stats.desgloseHorasPorTipo.lunesViernes += horasTrabajadas;
    }
  }

  /**
   * Finalizes weekly distribution by calculating percentages and analyzing most/least worked days
   *
   * @param stats - The statistics object to update
   */
  private finalizeWeeklyDistribution(stats: EstadisticasDias): void {
    const dist = stats.distribucionSemanal;
    const totalWorked = dist.totalDiasTrabajados;

    // Calculate percentages
    if (totalWorked > 0) {
      dist.porcentajes.lunes = this.calculatePercentage(
        dist.diasPorSemana.lunes,
        totalWorked
      );
      dist.porcentajes.martes = this.calculatePercentage(
        dist.diasPorSemana.martes,
        totalWorked
      );
      dist.porcentajes.miercoles = this.calculatePercentage(
        dist.diasPorSemana.miercoles,
        totalWorked
      );
      dist.porcentajes.jueves = this.calculatePercentage(
        dist.diasPorSemana.jueves,
        totalWorked
      );
      dist.porcentajes.viernes = this.calculatePercentage(
        dist.diasPorSemana.viernes,
        totalWorked
      );
      dist.porcentajes.sabado = this.calculatePercentage(
        dist.diasPorSemana.sabado,
        totalWorked
      );
      dist.porcentajes.domingo = this.calculatePercentage(
        dist.diasPorSemana.domingo,
        totalWorked
      );
    }

    // Find most and least worked days
    const weekdays = [
      "lunes",
      "martes",
      "miercoles",
      "jueves",
      "viernes",
      "sabado",
      "domingo",
    ] as const;
    let maxCount = -1;
    let minCount = Infinity;
    let mostWorkedDay = "";
    let leastWorkedDay = "";

    for (const day of weekdays) {
      const count = dist.diasPorSemana[day];

      if (count > maxCount) {
        maxCount = count;
        mostWorkedDay = day;
      }

      if (count < minCount) {
        minCount = count;
        leastWorkedDay = day;
      }
    }

    dist.diaMasTrabajado = mostWorkedDay;
    dist.diaMenosTrabajado = leastWorkedDay;
  }
}
