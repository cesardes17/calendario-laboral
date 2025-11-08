/**
 * Day Statistics Domain Types
 *
 * Types and interfaces for calculating and representing calendar day statistics.
 * Used to provide statistical summaries of the calendar (HU-027 / SCRUM-39).
 */

import type { DistribucionSemanal } from './weeklyDistribution';
import { createEmptyWeeklyDistribution } from './weeklyDistribution';
import type { SaldoHoras } from './hoursBalance';
import { createEmptyHoursBalance } from './hoursBalance';

/**
 * Breakdown of worked hours by day type
 */
export interface DesgloseHorasPorTipo {
  /** Hours worked Monday-Friday */
  lunesViernes: number;
  /** Hours worked on Saturdays */
  sabados: number;
  /** Hours worked on Sundays */
  domingos: number;
  /** Hours worked on holidays */
  festivosTrabajados: number;
}

/**
 * Monthly statistics for charts (HU-Statistics / SCRUM-50)
 */
export interface EstadisticasMensuales {
  /** Hours worked per month (array of 12 numbers, Jan=0, Dec=11) */
  horasPorMes: number[];
  /** Worked days per month (array of 12 numbers) */
  diasTrabajadosPorMes: number[];
  /** Month names for display */
  nombresMeses: string[];
}

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
 *   porcentajeVacaciones: 10.53,
 *   distribucionSemanal: {
 *     domingo: 0,
 *     lunes: 26,
 *     martes: 26,
 *     miercoles: 26,
 *     jueves: 26,
 *     viernes: 26,
 *     sabado: 0
 *   }
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

  /** Number of on-call shift days (estado = 'Guardia') */
  diasGuardias: number;

  /** Total hours worked on guardias */
  horasGuardias: number;

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

  /** Distribution of worked days by weekday (HU-Statistics / SCRUM-50) */
  distribucionSemanal: DistribucionSemanal;

  // Hours balance and breakdown (HU-Statistics / SCRUM-50)
  /** Balance between worked hours and contract hours */
  balanceHoras: SaldoHoras;

  /** Breakdown of hours by day type */
  desgloseHorasPorTipo: DesgloseHorasPorTipo;

  /** Average hours per worked day */
  promedioHorasPorDiaTrabajado: number;

  /** Average hours per week */
  promedioHorasPorSemana: number;

  /** Monthly statistics for charts (HU-Statistics / SCRUM-50) */
  estadisticasMensuales: EstadisticasMensuales;
}

/**
 * Creates an empty statistics object with all counts at zero
 */
export function createEmptyStatistics(): EstadisticasDias {
  return {
    diasTrabajados: 0,
    diasDescanso: 0,
    diasVacaciones: 0,
    diasGuardias: 0,
    horasGuardias: 0,
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
    distribucionSemanal: createEmptyWeeklyDistribution(),
    balanceHoras: createEmptyHoursBalance(),
    desgloseHorasPorTipo: {
      lunesViernes: 0,
      sabados: 0,
      domingos: 0,
      festivosTrabajados: 0,
    },
    promedioHorasPorDiaTrabajado: 0,
    promedioHorasPorSemana: 0,
    estadisticasMensuales: {
      horasPorMes: Array(12).fill(0),
      diasTrabajadosPorMes: Array(12).fill(0),
      nombresMeses: [
        'Enero',
        'Febrero',
        'Marzo',
        'Abril',
        'Mayo',
        'Junio',
        'Julio',
        'Agosto',
        'Septiembre',
        'Octubre',
        'Noviembre',
        'Diciembre',
      ],
    },
  };
}
