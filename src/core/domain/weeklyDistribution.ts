/**
 * Weekly Distribution Domain Types
 *
 * Types and interfaces for calculating and representing the distribution
 * of worked days across the days of the week (HU-028 / SCRUM-40).
 */

/**
 * Count of worked days by weekday name
 */
export interface DiasPorSemana {
  lunes: number;
  martes: number;
  miercoles: number;
  jueves: number;
  viernes: number;
  sabado: number;
  domingo: number;
}

/**
 * Percentage of worked days by weekday name
 */
export interface PorcentajesPorSemana {
  lunes: number;
  martes: number;
  miercoles: number;
  jueves: number;
  viernes: number;
  sabado: number;
  domingo: number;
}

/**
 * Distribution of worked days across the week
 *
 * Contains counts by weekday, percentages, and analysis of most/least worked days.
 * Only counts days with estado = 'Trabajo' or 'FestivoTrabajado'.
 *
 * Business Rules:
 * - Only work days (Trabajo, FestivoTrabajado) are counted
 * - Days excluded: Descanso, Vacaciones, Festivo, NoContratado, null
 * - Percentages calculated over total worked days
 * - Array position mapping: 0=Sunday, 1=Monday, ..., 6=Saturday (JS Date.getDay())
 * - diaMasTrabajado: weekday with highest count (tie-breaker: first occurrence)
 * - diaMenosTrabajado: weekday with lowest count (tie-breaker: first occurrence)
 * - turnosExtrasPorSemana: Count of extra shifts by weekday (independent of work state)
 *
 * @example
 * ```typescript
 * const dist: DistribucionSemanal = {
 *   diasPorSemana: {
 *     lunes: 30,
 *     martes: 30,
 *     miercoles: 30,
 *     jueves: 30,
 *     viernes: 30,
 *     sabado: 0,
 *     domingo: 0
 *   },
 *   porcentajes: {
 *     lunes: 20.00,
 *     martes: 20.00,
 *     miercoles: 20.00,
 *     jueves: 20.00,
 *     viernes: 20.00,
 *     sabado: 0,
 *     domingo: 0
 *   },
 *   turnosExtrasPorSemana: {
 *     lunes: 2,
 *     martes: 1,
 *     miercoles: 0,
 *     jueves: 1,
 *     viernes: 0,
 *     sabado: 1,
 *     domingo: 0
 *   },
 *   diaMasTrabajado: 'lunes',
 *   diaMenosTrabajado: 'sabado',
 *   totalDiasTrabajados: 150
 * };
 * ```
 */
export interface DistribucionSemanal {
  /** Count of worked days for each weekday */
  diasPorSemana: DiasPorSemana;

  /** Percentage of worked days for each weekday (over total worked days) */
  porcentajes: PorcentajesPorSemana;

  /** Count of extra shifts for each weekday */
  turnosExtrasPorSemana: DiasPorSemana;

  /** Name of the weekday with most worked days */
  diaMasTrabajado: string;

  /** Name of the weekday with least worked days */
  diaMenosTrabajado: string;

  /** Total number of worked days (Trabajo + FestivoTrabajado) */
  totalDiasTrabajados: number;
}

/**
 * Creates an empty weekly distribution with all counts at zero
 */
export function createEmptyWeeklyDistribution(): DistribucionSemanal {
  return {
    diasPorSemana: {
      lunes: 0,
      martes: 0,
      miercoles: 0,
      jueves: 0,
      viernes: 0,
      sabado: 0,
      domingo: 0,
    },
    porcentajes: {
      lunes: 0,
      martes: 0,
      miercoles: 0,
      jueves: 0,
      viernes: 0,
      sabado: 0,
      domingo: 0,
    },
    turnosExtrasPorSemana: {
      lunes: 0,
      martes: 0,
      miercoles: 0,
      jueves: 0,
      viernes: 0,
      sabado: 0,
      domingo: 0,
    },
    diaMasTrabajado: '',
    diaMenosTrabajado: '',
    totalDiasTrabajados: 0,
  };
}

/**
 * Weekday names in Spanish, ordered by index (0-6)
 * Maps to JavaScript Date.getDay() values
 */
export const WEEKDAY_NAMES_MAP: readonly string[] = [
  'domingo',   // 0
  'lunes',     // 1
  'martes',    // 2
  'miercoles', // 3
  'jueves',    // 4
  'viernes',   // 5
  'sabado',    // 6
] as const;

/**
 * Type for weekday names in Spanish
 */
export type WeekdayName = 'lunes' | 'martes' | 'miercoles' | 'jueves' | 'viernes' | 'sabado' | 'domingo';
