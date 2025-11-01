/**
 * Day Statistics Domain Types
 *
 * Types and interfaces for calculating and representing calendar day statistics.
 * Used to provide statistical summaries of the calendar (HU-027 / SCRUM-39).
 */

/**
 * Statistics about the distribution of days in a calendar
 *
 * Contains counts by state, derived totals, and percentages over effective days.
 *
 * Business Rules:
 * - All day counts must sum to totalDiasAnio (365 or 366)
 * - Percentages are calculated over diasEfectivos (totalDiasAnio - diasNoContratados)
 * - Percentages should sum to approximately 100% (allowing for rounding)
 *
 * @example
 * ```typescript
 * const stats: EstadisticasDias = {
 *   diasTrabajados: 126,
 *   diasDescanso: 54,
 *   diasVacaciones: 22,
 *   diasFestivos: 5,
 *   diasFestivosTrabajados: 2,
 *   diasNoContratados: 156,
 *   totalDiasLaborables: 128,
 *   totalDiasNoLaborables: 81,
 *   totalDiasAnio: 365,
 *   diasEfectivos: 209,
 *   porcentajeTrabajo: 61.24,
 *   porcentajeDescanso: 25.84,
 *   porcentajeVacaciones: 10.53
 * };
 * ```
 */
export interface EstadisticasDias {
  // Counts by day state
  /** Number of work days (estado = 'Trabajo') */
  diasTrabajados: number;

  /** Number of rest days (estado = 'Descanso') */
  diasDescanso: number;

  /** Number of vacation days (estado = 'Vacaciones') */
  diasVacaciones: number;

  /** Number of non-worked holidays (estado = 'Festivo') */
  diasFestivos: number;

  /** Number of worked holidays (estado = 'FestivoTrabajado') */
  diasFestivosTrabajados: number;

  /** Number of non-contracted days (estado = 'NoContratado') */
  diasNoContratados: number;

  // Derived totals
  /** Total working days (diasTrabajados + diasFestivosTrabajados) */
  totalDiasLaborables: number;

  /** Total non-working days (diasDescanso + diasVacaciones + diasFestivos) */
  totalDiasNoLaborables: number;

  /** Total days in the year (365 or 366) */
  totalDiasAnio: number;

  /** Effective days in the year (totalDiasAnio - diasNoContratados) */
  diasEfectivos: number;

  // Percentages (over diasEfectivos)
  /** Percentage of work days over effective days */
  porcentajeTrabajo: number;

  /** Percentage of rest days over effective days */
  porcentajeDescanso: number;

  /** Percentage of vacation days over effective days */
  porcentajeVacaciones: number;
}

/**
 * Creates an empty statistics object with all counts at zero
 */
export function createEmptyStatistics(): EstadisticasDias {
  return {
    diasTrabajados: 0,
    diasDescanso: 0,
    diasVacaciones: 0,
    diasFestivos: 0,
    diasFestivosTrabajados: 0,
    diasNoContratados: 0,
    totalDiasLaborables: 0,
    totalDiasNoLaborables: 0,
    totalDiasAnio: 0,
    diasEfectivos: 0,
    porcentajeTrabajo: 0,
    porcentajeDescanso: 0,
    porcentajeVacaciones: 0,
  };
}
