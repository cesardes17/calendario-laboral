/**
 * Calendar Day Domain Types
 *
 * Represents a single day in the annual work calendar.
 * Each day contains complete date information and can have
 * different states according to business rules (HU-019).
 */

/**
 * Possible states for a calendar day.
 * Priority order (highest to lowest):
 * 1. NoContratado (Not Contracted)
 * 2. Vacaciones (Vacation)
 * 3. Guardia (On-call shift - only for weekly cycles on rest/holiday days)
 * 4. Festivo / FestivoTrabajado (Holiday / Worked Holiday)
 * 5. Descanso (Rest - immutable from cycle)
 * 6. Trabajo (Work)
 */
export type EstadoDia =
  | 'NoContratado'
  | 'Vacaciones'
  | 'Guardia'
  | 'Festivo'
  | 'FestivoTrabajado'
  | 'Descanso'
  | 'Trabajo';

/**
 * Metadata for days that are part of a cycle
 * Contains information about which part of the cycle and position within that part
 */
export interface DayMetadata {
  /** The cycle part number this day belongs to (0-indexed) */
  parte?: number;
  /** Day index within the current part (0-indexed) */
  diaDentroParte?: number;
  /** Type of day within the cycle part */
  tipoDentroParte?: 'Trabajo' | 'Descanso';
}

/**
 * Represents a single day in the annual calendar
 * Contains all information needed for work calendar calculations
 */
export interface CalendarDay {
  /** Complete date as Date object */
  fecha: Date;

  /** Day of week (0=Sunday, 1=Monday, ..., 6=Saturday) */
  diaSemana: number;

  /** Name of the weekday in Spanish */
  nombreDia: string;

  /** Day number in the month (1-31) */
  diaNumero: number;

  /** Month number (1-12) */
  mes: number;

  /** Name of the month in Spanish */
  nombreMes: string;

  /** ISO week number of the year (1-53) */
  numeroSemana: number;

  /** Current state of the day (null = not yet determined) */
  estado: EstadoDia | null;

  /** Hours worked on this day (0 initially) */
  horasTrabajadas: number;

  /** Optional description or notes for this day */
  descripcion?: string;

  /** Metadata for cycle-based days */
  metadata?: DayMetadata;
}

/**
 * Spanish weekday names (indexed 0-6, Sunday to Saturday)
 */
export const WEEKDAY_NAMES: readonly string[] = [
  'Domingo',
  'Lunes',
  'Martes',
  'Miércoles',
  'Jueves',
  'Viernes',
  'Sábado',
] as const;

/**
 * Spanish month names (indexed 0-11, January to December)
 */
export const MONTH_NAMES: readonly string[] = [
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
] as const;
