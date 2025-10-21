/**
 * @file working-hours.ts
 * @description Value Object que representa las horas trabajadas por tipo de día
 */

/**
 * Tipo de día según su naturaleza laboral
 */
export type DayType = 'weekday' | 'saturday' | 'sunday' | 'holiday';

/**
 * Configuración de horas por tipo de día
 */
export interface WorkingHoursConfig {
  weekday: number;  // Lunes a Viernes
  saturday: number;
  sunday: number;
  holiday: number;  // Festivo trabajado
}

/**
 * Valores por defecto para horas de trabajo
 */
export const DEFAULT_WORKING_HOURS: WorkingHoursConfig = {
  weekday: 8,
  saturday: 8,
  sunday: 8,
  holiday: 8,
};

/**
 * Constantes para validación
 */
export const WORKING_HOURS_CONSTRAINTS = {
  MIN: 0,
  MAX: 24,
  DECIMAL_PLACES: 2,
} as const;

/**
 * Errores relacionados con horas de trabajo
 */
export class WorkingHoursError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'WorkingHoursError';
  }
}

/**
 * Value Object: WorkingHours
 * Representa las horas trabajadas por tipo de día
 *
 * Invariantes:
 * - Todas las horas deben estar entre 0 y 24
 * - Las horas se almacenan con máximo 2 decimales
 */
export class WorkingHours {
  private constructor(private readonly config: WorkingHoursConfig) {
    this.validateHours(config);
  }

  /**
   * Crea una instancia de WorkingHours con valores personalizados
   */
  static create(config: Partial<WorkingHoursConfig> = {}): WorkingHours {
    // Normalizar los valores proporcionados
    const normalizedConfig: Partial<WorkingHoursConfig> = {};
    for (const [key, value] of Object.entries(config)) {
      if (value !== undefined) {
        normalizedConfig[key as DayType] = WorkingHours.normalizeHours(value);
      }
    }

    const fullConfig: WorkingHoursConfig = {
      ...DEFAULT_WORKING_HOURS,
      ...normalizedConfig,
    };

    return new WorkingHours(fullConfig);
  }

  /**
   * Crea una instancia con valores por defecto
   */
  static default(): WorkingHours {
    return new WorkingHours(DEFAULT_WORKING_HOURS);
  }

  /**
   * Valida que todas las horas estén en el rango permitido
   */
  private validateHours(config: WorkingHoursConfig): void {
    const entries = Object.entries(config) as [DayType, number][];

    for (const [dayType, hours] of entries) {
      this.validateSingleHour(dayType, hours);
    }
  }

  /**
   * Valida una hora individual
   */
  private validateSingleHour(dayType: string, hours: number): void {
    if (hours < WORKING_HOURS_CONSTRAINTS.MIN) {
      throw new WorkingHoursError(
        `Las horas para ${dayType} no pueden ser negativas. Recibido: ${hours}`
      );
    }

    if (hours > WORKING_HOURS_CONSTRAINTS.MAX) {
      throw new WorkingHoursError(
        `Las horas para ${dayType} no pueden superar ${WORKING_HOURS_CONSTRAINTS.MAX}. Recibido: ${hours}`
      );
    }

    if (!Number.isFinite(hours)) {
      throw new WorkingHoursError(
        `Las horas para ${dayType} deben ser un número válido. Recibido: ${hours}`
      );
    }
  }

  /**
   * Normaliza un valor de horas a 2 decimales
   */
  static normalizeHours(hours: number): number {
    return Math.round(hours * 100) / 100;
  }

  /**
   * Obtiene las horas para un tipo de día específico
   */
  getHours(dayType: DayType): number {
    return this.config[dayType];
  }

  /**
   * Obtiene todas las horas configuradas
   */
  getAll(): WorkingHoursConfig {
    return { ...this.config };
  }

  /**
   * Actualiza las horas para un tipo de día
   */
  updateHours(dayType: DayType, hours: number): WorkingHours {
    const normalizedHours = WorkingHours.normalizeHours(hours);

    return WorkingHours.create({
      ...this.config,
      [dayType]: normalizedHours,
    });
  }

  /**
   * Actualiza múltiples tipos de día a la vez
   */
  updateMultiple(updates: Partial<WorkingHoursConfig>): WorkingHours {
    const normalizedUpdates: Partial<WorkingHoursConfig> = {};

    for (const [key, value] of Object.entries(updates)) {
      if (value !== undefined) {
        normalizedUpdates[key as DayType] = WorkingHours.normalizeHours(value);
      }
    }

    return WorkingHours.create({
      ...this.config,
      ...normalizedUpdates,
    });
  }

  /**
   * Verifica si todas las horas están en sus valores por defecto
   */
  isDefault(): boolean {
    return (
      this.config.weekday === DEFAULT_WORKING_HOURS.weekday &&
      this.config.saturday === DEFAULT_WORKING_HOURS.saturday &&
      this.config.sunday === DEFAULT_WORKING_HOURS.sunday &&
      this.config.holiday === DEFAULT_WORKING_HOURS.holiday
    );
  }

  /**
   * Igualdad por valor
   */
  equals(other: WorkingHours): boolean {
    return (
      this.config.weekday === other.config.weekday &&
      this.config.saturday === other.config.saturday &&
      this.config.sunday === other.config.sunday &&
      this.config.holiday === other.config.holiday
    );
  }

  /**
   * Serialización para almacenamiento
   */
  toJSON(): WorkingHoursConfig {
    return { ...this.config };
  }

  /**
   * Deserialización desde almacenamiento
   */
  static fromJSON(json: WorkingHoursConfig): WorkingHours {
    return WorkingHours.create(json);
  }

  /**
   * Representación legible
   */
  toString(): string {
    return `WorkingHours(L-V: ${this.config.weekday}h, Sáb: ${this.config.saturday}h, Dom: ${this.config.sunday}h, Festivo: ${this.config.holiday}h)`;
  }
}
